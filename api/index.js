// Vercel serverless function wrapper for Express app
// This file allows the Express backend to run on Vercel

// Set Vercel environment flag
process.env.VERCEL = '1';

// Load environment variables
require('dotenv').config();

const app = require('../server/src/app');

// Export as Vercel serverless function handler
module.exports = (req, res) => {
  return app(req, res);
};

