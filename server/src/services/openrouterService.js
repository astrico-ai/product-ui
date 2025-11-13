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

// Removed streamFastLLMStatus - using simple loading indicator instead

/**
 * Detects if the query requests CSV/Excel export
 * @param {string} query - User query
 * @returns {boolean} True if CSV export is requested
 */
const detectCSVRequest = (query) => {
  if (!query) return false;
  const lowerQuery = query.toLowerCase();
  const csvKeywords = [
    'csv', 'excel', 'spreadsheet', 'export', 'download', 
    'in an excel', 'as csv', 'to csv', 'to excel', 'as excel',
    'create csv', 'generate csv', 'create excel', 'generate excel'
  ];
  return csvKeywords.some(keyword => lowerQuery.includes(keyword));
};

/**
 * Converts JSON table structure to CSV string
 * @param {Object} tableData - Object with columns array and rows array
 * @returns {string|null} CSV string or null if invalid
 */
const convertJSONToCSV = (tableData) => {
  if (!tableData || !tableData.columns || !tableData.rows) {
    return null;
  }
  
  const columns = tableData.columns;
  const rows = tableData.rows;
  
  if (columns.length === 0 || rows.length === 0) {
    return null;
  }
  
  // Create CSV header
  const csvLines = [columns.join(',')];
  
  // Create CSV rows
  for (const row of rows) {
    const values = columns.map(col => {
      const value = row[col] || '';
      // Escape commas and quotes in CSV
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return String(value);
    });
    csvLines.push(values.join(','));
  }
  
  return csvLines.join('\n');
};

/**
 * Extracts JSON table data from function calls in streaming response
 * @param {Array} toolCalls - Array of tool calls from streaming response
 * @returns {Object|null} Parsed JSON object with table structure or null if not found
 */
const extractJSONFromToolCalls = (toolCalls) => {
  if (!toolCalls || !Array.isArray(toolCalls) || toolCalls.length === 0) {
    return null;
  }
  
  // Look for return_table_data function call
  for (const toolCall of toolCalls) {
    if (toolCall.type === 'function' && toolCall.function) {
      const functionName = toolCall.function.name;
      const functionArgs = toolCall.function.arguments;
      
      if (functionName === 'return_table_data' && functionArgs) {
        try {
          // Parse function arguments (can be string or already parsed)
          const args = typeof functionArgs === 'string' 
            ? JSON.parse(functionArgs) 
            : functionArgs;
          
          if (args.table && args.table.columns && args.table.rows) {
            return args;
          }
        } catch (e) {
          logger.warn('⚠️ [FUNCTION] Failed to parse function arguments:', e.message);
          continue;
        }
      }
    }
  }
  
  return null;
};

/**
 * Extracts JSON table data from LLM response text (fallback for non-function-call responses)
 * Looks for JSON in markdown code blocks
 * @param {string} text - Full response text from LLM
 * @returns {Object|null} Parsed JSON object with table structure or null if not found
 */
