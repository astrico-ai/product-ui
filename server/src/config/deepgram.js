require('dotenv').config();
const WebSocket = require('ws');
const debug = require('debug')('app:deepgram');

if (!process.env.DEEPGRAM_API_KEY) {
    throw new Error('DEEPGRAM_API_KEY is not set in environment variables');
}

// Configuration object for Deepgram services
const config = {
    wsUrl: 'wss://api.deepgram.com/v1/listen',
    apiKey: process.env.DEEPGRAM_API_KEY
};

// Function to create a new WebSocket connection
function createDeepgramSocket(options = {}) {
    // Only include minimal required parameters
    const params = {
        encoding: 'linear16',
        sample_rate: 16000,
        channels: 1,
        model: 'nova-2',
        language: 'hi',
        vad_events: true,
        interim_results: true,
        // More conservative endpointing to avoid premature closure
        utterance_end_ms: "1000",    // Reduced to be less aggressive with silence detection
        endpointing: "500",          // Reduced to be less aggressive with pause detection
        // Disable built-in keepalive to handle it manually
        keepalive: false
    };

    const queryString = Object.entries(params)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');
    
    const wsUrl = `${config.wsUrl}?${queryString}`;
    debug('Creating WebSocket with URL:', wsUrl);
    
    // Create WebSocket with enhanced error handling
    const ws = new WebSocket(wsUrl, {
        headers: {
            'Authorization': `Token ${config.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        handshakeTimeout: 10000,      // 10 second timeout for initial connection
        maxPayload: 2 * 1024 * 1024,  // 2MB max payload size
        followRedirects: true,
        perMessageDeflate: false      // Disable compression for real-time audio
    });

    // Track connection state
    let isConnecting = true;
    let lastActivity = Date.now();
    let pingInterval = null;
    let connectionTimeout = null;
    
    // Connection timeout handler
    connectionTimeout = setTimeout(() => {
        if (isConnecting) {
            debug('Connection timeout - terminating socket');
            cleanup();
            try {
                ws.terminate();
            } catch (error) {
                debug('Error terminating connection on timeout:', error);
            }
        }
    }, 10000);

    function cleanup() {
        if (pingInterval) clearInterval(pingInterval);
        if (connectionTimeout) clearTimeout(connectionTimeout);
        pingInterval = null;
        connectionTimeout = null;
        isConnecting = false;
    }

    // Add connection verification
    ws.on('unexpected-response', (request, response) => {
        isConnecting = false;
        cleanup();
        
        const status = response.statusCode;
        const headers = response.headers;
        
        debug('Unexpected response from Deepgram:', {
            status,
            headers,
            timestamp: new Date().toISOString()
        });

        // Handle specific error conditions
        if (status === 401 || status === 403) {
            try {
                ws.terminate();
            } catch (error) {
                debug('Error terminating connection after auth failure:', error);
            }
        } else if (status === 429) {
            const retryAfter = parseInt(headers['retry-after'] || '60', 10);
            try {
                ws.terminate();
            } catch (error) {
                debug('Error terminating connection after rate limit:', error);
            }
        } else {
            try {
                ws.terminate();
            } catch (error) {
                debug('Error terminating connection after unexpected response:', error);
            }
        }
    });

    ws.on('upgrade', (response) => {
        debug('WebSocket upgrade successful:', {
            status: response.statusCode,
            headers: response.headers,
            timestamp: new Date().toISOString()
        });
    });

    ws.on('open', () => {
        isConnecting = false;
        cleanup();
        lastActivity = Date.now();
        debug('WebSocket connection opened successfully');

        // Setup ping interval - every 4 seconds
        pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                try {
                    // Check for inactivity
                    const inactiveTime = Date.now() - lastActivity;
                    if (inactiveTime > 12000) { // 12 seconds of inactivity
                        debug('Connection inactive for too long');
                        cleanup();
                        ws.close(1000, 'Connection inactive');
                        return;
                    }

                    ws.ping();
                } catch (error) {
                    debug('Error sending ping:', error);
                    cleanup();
                    ws.close(1011, 'Failed to send ping');
                }
            }
        }, 4000);
    });

    ws.on('message', (data) => {
        lastActivity = Date.now();
        try {
            const message = JSON.parse(data);
            
            // Handle VAD events
            if (message.type === 'VADEvent') {
                debug('Received VAD event:', message);
                // You can emit these events to the client if needed
            }
            
            // Handle speech detected events
            if (message.speech_started) {
                debug('Speech detected');
            }
            
            // Handle specific message types
            if (message.type === 'Results' && message.is_final) {
                debug('Received final results');
            }
        } catch (error) {
            debug('Error parsing message:', error);
        }
    });

    ws.on('pong', () => {
        lastActivity = Date.now();
        debug('Received pong from Deepgram');
    });

    // Cleanup on close
    ws.on('close', (code, reason) => {
        cleanup();
        debug('WebSocket connection closed:', {
            code,
            reason: reason.toString(),
            timestamp: new Date().toISOString(),
            lastActivity: new Date(lastActivity).toISOString()
        });

        // Handle specific close codes per Deepgram documentation
        switch (code) {
            case 1000: // Normal closure
                debug('Normal closure');
                break;
            case 1006: // Abnormal closure
                debug('Abnormal closure - possible network issue');
                break;
            case 1008: // Policy violation
                debug('Policy violation:', reason.toString());
                break;
            case 1011: // Server error
                debug('Server error:', reason.toString());
                break;
            case 1012: // Service restart
                debug('Service restarting');
                break;
            case 1013: // Try again later
                debug('Service temporarily unavailable');
                break;
        }
    });

    ws.on('error', (error) => {
        debug('WebSocket error:', {
            error: error.message,
            code: error.code,
            type: error.type,
            timestamp: new Date().toISOString()
        });
        cleanup();
        
        // If still connecting, terminate instead of close
        if (ws.readyState === WebSocket.CONNECTING) {
            try {
                ws.terminate();
            } catch (terminateError) {
                debug('Error terminating connection after error:', terminateError);
            }
        }
    });
    
    return ws;
}

module.exports = {
    createDeepgramSocket,
    config
}; 