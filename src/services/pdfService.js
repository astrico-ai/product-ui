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
    if (data.code) {
      console.error(`Upload error [${data.code}]:`, errorMessage);
    }
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
    console.error('Error uploading PDFs:', error);
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
    console.error('Error listing PDFs:', error);
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
    console.error('Error deleting PDF:', error);
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
      if (data.code) {
        console.error(`Analysis error [${data.code}]:`, errorMessage);
        
        // Provide user-friendly messages for common errors
        if (data.code === 'RATE_LIMITED') {
          throw new Error('API rate limit exceeded. Please try again in a moment.');
        } else if (data.code === 'TIMEOUT') {
          throw new Error('Analysis took too long. Please try with fewer PDFs.');
        }
      }
      throw new Error(errorMessage);
    }
    
    return data;
  } catch (error) {
    console.error('Error analyzing PDFs:', error);
    throw error;
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
  formatFileSize,
  validatePDF,
  getServiceMode
};

