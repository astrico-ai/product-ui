const { filesToBase64Array, urlToBase64 } = require('../utils/base64Encoder');
const { getPDFBuffer, getSignedUrl } = require('./s3Service');
const { logger } = require('../utils/logger');

/**
 * Processes uploaded files and converts to Base64 for API consumption
 * @param {Array} files - Array of uploaded file objects
 * @returns {Promise<Array>} Array of Base64 encoded PDF objects
 */
const processFilesToBase64 = async (files) => {
  try {
    if (!Array.isArray(files) || files.length === 0) {
      throw new Error('No files provided for processing');
    }

    logger.debug('Processing files to Base64', { count: files.length });

    // Convert files to Base64 array
    const base64Array = filesToBase64Array(files);

    logger.debug('Files processed to Base64', {
      count: base64Array.length,
      totalSize: base64Array.reduce((sum, pdf) => sum + pdf.size, 0)
    });

    return base64Array;
  } catch (error) {
    logger.error('Error processing files to Base64', { error: error.message });
    throw error;
  }
};

/**
 * Processes S3 URLs and converts PDFs to Base64
 * @param {Array} s3Keys - Array of S3 object keys
 * @returns {Promise<Array>} Array of Base64 encoded PDF objects
 */
const processS3KeysToBase64 = async (s3Keys) => {
  try {
    if (!Array.isArray(s3Keys) || s3Keys.length === 0) {
      throw new Error('No S3 keys provided');
    }

    logger.debug('Processing S3 keys to Base64', { count: s3Keys.length });

    const base64Array = [];

    for (const s3Key of s3Keys) {
      try {
        const buffer = await getPDFBuffer(s3Key);
        const base64 = buffer.toString('base64');
        const filename = s3Key.split('/').pop();

        base64Array.push({
          filename,
          data: base64,
          s3Key,
          size: buffer.length
        });
      } catch (error) {
        logger.error('Error processing S3 key to Base64', {
          s3Key,
          error: error.message
        });
        throw new Error(`Failed to process ${s3Key}: ${error.message}`);
      }
    }

    logger.debug('S3 keys processed to Base64', {
      count: base64Array.length,
      totalSize: base64Array.reduce((sum, pdf) => sum + pdf.size, 0)
    });

    return base64Array;
  } catch (error) {
    logger.error('Error processing S3 keys', { error: error.message });
    throw error;
  }
};

/**
 * Processes S3 keys and generates signed URLs (more efficient than Base64)
 * @param {Array} s3Keys - Array of S3 object keys
 * @param {number} expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
 * @returns {Promise<Array>} Array of PDF objects with signed URLs
 */
const processS3KeysToUrls = async (s3Keys, expiresIn = 3600) => {
  try {
    if (!Array.isArray(s3Keys) || s3Keys.length === 0) {
      throw new Error('No S3 keys provided');
    }

    logger.debug('Processing S3 keys to signed URLs', { 
      count: s3Keys.length, 
      expiresIn 
    });

    const urlArray = [];

    for (const s3Key of s3Keys) {
      try {
        const signedUrl = getSignedUrl(s3Key, expiresIn);
        const filename = s3Key.split('/').pop();

        urlArray.push({
          filename,
          url: signedUrl,
          s3Key
        });

        logger.debug('Generated signed URL for PDF', { 
          s3Key, 
          filename,
          urlLength: signedUrl.length
        });
      } catch (error) {
        logger.error('Error generating signed URL', {
          s3Key,
          error: error.message
        });
        throw new Error(`Failed to generate URL for ${s3Key}: ${error.message}`);
      }
    }

    logger.debug('S3 keys processed to signed URLs', {
      count: urlArray.length
    });

    return urlArray;
  } catch (error) {
    logger.error('Error processing S3 keys to URLs', { error: error.message });
    throw error;
  }
};

/**
 * Builds metadata object for a PDF
 * @param {Object} pdfData - PDF data object
 * @returns {Object} Metadata object
 */
