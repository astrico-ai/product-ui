# Task List: PDF Upload & Analysis Module

## Overview
This task list breaks down the implementation of the PDF Upload & Analysis Module into actionable items. The feature allows users to upload PDFs, manage them in a dedicated interface, reference them in chat with `@` mentions, and get AI-powered analysis using Claude 4.5 Sonnet via OpenRouter API.

## Architecture Context
- **Frontend**: React with Vite, using Tailwind CSS and Radix UI components
- **Backend**: Express.js with Node.js
- **State Management**: Zustand
- **UI Patterns**: Using existing MainLayout, Input, Button, and Dialog components
- **Chat Integration**: Existing ChatPage component structure
- **Storage**: AWS S3 for PDF storage
- **AI API**: OpenRouter (Claude 4.5 Sonnet)

## Relevant Files

### Backend Files
- `server/src/app.js` - Main Express server setup (will need PDF upload routes)
- `server/src/services/aiService.js` - Existing AI service (will integrate OpenRouter for PDF analysis)
- `server/src/config/openai.js` - Existing AI config (will add OpenRouter config)
- `server/src/utils/` - Utility functions directory (will add PDF processing utilities)

### Frontend Pages & Components
- `src/pages/ChatPage.jsx` - Main chat interface (will add @ mention system and PDF references)
- `src/pages/PDFManagerPage.jsx` - NEW: Dedicated PDF management page
- `src/components/PDFUploadArea.jsx` - NEW: Drag-and-drop upload component
- `src/components/PDFList.jsx` - NEW: List of uploaded PDFs
- `src/components/PDFMentionDropdown.jsx` - NEW: @ mention dropdown for PDF selection
- `src/components/PDFReferenceBadge.jsx` - NEW: Badge to show referenced PDFs in chat

### Frontend Services & Utils
- `src/services/pdfService.js` - NEW: Service for PDF management API calls
- `src/services/s3Service.js` - NEW: AWS S3 integration for file uploads
- `src/hooks/usePDFStore.js` - NEW: Zustand store for PDF management state
- `src/hooks/usePDFMention.js` - NEW: Hook for @ mention functionality in chat input
- `src/utils/base64Encoder.js` - NEW: Utility to convert PDFs to Base64

### Configuration
- `.env.example` - Environment variables template (will add AWS & OpenRouter keys)
- `server/src/config/aws.js` - NEW: AWS S3 configuration

## Multi-Agent Assignment Plan

### Agent Roles & Task Distribution

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CURSOR MULTI-AGENT WORKFLOW                       │
└─────────────────────────────────────────────────────────────────────┘

AGENT 1: Backend Infrastructure (Tasks 1.0 & 2.0)
├─ Task 1.0: AWS S3 Setup & Configuration
├─ Task 2.0: OpenRouter API Integration
└─ Deliverables: Backend API endpoints, services, config files

         ↓ (depends on)

AGENT 3: Frontend PDF Management UI (Task 3.0)
├─ Task 3.0: PDF Manager Page & Upload UI
└─ Deliverables: Upload page, PDF list, delete functionality

         ↓ (depends on)

AGENT 4: Chat @ Mention System (Task 4.0)
├─ Task 4.0: @ Mention Detection & PDF Selection
└─ Deliverables: @ mention dropdown, reference badges

         ↓ (depends on)

AGENT 5: State & Integration (Task 5.0)
├─ Task 5.0: Zustand Store & Data Synchronization
└─ Deliverables: State store, hooks, full integration
```

### Agent Assignments

| Agent | Focus Area | Primary Tasks | Can Start | Can Work In Parallel |
|-------|-----------|-----------------|-----------|----------------------|
| **Agent 1** | Backend | 1.0, 2.0 | Immediately | Yes - independent |
| **Agent 3** | Frontend UI | 3.0 | Immediately* | Yes - use mock APIs first |
| **Agent 4** | Chat Features | 4.0 | Immediately* | Yes - use mock state first |
| **Agent 5** | State Mgmt | 5.0 | Immediately* | Yes - completely independent |

*Can start immediately IF the **Interface Contracts are agreed upon first**

### Parallel Workflow Strategy

```
┌─────────────────────────────────────────────────────────────────────┐
│              CURSOR MULTI-AGENT PARALLEL WORKFLOW                    │
└─────────────────────────────────────────────────────────────────────┘

