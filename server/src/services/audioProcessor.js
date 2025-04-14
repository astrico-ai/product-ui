const debug = require('debug')('app:audio');
const { createDeepgramSocket, config } = require('../config/deepgram');
const openai = require('../config/openai');  // Still needed for chat and TTS
const { logger } = require('../utils/logger');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Audio configuration constants
const SAMPLE_RATE = 16000;          // 16 kHz
const BYTES_PER_SAMPLE = 2;         // 16-bit audio = 2 bytes per sample
const CHANNELS = 1;                 // Mono
const CHUNK_DURATION_MS = 100;      // 100ms chunks
const SAMPLES_PER_CHUNK = Math.floor(SAMPLE_RATE * (CHUNK_DURATION_MS / 1000));
const OPTIMAL_CHUNK_SIZE = SAMPLES_PER_CHUNK * BYTES_PER_SAMPLE * CHANNELS;  // Should be 3200 bytes

// System message for the loan default scenario
const SYSTEM_MESSAGE = {
    role: "system",
    content: `You are roleplaying as a potential customer named Reshmi.

Scenario:
- Reshmi is considering taking a personal loan but is cautious.
- She is concerned about high interest rates, hidden charges, and repayment terms.
- She has previously taken loans from other banks and is generally skeptical of new offers.

Instructions:
- Always reply in Hindi.
- Act politely but ask tough questions about loan terms, interest rates, processing fees, etc.
- Raise objections like "मुझे अभी लोन की ज़रूरत नहीं है" or "मैं पहले से अपनी बैंक से खुश हूँ।"
- Challenge the agent to explain why their loan offer is better.
- Keep replies short (1 to 3 sentences) to allow natural conversation.
- If the agent answers convincingly (shows empathy, clear explanation), gradually become more interested.
- End the conversation positively if the agent closes the sale well, or politely decline if not convinced.
- End the conversation when the agent says a closing line like "क्या मैं आपकी कुछ और मदद कर सकता हूँ?" or "धन्यवाद".

Stay completely in character as Reshmi throughout the conversation.
`
};

// Create a small silence buffer (50ms) for keep-alive
const SILENCE_DURATION_MS = 50;
const SILENCE_BUFFER_SIZE = Math.floor(SAMPLE_RATE * (SILENCE_DURATION_MS / 1000)) * BYTES_PER_SAMPLE;
const SILENCE_BUFFER = Buffer.alloc(SILENCE_BUFFER_SIZE);

class AudioProcessor {
    constructor(socket) {
        this.socket = socket;
        this.conversationHistory = [SYSTEM_MESSAGE];
        this.currentTranscription = '';
        this.isProcessing = false;
        this.deepgramConnection = null;
        this.isSpeaking = false;
        this.speechStartTime = null;
        this.lastVadEvent = null;
        this.connectionMonitor = null;
        this.isConnectionReady = false;
        this.pendingAudioChunks = [];
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 3;
        this.reconnectDelay = 2000;
        this.lastConnectionError = null;
        this.lastPongTime = null;
        this.monitorInterval = null;
        this.isProcessingChunks = false;
        this._connectionTimeoutId = null;
        this._isShuttingDown = false;
        this._keepAliveInterval = null;
        this._lastAudioSentTime = null;
        this._audioStreamActive = false;
        this._hasReceivedFirstChunk = false;
        this._partialChunk = null;  // Buffer for incomplete chunks
        
        debug('Audio processor initialized with Deepgram streaming support');
        debug(`Configured for ${CHUNK_DURATION_MS}ms chunks (${OPTIMAL_CHUNK_SIZE} bytes)`);
        // Don't initialize connection immediately - wait for first audio chunk
    }

    normalizeChunkSize(chunk) {
        // Convert to buffer if needed
        let audioBuffer = Buffer.isBuffer(chunk) ? chunk : 
                         chunk instanceof Int16Array ? Buffer.from(chunk.buffer) :
                         Buffer.from(chunk);

        // If we have a partial chunk from before, prepend it
        if (this._partialChunk) {
            audioBuffer = Buffer.concat([this._partialChunk, audioBuffer]);
            this._partialChunk = null;
        }

        const chunks = [];
        let offset = 0;

        // Extract full chunks
        while (offset + OPTIMAL_CHUNK_SIZE <= audioBuffer.length) {
            chunks.push(audioBuffer.slice(offset, offset + OPTIMAL_CHUNK_SIZE));
            offset += OPTIMAL_CHUNK_SIZE;
        }

        // Store any remaining partial chunk
        if (offset < audioBuffer.length) {
            this._partialChunk = audioBuffer.slice(offset);
            debug(`Stored ${this._partialChunk.length} bytes for next chunk`);
        }

        return chunks;
    }