const buildPDFMetadata = (pdfData) => {
  return {
    id: pdfData.id || '',
    filename: pdfData.filename || 'unknown.pdf',
    size: pdfData.size || 0,
    uploadedAt: pdfData.uploadedAt || new Date().toISOString(),
    s3Key: pdfData.s3Key || null,
    s3Url: pdfData.s3Url || null,
    mimeType: pdfData.mimetype || 'application/pdf',
    etag: pdfData.etag || null
  };
};

/**
 * Filters out non-existent PDFs from a list
 * @param {Array} pdfs - Array of PDF metadata objects
 * @param {Array} pdfIds - Array of PDF IDs to check
 * @returns {Array} Filtered array of existing PDFs
 */
const filterValidPDFs = (pdfs, pdfIds) => {
  if (!Array.isArray(pdfs) || !Array.isArray(pdfIds)) {
    throw new Error('Invalid input: pdfs and pdfIds must be arrays');
  }

  return pdfs.filter(pdf => pdfIds.includes(pdf.id));
};

/**
 * Validates PDF IDs against available PDFs
 * @param {Array} requestedIds - IDs (s3Keys) requested by user
 * @param {Array} availablePdfs - Available PDFs from storage
 * @returns {Object} {valid: boolean, validIds: Array, invalidIds: Array}
 */
const validatePDFIds = (requestedIds, availablePdfs) => {
  if (!Array.isArray(requestedIds) || requestedIds.length === 0) {
    return {
      valid: false,
      error: 'No PDF IDs provided',
      validIds: [],
      invalidIds: []
    };
  }

  // Use s3Key for validation since PDFs from S3 use s3Key, not id
  const availableIds = availablePdfs.map(pdf => pdf.s3Key || pdf.id);
  const validIds = [];
  const invalidIds = [];

  requestedIds.forEach(id => {
    if (availableIds.includes(id)) {
      validIds.push(id);
    } else {
      invalidIds.push(id);
    }
  });

  return {
    valid: validIds.length > 0,
    validIds,
    invalidIds,
    missingPdfs: invalidIds.length
  };
};

/**
 * Enriches PDF data with additional metadata
 * @param {Array} pdfs - Array of PDF objects
 * @param {string} analysisQuery - User's analysis query
 * @returns {Array} Enriched PDF objects
 */
const enrichPDFData = (pdfs, analysisQuery = '') => {
  return pdfs.map(pdf => ({
    ...pdf,
    enrichedMetadata: {
      relatedTo: analysisQuery,
      processedAt: new Date().toISOString(),
      dataVersion: '1.0'
    }
  }));
};

/**
 * Sanitizes PDF filenames for safe usage
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
const sanitizeFilename = (filename) => {
  // Remove any path separators and special characters
  return filename
    .replace(/\\/g, '/')
    .split('/')
    .pop()
    .replace(/[^a-z0-9._ -]/gi, '_')
    .substring(0, 255);
};

/**
 * Formats file size for display
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Calculates total size of multiple PDFs
 * @param {Array} pdfs - Array of PDF objects
 * @returns {Object} Size information
 */
const calculateTotalSize = (pdfs) => {
  if (!Array.isArray(pdfs)) {
    throw new Error('Input must be an array');
  }

  const totalBytes = pdfs.reduce((sum, pdf) => sum + (pdf.size || 0), 0);
  
  return {
    totalBytes,
    totalFormatted: formatFileSize(totalBytes),
    count: pdfs.length,
    average: pdfs.length > 0 ? Math.round(totalBytes / pdfs.length) : 0,
    averageFormatted: pdfs.length > 0 ? formatFileSize(Math.round(totalBytes / pdfs.length)) : '0 Bytes'
  };
};

module.exports = {
  processFilesToBase64,
  processS3KeysToBase64,
  processS3KeysToUrls,
  buildPDFMetadata,
  filterValidPDFs,
  validatePDFIds,
  enrichPDFData,
  sanitizeFilename,
  formatFileSize,
  calculateTotalSize
};
