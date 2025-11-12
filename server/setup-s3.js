/**
 * S3 Bucket Setup Script
 * Creates the S3 bucket and configures CORS
 * 
 * Usage: node setup-s3.js
 */

const AWS = require('aws-sdk');
require('dotenv').config();

const s3 = new AWS.S3();
const bucketName = process.env.AWS_S3_BUCKET_NAME;
const region = process.env.AWS_REGION || 'us-east-1';

console.log('🚀 S3 Bucket Setup');
console.log('==================');
console.log(`Bucket Name: ${bucketName}`);
console.log(`Region: ${region}`);
console.log('');

// Step 1: Create bucket
async function createBucket() {
  console.log('Step 1: Creating bucket...');
  
  try {
    const params = {
      Bucket: bucketName,
      CreateBucketConfiguration: {
        LocationConstraint: region === 'us-east-1' ? undefined : region
      }
    };
    
    // Remove CreateBucketConfiguration for us-east-1
    if (region === 'us-east-1') {
      delete params.CreateBucketConfiguration;
    }
    
    await s3.createBucket(params).promise();
    console.log('✅ Bucket created successfully!');
    console.log(`   URL: https://${bucketName}.s3.amazonaws.com/`);
  } catch (error) {
    if (error.code === 'BucketAlreadyOwnedByYou') {
      console.log('✅ Bucket already exists (you own it)');
    } else if (error.code === 'BucketAlreadyExists') {
      console.log('❌ Bucket name already taken by someone else');
      console.log('   Try a different name in your .env file');
      process.exit(1);
    } else {
      console.error('❌ Error creating bucket:', error.message);
      throw error;
    }
  }
  console.log('');
}

// Step 2: Configure CORS
async function configureCORS() {
  console.log('Step 2: Configuring CORS...');
  
  const corsConfig = {
    Bucket: bucketName,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedHeaders: ['*'],
          AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
          AllowedOrigins: [
            'http://localhost:5173',
            'http://localhost:3000',
            'http://localhost:5174',
          ],
          ExposeHeaders: ['ETag'],
          MaxAgeSeconds: 3000
        }
      ]
    }
  };
  
  try {
    await s3.putBucketCors(corsConfig).promise();
    console.log('✅ CORS configured successfully!');
  } catch (error) {
    console.error('❌ Error configuring CORS:', error.message);
    throw error;
  }
  console.log('');
}

// Step 3: Verify setup
async function verifySetup() {
  console.log('Step 3: Verifying setup...');
  
  try {
    // Check if bucket exists and is accessible
    await s3.headBucket({ Bucket: bucketName }).promise();
    console.log('✅ Bucket is accessible');
    
    // Try to list objects (should be empty)
    const objects = await s3.listObjectsV2({ Bucket: bucketName, MaxKeys: 1 }).promise();
    console.log(`✅ Can list objects (${objects.KeyCount} files currently)`);
    
  } catch (error) {
    console.error('❌ Error verifying setup:', error.message);
    throw error;
  }
  console.log('');
}

// Run setup
async function main() {
  try {
    await createBucket();
    await configureCORS();
    await verifySetup();
    
    console.log('');
    console.log('🎉 S3 Setup Complete!');
    console.log('===================');
    console.log('Your backend is ready to upload PDFs to S3.');
    console.log('');
    console.log('Next steps:');
    console.log('1. Restart your backend server: npm run dev');
    console.log('2. Test the API: curl http://localhost:3000/api/pdfs');
    console.log('3. Start the frontend and test PDF upload!');
    console.log('');
    
  } catch (error) {
    console.error('');
    console.error('❌ Setup failed:', error.message);
    console.error('');
    console.error('Troubleshooting:');
    console.error('- Check your AWS credentials in .env');
    console.error('- Verify AWS_S3_BUCKET_NAME is set');
    console.error('- Try a different bucket name (must be globally unique)');
    console.error('- Check your AWS IAM permissions');
    process.exit(1);
  }
}

// Check if .env is configured
if (!bucketName) {
  console.error('❌ AWS_S3_BUCKET_NAME not found in .env file');
  console.error('');
  console.error('Please add this to server/.env:');
  console.error('AWS_S3_BUCKET_NAME=product-ui-pdfs-yourname');
  process.exit(1);
}

main();

