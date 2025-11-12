# AGENT 3 HANDOFF - PDF Management Frontend

**From:** Agent 1 (Backend Infrastructure) ✅ COMPLETE  
**To:** Agent 3 (Frontend PDF Management Page)  
**Status:** Ready for Integration

---

## 🎯 Your Mission

Build the PDF Management UI page and integrate it with the 4 production-ready API endpoints from Agent 1.

**Key Requirements:**
- Separate page accessible from main navigation (route: `/pdf-manager`)
- Drag-and-drop PDF upload interface
- List of uploaded PDFs with metadata
- Delete functionality with confirmation
- Styled consistently with existing UI
- Integration with real APIs (no mocks needed - APIs are ready!)

---

## 🔗 API Endpoints Ready for Integration

All 4 endpoints are production-ready and can be called immediately:

### 1. Upload PDFs
```
POST http://localhost:3000/api/pdfs/upload
Content-Type: multipart/form-data

Request:
  - Field name: "files"
  - Value: [file1.pdf, file2.pdf, ...]
  - Max files: 10
  - Max size per file: 25MB

Success Response (200):
{
  "success": true,
  "pdfs": [
    {
      "id": "uuid-string",
      "filename": "document.pdf",
      "size": 512000,
      "uploadedAt": "2025-01-15T10:30:00Z",
      "s3Url": "https://s3.../pdfs/...",
      "s3Key": "pdfs/2025-01-15/uuid/document.pdf"
    }
  ],
  "failed": [],
  "message": "1 file(s) uploaded successfully"
}

Error Response (400/413/500):
{
  "success": false,
  "error": "Error message",
  "errors": [{...}],
  "code": "ERROR_CODE"
}
```

### 2. List PDFs
```
GET http://localhost:3000/api/pdfs

Success Response (200):
{
  "success": true,
  "pdfs": [
    {
      "s3Key": "pdfs/2025-01-15/uuid-1/doc1.pdf",
      "filename": "doc1.pdf",
      "size": 256000,
      "uploadedAt": "2025-01-15T10:30:00Z",
      "s3Url": "https://s3.../...",
      "etag": "\"abc123\""
    }
  ],
  "total": 1
}
```

### 3. Delete PDF
```
DELETE http://localhost:3000/api/pdfs/:id

Success Response (200):
{
  "success": true,
  "message": "PDF deleted successfully",
  "id": "pdfs/2025-01-15/uuid-1/doc1.pdf",
  "filename": "doc1.pdf"
}

Error Response (404):
{
  "success": false,
  "error": "PDF not found",
  "code": "PDF_NOT_FOUND"
}
```

### 4. Analyze PDFs (Ready in backend, used by Agent 4)
```
POST http://localhost:3000/api/pdfs/analyze

Request:
{
  "pdfIds": ["id1", "id2"],
  "query": "User's question",
  "userMessage": "optional context"
}

Response (200):
{
  "success": true,
  "analysis": "AI analysis text...",
  "referencedPdfs": [{id, filename}],
  "tokensUsed": {input, output, total},
  "model": "claude-3.5-sonnet",
  "timestamp": "2025-01-15T10:35:00Z"
}
```

---

## 📋 Frontend Components to Build

### 1. PDFManagerPage Component
**Location:** `src/pages/PDFManagerPage.jsx`

**Features:**
- Main page component
- Two main sections: Upload Area + PDF List
- Use existing MainLayout wrapper
- Apply existing styling patterns

**Route:** Add to `src/App.jsx`
```jsx
<Route path="/pdf-manager" element={<PDFManagerPage />} />
```

**Navigation:** Add link in Sidebar/MainLayout

---

### 2. PDFUploadArea Component
**Location:** `src/components/PDFUploadArea.jsx`

**Features:**
- Drag-and-drop zone
- File input button
- Shows selected files before upload
- Upload progress indicator
- Error messages for invalid files
- Success notification after upload

**Props:**
```javascript
{
  onUploadSuccess: (pdfs) => {},  // Called after successful upload
  onUploadError: (error) => {},   // Called on error
  isLoading: boolean
}
```

**Handle:**
- Drag over effect
- Drop event
- File validation (size, type)
- Show loading state during upload
- Display success/error toast

---

### 3. PDFList Component
**Location:** `src/components/PDFList.jsx`

**Features:**
- Table/list view of uploaded PDFs
- Display: filename, size, upload date
- Delete button for each PDF
- Delete confirmation dialog
- Empty state when no PDFs
- Refresh list after upload/delete