Step 0: AGREE ON CONTRACTS (15 mins - all agents together)
└─ Define API endpoints structure
└─ Define component props/exports
└─ Define Zustand store shape

             ↓ AGENTS WORK IN PARALLEL ↓

┌─────────────┬──────────────────┬──────────────────┬──────────────────┐
│  AGENT 1    │    AGENT 3       │    AGENT 4       │    AGENT 5       │
│ Backend     │  Frontend UI     │  Chat @Mentions  │  State Mgmt      │
├─────────────┼──────────────────┼──────────────────┼──────────────────┤
│ Tasks 1.0   │  Tasks 3.0       │  Tasks 4.0       │  Tasks 5.0       │
│             │  (use mock API)  │  (use mock state)│  (independent)   │
│             │                  │                  │                  │
│ 1.1-1.6     │  3.1-3.6         │  4.1-4.7         │  5.1-5.6         │
│             │                  │                  │                  │
│ Builds:     │  Builds:         │  Builds:         │  Builds:         │
│ ✓ API       │  ✓ UI Components │  ✓ @ Mention UI  │  ✓ Zustand Store │
│ ✓ Services  │  ✓ Upload Logic  │  ✓ Detection     │  ✓ Hooks         │
│ ✓ Config    │  ✓ Delete Logic  │  ✓ Selection     │  ✓ Sync Logic    │
└─────────────┴──────────────────┴──────────────────┴──────────────────┘

             ↓ INTEGRATION PHASE ↓

Step 1: Agent 1 → Agent 3 Integration
└─ Replace mock APIs with real endpoints
└─ Test upload, list, delete flows

Step 2: Agent 1 → Agent 4 Integration  
└─ Replace mock state with real store
└─ Test @ mention + PDF reference flows

Step 3: Agent 1 → Agent 5 Integration
└─ Connect Zustand store to backend APIs
└─ Test state synchronization

Step 4: Agent 3 + Agent 4 + Agent 5 Integration
└─ Full E2E: Upload → Reference in Chat → Analyze
└─ Verify UI + State + API all work together
```

### Development Strategy for Parallel Work

**PHASE 1: Contract Definition (Prerequisites)**
All agents must agree on these before starting:
- API endpoints & response formats (for Agent 1 specification)
- React component interfaces & props (for Agents 3 & 4)
- Zustand store structure (for Agent 5)
- ✅ These are documented in "Interface Contracts" section below

**PHASE 2: Development with Mocks**
- **Agent 1**: Builds real APIs
- **Agent 3**: Builds UI with mock API calls (uses `fetch` to mock endpoints)
- **Agent 4**: Builds @ mention with mock store (local state)
- **Agent 5**: Builds Zustand store independently

**PHASE 3: Integration**
- Replace mocks with real implementations
- Connect all pieces together
- End-to-end testing

### Milestones (What Needs to Happen When)

| Milestone | Owner | Status | Must Complete Before |
|-----------|-------|--------|----------------------|
| **M1: Contracts Locked** | All | Planning | All agents start development |
| **M2: Agent 1 APIs Done** | Agent 1 | Phase 2 | Agents 3,4,5 do final integration |
| **M3: Agent 3 UI Done** | Agent 3 | Phase 2 | Agent 4 integration testing |
| **M4: Agent 4 Dropdown Done** | Agent 4 | Phase 2 | Agent 5 final wiring |
| **M5: Agent 5 Store Done** | Agent 5 | Phase 2 | Final E2E testing |
| **M6: Full Integration** | All | Phase 3 | Feature complete |

---

## AGENT 1: Backend Infrastructure - Detailed Work Plan

### Agent 1 Mission
Build all backend infrastructure (AWS S3 + OpenRouter API integration) that other agents depend on. Deliver 4 working API endpoints + configuration files by end of Phase 2.

### Deliverables Checklist

**By End of Development:**
- ✅ AWS S3 Configuration Module
- ✅ OpenRouter Configuration Module  
- ✅ 4 REST API Endpoints (upload, list, delete, analyze)
- ✅ Error handling & validation layer
- ✅ Base64 encoding utility
- ✅ All tests passing
- ✅ `.env.example` with all required variables

### Files I (Agent 1) Will Create or Modify

#### Configuration Files
```
server/src/config/aws.js              [NEW] - AWS S3 client setup + config
server/src/config/openrouter.js       [NEW] - OpenRouter API setup + config
.env.example                           [MODIFY] - Add AWS + OpenRouter keys
```

#### Service Modules
```
server/src/services/s3Service.js      [NEW] - S3 upload/download/delete operations
server/src/services/openrouterService.js [NEW] - OpenRouter PDF analysis calls
server/src/services/pdfProcessingService.js [NEW] - Base64 encoding, PDF validation
```

#### API Route Handlers
```
server/src/routes/pdfs.js             [NEW] - All 4 PDF endpoints
server/src/app.js                     [MODIFY] - Register PDF routes
```

#### Utilities & Helpers
```
server/src/utils/pdfValidator.js      [NEW] - PDF file validation
server/src/utils/base64Encoder.js     [NEW] - PDF to Base64 conversion
server/src/utils/errors.js            [MODIFY] - Add PDF-specific error handling
```

#### Database/Storage Schema
```
server/src/models/pdf.model.js        [NEW] - PDF metadata schema (if using DB)
                                            OR simple in-memory store for now
