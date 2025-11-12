const { logger } = require('./logger');

/**
 * Logs full OpenRouter API request payload
 * @param {Object} payload - Full request payload
 * @param {string} requestId - Unique request identifier
 */
const logOpenRouterRequest = (payload, requestId = '') => {
  logger.info('');
  logger.info('═══════════════════════════════════════════════════════════');
  logger.info(`📤 [OPENROUTER] FULL REQUEST PAYLOAD ${requestId ? `[${requestId}]` : ''}`);
  logger.info('═══════════════════════════════════════════════════════════');
  logger.info(JSON.stringify(payload, null, 2));
  logger.info('═══════════════════════════════════════════════════════════');
  logger.info('');
};

/**
 * Logs full OpenRouter API response payload
 * @param {Object} responseData - Full response data from API
 * @param {string} requestId - Unique request identifier
 */
const logOpenRouterResponse = (responseData, requestId = '') => {
  logger.info('');
  logger.info('═══════════════════════════════════════════════════════════');
  logger.info(`📥 [OPENROUTER] FULL RESPONSE PAYLOAD ${requestId ? `[${requestId}]` : ''}`);
  logger.info('═══════════════════════════════════════════════════════════');
  logger.info(JSON.stringify(responseData, null, 2));
  logger.info('═══════════════════════════════════════════════════════════');
  logger.info('');
};

/**
 * Logs OpenRouter API error with full details
 * @param {Error} error - Error object
 * @param {Object} errorData - Additional error data
 * @param {string} requestId - Unique request identifier
 */
const logOpenRouterError = (error, errorData = {}, requestId = '') => {
  logger.error('');
  logger.error('═══════════════════════════════════════════════════════════');
  logger.error(`❌ [OPENROUTER] ERROR ${requestId ? `[${requestId}]` : ''}`);
  logger.error('═══════════════════════════════════════════════════════════');
  logger.error('Error Message:', error.message);
  logger.error('Error Details:', JSON.stringify(errorData, null, 2));
  if (error.response?.data) {
    logger.error('Error Response Data:', JSON.stringify(error.response.data, null, 2));
  }
  logger.error('═══════════════════════════════════════════════════════════');
  logger.error('');
};

module.exports = {
  logOpenRouterRequest,
  logOpenRouterResponse,
  logOpenRouterError
};
