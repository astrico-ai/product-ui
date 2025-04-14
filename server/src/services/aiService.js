const openai = require('../config/openai');
const debug = require('debug')('app:ai-service');

// Export the OpenAI instance directly
module.exports = openai; 