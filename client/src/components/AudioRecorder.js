import { useState, useEffect, useRef } from 'react';
import { createVAD } from '@ricky0123/vad-web';

// Audio configuration
const SAMPLE_RATE = 16000;
const CHANNELS = 1;
const BYTES_PER_SAMPLE = 2;
const CHUNK_DURATION_MS = 100;
const SAMPLES_PER_CHUNK = Math.floor(SAMPLE_RATE * (CHUNK_DURATION_MS / 1000));
const CHUNK_SIZE = SAMPLES_PER_CHUNK * BYTES_PER_SAMPLE * CHANNELS;

// VAD configuration
const VAD_MODE = {
    NORMAL: 0,
    LOW_BITRATE: 1,
    AGGRESSIVE: 2,
    VERY_AGGRESSIVE: 3
};

class AudioBuffer {
    constructor(maxSize = 50) {  // 5 seconds of audio
        this.buffer = [];
        this.maxSize = maxSize;
    }

    push(chunk) {
        this.buffer.push(chunk);
        if (this.buffer.length > this.maxSize) {
            this.buffer.shift();
        }
    }

    clear() {
        this.buffer = [];
    }

    getBuffer() {
        return [...this.buffer];
    }

    getLastNChunks(n) {
        return this.buffer.slice(-n);
    }
}

