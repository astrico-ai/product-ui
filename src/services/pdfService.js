/**
 * PDF Service - API abstraction layer for PDF management
 * 
 * UPDATED: Now using Agent 1's real backend APIs
 * Backend Status: ✅ PRODUCTION READY
 * 
 * Integration with:
 * - AWS S3 for file storage
 * - OpenRouter API for PDF analysis
 * - Full error handling and validation
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const USE_MOCK = import.meta.env.VITE_USE_MOCK_PDF_API === 'true'; // Default to real API now

// Mock data store (simulates backend database)
// Using s3Key as identifier to match Agent 1's API
let mockPDFs = [
  {
    s3Key: 'pdfs/2025-01-15/mock-1/Product_Requirements_Document.pdf',
    filename: 'Product_Requirements_Document.pdf',
    size: 524288, // 512 KB
    uploadedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    s3Url: 'https://mock-s3.example.com/pdfs/mock-1/Product_Requirements_Document.pdf',
    etag: '"abc123"'
  },
  {
    s3Key: 'pdfs/2025-01-15/mock-2/Technical_Specifications.pdf',
    filename: 'Technical_Specifications.pdf',
    size: 1048576, // 1 MB
    uploadedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    s3Url: 'https://mock-s3.example.com/pdfs/mock-2/Technical_Specifications.pdf',
    etag: '"def456"'
  }
];

/**
 * Utility: Format file size to human-readable format
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Utility: Validate PDF file
 */
export const validatePDF = (file) => {
  const maxSize = 25 * 1024 * 1024; // 25 MB
  const allowedTypes = ['application/pdf'];
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only PDF files are allowed' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 25MB' };
  }
  
  return { valid: true };
};

/**
 * MOCK: Upload PDFs (simulates API call)
 */
const mockUploadPDFs = async (files) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Validate all files first
  for (const file of files) {
    const validation = validatePDF(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
  }
  
  // Simulate successful upload (match Agent 1's response format)
  const timestamp = new Date().toISOString().split('T')[0];
  const uploadedPDFs = files.map(file => {
    const uuid = Math.random().toString(36).substr(2, 9);
    const s3Key = `pdfs/${timestamp}/${uuid}/${file.name}`;
    return {
      s3Key,
      filename: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      s3Url: `https://mock-s3.example.com/${s3Key}`,
      etag: `"${Math.random().toString(36).substr(2, 9)}"`
    };
  });
  
  // Add to mock store
  mockPDFs = [...mockPDFs, ...uploadedPDFs];
  
  return {
    success: true,
    pdfs: uploadedPDFs,
    failed: [],
    message: `${uploadedPDFs.length} file(s) uploaded successfully`
  };
};

/**
 * REAL: Upload PDFs to backend API (Agent 1's implementation)
 * Endpoint: POST /api/pdfs/upload
 */
const realUploadPDFs = async (files) => {
  const formData = new FormData();
  
  // Validate all files first (client-side validation)
  for (const file of files) {
    const validation = validatePDF(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    formData.append('files', file);
  }
  
  const response = await fetch(`${API_BASE_URL}/api/pdfs/upload`, {
    method: 'POST',
    body: formData,
  });
  
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    // Handle specific error codes from Agent 1
    const errorMessage = data.error || 'Failed to upload PDFs';
    throw new Error(errorMessage);
  }
  
  return data; // Returns { success, pdfs: [...], failed: [...], message }
};

/**
 * PUBLIC API: Upload PDFs
 * @param {File[]} files - Array of PDF files to upload
 * @returns {Promise<{success: boolean, pdfs: Array}>}
 */
export const uploadPDFs = async (files) => {
  try {
    if (USE_MOCK) {
      return await mockUploadPDFs(files);
    } else {
      return await realUploadPDFs(files);
    }
  } catch (error) {
    throw error;
  }
};

/**
 * MOCK: List all PDFs
 */
const mockListPDFs = async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    pdfs: [...mockPDFs].reverse(), // Most recent first
    total: mockPDFs.length
  };
};

/**
 * REAL: List all PDFs from backend (Agent 1's implementation)
 * Endpoint: GET /api/pdfs
 */
const realListPDFs = async () => {
  const response = await fetch(`${API_BASE_URL}/api/pdfs`, {
    method: 'GET',
  });
  
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to fetch PDFs');
  }
  
  return data; // Returns { success, pdfs: [{s3Key, filename, size, uploadedAt, s3Url, etag}], total }
};

