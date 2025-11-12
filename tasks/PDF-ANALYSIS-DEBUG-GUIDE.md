# PDF Analysis Debug Guide

## Issue
Claude/OpenRouter responds with "I don't see any document attached" even though the PDF is in the request payload.

## Changes Made

### 1. ✅ Added `plugins` Configuration (CRITICAL)
**File**: `server/src/config/openrouter.js`

Added explicit PDF parsing engine configuration:
```javascript
plugins: [
  {
    id: 'file-parser',
    pdf: {
      engine: 'native'  // Uses Claude's native PDF support
    }
  }
]
```

According to [OpenRouter docs](https://openrouter.ai/docs/features/multimodal/pdfs#plugin-configuration), this tells OpenRouter to:
- Use native PDF processing for Claude models
- Fall back to `mistral-ocr` if native not available

### 2. ✅ Added Base64 Fallback for Debugging
**File**: `server/src/routes/pdfs.js`

Added ability to test with Base64 encoding to rule out S3 URL access issues:
- Default: Uses signed S3 URLs (efficient)
- Debug mode: Uses Base64 encoding

## Testing Steps

### Step 1: Test with Current Setup (URL + plugins)
Restart your server and test:
```bash
npm run dev
```

Make an analyze request from your frontend. Check the logs for:
- `plugins` in the request payload
- OpenRouter's response

### Step 2: Test with Base64 (if URLs still fail)
Modify your frontend API call or use cURL:

**Option A: Frontend query parameter**
```javascript
// Add useBase64=true to your analyze request
const response = await fetch('/api/pdfs/analyze?useBase64=true', {
  method: 'POST',
  body: JSON.stringify({ pdfIds, query })
});
```

**Option B: Request body**
```json
{
  "pdfIds": ["pdf-key-1"],
  "query": "Summarize this document",
  "useBase64": true
}
```

**Option C: cURL test**
```bash
curl -X POST http://localhost:3000/api/pdfs/analyze?useBase64=true \
  -H "Content-Type: application/json" \
  -d '{
    "pdfIds": ["pdfs/2025-11-04/..."],
    "query": "Summarize this document"
  }'
```

### Step 3: Configure S3 CORS (if URL approach fails)

If Base64 works but URLs don't, you need to add CORS headers to your S3 bucket.

**AWS Console Steps:**
1. Go to AWS S3 Console
2. Select your bucket: `product-ui-pdfs`
3. Go to **Permissions** tab
4. Scroll to **Cross-origin resource sharing (CORS)**
5. Add this configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

**Or use AWS CLI:**
```bash
aws s3api put-bucket-cors --bucket product-ui-pdfs --cors-configuration file://cors.json
```

**cors.json:**
```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

### Step 4: Verify S3 Bucket Policy

Ensure your bucket allows public read access for signed URLs:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowPublicRead",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::product-ui-pdfs/pdfs/*"
    }
  ]
}
```

**Note**: This makes files in the `pdfs/` folder publicly readable via signed URLs only (not directly browsable).

## Expected Results

### ✅ Success with `plugins` parameter:
```json
{
  "choices": [{
    "message": {
      "content": "This document discusses... [actual summary]"
    }
  }],
  "usage": {
    "prompt_tokens": 5000,  // Higher due to PDF content
    "completion_tokens": 200
  }
}
```

### ✅ Success with Base64 (but not URLs):
- **Means**: S3 URLs are not accessible by OpenRouter
- **Fix**: Configure S3 CORS (Step 3)

### ❌ Failure with both approaches:
- Check `OPENROUTER_MODEL` in `.env` - ensure it supports PDF processing
- Try a different model: `anthropic/claude-3.5-sonnet` or `google/gemini-pro-1.5`
- Check OpenRouter API key permissions

## Current Request Format (Correct)

```json
{
  "model": "anthropic/claude-sonnet-4.5",
  "messages": [{
    "role": "user",
    "content": [
      {
        "type": "text",
        "text": "Summarize this document"
      },
      {
        "type": "file",
        "file": {
          "filename": "document.pdf",
          "fileData": "https://s3.ap-south-1.amazonaws.com/..."
        }
      }
    ]
  }],
  "plugins": [
    {
      "id": "file-parser",
      "pdf": {
        "engine": "native"
      }
    }
  ],
  "temperature": 0.7,
  "max_tokens": 2000
}
```

## Debugging Checklist

- [ ] Restart server after code changes
- [ ] Check full request JSON in logs (includes `plugins`?)
- [ ] Test with `useBase64=true` parameter
- [ ] Verify S3 CORS configuration
- [ ] Try accessing the signed S3 URL directly in browser
- [ ] Check OpenRouter model supports PDF (`anthropic/claude-*` should work)
- [ ] Verify `OPENROUTER_API_KEY` is correct in `.env`

## References

- [OpenRouter PDF Documentation](https://openrouter.ai/docs/features/multimodal/pdfs)
- [AWS S3 CORS Configuration](https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html)
- [AWS S3 Presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html)

