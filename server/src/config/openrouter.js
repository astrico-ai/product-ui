const { logger } = require('../utils/logger');

// OpenRouter Configuration
const openrouterConfig = {
  apiKey: process.env.OPENROUTER_API_KEY,
  baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  model: process.env.OPENROUTER_MODEL || 'claude-3.5-sonnet',
  timeout: parseInt(process.env.OPENROUTER_TIMEOUT || '60000'),
  maxRetries: 3,
  retryDelay: 1000, // 1 second between retries
  rateLimit: {
    maxRequests: 100,
    windowMs: 60000 // per minute
  }
};

// Validate OpenRouter configuration
const validateOpenRouterConfig = () => {
  if (!process.env.OPENROUTER_API_KEY) {
    logger.warn('OPENROUTER_API_KEY not configured - PDF analysis will fail');
  }
  
  logger.info('OpenRouter Configuration loaded', {
    baseUrl: openrouterConfig.baseUrl,
    model: openrouterConfig.model,
    timeout: openrouterConfig.timeout,
    apiKeyConfigured: !!process.env.OPENROUTER_API_KEY
  });
};

// Initialize validation on module load
if (process.env.NODE_ENV !== 'test') {
  validateOpenRouterConfig();
}

// Export configuration
module.exports = {
  openrouterConfig,
  validateOpenRouterConfig,
  
  // Helper function to get headers for OpenRouter API calls
  getHeaders: () => ({
    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.APP_NAME || 'product-ui',
    'X-Title': 'PDF Analysis Module'
  }),
  
  // Helper function to create message payload for OpenRouter
  // Accepts array of PDFs with either 'data' (base64) or 'url' (signed URL)
  // Uses OpenRouter's file format: https://openrouter.ai/docs/features/multimodal/pdfs
  createMessagePayload: (pdfArray, query) => ({
    model: openrouterConfig.model,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: query
          },
          ...pdfArray.map((pdf) => {
            // OpenRouter format differs based on input type:
            // - URLs: use "fileData" (camelCase) with direct URL
            // - Base64: use "file_data" (snake_case) with "data:application/pdf;base64," prefix
            if (pdf.url) {
              // URL-based format (most efficient)
              return {
                type: 'file',
                file: {
                  filename: pdf.filename || 'document.pdf',
                  fileData: pdf.url
                }
              };
            } else {
              // Base64 format (for local files)
              const base64WithPrefix = pdf.data.startsWith('data:') 
                ? pdf.data 
                : `data:application/pdf;base64,${pdf.data}`;
              
              return {
                type: 'file',
                file: {
                  filename: pdf.filename || 'document.pdf',
                  file_data: base64WithPrefix
                }
              };
            }
          })
        ]
      }
    ],
    // CRITICAL: Explicitly configure PDF processing engine
    // https://openrouter.ai/docs/features/multimodal/pdfs#plugin-configuration
    plugins: [
      {
        id: 'file-parser',
        pdf: {
          // Use 'native' for Claude models that support PDF natively
          // Falls back to 'mistral-ocr' if native not available
          engine: 'native'
        }
      }
    ],
    temperature: 0.7,
    max_tokens: 2000,
    top_p: 1
  })
};