/**
 * PUBLIC API: List all PDFs
 * @returns {Promise<{success: boolean, pdfs: Array, total: number}>}
 */
export const listPDFs = async () => {
  try {
    if (USE_MOCK) {
      return await mockListPDFs();
    } else {
      return await realListPDFs();
    }
  } catch (error) {
    throw error;
  }
};

/**
 * MOCK: Delete PDF
 */
const mockDeletePDF = async (s3Key) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const pdf = mockPDFs.find(pdf => pdf.s3Key === s3Key);
  
  if (!pdf) {
    throw new Error('PDF not found');
  }
  
  // Remove from mock store
  mockPDFs = mockPDFs.filter(pdf => pdf.s3Key !== s3Key);
  
  return {
    success: true,
    message: 'PDF deleted successfully',
    id: s3Key,
    filename: pdf.filename
  };
};

/**
 * REAL: Delete PDF from backend (Agent 1's implementation)
 * Endpoint: DELETE /api/pdfs/:id
 * Note: ID is the s3Key (URL encoded)
 */
const realDeletePDF = async (s3Key) => {
  const response = await fetch(`${API_BASE_URL}/api/pdfs/${encodeURIComponent(s3Key)}`, {
    method: 'DELETE',
  });
  
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    // Handle specific error codes from Agent 1
    const errorMessage = data.error || 'Failed to delete PDF';
    if (data.code === 'PDF_NOT_FOUND') {
      throw new Error('PDF not found. It may have been already deleted.');
    }
    throw new Error(errorMessage);
  }
  
  return data; // Returns { success, message, id: s3Key, filename }
};

/**
 * PUBLIC API: Delete PDF
 * @param {string} s3Key - S3 key of PDF to delete (used as ID)
 * @returns {Promise<{success: boolean, message: string, id: string, filename: string}>}
 */
export const deletePDF = async (s3Key) => {
  try {
    if (USE_MOCK) {
      return await mockDeletePDF(s3Key);
    } else {
      return await realDeletePDF(s3Key);
    }
  } catch (error) {
    throw error;
  }
};

/**
 * PUBLIC API: Analyze PDFs with AI (Agent 1's implementation)
 * Endpoint: POST /api/pdfs/analyze
 * 
 * Used by Agent 4 for chat integration with @ mention system
 * 
 * @param {string[]} pdfIds - Array of s3Keys to analyze
 * @param {string} query - User's query about the PDFs
 * @param {string} userMessage - Optional additional context
 * @returns {Promise<{success: boolean, analysis: string, referencedPdfs: Array, tokensUsed: Object, model: string, timestamp: string}>}
 */