export function AudioRecorder({ socket, isConnected }) {
    const [isRecording, setIsRecording] = useState(false);
    const [error, setError] = useState(null);
    
    // Audio refs
    const audioContext = useRef(null);
    const audioWorklet = useRef(null);
    const mediaStream = useRef(null);
    
    // VAD refs
    const vadInstance = useRef(null);
    const isSpeaking = useRef(false);
    const vadBuffer = useRef(new AudioBuffer());
    const speechBuffer = useRef(new AudioBuffer());
    const lastProcessedTime = useRef(Date.now());
    
    // Cleanup function
    useEffect(() => {
        return () => cleanup();
    }, []);

    const cleanup = () => {
        stopRecording();
        if (vadInstance.current) {
            vadInstance.current.destroy();
            vadInstance.current = null;
        }
        if (mediaStream.current) {
            mediaStream.current.getTracks().forEach(track => track.stop());
            mediaStream.current = null;
        }
        vadBuffer.current.clear();
        speechBuffer.current.clear();
    };

    const initializeVAD = async () => {
        try {
            vadInstance.current = await createVAD({
                onSpeechStart: handleSpeechStart,
                onSpeechEnd: handleSpeechEnd,
                onVADMisfire: handleVADMisfire,
                mode: VAD_MODE.NORMAL,
                workletURL: '/vad.worklet.js',  // Make sure this exists in public folder
                minSpeechFrames: 4,
                maxSilenceFrames: 8,
                vadThreshold: 0.8,
                sampleRate: SAMPLE_RATE,
                frameSamples: SAMPLES_PER_CHUNK
            });
            console.log('VAD initialized successfully');
        } catch (error) {
            console.error('VAD initialization failed:', error);
            throw error;
        }
    };

    const handleSpeechStart = () => {
        console.log('Speech detected');
        isSpeaking.current = true;
        
        // Get the last 2 chunks (200ms) of audio as pre-speech buffer
        const preSpeechBuffer = vadBuffer.current.getLastNChunks(2);
        if (preSpeechBuffer.length > 0) {
            speechBuffer.current.buffer.push(...preSpeechBuffer);
        }
    };

    const handleSpeechEnd = () => {
        console.log('Speech ended');
        isSpeaking.current = false;
        
        // Only send if we have accumulated enough speech
        if (speechBuffer.current.buffer.length >= 3) {  // At least 300ms of speech
            // Get the next chunk as post-speech buffer
            const postSpeechBuffer = vadBuffer.current.getLastNChunks(1);
            if (postSpeechBuffer.length > 0) {
                speechBuffer.current.buffer.push(...postSpeechBuffer);
            }
            
            // Send the speech buffer
            sendSpeechBuffer();
        }
        
        // Clear the speech buffer
        speechBuffer.current.clear();
    };

    const handleVADMisfire = () => {
        console.log('VAD misfire');
        isSpeaking.current = false;
        speechBuffer.current.clear();
    };

    const sendSpeechBuffer = () => {
        if (!socket || !isConnected || speechBuffer.current.buffer.length === 0) return;

        const audioData = speechBuffer.current.buffer;
        console.log(`Sending speech buffer: ${audioData.length} chunks`);
        
        // Convert chunks to the correct format if needed
        const formattedAudio = audioData.map(chunk => {
            // Ensure chunk is Int16Array
            return chunk instanceof Int16Array ? chunk : new Int16Array(chunk);
        });

        socket.emit('audio_data', formattedAudio);
    };

    const processAudioChunk = async (chunk) => {
        try {
            // Check if the chunk is marked as silent
            if (chunk.isSilent && !isSpeaking.current) {
                // Store minimal context during silence
                const lastChunk = vadBuffer.current.getLastNChunks(1)[0];
                if (lastChunk) {
                    vadBuffer.current.clear();
                    vadBuffer.current.push(lastChunk);
                }
                return;
            }

            // Throttle processing to avoid overwhelming the VAD
            const now = Date.now();
            if (now - lastProcessedTime.current < 10) return;  // Max 100 chunks per second
            lastProcessedTime.current = now;

            // Store raw audio for context
            vadBuffer.current.push(chunk);

            // Only process if VAD is ready
            if (!vadInstance.current) return;

            // Process through VAD
            const isSpeech = await vadInstance.current.process(chunk);
            
            // Store speech if detected
            if (isSpeech || isSpeaking.current) {
                speechBuffer.current.push(chunk);
            }

        } catch (error) {
            console.error('Error processing audio chunk:', error);
        }
    };

    const startRecording = async () => {
        try {
            await initializeVAD();

            // Get audio stream with specific constraints
            mediaStream.current = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: CHANNELS,
                    sampleRate: SAMPLE_RATE,
                    sampleSize: BYTES_PER_SAMPLE * 8,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            // Create audio context
            audioContext.current = new AudioContext({
                sampleRate: SAMPLE_RATE,
                latencyHint: 'interactive'
            });

            // Create processing pipeline
            const source = audioContext.current.createMediaStreamSource(mediaStream.current);
            
            // Initialize audio worklet with silence detection
            await audioContext.current.audioWorklet.addModule('/audioProcessor.js');
            audioWorklet.current = new AudioWorkletNode(audioContext.current, 'audio-processor', {
                processorOptions: {
                    sampleRate: SAMPLE_RATE,
                    chunkSize: SAMPLES_PER_CHUNK,
                    silenceThreshold: 0.001,
                    processingInterval: 3 // Process every 3rd chunk during silence
                }
            });

            // Handle audio chunks
            audioWorklet.current.port.onmessage = async (event) => {
                await processAudioChunk(event.data);
            };

            // Connect nodes
            source.connect(audioWorklet.current);
            audioWorklet.current.connect(audioContext.current.destination);

            setIsRecording(true);
            setError(null);

        } catch (error) {
            console.error('Failed to start recording:', error);
            setError(`Failed to start recording: ${error.message}`);
            cleanup();
        }
    };

    const stopRecording = () => {
        try {
            if (audioWorklet.current) {
                audioWorklet.current.disconnect();
                audioWorklet.current = null;
            }

            if (audioContext.current) {
                audioContext.current.close();
                audioContext.current = null;
            }

            if (mediaStream.current) {
                mediaStream.current.getTracks().forEach(track => track.stop());
                mediaStream.current = null;
            }

            if (vadInstance.current) {
                vadInstance.current.destroy();
                vadInstance.current = null;
            }

            vadBuffer.current.clear();
            speechBuffer.current.clear();
            isSpeaking.current = false;

            setIsRecording(false);
        } catch (error) {
            console.error('Failed to stop recording:', error);
            setError(`Failed to stop recording: ${error.message}`);
        }
    };

    return (
        <div className="audio-recorder">
            <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!isConnected}
                className={`record-button ${isRecording ? 'recording' : ''} ${!isConnected ? 'disabled' : ''}`}
            >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
            {error && <div className="error-message">{error}</div>}
            {isSpeaking.current && <div className="speaking-indicator">Speaking...</div>}
        </div>
    );
} 