```

#### Testing
```
server/src/routes/pdfs.test.js        [NEW] - API endpoint tests
server/src/services/s3Service.test.js [NEW] - S3 operations tests
```

---

### Implementation Timeline (Phase 2)

#### Step 1: Setup & Configuration (Day 1 - 2 hours)
**What I'm doing:**
- [ ] Create AWS S3 configuration module
- [ ] Create OpenRouter configuration module
- [ ] Update `.env.example` with all required keys
- [ ] Install required npm packages: `aws-sdk`, `dotenv`

**Files created:**
- `server/src/config/aws.js`
- `server/src/config/openrouter.js`
- Updated `.env.example`

**Deliverable to other agents:** 
- Environment variables list (so they know what to set)

---

#### Step 2: Utility & Service Modules (Day 1-2 - 3 hours)
**What I'm doing:**
- [ ] Create PDF validator utility
- [ ] Create Base64 encoder utility
- [ ] Create S3 service module (upload, download, delete, list)
- [ ] Create OpenRouter service module
- [ ] Create PDF processing service

**Files created:**
```javascript
// server/src/utils/pdfValidator.js
- validatePDFFile(file) → boolean | error
- validateFileSize(size) → boolean | error

// server/src/utils/base64Encoder.js
- fileToBase64(file) → base64String
- pdfToBase64(s3Url) → Promise<base64String>

// server/src/services/s3Service.js
- uploadPDF(file, userId) → { id, filename, size, s3Url, uploadedAt }
- listPDFs(userId) → Array<{ id, filename, size, uploadedAt, s3Url }>
- deletePDF(pdfId, userId) → { success, message }
- getPDFByteStream(s3Url) → Promise<Buffer>