export const analyzePDFs = async (pdfIds, query, userMessage = '') => {
  try {
    if (USE_MOCK) {
      // Return mock analysis for development
      await new Promise(resolve => setTimeout(resolve, 2000));
      return {
        success: true,
        analysis: 'Mock AI analysis result. Backend is ready - set VITE_USE_MOCK_PDF_API=false to use real OpenRouter API.',
        referencedPdfs: pdfIds.map(s3Key => {
          const pdf = mockPDFs.find(p => p.s3Key === s3Key);
          return { id: s3Key, filename: pdf?.filename || 'Unknown' };
        }),
        tokensUsed: { input: 1000, output: 200, total: 1200 },
        model: 'mock-model',
        timestamp: new Date().toISOString()
      };
    }
    
    const response = await fetch(`${API_BASE_URL}/api/pdfs/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        pdfIds, 
        query, 
        userMessage,
        useBase64: true  // ✅ Currently using Base64 (works without CORS)
                         // 🔄 Change to false after configuring S3 CORS
      })
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      // Handle specific error codes from Agent 1
      const errorMessage = data.error || 'Failed to analyze PDFs';
      if (data.code === 'RATE_LIMITED') {
        throw new Error('API rate limit exceeded. Please try again in a moment.');
      } else if (data.code === 'TIMEOUT') {
        throw new Error('Analysis took too long. Please try with fewer PDFs.');
      }
      throw new Error(errorMessage);
    }
    
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * PUBLIC API: Stream PDF analysis with AI (Server-Sent Events)
 * Endpoint: POST /api/pdfs/analyze/stream
 * 
 * Streams PDF analysis response token by token for better UX
 * 
 * @param {string[]} pdfIds - Array of s3Keys to analyze
 * @param {string} query - User's query about the PDFs
 * @param {string} userMessage - Optional additional context
 * @param {Function} onChunk - Callback for each chunk: (chunk: string) => void
 * @param {Function} onComplete - Callback when complete: (data: Object) => void
 * @param {Function} onError - Callback for errors: (error: Error) => void
 * @returns {Promise<void>}
 */
export const streamAnalyzePDFs = async (pdfIds, query, userMessage = '', onChunk, onComplete, onError) => {
  console.log('🚀 [STREAM] streamAnalyzePDFs called', { 
    pdfIds, 
    queryLength: query.length,
    endpoint: `${API_BASE_URL}/api/pdfs/analyze/stream`
  });
  
  try {
    if (USE_MOCK) {
      // Mock streaming for development
      const mockText = 'Mock AI analysis result. Backend is ready - set VITE_USE_MOCK_PDF_API=false to use real OpenRouter API.';
      const words = mockText.split(' ');
      
      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 50));
        onChunk(words[i] + (i < words.length - 1 ? ' ' : ''));
      }
      
      onComplete({
        success: true,
        analysis: mockText,
        referencedPdfs: pdfIds.map(s3Key => {
          const pdf = mockPDFs.find(p => p.s3Key === s3Key);
          return { id: s3Key, filename: pdf?.filename || 'Unknown' };
        }),
        tokensUsed: { input: 1000, output: 200, total: 1200 },
        model: 'mock-model',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    console.log('📡 [STREAM] Making fetch request to:', `${API_BASE_URL}/api/pdfs/analyze/stream`);
    console.log('📡 [STREAM] Request payload:', { 
      pdfIds, 
      queryLength: query?.length || 0,
      userMessageLength: userMessage?.length || 0,
      useBase64: true
    });
    
    let response;
    try {
      response = await fetch(`${API_BASE_URL}/api/pdfs/analyze/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pdfIds, 
          query, 
          userMessage,
          useBase64: true
        })
      });
    } catch (fetchError) {
      console.error('❌ [STREAM] Fetch request failed:', fetchError);
      throw new Error(`Failed to connect to server: ${fetchError.message}`);
    }
    
    console.log('📥 [STREAM] Response received:', { 
      status: response.status, 
      ok: response.ok,
      contentType: response.headers.get('content-type'),
      statusText: response.statusText
    });
    
    if (!response.ok) {
      console.error('❌ [STREAM] Response not OK:', response.status, response.statusText);
      let errorData;
      try {
        errorData = await response.json();
      } catch (jsonError) {
        const text = await response.text().catch(() => 'Unknown error');
        console.error('❌ [STREAM] Failed to parse error response:', text);
        throw new Error(`Server error (${response.status}): ${text || response.statusText}`);
      }
      throw new Error(errorData.error || errorData.message || 'Failed to start streaming');
    }

    // Check if response is SSE
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('text/event-stream')) {
      throw new Error(`Server did not return a streaming response. Got: ${contentType}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    let streamComplete = false;
    let accumulatedText = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          // Stream ended - check if we got a complete message
          if (!streamComplete) {
            // Stream ended without complete message - try to process remaining buffer
            if (buffer.trim()) {
              const trimmedLine = buffer.trim();
              if (trimmedLine.startsWith('data: ')) {
                const data = trimmedLine.slice(6);
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.type === 'complete') {
                    onComplete({
                      success: true,
                      analysis: parsed.analysis || accumulatedText,
                      referencedPdfs: parsed.referencedPdfs || [],
                      tokensUsed: parsed.tokensUsed || { input: 0, output: 0, total: 0 },
                      model: parsed.model || 'unknown',
                      timestamp: parsed.timestamp || new Date().toISOString(),
                      csvData: parsed.csvData || null,
                      jsonTableData: parsed.jsonTableData || null
                    });
                    streamComplete = true;
                    return;
                  }
                } catch (e) {
                  // Ignore parse errors in final buffer
                }
              }
            }
            
            // If we have accumulated text but no complete message, call onComplete with what we have
            if (accumulatedText.trim()) {
              console.warn('⚠️ [STREAM] Stream ended without complete message, using accumulated text');
              onComplete({
                success: true,
                analysis: accumulatedText,
                referencedPdfs: pdfIds.map(id => ({ id, filename: 'Unknown' })),
                tokensUsed: { input: 0, output: 0, total: 0 },
                model: 'unknown',
                timestamp: new Date().toISOString(),
                csvData: null
              });
              return;
            }
            
            // No text accumulated and no complete message - this is an error
            throw new Error('Stream ended unexpectedly without completing');
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          const trimmedLine = line.trim();
          
          // Skip empty lines
          if (!trimmedLine) continue;
          
          // Handle SSE comments (like ": OPENROUTER PROCESSING")
          if (trimmedLine.startsWith(':')) {
            continue;
          }
          
          if (trimmedLine.startsWith('data: ')) {
            const data = trimmedLine.slice(6); // Remove 'data: ' prefix
            
            if (data === '[DONE]' || data.trim() === '') {
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              
              // Handle our custom format from backend
              if (parsed.type === 'status' || parsed.type === 'transition') {
                // Ignore status and transition events - we use LoadingIndicator instead
                continue;
              } else if (parsed.type === 'chunk' && parsed.content) {
                // Regular chunk from main stream
                const isFirstChunk = accumulatedText.length === 0;
                if (isFirstChunk) {
                  console.log('📥 [STREAM] First chunk received on frontend', {
                    timestamp: new Date().toISOString(),
                    contentPreview: parsed.content.substring(0, 50) + (parsed.content.length > 50 ? '...' : ''),
                    contentLength: parsed.content.length
                  });
                }
                accumulatedText += parsed.content;
                onChunk(parsed.content);
              } else if (parsed.type === 'complete') {
                streamComplete = true;
                onComplete({
                  success: true,
                  analysis: parsed.analysis || accumulatedText,
                  referencedPdfs: parsed.referencedPdfs || [],
                  tokensUsed: parsed.tokensUsed || { input: 0, output: 0, total: 0 },
                  model: parsed.model || 'unknown',
                  timestamp: parsed.timestamp || new Date().toISOString(),
                  csvData: parsed.csvData || null,
                  jsonTableData: parsed.jsonTableData || null
                });
                return;
              } else if (parsed.type === 'error') {
                const errorMsg = parsed.error || parsed.message || 'Stream error occurred';
                console.error('❌ [STREAM] Backend sent error event:', errorMsg, parsed);
                // Create a proper Error object
                const streamError = new Error(errorMsg);
                // Throw it to be caught by the outer catch block
                throw streamError;
              } else if (parsed.type === 'done') {
                // Stream finished, wait for complete message
                continue;
              }
            } catch (parseError) {
              // Only warn for non-empty, non-comment data
              if (data.trim() && !data.startsWith(':')) {
                console.warn('⚠️ [STREAM] Failed to parse SSE data:', {
                  data: data.substring(0, 100),
                  error: parseError,
                  errorType: typeof parseError,
                  errorMessage: parseError?.message
                });
              }
              // Don't re-throw parse errors - they're not critical, just skip the line
              continue;
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ [STREAM] Error in streaming loop:', error);
      // Ensure error is always an Error object with a proper message
      let errorObj;
      if (error instanceof Error) {
        errorObj = error;
      } else if (error && typeof error === 'object' && error.message) {
        errorObj = new Error(error.message);
      } else if (error === undefined || error === null) {
        // Handle undefined/null errors - don't call onError for these
        console.warn('⚠️ [STREAM] Caught undefined/null error in streaming loop, ignoring');
        return;
      } else {
        const errorStr = error?.toString?.() || String(error) || 'Unknown streaming error';
        errorObj = new Error(errorStr);
      }
      console.error('❌ [STREAM] Calling onError with:', errorObj.message);
      if (onError) {
        onError(errorObj);
      }
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    console.error('❌ [STREAM] Error in streamAnalyzePDFs outer catch:', error);
    // Ensure error is always an Error object with a proper message
    let errorObj;
    if (error instanceof Error) {
      errorObj = error;
    } else if (error && typeof error === 'object' && error.message) {
      errorObj = new Error(error.message);
    } else if (error === undefined || error === null) {
      // Handle undefined/null errors - don't call onError for these
      console.warn('⚠️ [STREAM] Caught undefined/null error in outer catch, ignoring');
      return;
    } else {
      const errorStr = error?.toString?.() || String(error) || 'Unknown error';
      errorObj = new Error(errorStr);
    }
    console.error('❌ [STREAM] Calling onError from outer catch with:', errorObj.message);
    if (onError) {
      onError(errorObj);
    }
  }
};

/**
 * Get current mode (for debugging/UI display)
 */
export const getServiceMode = () => USE_MOCK ? 'mock' : 'real';

export default {
  uploadPDFs,
  listPDFs,
  deletePDF,
  analyzePDFs,
  streamAnalyzePDFs,
  formatFileSize,
  validatePDF,
  getServiceMode
};

