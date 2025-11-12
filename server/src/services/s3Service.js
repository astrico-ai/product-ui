const { v4: uuidv4 } = require('uuid');
const { s3Client, config } = require('../config/aws');
const { logger } = require('../utils/logger');

/**
 * Generates a pre-signed URL for temporary access to a PDF
 * @param {string} s3Key - S3 object key
 * @param {number} expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns {string} Pre-signed URL
 */
const getSignedUrl = (s3Key, expiresIn = 3600) => {
  try {
    logger.debug('Generating signed URL', { key: s3Key, expiresIn });

    const params = {
      Bucket: config.bucketName,
      Key: s3Key,
      Expires: expiresIn
    };

    const signedUrl = s3Client.getSignedUrl('getObject', params);
    logger.debug('Signed URL generated', { key: s3Key });
    
    return signedUrl;
  } catch (error) {
    logger.error('Failed to generate signed URL', { s3Key, error: error.message });
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }
};

/**
 * Uploads a single PDF file to S3
 * @param {Object} file - File object from multer with buffer and metadata
 * @returns {Promise<Object>} Upload result with S3 metadata
 */
const uploadPDF = async (file) => {
  try {
    const pdfId = uuidv4();
    const timestamp = new Date().toISOString().split('T')[0];
    const key = `${config.uploadPath}/${timestamp}/${pdfId}/${file.originalname}`;

    const params = {
      Bucket: config.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        'original-filename': file.originalname,
        'upload-timestamp': new Date().toISOString(),
        'pdf-id': pdfId
      }
    };

    logger.debug('Starting S3 upload', { key, size: file.size });

    const result = await s3Client.upload(params).promise();

    // Generate pre-signed URL for temporary access (valid for 1 hour)
    const signedUrl = getSignedUrl(key, 3600);

    const uploadedPDF = {
      id: pdfId,
      filename: file.originalname,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      s3Url: signedUrl, // Pre-signed URL for secure access
      s3Key: key,
      etag: result.ETag
    };

    logger.info('PDF uploaded successfully to S3', { id: pdfId, filename: file.originalname });
    return uploadedPDF;
  } catch (error) {
    logger.error('S3 upload failed', { 
      filename: file.originalname, 
      error: error.message,
      code: error.code 
    });
    throw new Error(`Failed to upload PDF to S3: ${error.message}`);
  }
};

/**
 * Uploads multiple PDF files to S3
 * @param {Array} files - Array of file objects from multer
 * @returns {Promise<Array>} Array of upload results
 */
const uploadPDFs = async (files) => {
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error('No files provided for upload');
  }

  logger.debug('Starting batch upload', { count: files.length });

  const uploadPromises = files.map(file => uploadPDF(file));
  
  try {
    const results = await Promise.allSettled(uploadPromises);
    
    const uploaded = [];
    const failed = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        uploaded.push(result.value);
      } else {
        failed.push({
          filename: files[index].originalname,
          error: result.reason.message
        });
      }
    });

    logger.info('Batch upload complete', { 
      uploaded: uploaded.length, 
      failed: failed.length 
    });

    return {
      uploaded,
      failed,
      success: failed.length === 0
    };
  } catch (error) {
    logger.error('Batch upload error', { error: error.message });
    throw error;
  }
};

/**
 * Lists all PDFs stored in S3
 * @returns {Promise<Array>} Array of PDF metadata
 */
const listPDFs = async () => {
  try {
    logger.debug('Listing PDFs from S3');

    const params = {
      Bucket: config.bucketName,
      Prefix: `${config.uploadPath}/`
    };

    const result = await s3Client.listObjectsV2(params).promise();
    
    if (!result.Contents || result.Contents.length === 0) {
      logger.debug('No PDFs found in S3');
      return [];
    }

    const pdfs = result.Contents
      .filter(obj => obj.Key.endsWith('.pdf'))
      .map(obj => {
        // Generate pre-signed URL for temporary access (valid for 1 hour)
        const signedUrl = getSignedUrl(obj.Key, 3600);
        
        return {
          s3Key: obj.Key,
          filename: obj.Key.split('/').pop(),
          size: obj.Size,
          uploadedAt: obj.LastModified.toISOString(),
          s3Url: signedUrl, // Pre-signed URL for secure access
          etag: obj.ETag
        };
      })
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    logger.debug('PDFs listed successfully', { count: pdfs.length });
    return pdfs;
  } catch (error) {
    logger.error('Failed to list PDFs', { error: error.message, code: error.code });
    throw new Error(`Failed to list PDFs: ${error.message}`);
  }
};

/**
 * Deletes a PDF from S3 by S3 key
 * @param {string} s3Key - S3 object key
 * @returns {Promise<Object>} Deletion result
 */
const deletePDF = async (s3Key) => {
  try {
    if (!s3Key) {
      throw new Error('S3 key is required');
    }

    logger.debug('Deleting PDF from S3', { key: s3Key });

    const params = {
      Bucket: config.bucketName,
      Key: s3Key
    };

    const result = await s3Client.deleteObject(params).promise();

    logger.info('PDF deleted successfully', { key: s3Key });
    
    return {
      success: true,
      message: 'PDF deleted successfully',
      s3Key
    };
  } catch (error) {
    logger.error('Failed to delete PDF', { s3Key, error: error.message });
    throw new Error(`Failed to delete PDF: ${error.message}`);
  }
};

/**
 * Gets PDF file content from S3 as buffer
 * @param {string} s3Key - S3 object key
 * @returns {Promise<Buffer>} PDF file buffer
 */
const getPDFBuffer = async (s3Key) => {
  try {
    logger.debug('Fetching PDF buffer from S3', { key: s3Key });

    const params = {
      Bucket: config.bucketName,
      Key: s3Key
    };

    const result = await s3Client.getObject(params).promise();
    
    logger.debug('PDF buffer retrieved', { key: s3Key, size: result.Body.length });
    return result.Body;
  } catch (error) {
    logger.error('Failed to fetch PDF buffer', { s3Key, error: error.message });
    throw new Error(`Failed to fetch PDF: ${error.message}`);
  }
};

/**
 * Gets PDF file content from S3 as stream
 * @param {string} s3Key - S3 object key
 * @returns {Stream} PDF file stream
 */
const getPDFStream = (s3Key) => {
  try {
    logger.debug('Creating PDF stream from S3', { key: s3Key });

    const params = {
      Bucket: config.bucketName,
      Key: s3Key
    };

    return s3Client.getObject(params).createReadStream();
  } catch (error) {
    logger.error('Failed to create PDF stream', { s3Key, error: error.message });
    throw new Error(`Failed to create PDF stream: ${error.message}`);
  }
};

/**
 * Checks if PDF exists in S3
 * @param {string} s3Key - S3 object key
 * @returns {Promise<boolean>} True if exists, false otherwise
 */
const pdfExists = async (s3Key) => {
  try {
    const params = {
      Bucket: config.bucketName,
      Key: s3Key
    };

    await s3Client.headObject(params).promise();
    return true;
  } catch (error) {
    if (error.code === 'NotFound') {
      return false;
    }
    logger.error('Error checking PDF existence', { s3Key, error: error.message });
    throw error;
  }
};

module.exports = {
  uploadPDF,
  uploadPDFs,
  listPDFs,
  deletePDF,
  getPDFBuffer,
  getPDFStream,
  pdfExists,
  getSignedUrl
};
