# API Manual Testing Guide - PDF Upload & Analysis Module

## Prerequisites

- Backend server running: `npm run dev` (from `server/` directory)
- Server URL: `http://localhost:3000`
- AWS S3 credentials configured in `.env`
- OpenRouter API key configured in `.env`
- Sample PDF files for testing

---

## 1️⃣ POST /api/pdfs/upload - Upload PDF Files

### Test Case 1.1: Upload Single PDF (Success)

**Using cURL:**
```bash
curl -X POST http://localhost:3000/api/pdfs/upload \
  -F "files=@/path/to/sample.pdf"
```

**Expected Response (200):**
```json
{
  "success": true,
  "pdfs": [
    {
      "id": "uuid-string",
      "filename": "sample.pdf",
      "size": 512000,
      "uploadedAt": "2025-01-15T10:30:00Z",
      "s3Url": "https://product-ui-pdfs.s3.us-east-1.amazonaws.com/pdfs/2025-01-15/...",
      "s3Key": "pdfs/2025-01-15/uuid/sample.pdf",
      "etag": "\"abc123def456\""
    }
  ],
  "failed": [],
  "message": "1 file(s) uploaded successfully"
}
```

---

### Test Case 1.2: Upload Multiple PDFs (Success)

**Using cURL:**
```bash
curl -X POST http://localhost:3000/api/pdfs/upload \
  -F "files=@/path/to/doc1.pdf" \
  -F "files=@/path/to/doc2.pdf" \
  -F "files=@/path/to/doc3.pdf"
```

**Expected Response (200):**
```json
{
  "success": true,
  "pdfs": [
    { "id": "uuid-1", "filename": "doc1.pdf", "size": 256000, ... },
    { "id": "uuid-2", "filename": "doc2.pdf", "size": 384000, ... },
    { "id": "uuid-3", "filename": "doc3.pdf", "size": 512000, ... }
  ],
  "failed": [],
  "message": "3 file(s) uploaded successfully"
}
```

---

### Test Case 1.3: Upload with Invalid File Type (Error)

**Using cURL:**
```bash
curl -X POST http://localhost:3000/api/pdfs/upload \
  -F "files=@/path/to/document.txt"
```

**Expected Response (400):**
```json
{
  "success": false,
  "error": "File validation failed",
  "errors": [
    {
      "index": 0,
      "filename": "document.txt",
      "error": "Invalid file type: text/plain. Only PDF files are allowed.",
      "code": "INVALID_FILE_TYPE"
    }
  ],
  "code": "VALIDATION_FAILED"
}
```

---

### Test Case 1.4: Upload File Exceeding Size Limit (Error)

**Using cURL:**
```bash
curl -X POST http://localhost:3000/api/pdfs/upload \
  -F "files=@/path/to/huge-file-30mb.pdf"
```

**Expected Response (413):**
```json
{
  "success": false,
  "error": "File is too large. Maximum size is 25MB",
  "code": "FILE_TOO_LARGE"
}
```

---

### Test Case 1.5: Upload with No Files (Error)

**Using cURL:**
```bash
curl -X POST http://localhost:3000/api/pdfs/upload
```

**Expected Response (400):**
```json
{
  "success": false,
  "error": "No files provided",
  "code": "NO_FILES_PROVIDED"
}
```

---

### Test Case 1.6: Upload More Than 10 Files (Error)

**Using cURL:**
```bash
curl -X POST http://localhost:3000/api/pdfs/upload \
  -F "files=@doc1.pdf" \
  -F "files=@doc2.pdf" \
  -F "files=@doc3.pdf" \
  -F "files=@doc4.pdf" \
  -F "files=@doc5.pdf" \
  -F "files=@doc6.pdf" \
  -F "files=@doc7.pdf" \
  -F "files=@doc8.pdf" \
  -F "files=@doc9.pdf" \
  -F "files=@doc10.pdf" \
  -F "files=@doc11.pdf"
```

**Expected Response (413):**
```json
{
  "success": false,
  "error": "Too many files. Maximum is 10 files per upload",
  "code": "TOO_MANY_FILES"
}
```

---

## 2️⃣ GET /api/pdfs - List All PDFs

### Test Case 2.1: List PDFs (Success)

**Using cURL:**
```bash
curl -X GET http://localhost:3000/api/pdfs
```

