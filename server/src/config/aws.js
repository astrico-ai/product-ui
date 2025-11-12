const AWS = require('aws-sdk');
const { logger } = require('../utils/logger');

// Configure AWS SDK
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  maxRetries: 3,
  httpOptions: {
    timeout: 30000,
    connectTimeout: 5000
  }
});

// Create S3 client
const s3Client = new AWS.S3({
  signatureVersion: 'v4',
  s3ForcePathStyle: true
});

// Validate AWS credentials on startup
const validateAWSConfig = () => {
  if (!process.env.AWS_ACCESS_KEY_ID) {
    logger.warn('AWS_ACCESS_KEY_ID not configured - S3 operations may fail');
  }
  if (!process.env.AWS_SECRET_ACCESS_KEY) {
    logger.warn('AWS_SECRET_ACCESS_KEY not configured - S3 operations may fail');
  }
  if (!process.env.AWS_S3_BUCKET_NAME) {
    logger.warn('AWS_S3_BUCKET_NAME not configured - S3 operations may fail');
  }
  logger.info('AWS S3 Configuration loaded', {
    region: process.env.AWS_REGION || 'us-east-1',
    bucket: process.env.AWS_S3_BUCKET_NAME,
    credentialsConfigured: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)
  });
};

// Initialize validation on module load
if (process.env.NODE_ENV !== 'test') {
  validateAWSConfig();
}

// Export configuration
module.exports = {
  s3Client,
  config: {
    region: process.env.AWS_REGION || 'us-east-1',
    bucketName: process.env.AWS_S3_BUCKET_NAME || 'product-ui-pdfs',
    uploadPath: 'pdfs',
    maxFileSize: 25 * 1024 * 1024, // 25MB in bytes
  },
  validateAWSConfig
};
