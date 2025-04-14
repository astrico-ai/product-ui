require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const debug = require('debug')('app:server');

const { logger, stream } = require('./utils/logger');
const { errorHandler } = require('./utils/errors');
const AudioProcessor = require('./services/audioProcessor');

// Initialize express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev', { stream }));
app.use(express.static(__dirname + '/../'));

// Basic route for testing
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

// WebSocket connection handling
io.on('connection', (socket) => {
    debug(`New client connected: ${socket.id}`);
    
    // Create audio processor instance for this connection
    const audioProcessor = new AudioProcessor(socket);
    
    socket.on('start_recording', () => {
        debug(`Client ${socket.id} started recording`);
        // Clear any existing conversation
        audioProcessor.clearConversation();
    });

    socket.on('audio_data', async (data) => {
        try {
            debug(`Received audio data from client ${socket.id}, data size: ${data.audio.length}`);
            const audioBuffer = Buffer.from(data.audio, 'base64');
            debug(`Converted to audio buffer, size: ${audioBuffer.length} bytes`);
            await audioProcessor.addAudioChunk(audioBuffer);
        } catch (error) {
            console.error('Error processing audio:', error);
            debug('Audio processing error details:', {
                error: error.message,
                stack: error.stack
            });
            socket.emit('error', { message: 'Error processing audio data' });
        }
    });

    socket.on('end_recording', async () => {
        debug(`Client ${socket.id} ended recording`);
        // No need to process audio here as it's processed in real-time
    });

    socket.on('start_training', async () => {
        try {
            // Clear any existing conversation state
            audioProcessor.clearConversation();
        } catch (error) {
            console.error('Error starting training:', error);
            socket.emit('error', { message: 'Error starting training session' });
        }
    });

    socket.on('end_training', () => {
        debug(`Client ${socket.id} ended training session`);
        // Clear conversation state
        audioProcessor.clearConversation();
    });

    socket.on('disconnect', () => {
        debug(`Client disconnected: ${socket.id}`);
    });
});

// Error handling
app.use(errorHandler);

// Handle unhandled routes
app.use('*', (req, res) => {
    res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on this server!`
    });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    debug(`Debug mode is ${process.env.DEBUG_MODE ? 'enabled' : 'disabled'}`);
}); 