**Expected Response (200):**
```json
{
  "success": true,
  "pdfs": [
    {
      "s3Key": "pdfs/2025-01-15/uuid-1/doc1.pdf",
      "filename": "doc1.pdf",
      "size": 256000,
      "uploadedAt": "2025-01-15T10:30:00Z",
      "s3Url": "https://product-ui-pdfs.s3.us-east-1.amazonaws.com/pdfs/2025-01-15/...",
      "etag": "\"abc123\""
    },
    {
      "s3Key": "pdfs/2025-01-15/uuid-2/doc2.pdf",
      "filename": "doc2.pdf",
      "size": 384000,
      "uploadedAt": "2025-01-15T09:15:00Z",
      "s3Url": "https://product-ui-pdfs.s3.us-east-1.amazonaws.com/pdfs/2025-01-15/...",
      "etag": "\"def456\""
    }
  ],
  "total": 2
}
```

---

### Test Case 2.2: List PDFs (Empty)

**Using cURL:**
```bash
curl -X GET http://localhost:3000/api/pdfs
```

**Expected Response (200):**
```json
{
  "success": true,
  "pdfs": [],
  "total": 0
}
```

---

## 3️⃣ DELETE /api/pdfs/:id - Delete PDF

### Test Case 3.1: Delete PDF (Success)

First, get the S3 key from the list endpoint, then:

**Using cURL:**
```bash
curl -X DELETE http://localhost:3000/api/pdfs/uuid-1
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "PDF deleted successfully",
  "id": "pdfs/2025-01-15/uuid-1/doc1.pdf",
  "filename": "doc1.pdf"
}
```

---

### Test Case 3.2: Delete Non-existent PDF (Error)

**Using cURL:**
```bash
curl -X DELETE http://localhost:3000/api/pdfs/non-existent-id
```

**Expected Response (404):**
```json
{
  "success": false,
  "error": "PDF not found",
  "code": "PDF_NOT_FOUND"
}
```

---

### Test Case 3.3: Delete with Missing ID (Error)

**Using cURL:**
```bash
curl -X DELETE http://localhost:3000/api/pdfs/
```

**Expected Response (404):**
```json
{
  "success": false,
  "error": "PDF not found",
  "code": "PDF_NOT_FOUND"
}
```

---

## 4️⃣ POST /api/pdfs/analyze - Analyze PDFs

### Test Case 4.1: Analyze Single PDF (Success)

**Using cURL:**
```bash
curl -X POST http://localhost:3000/api/pdfs/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "pdfIds": ["pdfs/2025-01-15/uuid-1/doc1.pdf"],
    "query": "Summarize the main points from this document",
    "userMessage": "Focus on key takeaways"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "analysis": "Based on the PDF you referenced, the main points are:\n\n1. First key point...\n2. Second key point...\n3. Third key point...",
  "referencedPdfs": [
    {
      "id": "pdfs/2025-01-15/uuid-1/doc1.pdf",
      "filename": "doc1.pdf"
    }
  ],
  "tokensUsed": {
    "input": 2500,
    "output": 350,
    "total": 2850
  },
  "model": "claude-3.5-sonnet",
  "timestamp": "2025-01-15T10:35:00Z"
}
```

---

### Test Case 4.2: Analyze Multiple PDFs (Success)

**Using cURL:**
```bash
curl -X POST http://localhost:3000/api/pdfs/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "pdfIds": [
      "pdfs/2025-01-15/uuid-1/doc1.pdf",
      "pdfs/2025-01-15/uuid-2/doc2.pdf"
    ],
    "query": "Compare and contrast the approaches in these two documents"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "analysis": "Comparing the two documents:\n\nDocument 1 approach: ...\nDocument 2 approach: ...\n\nKey differences: ...",
  "referencedPdfs": [
    {
      "id": "pdfs/2025-01-15/uuid-1/doc1.pdf",
      "filename": "doc1.pdf"
    },
    {
      "id": "pdfs/2025-01-15/uuid-2/doc2.pdf",
      "filename": "doc2.pdf"
    }
  ],
  "tokensUsed": {
    "input": 4200,
    "output": 520,
    "total": 4720
  },
  "model": "claude-3.5-sonnet",
  "timestamp": "2025-01-15T10:36:00Z"
}
```

---

### Test Case 4.3: Analyze with Missing PDF IDs (Error)

**Using cURL:**
```bash
curl -X POST http://localhost:3000/api/pdfs/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Summarize this"
  }'
```

**Expected Response (400):**
```json
{
  "success": false,
  "error": "At least one PDF ID is required",
  "code": "MISSING_PDF_IDS"
}
```

---

### Test Case 4.4: Analyze with Empty Query (Error)