    startConnectionMonitor() {
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
        }

        this.monitorInterval = setInterval(() => {
            this.checkConnectionHealth();
        }, 4000); // Check every 4 seconds
    }

    checkConnectionHealth() {
        if (this._isShuttingDown) return;

        if (!this.deepgramConnection || this.deepgramConnection.readyState !== WebSocket.OPEN) {
            debug('Connection health check failed - connection not open');
            this.handleConnectionFailure();
            return;
        }

        // Process any pending chunks if connection is healthy
        if (this.pendingAudioChunks.length > 0 && !this.isProcessingChunks) {
            this.processPendingChunks();
        }
    }

    async handleConnectionFailure() {
        if (this._isShuttingDown || this.isProcessingChunks) {
            debug('Skipping reconnection - shutdown in progress or already processing');
            return;
        }

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            debug('Max reconnection attempts reached');
            this.socket.emit('deepgram_error', {
                error: 'Max reconnection attempts reached',
                details: this.lastConnectionError
            });
            this.cleanup();
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 10000);
        
        debug(`Attempting reconnection in ${delay}ms (attempt ${this.reconnectAttempts})`);
        this.socket.emit('deepgram_status', {
            status: 'reconnecting',
            attempt: this.reconnectAttempts,
            delay
        });

        await new Promise(resolve => setTimeout(resolve, delay));
        
        if (!this._isShuttingDown) {
            this.initializeDeepgramConnection();
        }
    }

    async processPendingChunks() {
        if (this.isProcessingChunks || this.pendingAudioChunks.length === 0 || this._isShuttingDown) {
            return;
        }

        this.isProcessingChunks = true;
        debug(`Processing ${this.pendingAudioChunks.length} pending chunks`);

        try {
            // Send Finalize message before processing chunks
            if (this.deepgramConnection && this.deepgramConnection.readyState === WebSocket.OPEN) {
                await this.sendControlMessage({ type: 'Finalize' });
            }

            while (this.pendingAudioChunks.length > 0 && !this._isShuttingDown) {
                const chunk = this.pendingAudioChunks.shift();
                try {
                    await this.sendAudioChunk(chunk);
                } catch (error) {
                    debug('Error processing pending chunk:', error);
                    // Only put the chunk back if we're not shutting down
                    if (!this._isShuttingDown) {
                        this.pendingAudioChunks.unshift(chunk);
                    }
                    break;
                }
            }
        } finally {
            this.isProcessingChunks = false;
        }
    }

    async initializeDeepgramConnection() {
        if (this._isShuttingDown) {
            debug('Skipping connection initialization - shutdown in progress');
            return;
        }

        if (this.isProcessingChunks) {
            debug('Connection initialization already in progress');
            return;
        }

        // Clear any pending audio chunks to avoid sending stale audio
        debug(`Flushing ${this.pendingAudioChunks.length} pending audio chunks`);
        this.pendingAudioChunks = [];
        this.isProcessingChunks = true;
        
        // Close existing connection if any
        await this.closeExistingConnection();

        try {
            debug('Initializing new Deepgram connection');
            this.deepgramConnection = createDeepgramSocket();
            
            this.deepgramConnection.on('open', async () => {
                debug('Deepgram connection opened');
                this.isProcessingChunks = false;
                this.lastConnectionError = null;
                this._lastAudioSentTime = Date.now();
                this._audioStreamActive = true;
                
                // Reset reconnection state on successful connection
                if (this.deepgramConnection && this.deepgramConnection.readyState === WebSocket.OPEN) {
                    this.reconnectAttempts = 0;
                    this.reconnectDelay = 2000;
                    this.socket.emit('deepgram_status', { status: 'connected' });
                    
                    // Process any pending chunks that arrived during connection
                    if (this.pendingAudioChunks.length > 0) {
                        await this.processPendingChunks();
                    }
                }
            });

            this.deepgramConnection.on('message', (message) => {
                try {
                    const result = JSON.parse(message);
                    if (result.error) {
                        debug('Received error from Deepgram:', result.error);
                        this.socket.emit('deepgram_error', result.error);
                        return;
                    }
                    this.socket.emit('transcription', result);
                } catch (error) {
                    debug('Error parsing Deepgram message:', error);
                }
            });

            this.deepgramConnection.on('error', (error) => {
                debug('Deepgram connection error:', error);
                this.lastConnectionError = error;
                this.handleConnectionFailure();
            });

            this.deepgramConnection.on('close', (code, reason) => {
                debug('Deepgram connection closed:', { code, reason: reason.toString() });
                this.isProcessingChunks = false;
                
                // Don't attempt reconnection if we're shutting down
                if (this._isShuttingDown) {
                    debug('Connection closed during shutdown - not reconnecting');
                    return;
                }
                
                // Handle specific close codes
                switch (code) {
                    case 1000: // Normal closure
                        debug('Normal closure - no reconnect needed');
                        break;
                    case 1006: // Abnormal closure
                        debug('Abnormal closure - attempting immediate reconnect');
                        this.handleConnectionFailure();
                        break;
                    case 1008: // Policy violation
                        debug('Policy violation - check authentication');
                        this.socket.emit('deepgram_error', {
                            error: 'Authentication failed',
                            code
                        });
                        break;
                    default:
                        debug('Unexpected close code:', code);
                        this.handleConnectionFailure();
                }
            });

        } catch (error) {
            debug('Error initializing Deepgram connection:', error);
            this.isProcessingChunks = false;
            this.lastConnectionError = error;
            this.handleConnectionFailure();
        }
    }

    startKeepAlive() {
        // Clear any existing interval
        if (this._keepAliveInterval) {
            clearInterval(this._keepAliveInterval);
        }

        // Send silence every 4 seconds if no audio has been sent
        this._keepAliveInterval = setInterval(async () => {
            if (!this._isShuttingDown && this._audioStreamActive) {
                const timeSinceLastAudio = Date.now() - this._lastAudioSentTime;
                
                // If no audio sent in last 4 seconds, send silence
                if (timeSinceLastAudio > 4000) {
                    try {
                        debug('Sending keep-alive silence');
                        await this.sendAudioChunk(SILENCE_BUFFER);
                        this._lastAudioSentTime = Date.now();
                    } catch (error) {
                        debug('Error sending keep-alive silence:', error);
                        // If we can't send silence, connection might be dead
                        if (!this._isShuttingDown) {
                            this.handleConnectionFailure();
                        }
                    }
                }
            }
        }, 4000);
    }

    async closeExistingConnection() {
        if (this.deepgramConnection) {
            try {
                // Only try to send CloseStream and close if the connection is actually open
                if (this.deepgramConnection.readyState === WebSocket.OPEN) {
                    try {
                        await this.sendControlMessage({ type: 'CloseStream' });
                        // Wait briefly for the message to be sent
                        await new Promise(resolve => setTimeout(resolve, 100));
                        this.deepgramConnection.close(1000, 'Normal closure');
                    } catch (error) {
                        debug('Error during graceful connection close:', error);
                        // Force close if graceful close fails
                        this.deepgramConnection.terminate();
                    }
                } else if (this.deepgramConnection.readyState === WebSocket.CONNECTING) {
                    // If still connecting, just terminate
                    debug('Terminating connection in CONNECTING state');
                    this.deepgramConnection.terminate();
                }
            } catch (error) {
                debug('Error closing existing connection:', error);
                // Ensure connection is terminated even if close fails
                try {
                    this.deepgramConnection.terminate();
                } catch (terminateError) {
                    debug('Error terminating connection:', terminateError);
                }
            }
            this.deepgramConnection = null;
        }
    }

    async sendControlMessage(message) {
        if (!this.deepgramConnection || this.deepgramConnection.readyState !== WebSocket.OPEN) {
            throw new Error('Connection not ready');
        }

        return new Promise((resolve, reject) => {
            try {
                this.deepgramConnection.send(JSON.stringify(message), (error) => {
                    if (error) {
                        debug('Error sending control message:', error);
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            } catch (error) {
                debug('Exception sending control message:', error);
                reject(error);
            }
        });
    }

    async addAudioChunk(chunk) {
        if (this._isShuttingDown) {
            debug('Ignoring audio chunk - shutdown in progress');
            return;
        }

        if (!chunk || chunk.length === 0) {
            debug('Received empty audio chunk');
            return;
        }

        // Initialize connection on first chunk if not already connected
        if (!this._hasReceivedFirstChunk) {
            this._hasReceivedFirstChunk = true;
            if (!this.deepgramConnection) {
                debug('Received first audio chunk - initializing connection');
                await this.initializeDeepgramConnection();
                // Return early - the chunk will be processed once connection is established
                return;
            }
        }

        debug(`Received audio chunk: ${chunk.length} bytes`);
        this._lastAudioSentTime = Date.now();

        // Normalize chunk size
        const normalizedChunks = this.normalizeChunkSize(chunk);
        debug(`Normalized into ${normalizedChunks.length} chunks of ${OPTIMAL_CHUNK_SIZE} bytes`);

        // Queue or send the normalized chunks
        if (!this.deepgramConnection || this.deepgramConnection.readyState !== WebSocket.OPEN) {
            debug('Connection not ready, queueing normalized chunks');
            this.pendingAudioChunks.push(...normalizedChunks);
            return;
        }

        // Send each normalized chunk
        for (const normalizedChunk of normalizedChunks) {
            try {
                await this.sendAudioChunk(normalizedChunk);
            } catch (error) {
                debug('Error sending audio chunk:', error);
                if (!this._isShuttingDown) {
                    this.pendingAudioChunks.push(normalizedChunk);
                    this.handleConnectionFailure();
                    break;  // Stop sending chunks if we encounter an error
                }
            }
        }
    }

    async sendAudioChunk(chunk) {
        if (!this.deepgramConnection || this.deepgramConnection.readyState !== WebSocket.OPEN) {
            throw new Error('Connection not ready');
        }

        return new Promise((resolve, reject) => {
            try {
                this.deepgramConnection.send(chunk, { binary: true }, (error) => {
                    if (error) {
                        debug('Error in WebSocket send:', error);
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            } catch (error) {
                debug('Exception in WebSocket send:', error);
                reject(error);
            }
        });
    }

    async processCompleteTranscription() {
        try {
            debug('Processing complete transcription:', this.currentTranscription);
            
            // Only process if we have meaningful content
            if (this.currentTranscription.trim().length < 2) {
                debug('Skipping processing for very short transcription');
                return;
            }
            
            // Add to conversation history
            this.conversationHistory.push({
                role: 'user',
                content: this.currentTranscription
            });

            // Get AI response using OpenAI
            debug('Requesting AI response');
            const aiResponse = await this.getAIResponse();
            debug('Received AI response:', aiResponse);
            
            // Convert to speech
            debug('Converting to speech');
            const audioResponse = await this.textToSpeech(aiResponse);
            debug('Speech conversion complete');
            
            // Send response to client
            this.socket.emit('ai_response', {
                text: aiResponse,
                audio: audioResponse,
                transcription: this.currentTranscription
            });
            
            // Clear current transcription
            this.currentTranscription = '';
            
        } catch (error) {
            logger.error('Error in complete transcription processing:', error);
            this.socket.emit('error', {
                message: 'Error processing conversation',
                details: error.message
            });
        }
    }

    // OpenAI methods for chat and TTS
    async getAIResponse() {
        try {
            const response = await openai.chat(this.conversationHistory);
            const aiMessage = response.choices[0].message;
            this.conversationHistory.push(aiMessage);
            return aiMessage.content;
        } catch (error) {
            logger.error('Error getting AI response:', error);
            throw error;
        }
    }

    async textToSpeech(text) {
        try {
            return await openai.speak(text);
        } catch (error) {
            logger.error('Text-to-speech error:', error);
            throw error;
        }
    }

    clearConversation() {
        if (this._isShuttingDown) {
            debug('Already shutting down - skipping clearConversation');
            return;
        }

        this._isShuttingDown = true;

        // Clear the connection monitor first
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
        }

        // Clear any pending connection timeout
        if (this._connectionTimeoutId) {
            clearTimeout(this._connectionTimeoutId);
            this._connectionTimeoutId = null;
        }

        // Clear keep-alive interval
        if (this._keepAliveInterval) {
            clearInterval(this._keepAliveInterval);
            this._keepAliveInterval = null;
        }

        // Close connection and reset state
        this.closeExistingConnection()
            .catch(error => debug('Error during connection cleanup:', error))
            .finally(() => {
                this.conversationHistory = [SYSTEM_MESSAGE];
                this.currentTranscription = '';
                this.isSpeaking = false;
                this.speechStartTime = null;
                this.lastVadEvent = null;
                this.pendingAudioChunks = [];
                this.isProcessing = false;
                this.isProcessingChunks = false;
                this.reconnectAttempts = 0;
                this.reconnectDelay = 2000;
                this.lastConnectionError = null;
                this.lastPongTime = null;
                this._lastAudioSentTime = null;
                this._audioStreamActive = false;
                this._isShuttingDown = false;
                debug('Conversation history and Deepgram connection cleared');
            });
    }

    cleanup() {
        if (this._isShuttingDown) {
            debug('Already shutting down - skipping cleanup');
            return;
        }

        this._isShuttingDown = true;
        this._audioStreamActive = false;
        this._partialChunk = null;  // Clear any partial chunk

        // Clear all intervals first
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
        }

        if (this._connectionTimeoutId) {
            clearTimeout(this._connectionTimeoutId);
            this._connectionTimeoutId = null;
        }

        if (this._keepAliveInterval) {
            clearInterval(this._keepAliveInterval);
            this._keepAliveInterval = null;
        }
        
        // Close connection and cleanup state
        this.closeExistingConnection()
            .catch(error => debug('Error during cleanup:', error))
            .finally(() => {
                this.pendingAudioChunks = [];
                this.isProcessingChunks = false;
                this._lastAudioSentTime = null;
                this._isShuttingDown = false;
                debug('Cleanup completed');
            });
    }
}

module.exports = AudioProcessor; 