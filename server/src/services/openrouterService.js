const axios = require('axios');
const { openrouterConfig, getHeaders, createMessagePayload } = require('../config/openrouter');
const { logger } = require('../utils/logger');
const { logOpenRouterRequest, logOpenRouterResponse, logOpenRouterError } = require('../utils/apiLogger');

/**
 * Analyzes PDFs using OpenRouter API with Claude 4.5 Sonnet
 * @param {Array} pdfArray - Array of objects with {filename, url OR data (base64), id}
 * @param {string} query - User query/question about the PDFs
 * @param {string} userMessage - Optional additional context
 * @returns {Promise<Object>} Analysis result with response and metadata
 */
const analyzePDFs = async (pdfArray, query, userMessage = '') => {
  const startTime = Date.now();
  
  try {
    if (!pdfArray || pdfArray.length === 0) {
      throw new Error('No PDFs provided for analysis');
    }

    if (!query || query.trim().length === 0) {
      throw new Error('Query is required');
    }

    // Determine input method (URL-based is more efficient)
    const inputMethod = pdfArray[0]?.url ? 'url' : 'base64';

    logger.info('📊 [OPENROUTER] PDF Analysis Request Started', {
      pdfCount: pdfArray.length,
      queryLength: query.length,
      hasUserMessage: !!userMessage,
      inputMethod,
      timestamp: new Date().toISOString()
    });

    // Build the message content
    const finalQuery = userMessage 
      ? `${query}\n\nAdditional context: ${userMessage}`
      : query;

    const payload = createMessagePayload(pdfArray, finalQuery);

    logger.debug('📤 [OPENROUTER] Request Payload', {
      model: payload.model,
      messagesCount: payload.messages.length,
      contentItemsCount: payload.messages[0]?.content?.length || 0,
      temperature: payload.temperature,
      max_tokens: payload.max_tokens,
      payloadSize: JSON.stringify(payload).length,
      inputMethod,
      pdfFiles: pdfArray.map(pdf => ({
        filename: pdf.filename,
        inputType: pdf.url ? 'url' : 'base64',
        ...(pdf.url ? { urlLength: pdf.url.length } : { dataSize: pdf.data?.length })
      }))
    });

    // ✅ LOG FULL REQUEST JSON
    logOpenRouterRequest(payload, `analyze-${Date.now()}`);

    const response = await makeOpenRouterRequest(payload, startTime);

    // ✅ LOG FULL RESPONSE JSON
    logOpenRouterResponse(response, `analyze-${Date.now()}`);

    // Extract analysis text from response
    const analysis = response.choices?.[0]?.message?.content || '';

    if (!analysis) {
      throw new Error('No analysis returned from OpenRouter');
    }

    const result = {
      success: true,
      analysis,
      referencedPdfs: pdfArray.map(pdf => ({
        id: pdf.id,
        filename: pdf.filename
      })),
      tokensUsed: {
        input: response.usage?.prompt_tokens || 0,
        output: response.usage?.completion_tokens || 0,
        total: response.usage?.total_tokens || 0
      },
      model: response.model || openrouterConfig.model,
      timestamp: new Date().toISOString()
    };

    const duration = Date.now() - startTime;

    logger.info('✅ [OPENROUTER] PDF Analysis Complete', {
      pdfCount: pdfArray.length,
      tokensUsed: result.tokensUsed,
      analysisLength: analysis.length,
      duration: `${duration}ms`,
      inputMethod,
      model: result.model,
      timestamp: result.timestamp
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('❌ [OPENROUTER] PDF Analysis Failed', {
      error: error.message,
      pdfCount: pdfArray?.length || 0,
      duration: `${duration}ms`,
      stack: error.stack
    });

    // ✅ LOG FULL ERROR DETAILS
    logOpenRouterError(error, { 
      pdfCount: pdfArray?.length || 0, 
      duration 
    }, `analyze-${Date.now()}`);
    
    throw error;
  }
};

/**
 * Makes a request to OpenRouter API with retry logic
 * @param {Object} payload - Message payload for OpenRouter
 * @param {number} startTime - Start time for performance tracking
 * @param {number} retryCount - Current retry count
 * @returns {Promise<Object>} API response
 */
const makeOpenRouterRequest = async (payload, startTime, retryCount = 0) => {
  const requestStartTime = Date.now();
  
  try {
    const url = `${openrouterConfig.baseUrl}/chat/completions`;
    const headers = getHeaders();

    logger.debug('📡 [OPENROUTER] Sending HTTP Request', {
      method: 'POST',
      url,
      model: payload.model,
      retryCount,
      headers: {
        'Authorization': `Bearer ${headers.Authorization ? '***' : 'NOT_SET'}`,
        'Content-Type': headers['Content-Type'],
        'HTTP-Referer': headers['HTTP-Referer'],
        'X-Title': headers['X-Title']
      },
      timeout: openrouterConfig.timeout
    });

    const response = await axios.post(url, payload, {
      headers,
      timeout: openrouterConfig.timeout,
      validateStatus: (status) => status < 500 // Don't throw on 4xx errors
    });

    const requestDuration = Date.now() - requestStartTime;

    // Log response metadata
    logger.debug('📥 [OPENROUTER] HTTP Response Received', {
      statusCode: response.status,
      statusText: response.statusText,
      duration: `${requestDuration}ms`,
      contentLength: JSON.stringify(response.data).length,
      headers: {
        'content-type': response.headers['content-type'],
        'x-ratelimit-limit-requests': response.headers['x-ratelimit-limit-requests'],
        'x-ratelimit-limit-tokens': response.headers['x-ratelimit-limit-tokens'],
        'x-ratelimit-remaining-requests': response.headers['x-ratelimit-remaining-requests'],
        'x-ratelimit-remaining-tokens': response.headers['x-ratelimit-remaining-tokens'],
        'x-ratelimit-reset-requests': response.headers['x-ratelimit-reset-requests'],
        'x-ratelimit-reset-tokens': response.headers['x-ratelimit-reset-tokens']
      }
    });

    // Handle rate limiting (429)
    if (response.status === 429) {
      const retryAfter = parseInt(response.headers['retry-after']) || 60;
      logger.warn('⚠️  [OPENROUTER] Rate Limit Hit (429)', {
        retryAfter: `${retryAfter}s`,
        retryCount,
        maxRetries: openrouterConfig.maxRetries,
        message: response.data?.error?.message || 'Rate limited'
      });

      if (retryCount < openrouterConfig.maxRetries) {
        logger.info('🔄 [OPENROUTER] Retrying After Rate Limit', {
          retryCount: retryCount + 1,
          waitTime: `${openrouterConfig.retryDelay * (retryCount + 1)}ms`
        });
        await sleep(openrouterConfig.retryDelay * (retryCount + 1));
        return makeOpenRouterRequest(payload, startTime, retryCount + 1);
      }

      throw new Error(`OpenRouter API rate limit exceeded. Retry after ${retryAfter}s`);
    }

    // Handle other errors
    if (response.status >= 400) {
      const errorMessage = response.data?.error?.message || `OpenRouter API error: ${response.status}`;
      
      logger.error('❌ [OPENROUTER] API Error Response', {
        statusCode: response.status,
        statusText: response.statusText,
        error: errorMessage,
        errorType: response.data?.error?.type || 'unknown',
        fullError: response.data?.error || {},
        requestDuration: `${requestDuration}ms`
      });

      throw new Error(errorMessage);
    }

    if (!response.data?.choices) {
      logger.error('❌ [OPENROUTER] Invalid Response Format', {
        statusCode: response.status,
        responseKeys: Object.keys(response.data || {}),
        response: response.data
      });
      throw new Error('Invalid response format from OpenRouter API');
    }

    // Log successful response details
    logger.info('✅ [OPENROUTER] API Response Success', {
      statusCode: response.status,
      model: response.data.model,
      choicesCount: response.data.choices?.length || 0,
      tokensUsed: {
        prompt_tokens: response.data.usage?.prompt_tokens || 0,
        completion_tokens: response.data.usage?.completion_tokens || 0,
        total_tokens: response.data.usage?.total_tokens || 0
      },
      requestDuration: `${requestDuration}ms`,
      finishReasons: response.data.choices?.map(c => c.finish_reason) || [],
      rateLimitRemaining: {
        requests: response.headers['x-ratelimit-remaining-requests'],
        tokens: response.headers['x-ratelimit-remaining-tokens']
      }
    });

    return response.data;
  } catch (error) {
    const requestDuration = Date.now() - requestStartTime;

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      logger.warn('⏱️  [OPENROUTER] Request Timeout', {
        code: error.code,
        message: error.message,
        retryCount,
        maxRetries: openrouterConfig.maxRetries,
        duration: `${requestDuration}ms`
      });

      if (retryCount < openrouterConfig.maxRetries) {
        logger.info('🔄 [OPENROUTER] Retrying After Timeout', {
          retryCount: retryCount + 1,
          waitTime: `${openrouterConfig.retryDelay}ms`
        });
        await sleep(openrouterConfig.retryDelay);
        return makeOpenRouterRequest(payload, startTime, retryCount + 1);
      }
    }

    if (error.response) {
      logger.error('❌ [OPENROUTER] HTTP Error', {
        statusCode: error.response.status,
        statusText: error.response.statusText,
        message: error.message,
        data: error.response.data,
        duration: `${requestDuration}ms`
      });
    } else if (error.request) {
      logger.error('❌ [OPENROUTER] Request Error (No Response)', {
        message: error.message,
        code: error.code,
        duration: `${requestDuration}ms`
      });
    } else {
      logger.error('❌ [OPENROUTER] Unknown Error', {
        message: error.message,
        stack: error.stack,
        duration: `${requestDuration}ms`
      });
    }

    throw error;
  }
};

/**
 * Validates OpenRouter API response
 * @param {Object} response - API response
 * @returns {boolean} True if valid
 */
const validateResponse = (response) => {
  return (
    response &&
    response.choices &&
    Array.isArray(response.choices) &&
    response.choices.length > 0 &&
    response.choices[0].message &&
    response.choices[0].message.content
  );
};

/**
 * Helper function to sleep for a given duration
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Formats the analysis response with PDF references
 * @param {Object} analysisResult - Result from analyzePDFs
 * @param {Array} pdfs - Original PDF metadata array
 * @returns {Object} Formatted response
 */
const formatAnalysisResponse = (analysisResult, pdfs = []) => {
  return {
    success: analysisResult.success,
    analysis: analysisResult.analysis,
    referencedPdfs: analysisResult.referencedPdfs,
    tokensUsed: analysisResult.tokensUsed,
    model: analysisResult.model,
    timestamp: analysisResult.timestamp,
    pdfContext: pdfs.map(pdf => ({
      id: pdf.id,
      filename: pdf.filename,
      size: pdf.size
    }))
  };
};

/**
 * Validates that required OpenRouter configuration is present
 * @returns {Object} {valid: boolean, errors: Array}
 */
const validateConfig = () => {
  const errors = [];

  if (!process.env.OPENROUTER_API_KEY) {
    errors.push('OPENROUTER_API_KEY environment variable not set');
  }

  if (!openrouterConfig.baseUrl) {
    errors.push('OpenRouter base URL not configured');
  }

  if (!openrouterConfig.model) {
    errors.push('OpenRouter model not configured');
  }

  const validationResult = {
    valid: errors.length === 0,
    errors
  };

  logger.info('🔐 [OPENROUTER] Configuration Validation', validationResult);

  return validationResult;
};

module.exports = {
  analyzePDFs,
  makeOpenRouterRequest,
  validateResponse,
  formatAnalysisResponse,
  validateConfig,
  sleep
};
