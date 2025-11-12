const fs = require('fs').promises;
const { logger } = require('./logger');

/**
 * Converts file buffer to Base64 string
 * @param {Buffer} buffer - File buffer
 * @returns {string} Base64 encoded string
 */
const bufferToBase64 = (buffer) => {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error('Input must be a Buffer');
  }
  return buffer.toString('base64');
};

/**
 * Converts file path to Base64 string
 * @param {string} filePath - Path to file
 * @returns {Promise<string>} Base64 encoded string
 */
const fileToBase64 = async (filePath) => {
  try {
    const buffer = await fs.readFile(filePath);
    return bufferToBase64(buffer);
  } catch (error) {
    logger.error('Error reading file for Base64 encoding', { filePath, error: error.message });
    throw new Error(`Failed to read file: ${error.message}`);
  }
};

/**
 * Converts multiple file buffers to Base64 with metadata
 * @param {Array} files - Array of file objects with buffer and metadata
 * @returns {Array} Array of objects with Base64 data and metadata
 */
const filesToBase64Array = (files) => {
  if (!Array.isArray(files)) {
    throw new Error('Input must be an array');
  }

  return files.map((file, index) => {
    try {
      const base64Data = bufferToBase64(file.buffer);
      return {
        filename: file.originalname || `file_${index}`,
        data: base64Data,
        size: file.size,
        mimetype: file.mimetype,
        id: file.id || `pdf_${index}`
      };
    } catch (error) {
      logger.error('Error encoding file to Base64', { 
        filename: file.originalname, 
        error: error.message 
      });
      throw error;
    }
  });
};

/**
 * Converts URL-based PDF to Base64 (for S3 URLs)
 * @param {string} url - URL to PDF file
 * @returns {Promise<string>} Base64 encoded string
 */
const urlToBase64 = async (url) => {
  try {
    const axios = require('axios');
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000
    });
    return Buffer.from(response.data).toString('base64');
  } catch (error) {
    logger.error('Error fetching URL for Base64 encoding', { url, error: error.message });
    throw new Error(`Failed to fetch URL: ${error.message}`);
  }
};

/**
 * Decodes Base64 string back to Buffer
 * @param {string} base64String - Base64 encoded string
 * @returns {Buffer} Decoded buffer
 */
const base64ToBuffer = (base64String) => {
  try {
    return Buffer.from(base64String, 'base64');
  } catch (error) {
    logger.error('Error decoding Base64', { error: error.message });
    throw new Error('Invalid Base64 string');
  }
};

/**
 * Gets size of Base64 encoded data in bytes
 * @param {string} base64String - Base64 encoded string
 * @returns {number} Size in bytes
 */
const getBase64Size = (base64String) => {
  return Math.ceil(base64String.length * 0.75);
};

module.exports = {
  bufferToBase64,
  fileToBase64,
  filesToBase64Array,
  urlToBase64,
  base64ToBuffer,
  getBase64Size
};