// server/src/services/openrouterService.js
- analyzePDFs(pdfBase64Array, query) → Promise<{ analysis, usage }>
- formatAnalysisResponse(analysis, pdfIds) → formatted response
```

**Deliverable to other agents:**
- These services exported with clear interfaces that Agent 3/4/5 can mock

---

#### Step 3: API Endpoints (Day 2-3 - 4 hours)
**What I'm doing:**
- [ ] Create `/api/pdfs/upload` endpoint
  - Accept multipart/form-data
  - Validate files
  - Upload to S3
  - Return metadata

- [ ] Create `/api/pdfs` endpoint (GET)
  - List all PDFs
  - Return with metadata

- [ ] Create `/api/pdfs/:id` endpoint (DELETE)
  - Delete from S3
  - Return success message

- [ ] Create `/api/pdfs/analyze` endpoint (POST)
  - Accept pdfIds + query
  - Fetch PDFs from S3
  - Convert to Base64
  - Send to OpenRouter
  - Return analysis

**Files created:**
```javascript
// server/src/routes/pdfs.js
POST   /api/pdfs/upload
GET    /api/pdfs
DELETE /api/pdfs/:id
POST   /api/pdfs/analyze
```

**Deliverable to other agents:**
- Working API endpoints (Agents 3 & 4 can hit these instead of mocking)

---

#### Step 4: Error Handling & Validation (Day 3 - 2 hours)
**What I'm doing:**
- [ ] Add comprehensive error handling for all operations
- [ ] Add request validation middleware
- [ ] Add S3 error handling (network issues, permissions, etc.)
- [ ] Add OpenRouter error handling (API errors, rate limits)
- [ ] Return consistent error response format

**Error scenarios to handle:**
```javascript
- Invalid file type (not PDF)
- File too large (> 25MB)
- S3 upload failure
- S3 connection timeout
- PDF not found in S3
- OpenRouter API rate limit
- OpenRouter API timeout
- Missing required fields in request
```

**Deliverable to other agents:**
- Predictable error responses they can handle in UI

---

#### Step 5: Testing (Day 4 - 2 hours)
**What I'm doing:**
- [ ] Write unit tests for all services
- [ ] Write integration tests for all API endpoints
- [ ] Test with mock AWS & OpenRouter responses
- [ ] Test error scenarios
- [ ] Run tests and verify all pass

**Test files:**
```javascript
// server/src/services/s3Service.test.js
- uploadPDF success/failure
- listPDFs success/failure
- deletePDF success/failure

// server/src/routes/pdfs.test.js
- POST /api/pdfs/upload with valid/invalid files
- GET /api/pdfs returns list
- DELETE /api/pdfs/:id removes file
- POST /api/pdfs/analyze with real/mock data
```

**Deliverable to other agents:**
- Confidence that APIs are production-ready

---

### API Contract (Final Spec for Other Agents)

```javascript
/* ================== ENDPOINT 1: UPLOAD PDFs ================== */
POST /api/pdfs/upload
Content-Type: multipart/form-data

Body: form-data with key "files", value: [file1.pdf, file2.pdf, ...]

Success Response (200):
{
  "success": true,
  "pdfs": [
    {
      "id": "uuid-string",
      "filename": "document.pdf",
      "size": 512000,              // bytes
      "uploadedAt": "2025-01-15T10:30:00Z",
      "s3Url": "https://s3.../uploads/..."
    }
  ]
}

Error Response (400/500):
{
  "success": false,
  "error": "File too large - max 25MB per file",
  "code": "FILE_SIZE_EXCEEDED"
}

/* ================== ENDPOINT 2: LIST PDFs ================== */
GET /api/pdfs

Success Response (200):
{
  "success": true,
  "pdfs": [
    {
      "id": "uuid-string",
      "filename": "document.pdf",
      "size": 512000,
      "uploadedAt": "2025-01-15T10:30:00Z"
    }
  ],
  "total": 5
}

/* ================== ENDPOINT 3: DELETE PDF ================== */
DELETE /api/pdfs/:id

Success Response (200):
{
  "success": true,
  "message": "PDF deleted successfully",
  "id": "uuid-string"
}

Error Response (404):
{
  "success": false,
  "error": "PDF not found",
  "code": "PDF_NOT_FOUND"
}

/* ================== ENDPOINT 4: ANALYZE PDFs ================== */
POST /api/pdfs/analyze
Content-Type: application/json

Body:
{
  "pdfIds": ["id1", "id2"],
  "query": "Summarize the key points",
  "userMessage": "optional context"  // optional
}

Success Response (200):
{
  "success": true,
  "analysis": "Based on the PDFs you referenced...",
  "referencedPdfs": [
    {
      "id": "id1",
      "filename": "document.pdf"
    }
  ],
  "tokensUsed": {
    "input": 2500,
    "output": 350
  }
}

Error Response (400/429/500):
{
  "success": false,
  "error": "API rate limit exceeded",
  "code": "OPENROUTER_RATE_LIMIT",
  "retryAfter": 60  // seconds
}
```

---

### Environment Variables I Need

Agent 1 will create `.env.example` with these. Other agents should copy and fill:

```bash
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_S3_BUCKET_NAME=product-ui-pdfs

# OpenRouter API
OPENROUTER_API_KEY=sk-or-your_key_here
OPENROUTER_MODEL=claude-3.5-sonnet
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Server Config
PORT=3000
NODE_ENV=development

