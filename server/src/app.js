require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const debug = require('debug')('app:server');

const { logger, stream } = require('./utils/logger');
const { errorHandler } = require('./utils/errors');
const pdfRoutes = require('./routes/pdfs');

// Initialize express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST", "DELETE"]
    }
});

// Middleware
// CORS configuration - allow requests from frontend domain
const corsOptions = {
    origin: process.env.CLIENT_URL || (process.env.VERCEL ? 'https://demo.astrico.ai' : 'http://localhost:5173'),
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev', { stream }));
app.use(express.static(__dirname + '/../'));

// Basic route for testing
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

// PDF Routes
app.use('/api/pdfs', pdfRoutes);

// WebSocket connection handling
io.on('connection', (socket) => {
    debug(`New client connected: ${socket.id}`);
    
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

// Export app for Vercel serverless functions
// Only start server if not in Vercel environment
if (process.env.VERCEL !== '1') {
    // Start server (for local development)
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        logger.info(`PDF API routes registered at /api/pdfs`);
        debug(`Debug mode is ${process.env.DEBUG_MODE ? 'enabled' : 'disabled'}`);
    });
}

// Export app for Vercel
module.exports = app; 