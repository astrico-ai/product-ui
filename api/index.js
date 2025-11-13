// Vercel serverless function wrapper for Express app
// This file allows the Express backend to run on Vercel

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Set Vercel environment flag
process.env.VERCEL = '1';

// Get current directory in ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create require function for CommonJS modules
const require = createRequire(import.meta.url);

// Load environment variables
require('dotenv').config();

// Load Express app (CommonJS module)
const app = require(join(__dirname, '../server/src/app.js'));

// Export as Vercel serverless function handler
export default (req, res) => {
  return app(req, res);
};