# Logging
DEBUG_MODE=true
LOG_LEVEL=debug
```

---

### Dependencies I'll Add to `server/package.json`

```json
{
  "dependencies": {
    "aws-sdk": "^2.1500.0",
    "dotenv": "^16.5.0",
    "multer": "^1.4.5",
    "axios": "^1.6.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "supertest": "^6.3.0"
  }
}
```

---

### What I'm NOT Doing (Out of Scope for Agent 1)

- ❌ Creating the React components (Agent 3's job)
- ❌ Building the @ mention UI (Agent 4's job)
- ❌ Creating Zustand store (Agent 5's job)
- ❌ Database integration (using in-memory store for now)
- ❌ Authentication/Authorization (not in PRD scope)
- ❌ PDF text extraction (just Base64 encoding)

---

### Blockers & Assumptions

**Assumptions:**
- AWS S3 credentials are available in `.env`
- OpenRouter API key is available
- Node.js 18+ is running
- Express.js is already set up

**Potential Blockers:**
- AWS IAM permissions might need adjustment
- OpenRouter API might have rate limits
- Large PDF files might timeout

**How I'll Handle:**
- Add retry logic for API calls
- Add exponential backoff for rate limits
- Add timeouts with clear error messages

---

### Handoff to Other Agents

**When Agent 1 is Done (End of Phase 2):**

Agents 3, 4, 5 get:
- ✅ 4 working API endpoints
- ✅ Exact response format specifications
- ✅ `.env.example` with all keys
- ✅ Error response formats
- ✅ Ready to replace mock implementations

**What Agents Need to Do:**
- Agent 3: Replace fetch mocks with real API calls
- Agent 4: Replace mock PDF list with real API calls  
- Agent 5: Connect Zustand to real API endpoints

---

### Success Criteria for Agent 1

- [ ] All 4 endpoints working
- [ ] All unit tests passing (>85% coverage)
- [ ] All integration tests passing
- [ ] Error handling for all edge cases
- [ ] `.env.example` complete
- [ ] Documentation clear for other agents
- [ ] Code follows existing codebase patterns

---

### Status Tracking

**Current Phase:** Planning (Creating this document)
**Next Phase:** Implementation
**Start Date:** [Ready to start]
**Estimated Completion:** 2 days (Phase 2)

### Interface Contracts (What Each Agent Must Provide)

#### **Agent 1 Exports (Backend APIs)**
```javascript
// POST /api/pdfs/upload
// - Accepts: multipart/form-data with PDF files
// - Returns: { success: bool, pdfs: [{ id, filename, size, uploadedAt, s3Url }] }
// - Error: { success: false, error: string }

// GET /api/pdfs
// - Returns: { pdfs: [{ id, filename, size, uploadedAt }] }

// DELETE /api/pdfs/:id
// - Returns: { success: bool, message: string }

// POST /api/pdfs/analyze
// - Accepts: { pdfIds: string[], query: string, userMessage?: string }
// - Returns: { success: bool, analysis: string, referencedPdfs: string[] }
// - Error: { success: false, error: string }
```

#### **Agent 3 Exports (Frontend Components & Services)**
```javascript
// Components exported:
// - PDFManagerPage: Main page component
// - PDFUploadArea: Drag-drop upload component
// - PDFList: PDF list/table component

// Services exported:
// - pdfService.uploadPDFs(files) → Promise<{ pdfs: Array }>
// - pdfService.deletePDF(id) → Promise<{ success: bool }>
// - pdfService.listPDFs() → Promise<{ pdfs: Array }>

// Route: /pdf-manager (accessible from MainLayout)
```

#### **Agent 4 Exports (Chat Integration)**
```javascript
// Components exported:
// - PDFMentionDropdown: Dropdown for @ mention selection
// - PDFReferenceBadge: Badge showing selected PDFs

// Hooks exported:
// - usePDFMention() → { detectedAt, selectedPdfs, handleSelect, handleRemove }