**Props:**
```javascript
{
  pdfs: Array<{s3Key, filename, size, uploadedAt, s3Url}>,
  onDelete: (s3Key) => {},
  isLoading: boolean,
  onRefresh: () => {}
}
```

**Display:**
- Filename
- File size (formatted: e.g., "2.5 MB")
- Upload date (formatted: e.g., "Jan 15, 2025")
- Delete icon/button

---

### 4. PDF Service Hook
**Location:** `src/services/pdfService.js`

**Functions to Create:**
```javascript
// Upload files
async uploadPDFs(files) → {success, pdfs, failed}

// Get list of PDFs
async listPDFs() → {pdfs, total}

// Delete a PDF
async deletePDF(s3Key) → {success, message}

// Analyze PDFs (for Agent 4 later)
async analyzePDFs(pdfIds, query) → {analysis, referencedPdfs, ...}
```

**Base URL:** Use environment variable or `process.env.VITE_API_URL` (default: `http://localhost:3000`)

---

## 🛠 Integration Steps

### Step 1: Create PDF Service
```javascript
// src/services/pdfService.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const uploadPDFs = async (files) => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  
  const response = await fetch(`${API_URL}/api/pdfs/upload`, {
    method: 'POST',
    body: formData
  });
  return response.json();
};

export const listPDFs = async () => {
  const response = await fetch(`${API_URL}/api/pdfs`);
  return response.json();
};

export const deletePDF = async (s3Key) => {
  const response = await fetch(`${API_URL}/api/pdfs/${encodeURIComponent(s3Key)}`, {
    method: 'DELETE'
  });
  return response.json();
};

// Add more functions...
```

### Step 2: Create PDFUploadArea Component
```javascript
// src/components/PDFUploadArea.jsx
import { useState } from 'react';
import { uploadPDFs } from '@/services/pdfService';

export const PDFUploadArea = ({ onUploadSuccess, onUploadError, isLoading }) => {
  // Implement drag-and-drop
  // Call uploadPDFs() on drop
  // Show progress/loading state
  // Call onUploadSuccess() or onUploadError()
};
```

### Step 3: Create PDFList Component
```javascript
// src/components/PDFList.jsx
import { listPDFs, deletePDF } from '@/services/pdfService';

export const PDFList = ({ onDelete, isLoading }) => {
  const [pdfs, setPdfs] = useState([]);
  
  useEffect(() => {
    loadPDFs();
  }, []);
  
  const loadPDFs = async () => {
    const result = await listPDFs();
    if (result.success) setPdfs(result.pdfs);
  };
  
  const handleDelete = async (s3Key) => {
    const result = await deletePDF(s3Key);
    if (result.success) {
      await loadPDFs(); // Refresh list
    }
  };
  
  // Render PDF list with delete buttons
};
```

### Step 4: Create PDFManagerPage
```javascript
// src/pages/PDFManagerPage.jsx
import { PDFUploadArea } from '@/components/PDFUploadArea';
import { PDFList } from '@/components/PDFList';

export default function PDFManagerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handleUploadSuccess = () => {
    setRefreshKey(prev => prev + 1);
    // Show success toast
  };
  
  return (
    <MainLayout>
      <div className="pdf-manager-container">
        <h1>PDF Manager</h1>
        <PDFUploadArea onUploadSuccess={handleUploadSuccess} />
        <PDFList key={refreshKey} />
      </div>
    </MainLayout>
  );
}
```

### Step 5: Add Route in App.jsx
```javascript
// src/App.jsx
import PDFManagerPage from '@/pages/PDFManagerPage';

<Route path="/pdf-manager" element={<PDFManagerPage />} />
```

### Step 6: Add Navigation Link
Add link to `/pdf-manager` in your MainLayout/Sidebar

---

## 🎨 Styling Guide

**Use existing patterns from your codebase:**
- Color scheme: Existing primary/secondary colors
- Buttons: Use existing Button components
- Modals/Dialogs: Use existing Dialog components
- Inputs: Use existing Input components
- Loading states: Use existing Skeleton components
- Notifications: Use existing toast system

**Reference existing pages:**
- Check `src/pages/Sources.jsx` for similar list layouts
- Check `src/pages/Training.jsx` for upload patterns
- Match the visual style and spacing

---

## 📦 Environment Setup

**Add to `.env` (frontend root):**
```
VITE_API_URL=http://localhost:3000
```

This makes the API URL configurable and easy to change for different environments.

---

## ✅ Integration Checklist

