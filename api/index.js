// Vercel serverless function wrapper for Express app
// This file allows the Express backend to run on Vercel

// Set Vercel environment flag
process.env.VERCEL = '1';

const app = require('../server/src/app');

module.exports = app;