// Integration points:
// - Modify ChatPage input to detect @ symbol
// - Show dropdown when @ is detected
// - Store selected PDFs in message object
```

#### **Agent 5 Exports (State Management)**
```javascript
// Zustand store: usePDFStore
// - State: { pdfs: [], selectedPdfs: [], loading: bool }
// - Actions: { 
//     setPDFs(pdfs), 
//     addPDF(pdf), 
//     removePDF(id),
//     setSelectedPdfs(pdfs),
//     clearSelectedPdfs()
//   }

// Hooks:
// - usePDFStore() → store state
// - usePDFSync() → auto-sync with backend

// Integration:
// - Connect all components to store
// - Sync with Agent 1 backend
// - Handle PDF deletion cascades
```

### Critical Coordination Points

**Point 1: API Ready** (After Agent 1)
- Agent 1 must have all 4 API endpoints working
- Agents 3, 4, 5 cannot start without this

**Point 2: Frontend UI Ready** (After Agent 3)
- Agent 3 must have PDFManagerPage working
- Agent 4 needs PDFUploadArea component reference

**Point 3: @ Mention Ready** (After Agent 4)
- Agent 4 must have dropdown + badge components
- Agent 5 needs these for full chat integration

**Point 4: Full Integration** (After Agent 5)
- All components wired to Zustand store
- State persists across page navigation
- Chat messages properly reference PDFs

### Environment Variables to Setup

Create in `.env` before Agent 1 starts:
```
# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET_NAME=product-ui-pdfs

# OpenRouter
OPENROUTER_API_KEY=your_openrouter_key

# API Base URL
VITE_API_URL=http://localhost:3000/api
```

---

## Tasks

- [ ] 1.0 Backend Setup & AWS S3 Integration
  - [ ] 1.1 Configure AWS S3 credentials and IAM permissions
  - [ ] 1.2 Create AWS S3 service module for file upload/download
  - [ ] 1.3 Create PDF upload REST API endpoint with validation
  - [ ] 1.4 Create PDF list retrieval endpoint
  - [ ] 1.5 Create PDF deletion endpoint
  - [ ] 1.6 Implement error handling for S3 operations
  
- [ ] 2.0 OpenRouter API Integration for PDF Analysis
  - [ ] 2.1 Configure OpenRouter API credentials
  - [ ] 2.2 Create OpenRouter service module
  - [ ] 2.3 Implement Base64 encoding for PDFs before API submission
  - [ ] 2.4 Create PDF analysis endpoint that accepts @ referenced PDFs and queries
  - [ ] 2.5 Handle multi-PDF analysis (cross-referencing)
  - [ ] 2.6 Format AI responses to indicate which PDFs were analyzed
  
- [ ] 3.0 Frontend PDF Management Page & Upload UI
  - [ ] 3.1 Create PDFManagerPage component with routing
  - [ ] 3.2 Build drag-and-drop upload area component
  - [ ] 3.3 Create uploaded PDFs list/table component with metadata display
  - [ ] 3.4 Implement PDF deletion with confirmation dialog
  - [ ] 3.5 Add loading states and success/error notifications
  - [ ] 3.6 Style page consistently with existing UI design
  
- [ ] 4.0 Chat Integration with @ Mention System
  - [ ] 4.1 Add @ mention detection in chat input field
  - [ ] 4.2 Create PDFMentionDropdown component for PDF selection
  - [ ] 4.3 Implement multi-select PDF reference functionality
  - [ ] 4.4 Display PDF reference badges/pills in chat input
  - [ ] 4.5 Create PDFReferenceBadge component to show selected PDFs
  - [ ] 4.6 Modify message structure to include PDF references
  - [ ] 4.7 Filter out deleted PDFs from dropdown (handle edge case from requirement 18)
  
- [ ] 5.0 State Management & Data Flow
  - [ ] 5.1 Create Zustand store for PDF list and selected PDFs
  - [ ] 5.2 Create hook for PDF mention functionality
  - [ ] 5.3 Integrate PDF state with ChatPage component
  - [ ] 5.4 Implement synchronization of PDF list across components
  - [ ] 5.5 Handle PDF reference persistence during chat session
  - [ ] 5.6 Clear PDF references after message sent (if applicable per UX preference)

---

**I have generated the high-level tasks based on the PRD. Ready to generate the sub-tasks? Respond with 'Go' to proceed.**