const extractJSONFromResponse = (text) => {
  if (!text) return null;
  
  // Try to find JSON in markdown code blocks
  const jsonCodeBlockRegex = /```(?:json)?\s*\n([\s\S]*?)```/g;
  let match;
  const matches = [];
  
  // Find all JSON code blocks
  while ((match = jsonCodeBlockRegex.exec(text)) !== null) {
    if (match[1]) {
      matches.push(match[1].trim());
    }
  }
  
  // Try to parse each JSON block
  for (const jsonStr of matches) {
    try {
      const parsed = JSON.parse(jsonStr);
      // Check if it has table structure
      if (parsed.table && parsed.table.columns && parsed.table.rows) {
        return parsed;
      }
      // Also accept direct table structure
      if (parsed.columns && parsed.rows) {
        return { table: parsed };
      }
    } catch (e) {
      // Not valid JSON, continue
      continue;
    }
  }
  
  // Try to find JSON without code blocks (less common)
  try {
    const jsonMatch = text.match(/\{[\s\S]*"table"[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.table && parsed.table.columns && parsed.table.rows) {
        return parsed;
      }
    }
  } catch (e) {
    // Not valid JSON
  }
  
  return null;
};

/**
 * Streams PDF analysis using OpenRouter API with Server-Sent Events
 * Uses fast LLM for status messages while PDFs are processing, then switches to main analysis
 * @param {Array} pdfArray - Array of objects with {filename, url OR data (base64), id}
 * @param {string} query - User query/question about the PDFs
 * @param {string} userMessage - Optional additional context
 * @param {Object} res - Express response object for SSE
 * @returns {Promise<void>}
 */
const streamAnalyzePDFs = async (pdfArray, query, userMessage = '', res) => {
  const startTime = Date.now();
  let fullText = '';
  let tokensUsed = { input: 0, output: 0, total: 0 };
  let model = openrouterConfig.model;
  
  try {
    if (!pdfArray || pdfArray.length === 0) {
      throw new Error('No PDFs provided for analysis');
    }

    if (!query || query.trim().length === 0) {
      throw new Error('Query is required');
    }

    // Detect if CSV export is requested
    const isCSVRequest = detectCSVRequest(query);
    
    // Build the message content with CSV instructions if needed
    let finalQuery = userMessage 
      ? `${query}\n\nAdditional context: ${userMessage}`
      : query;
    
    // Add formatting instructions to reduce excessive spacing
    if (!isCSVRequest) {
      // For regular queries, also add spacing instructions
      finalQuery = finalQuery + `\n\nIMPORTANT FORMATTING: Use only single newlines (\\n) between paragraphs. Avoid multiple consecutive newlines or excessive spacing. Keep the response compact and well-formatted.`;
    }
    
    // Define function/tool for returning table data if CSV/Excel is requested
    let tools = null;
    if (isCSVRequest) {
      tools = [
        {
          type: 'function',
          function: {
            name: 'return_table_data',
            description: 'Returns structured table data extracted from PDFs. Use this function to return the table data when the user requests CSV/Excel export.',
            parameters: {
              type: 'object',
              properties: {
                table: {
                  type: 'object',
                  description: 'The table data structure',
                  properties: {
                    columns: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'Array of column names/headers'
                    },
                    rows: {
                      type: 'array',
                      items: {
                        type: 'object',
                        description: 'Object where keys are column names and values are cell values',
                        additionalProperties: { type: 'string' }
                      },
                      description: 'Array of row objects, each object has column names as keys'
                    }
                  },
                  required: ['columns', 'rows']
                }
              },
              required: ['table']
            }
          }
        }
      ];
      
      const functionCallInstructions = `\n\nIMPORTANT: The user has requested CSV/Excel export. Please follow these steps:
1. First, provide a comprehensive summary and explanation of the extracted data in your text response
2. Explain what fields were extracted, from which documents, and any important insights
3. After providing the full explanation, use the return_table_data function to return the structured table data
4. DO NOT call the function immediately - provide your explanation first, then call the function
5. Ensure all requested fields are included across all relevant documents
6. Use clear, descriptive column names
7. The function call should come AFTER your explanatory text, not before it
8. IMPORTANT: Use only single newlines (\\n) between paragraphs. Avoid multiple consecutive newlines or excessive spacing. Keep the response compact and well-formatted.`;
      
      finalQuery = finalQuery + functionCallInstructions;
      
      logger.info('📊 [FUNCTION] CSV export requested, using function calling for table data');
    }

    // Create payload with streaming enabled and tools if needed
    const payload = {
      ...createMessagePayload(pdfArray, finalQuery, tools),
      stream: true,  // Enable streaming
      streamOptions: {
        includeUsage: true  // Include usage stats in final chunk (per OpenRouter docs)
      }
    };

    // Generate unique request ID for logging
    const requestId = `stream-${Date.now()}`;

    // Log full request payload
    logOpenRouterRequest(payload, requestId);

    logger.info('📊 [OPENROUTER] Streaming PDF Analysis Started', {
      pdfCount: pdfArray.length,
      queryLength: query.length,
      requestId,
      timestamp: new Date().toISOString()
    });

    // Note: SSE headers should already be set by the route handler

    const url = `${openrouterConfig.baseUrl}/chat/completions`;
    const headers = getHeaders();

    // Log request details
    logger.info('📤 [OPENROUTER] Sending Streaming Request', {
      url,
      method: 'POST',
      model: payload.model,
      hasTools: !!tools && tools.length > 0,
      toolsCount: tools?.length || 0,
      requestId,
      headers: {
        'Authorization': headers.Authorization ? 'Bearer ***' : 'NOT_SET',
        'Content-Type': headers['Content-Type'],
        'HTTP-Referer': headers['HTTP-Referer'],
        'X-Title': headers['X-Title']
      }
    });

    // Make streaming request to OpenRouter
    const response = await axios.post(url, payload, {
      headers,
      responseType: 'stream',
      timeout: openrouterConfig.timeout
    });

    logger.debug('📤 [OPENROUTER] Request sent, waiting for first chunk...');

    let buffer = '';
    
    // Track tool calls during streaming
    let accumulatedToolCalls = [];
    let hasToolCalls = false;
    
    // Accumulate response data for logging
    let responseChunks = [];
    let responseMetadata = {
      model: null,
      usage: null,
      finishReason: null,
      toolCalls: []
    };

    // Process stream chunks - handle partial lines
    response.data.on('data', (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      
      // Keep the last incomplete line in buffer
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Skip empty lines
        if (!trimmedLine) continue;
        
        // Handle SSE comments (like ": OPENROUTER PROCESSING")
        if (trimmedLine.startsWith(':')) {
          logger.debug('📝 [OPENROUTER] SSE comment:', trimmedLine);
          continue;
        }
        
        // Handle data lines
        if (trimmedLine.startsWith('data: ')) {
          const data = trimmedLine.slice(6); // Remove 'data: ' prefix
          
          if (data === '[DONE]') {
            continue;
          }

          try {
            const parsed = JSON.parse(data);
            
            // Log what we're parsing (especially for first few chunks)
            if (fullText.length === 0) {
              logger.debug('🔍 [OPENROUTER] Parsing first data chunk', {
                hasChoices: !!parsed.choices,
                choicesLength: parsed.choices?.length || 0,
                hasDelta: !!parsed.choices?.[0]?.delta,
                hasContent: !!parsed.choices?.[0]?.delta?.content,
                deltaKeys: parsed.choices?.[0]?.delta ? Object.keys(parsed.choices[0].delta) : [],
                rawData: data.substring(0, 200)
              });
            }
            
            // Check for errors in chunk (mid-stream errors per OpenRouter docs)
            if (parsed.error) {
              logger.error('❌ [OPENROUTER] Stream error received', {
                error: parsed.error,
                finishReason: parsed.choices?.[0]?.finish_reason
              });
              
              res.write(`data: ${JSON.stringify({ 
                type: 'error', 
                error: parsed.error.message || parsed.error,
                code: parsed.error.code
              })}\n\n`);
              res.end();
              return;
            }
            
            // Extract content from delta
            const delta = parsed.choices?.[0]?.delta;
            
            // Track tool calls if present
            if (delta?.tool_calls && Array.isArray(delta.tool_calls)) {
              hasToolCalls = true;
              for (const toolCall of delta.tool_calls) {
                const index = toolCall.index || 0;
                if (!accumulatedToolCalls[index]) {
                  accumulatedToolCalls[index] = {
                    id: toolCall.id,
                    type: toolCall.type || 'function',
                    function: {
                      name: toolCall.function?.name || '',
                      arguments: toolCall.function?.arguments || ''
                    }
                  };
                } else {
                  // Accumulate function arguments (they can come in multiple chunks)
                  if (toolCall.function?.arguments) {
                    accumulatedToolCalls[index].function.arguments += toolCall.function.arguments;
                  }
                }
              }
            }
            
            // Track chunks without content (especially before first content)
            if (fullText.length === 0 && !delta?.content && !delta?.tool_calls) {
              const chunkTime = Date.now();
              logger.debug('⏳ [OPENROUTER] Received chunk without content (waiting for first content)', {
                timeSinceStart: `${chunkTime - startTime}ms`,
                hasDelta: !!delta,
                deltaKeys: delta ? Object.keys(delta) : [],
                hasToolCalls: !!delta?.tool_calls,
                finishReason: parsed.choices?.[0]?.finish_reason
              });
            }
            
            if (delta?.content) {
              // Log when we're about to send the first content chunk to frontend
              const isFirstContentChunk = fullText.length === 0;
              if (isFirstContentChunk) {
                const sendTime = Date.now();
                
                logger.info('📤 [OPENROUTER] Sending first content chunk to frontend', {
                  timeSinceStart: `${sendTime - startTime}ms`,
                  timestamp: new Date().toISOString(),
                  contentPreview: delta.content.substring(0, 50) + (delta.content.length > 50 ? '...' : ''),
                  contentLength: delta.content.length
                });
              }
              
              fullText += delta.content;
              
              // Send chunk to client IMMEDIATELY - don't buffer
              const chunkData = JSON.stringify({ 
                type: 'chunk', 
                content: delta.content 
              });
              
              const sseLine = `data: ${chunkData}\n\n`;
              res.write(sseLine);
              
              // Force flush if available (Node.js compression middleware)
              if (typeof res.flush === 'function') {
                res.flush();
              }
            }

            // Update token usage if available (usually in final chunk)
            if (parsed.usage) {
              tokensUsed = {
                input: parsed.usage.prompt_tokens || tokensUsed.input,
                output: parsed.usage.completion_tokens || tokensUsed.output,
                total: parsed.usage.total_tokens || tokensUsed.total
              };
            }

            // Update model if available
            if (parsed.model) {
              model = parsed.model;
              responseMetadata.model = parsed.model;
            }
            
            // Update usage if available
            if (parsed.usage) {
              tokensUsed = {
                input: parsed.usage.prompt_tokens || tokensUsed.input,
                output: parsed.usage.completion_tokens || tokensUsed.output,
                total: parsed.usage.total_tokens || tokensUsed.total
              };
              responseMetadata.usage = {
                prompt_tokens: tokensUsed.input,
                completion_tokens: tokensUsed.output,
                total_tokens: tokensUsed.total
              };
            }
            
            // Check finish reason and handle tool calls
            const finishReason = parsed.choices?.[0]?.finish_reason;
            if (finishReason) {
              responseMetadata.finishReason = finishReason;
            }
            
            // If stream ended with tool calls, try to extract final tool call data
            if (finishReason === 'tool_calls' && parsed.choices?.[0]?.delta?.tool_calls) {
              const toolCalls = parsed.choices[0].delta.tool_calls;
              for (const toolCall of toolCalls) {
                const index = toolCall.index || 0;
                if (!accumulatedToolCalls[index]) {
                  accumulatedToolCalls[index] = {
                    id: toolCall.id,
                    type: toolCall.type || 'function',
                    function: {
                      name: toolCall.function?.name || '',
                      arguments: toolCall.function?.arguments || ''
                    }
                  };
                } else {
                  if (toolCall.function?.arguments) {
                    accumulatedToolCalls[index].function.arguments += toolCall.function.arguments;
                  }
                }
              }
            }
            
            // Store chunk for response logging
            responseChunks.push(parsed);
            
          } catch (parseError) {
            // Skip invalid JSON (might be empty lines, comments, or malformed data)
            if (data.trim() && data !== '[DONE]') {
              logger.debug('Skipping invalid JSON in stream', { 
                data: data.substring(0, 100),
                error: parseError.message 
              });
            }
          }
        }
      }
    });

    response.data.on('end', () => {
      const duration = Date.now() - startTime;
      
      // Extract JSON table data from function calls or response text
      let jsonData = null;
      let csvData = null;
      if (isCSVRequest) {
        // First try to extract from function calls (preferred method)
        if (hasToolCalls && accumulatedToolCalls.length > 0) {
          jsonData = extractJSONFromToolCalls(accumulatedToolCalls);
          if (jsonData && jsonData.table) {
            logger.info('✅ [FUNCTION] JSON table data extracted from function call', {
              columns: jsonData.table.columns?.length || 0,
              rows: jsonData.table.rows?.length || 0
            });
          }
        }
        
        // Fallback: extract from response text if function call didn't work
        if (!jsonData) {
          jsonData = extractJSONFromResponse(fullText);
          if (jsonData && jsonData.table) {
            logger.info('✅ [JSON] JSON table data extracted from response text (fallback)', {
              columns: jsonData.table.columns?.length || 0,
              rows: jsonData.table.rows?.length || 0
            });
          }
        }
        
        if (jsonData && jsonData.table) {
          // Convert JSON to CSV for download compatibility
          csvData = convertJSONToCSV(jsonData.table);
          if (csvData) {
            logger.info('✅ [CSV] JSON converted to CSV', {
              csvLength: csvData.length,
              csvLines: csvData.split('\n').length
            });
          }
        } else {
          logger.warn('⚠️ [JSON] CSV/Excel requested but could not extract JSON table from function calls or response');
        }
      }
      
      // Clean up excessive newlines in the response text
      fullText = fullText.replace(/\n{3,}/g, '\n\n'); // Replace 3+ newlines with 2
      fullText = fullText.replace(/\n\n\n+/g, '\n\n'); // Replace multiple consecutive double newlines
      
      // Check if we have function calls but minimal text - this means LLM called function too early
      const hasMinimalText = fullText.trim().length < 100;
      if (hasToolCalls && hasMinimalText && isCSVRequest) {
        logger.warn('⚠️ [FUNCTION] LLM called function with minimal text - generating summary from table data');
        
        // Generate a summary based on the table data
        if (jsonData && jsonData.table) {
          const rowCount = jsonData.table.rows?.length || 0;
          const columnCount = jsonData.table.columns?.length || 0;
          const columns = jsonData.table.columns?.join(', ') || '';
          
          const autoSummary = `I've extracted ${rowCount} record(s) from the tender documents with the following fields: ${columns}. ` +
            `The data has been structured in a table format below. ` +
            (rowCount > 0 ? `Each row represents a separate tender/bid with its corresponding details.` : '');
          
          // Prepend the auto-generated summary to the existing text
          fullText = autoSummary + (fullText.trim() ? '\n\n' + fullText.trim() : '');
          
          logger.info('✅ [FUNCTION] Auto-generated summary added', {
            summaryLength: autoSummary.length,
            totalTextLength: fullText.length
          });
        }
      }
      
      // Final cleanup: ensure no excessive spacing at the end
      fullText = fullText.trim();
      
      // Build complete response object for logging
      const completeResponse = {
        id: `chatcmpl-${Date.now()}`,
        object: 'chat.completion.chunk',
        created: Math.floor(Date.now() / 1000),
        model: responseMetadata.model || model,
        choices: [{
          index: 0,
          delta: {
            content: fullText
          },
          finish_reason: responseMetadata.finishReason || 'stop'
        }],
        usage: responseMetadata.usage || tokensUsed,
        tool_calls: accumulatedToolCalls.length > 0 ? accumulatedToolCalls : undefined
      };
      
      // Log full response
      logOpenRouterResponse(completeResponse, requestId);
      
      logger.info('✅ [OPENROUTER] Streaming Complete', {
        pdfCount: pdfArray.length,
        tokensUsed,
        analysisLength: fullText.length,
        duration: `${duration}ms`,
        model: responseMetadata.model || model,
        csvRequested: isCSVRequest,
        jsonExtracted: !!jsonData,
        csvGenerated: !!csvData,
        hasToolCalls,
        toolCallsCount: accumulatedToolCalls.length,
        hadMinimalText: hasMinimalText,
        requestId
      });

      // Send final message with complete data
      const completePayload = {
        type: 'complete',
        analysis: fullText,
        referencedPdfs: pdfArray.map(pdf => ({
          id: pdf.id,
          filename: pdf.filename
        })),
        tokensUsed,
        model,
        timestamp: new Date().toISOString()
      };
      
      // Add JSON table data and CSV (for download) if available
      if (jsonData && jsonData.table) {
        completePayload.jsonTableData = jsonData.table;
      }
      if (csvData) {
        completePayload.csvData = csvData;
      }
      
      res.write(`data: ${JSON.stringify(completePayload)}\n\n`);
      
      res.end();
    });

    response.data.on('error', (error) => {
      
      // Log error with request ID
      logOpenRouterError(error, {
        requestId,
        duration: `${Date.now() - startTime}ms`,
        chunksReceived: responseChunks.length,
        fullTextLength: fullText.length
      }, requestId);
      
      logger.error('❌ [OPENROUTER] Stream Error', {
        error: error.message,
        stack: error.stack,
        requestId
      });

      res.write(`data: ${JSON.stringify({ 
        type: 'error', 
        error: error.message || 'Stream error occurred'
      })}\n\n`);
      res.end();
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('❌ [OPENROUTER] Streaming Failed', {
      error: error.message,
      pdfCount: pdfArray?.length || 0,
      duration: `${duration}ms`,
      stack: error.stack
    });

    res.write(`data: ${JSON.stringify({ 
      type: 'error', 
      error: error.message 
    })}\n\n`);
    res.end();
  }
};

module.exports = {
  analyzePDFs,
  streamAnalyzePDFs,
  makeOpenRouterRequest,
  validateResponse,
  formatAnalysisResponse,
  validateConfig,
  sleep
};