**Using cURL:**
```bash
curl -X POST http://localhost:3000/api/pdfs/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "pdfIds": ["pdfs/2025-01-15/uuid-1/doc1.pdf"],
    "query": ""
  }'
```

**Expected Response (400):**
```json
{
  "success": false,
  "error": "Query is required",
  "code": "MISSING_QUERY"
}
```

---

### Test Case 4.5: Analyze with Non-existent PDF (Error)

**Using cURL:**
```bash
curl -X POST http://localhost:3000/api/pdfs/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "pdfIds": ["pdfs/2025-01-15/uuid-999/nonexistent.pdf"],
    "query": "Summarize"
  }'
```

**Expected Response (400):**
```json
{
  "success": false,
  "error": "One or more PDFs not found",
  "invalidIds": ["pdfs/2025-01-15/uuid-999/nonexistent.pdf"],
  "code": "INVALID_PDF_IDS"
}
```

---

### Test Case 4.6: Analyze with OpenRouter Rate Limit (Error)

**Using cURL (after many requests):**
```bash
curl -X POST http://localhost:3000/api/pdfs/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "pdfIds": ["pdfs/2025-01-15/uuid-1/doc1.pdf"],
    "query": "Summarize"
  }'
```

**Expected Response (429):**
```json
{
  "success": false,
  "error": "OpenRouter API rate limit exceeded. Retry after 60s",
  "code": "RATE_LIMITED",
  "retryAfter": 60
}
```

---

### Test Case 4.7: Analyze with Timeout (Error)

**Using cURL (with slow network):**
```bash
curl -X POST http://localhost:3000/api/pdfs/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "pdfIds": ["pdfs/2025-01-15/uuid-1/doc1.pdf"],
    "query": "Very complex analysis query"
  }'
```

**Expected Response (504):**
```json
{
  "success": false,
  "error": "Analysis request timed out",
  "code": "TIMEOUT"
}
```

---

## Testing Checklist

### Upload Endpoint (POST /api/pdfs/upload)
- [ ] Single PDF upload ✓
- [ ] Multiple PDF upload ✓
- [ ] Invalid file type ✓
- [ ] File size exceeded ✓
- [ ] No files provided ✓
- [ ] Too many files ✓

### List Endpoint (GET /api/pdfs)
- [ ] List populated PDFs ✓
- [ ] List empty PDFs ✓

### Delete Endpoint (DELETE /api/pdfs/:id)
- [ ] Delete existing PDF ✓
- [ ] Delete non-existent PDF ✓
- [ ] Delete with missing ID ✓

### Analyze Endpoint (POST /api/pdfs/analyze)
- [ ] Analyze single PDF ✓
- [ ] Analyze multiple PDFs ✓
- [ ] Missing PDF IDs ✓
- [ ] Empty query ✓
- [ ] Non-existent PDF ✓
- [ ] Rate limit handling ✓
- [ ] Timeout handling ✓

---

## Using Postman Instead of cURL

### Setup:
1. Open Postman
2. Create new Collection: "PDF API Testing"
3. Create Environment: "Local Dev"
4. Set variable: `base_url = http://localhost:3000`

### Import Requests:
```
POST {{base_url}}/api/pdfs/upload
GET {{base_url}}/api/pdfs
DELETE {{base_url}}/api/pdfs/:id
POST {{base_url}}/api/pdfs/analyze
```

---

## Logging & Debugging

Monitor backend logs while testing:
```bash
cd server
npm run dev
```

Look for:
- `✓ PDF uploaded successfully to S3`
- `✓ PDFs listed successfully`
- `✓ PDF deleted successfully`
- `✓ PDF analysis completed`

---

## Common Issues & Troubleshooting

### Issue: "ECONNREFUSED - Connection refused"
**Solution:** Ensure backend is running (`npm run dev` from `server/` directory)

### Issue: "AWS credentials not configured"
**Solution:** Check `.env` file has `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`

### Issue: "OPENROUTER_API_KEY not set"
**Solution:** Check `.env` file has `OPENROUTER_API_KEY` set

### Issue: "Access Denied" from S3
**Solution:** Verify AWS IAM permissions allow S3 bucket operations

### Issue: Analysis returns empty response
**Solution:** Check OpenRouter API key is valid and not rate limited

---

## Next Steps (For Agent 3 - Frontend)

These API endpoints are now ready for:
1. Mock API integration during frontend development
2. Real API calls once frontend is ready
3. Full E2E testing with the UI
