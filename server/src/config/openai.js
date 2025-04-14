const OpenAI = require('openai');
const debug = require('debug')('app:openai');
const fs = require('fs');
const path = require('path');
const os = require('os');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

debug('OpenAI client initialized');

// Configuration object for different OpenAI services
const config = {
    transcription: {
        model: 'gpt-4o-transcribe',  // Using GPT-4 Mini for transcription
        language: 'en',  // Changed to English
        response_format: 'text',  // Changed to text format as per docs
        temperature: 0.3,  // Lower temperature for more accurate transcription
        stream: true      // Enable streaming
    },
    gpt4: {
        model: 'gpt-4o',
        temperature: 0.7,
        max_tokens: 200,
        presence_penalty: 0.6,
        frequency_penalty: 0.3
    },
    tts: {
        model: 'tts-1',
        voice: 'nova',
        response_format: 'mp3',
        speed: 1.0
    }
};

debug('OpenAI configuration:', JSON.stringify(config, null, 2));

// Create a temporary file and return its path
const createTempFile = (buffer) => {
    const tempPath = path.join(os.tmpdir(), `audio-${Date.now()}.webm`);
    fs.writeFileSync(tempPath, buffer);
    return tempPath;
};

// OpenAI wrapper with error handling
module.exports = {
    // Regular chat completion
    chat: async (messages) => {
        try {
            debug('Sending chat completion request with config:', JSON.stringify(config.gpt4, null, 2));
            const response = await openai.chat.completions.create({
                messages,
                ...config.gpt4
            });
            debug('Chat completion successful');
            return response;
        } catch (error) {
            debug('Chat completion error:', {
                name: error.name,
                message: error.message,
                code: error.code,
                response: error.response?.data
            });
            throw error;
        }
    },

    // Text to speech
    speak: async (text) => {
        try {
            debug('Converting text to speech with config:', JSON.stringify(config.tts, null, 2));
            const mp3Response = await openai.audio.speech.create({
                input: text,
                ...config.tts
            });
            
            debug('Text-to-speech conversion successful');
            const buffer = Buffer.from(await mp3Response.arrayBuffer());
            debug(`Generated audio buffer length: ${buffer.length}`);
            return buffer;
        } catch (error) {
            debug('Text-to-speech error:', {
                name: error.name,
                message: error.message,
                code: error.code,
                response: error.response?.data
            });
            throw error;
        }
    },

    // Transcription with streaming
    transcribe: async (fileStream, options = {}) => {
        try {
            debug('Starting transcription with config:', JSON.stringify(config.transcription, null, 2));
            const response = await openai.audio.transcriptions.create({
                file: fileStream,
                model: 'whisper-1',
                language: 'hi',
                response_format: 'text',
                ...options
            });
            
            debug('Transcription request successful');
            return response;
        } catch (error) {
            debug('Transcription error:', {
                name: error.name,
                message: error.message,
                code: error.code,
                response: error.response?.data
            });
            throw error;
        }
    }
}; 