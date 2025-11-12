const { logger } = require('./logger');

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB in bytes
const PDF_MIME_TYPE = 'application/pdf';
const PDF_MAGIC_BYTES = Buffer.from('%PDF-', 'utf-8');

/**
 * Validates if a file is a valid PDF based on MIME type and magic bytes
 * @param {Object} file - File object from multer with buffer, mimetype, originalname, size
 * @returns {Object} { valid: boolean, error?: string }
 */
const validatePDFFile = (file) => {
  if (!file) {
    return {
      valid: false,
      error: 'No file provided'
    };
  }

  // Check MIME type
  if (file.mimetype !== PDF_MIME_TYPE) {
    logger.warn('Invalid MIME type', { mimetype: file.mimetype, filename: file.originalname });
    return {
      valid: false,
      error: `Invalid file type: ${file.mimetype}. Only PDF files are allowed.`,
      code: 'INVALID_FILE_TYPE'
    };
  }

  // Check file size
  const fileSizeResult = validateFileSize(file.size);
  if (!fileSizeResult.valid) {
    return fileSizeResult;
  }

  // Check PDF magic bytes (PDF files start with %PDF-)
  if (file.buffer && file.buffer.length > 0) {
    const fileMagic = file.buffer.slice(0, 5);
    if (!fileMagic.equals(PDF_MAGIC_BYTES)) {
      logger.warn('Invalid PDF magic bytes', { filename: file.originalname });
      return {
        valid: false,
        error: 'File does not appear to be a valid PDF. Magic bytes mismatch.',
        code: 'INVALID_PDF_SIGNATURE'
      };
    }
  }

  logger.debug('PDF validation passed', { filename: file.originalname, size: file.size });
  return { valid: true };
};

/**
 * Validates file size
 * @param {number} size - File size in bytes
 * @returns {Object} { valid: boolean, error?: string }
 */
const validateFileSize = (size) => {
  if (typeof size !== 'number' || size <= 0) {
    return {
      valid: false,
      error: 'Invalid file size',
      code: 'INVALID_FILE_SIZE'
    };
  }

  if (size > MAX_FILE_SIZE) {
    logger.warn('File size exceeds limit', { size, maxSize: MAX_FILE_SIZE });
    return {
      valid: false,
      error: `File size (${formatFileSize(size)}) exceeds maximum allowed size of ${formatFileSize(MAX_FILE_SIZE)}`,
      code: 'FILE_SIZE_EXCEEDED'
    };
  }

  return { valid: true };
};

/**
 * Validates multiple files
 * @param {Array} files - Array of file objects from multer
 * @returns {Object} { valid: boolean, errors?: Array }
 */
const validatePDFFiles = (files) => {
  if (!Array.isArray(files) || files.length === 0) {
    return {
      valid: false,
      error: 'No files provided',
      code: 'NO_FILES_PROVIDED'
    };
  }

  const errors = [];
  
  for (let i = 0; i < files.length; i++) {
    const validation = validatePDFFile(files[i]);
    if (!validation.valid) {
      errors.push({
        index: i,
        filename: files[i]?.originalname || `file_${i}`,
        error: validation.error,
        code: validation.code
      });
    }
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors
    };
  }

  return { valid: true };
};

/**
 * Helper function to format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size string
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

module.exports = {
  validatePDFFile,
  validatePDFFiles,
  validateFileSize,
  formatFileSize,
  MAX_FILE_SIZE,
  PDF_MIME_TYPE
};