### Phase 1: Setup
- [ ] Create PDF service (`src/services/pdfService.js`)
- [ ] Add `VITE_API_URL` to `.env`
- [ ] Create PDFUploadArea component
- [ ] Create PDFList component
- [ ] Create PDFManagerPage component

### Phase 2: Integration
- [ ] Add route to `/pdf-manager` in App.jsx
- [ ] Add navigation link in MainLayout
- [ ] Test upload endpoint with UI
- [ ] Test list endpoint with UI
- [ ] Test delete endpoint with UI

### Phase 3: Polish
- [ ] Error handling and toast messages
- [ ] Loading states during operations
- [ ] Empty state when no PDFs
- [ ] File size formatting
- [ ] Date formatting
- [ ] Delete confirmation dialog

### Phase 4: Testing
- [ ] Upload single PDF
- [ ] Upload multiple PDFs
- [ ] List displays all PDFs
- [ ] Delete PDF works
- [ ] Refresh after operations
- [ ] Error handling works
- [ ] File validation on upload

---

## 🧪 Testing the Integration

**Start backend:**
```bash
cd server
npm run dev
```

**Start frontend:**
```bash
npm run dev
```

**Test in browser:**
1. Navigate to `http://localhost:5173/pdf-manager`
2. Try uploading a PDF
3. Verify it appears in the list
4. Try deleting a PDF
5. Check browser network tab to see API calls

---

## 🚨 Error Handling

**Errors to handle:**

```javascript
// Upload errors
- "No files provided" (400)
- "File too large" (413)
- "Invalid file type" (400)
- "Upload failed" (500)
- "Too many files" (413)

// List errors
- Network error
- Server error (500)

// Delete errors
- "PDF not found" (404)
- Network error
- Server error (500)
```

**Show to user:**
- Friendly error messages in toast/alert
- Technical error codes in console
- Retry option for failures

---

## 📝 API Response Error Codes

Agent 1 returns consistent error codes:

```javascript
// Upload errors
VALIDATION_FAILED
FILE_TOO_LARGE
FILE_SIZE_EXCEEDED
INVALID_FILE_TYPE
NO_FILES_PROVIDED
TOO_MANY_FILES
UPLOAD_ERROR

// List errors
LIST_ERROR

// Delete errors
PDF_NOT_FOUND
MISSING_ID
DELETE_ERROR

// Analyze errors (for Agent 4)
MISSING_PDF_IDS
MISSING_QUERY
INVALID_PDF_IDS
ANALYSIS_ERROR
RATE_LIMITED
TIMEOUT
```

Use these for better error handling logic.

---

## 🔄 Data Flow

```
User selects files
    ↓
PDFUploadArea calls uploadPDFs()
    ↓
POST /api/pdfs/upload (multipart/form-data)
    ↓
Backend uploads to S3
    ↓
Returns { success, pdfs: [...], failed: [...] }
    ↓
Show toast notification
    ↓
Refresh PDFList
    ↓
PDFList calls listPDFs()
    ↓
GET /api/pdfs
    ↓
Returns { success, pdfs: [...] }
    ↓
Render list of PDFs
```

---

## 🎁 What Agent 1 Gave You

✅ 4 Production-Ready API Endpoints  
✅ Comprehensive Error Handling  
✅ AWS S3 Integration  
✅ OpenRouter API Integration  
✅ File Validation (type, size, magic bytes)  
✅ Batch Upload Support  
✅ Full Request Logging  
✅ Rate Limit Handling  
✅ Timeout Protection  

**All you need to do:** Build the UI and call the APIs!

---

## 🤝 Coordination with Other Agents

- **Agent 4** will need the PDF list to implement the @ mention system
- **Agent 5** will connect your UI to the Zustand store for state management

You can proceed independently. Your components will be wired into the store by Agent 5 later.

---

## 📞 Troubleshooting

**API not responding?**
- Check backend is running: `npm run dev` from `server/` directory
- Check CORS is enabled (it is by default)
- Check environment variables are set

**Files not uploading?**
- Check file size < 25MB
- Check file is valid PDF
- Check AWS credentials in backend `.env`

**Files not appearing in list?**
- Check AWS S3 bucket name is correct
- Check backend logs for S3 errors
- Try refreshing the page

---

## ✨ Ready to Start?

You have everything you need! The APIs are fully functional and ready to be called from your frontend.

**Start with creating the PDF service, then build the components. Good luck! 🚀**

---

**Agent 1 Status:** ✅ COMPLETE  
**Agent 3 Status:** 🚀 READY TO START
