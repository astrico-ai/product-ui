# 🧪 AGENT 5 - TESTING & VERIFICATION GUIDE

**Purpose:** Comprehensive testing guide for Zustand state management integration  
**For:** Developers, QA, and future agents

---

## 🎯 Testing Overview

This guide covers testing of:
1. Zustand store functionality
2. Component integration
3. State synchronization
4. Persistence
5. Error handling
6. Performance

---

## 🚀 Quick Start Testing

### Prerequisites
```bash
# Ensure dev server is running
npm run dev

# Backend should be running (Agent 1)
cd server
npm run dev
```

### Environment Setup
```bash
# Check .env has required variables
VITE_API_URL=http://localhost:3000
VITE_USE_MOCK_PDF_API=false  # Set to true for mock testing
```

---

## 📋 Test Cases

### 1. Store Initialization

**Test:** Store loads correctly on app start

```javascript
// Open browser console
// Navigate to any page

// Check store state
import { usePDFStore } from '@/stores/usePDFStore';
const store = usePDFStore.getState();

console.log('PDFs:', store.pdfs);
console.log('Selected PDFs:', store.selectedPdfs);
console.log('Loading:', store.loading);
console.log('Last Sync:', store.lastSync);
```

**Expected Result:**
- ✅ Store object exists
- ✅ PDFs array exists (may be empty)
- ✅ Loading states are boolean
- ✅ lastSync is null or ISO string

---

### 2. PDFManagerPage Integration

#### Test 2.1: Page Load & Auto-Fetch

**Steps:**
1. Open browser
2. Navigate to `/pdf-manager`
3. Open DevTools console

**Expected Result:**
- ✅ Loading spinner appears
- ✅ PDFs load from backend
- ✅ Loading spinner disappears
- ✅ PDFs display in list
- ✅ Console shows: `[usePDFSync] Auto-refreshing PDFs...` (if auto-refresh enabled)

**Verify in Console:**
```javascript
usePDFStore.getState().pdfs.length > 0  // Should be true if PDFs exist
usePDFStore.getState().loading === false  // Should be false after load
```

---

#### Test 2.2: Upload PDF

**Steps:**
1. Click "Upload PDF" button
2. Select one or more PDF files
3. Wait for upload to complete

**Expected Result:**
- ✅ Upload modal opens
- ✅ Drag-drop area visible
- ✅ After upload, modal closes
- ✅ New PDFs appear at top of list
- ✅ Toast notification: "Upload successful"
- ✅ Store updates immediately

**Verify in Console:**
```javascript
const pdfs = usePDFStore.getState().pdfs;
console.log('First PDF:', pdfs[0]);  // Should be newly uploaded
console.log('Total PDFs:', pdfs.length);
```

---

#### Test 2.3: Delete PDF

**Steps:**
1. Click delete icon on any PDF
2. Confirm deletion

**Expected Result:**
- ✅ PDF removed from list immediately
- ✅ Toast notification: "PDF deleted"
- ✅ If PDF was selected in chat, it's removed from selections
- ✅ Store updates immediately

**Verify in Console:**
```javascript
const pdfs = usePDFStore.getState().pdfs;
const selectedPdfs = usePDFStore.getState().selectedPdfs;
console.log('Deleted PDF gone from pdfs:', !pdfs.find(p => p.s3Key === 'deleted-key'));
console.log('Deleted PDF gone from selections:', !selectedPdfs.find(p => p.s3Key === 'deleted-key'));
```

---

#### Test 2.4: Refresh PDFs

**Steps:**
1. Click "Refresh" button
2. Wait for reload

**Expected Result:**
- ✅ Refresh icon spins
- ✅ Toast notification: "Refreshing..."
- ✅ PDFs reload from backend
- ✅ List updates with latest data

---

### 3. ChatPage Integration

#### Test 3.1: @ Mention Dropdown

**Steps:**
1. Navigate to ChatPage
2. Type `@` in chat input
3. Wait for dropdown

**Expected Result:**
- ✅ Dropdown appears below input
- ✅ Shows all available PDFs from store
- ✅ PDFs match those in PDFManagerPage
- ✅ No duplicate API call (uses store data)

**Verify in Console:**
```javascript
// Check if usePDFMention is using store
const mention = usePDFMention({ useStore: true });
console.log('Available PDFs:', mention.availablePdfs.length);
console.log('Matches store:', mention.availablePdfs.length === usePDFStore.getState().pdfs.length);
```

---

#### Test 3.2: Select PDF

**Steps:**
1. Type `@` in chat
2. Click on a PDF in dropdown
3. Check selected PDFs area

**Expected Result:**
- ✅ Dropdown closes
- ✅ PDF appears as badge below/above input
- ✅ @ and search query removed from input
- ✅ Store's selectedPdfs updated

**Verify in Console:**
```javascript
const selectedPdfs = usePDFStore.getState().selectedPdfs;
console.log('Selected PDFs:', selectedPdfs);
console.log('Has selections:', selectedPdfs.length > 0);
```

---

#### Test 3.3: Send Message with PDFs

**Steps:**
1. Select one or more PDFs using @
2. Type a message
3. Send message

**Expected Result:**
- ✅ Message sent with PDF references
- ✅ AI analysis called with PDF IDs
- ✅ Response shows analyzed PDFs
- ✅ Selected PDFs cleared after send

**Verify in Console:**
```javascript
// After sending
const selectedPdfs = usePDFStore.getState().selectedPdfs;
console.log('Selections cleared:', selectedPdfs.length === 0);
```

---

#### Test 3.4: Remove Selected PDF

**Steps:**
1. Select PDFs using @
2. Click X on a badge
3. Check selections

**Expected Result:**
- ✅ Badge disappears
- ✅ PDF removed from store selections
- ✅ Other selections remain

**Verify in Console:**
```javascript
const selectedPdfs = usePDFStore.getState().selectedPdfs;
console.log('Removed PDF gone:', selectedPdfs);
```

---

### 4. Cross-Component Synchronization

#### Test 4.1: Upload in PDFManager, Use in Chat

**Steps:**
1. Open PDFManagerPage in Tab 1
2. Open ChatPage in Tab 2 (same browser)
3. Upload PDF in Tab 1
4. Go to Tab 2, type `@` in chat

**Expected Result:**
- ✅ Newly uploaded PDF appears in dropdown
- ✅ No page refresh needed
- ✅ Store synced across tabs

**Note:** If tabs don't sync, refresh Tab 2 and try again (browser localStorage sync timing)

---

#### Test 4.2: Delete in PDFManager, Check Chat

**Steps:**
1. Select PDF in ChatPage using @
2. Go to PDFManagerPage
3. Delete the selected PDF
4. Return to ChatPage

**Expected Result:**
- ✅ Selected PDF badge still shows (until page refresh)
- ✅ Type `@` - deleted PDF not in dropdown
- ✅ Store cascade deleted from selectedPdfs

**Verify in Console:**
```javascript
const selectedPdfs = usePDFStore.getState().selectedPdfs;
const pdfs = usePDFStore.getState().pdfs;
console.log('Selected PDF removed:', selectedPdfs.every(s => pdfs.some(p => p.s3Key === s.s3Key)));
```

---

### 5. Persistence Testing

#### Test 5.1: Page Refresh

**Steps:**
1. Upload some PDFs
2. Hard refresh page (Ctrl+R)
3. Check PDF list

**Expected Result:**
- ✅ PDFs persist after refresh
- ✅ lastSync timestamp preserved
- ✅ Loading states reset to defaults
- ✅ Selected PDFs cleared (by design)

**Verify in Console:**
```javascript
const pdfs = usePDFStore.getState().pdfs;
const selectedPdfs = usePDFStore.getState().selectedPdfs;
console.log('PDFs persisted:', pdfs.length > 0);
console.log('Selections cleared:', selectedPdfs.length === 0);
```

---

#### Test 5.2: Browser Storage

**Steps:**
1. Open DevTools → Application → Local Storage
2. Find key: `pdf-storage`
3. Inspect value

**Expected Result:**
- ✅ Key exists
- ✅ Contains `state.pdfs` array
- ✅ Contains `state.lastSync` timestamp
- ✅ Does NOT contain loading states or selections

---

#### Test 5.3: Clear Storage

**Steps:**
1. Run in console: `localStorage.removeItem('pdf-storage')`
2. Refresh page

**Expected Result:**
- ✅ PDFs list empty initially
- ✅ Auto-fetch triggers
- ✅ PDFs reload from backend
- ✅ Storage recreated

---

### 6. Error Handling

#### Test 6.1: Backend Down

**Steps:**
1. Stop backend server
2. Try to upload PDF
3. Check error state

**Expected Result:**
- ✅ Upload fails gracefully
- ✅ Toast shows error message
- ✅ Store captures error
- ✅ UI remains functional

**Verify in Console:**
```javascript
const error = usePDFStore.getState().error;
console.log('Error captured:', error);
```

---

#### Test 6.2: Invalid File Upload

**Steps:**
1. Try to upload non-PDF file
2. Check validation

**Expected Result:**
- ✅ Upload rejected
- ✅ Error message: "Only PDF files are allowed"
- ✅ Store not updated

---

#### Test 6.3: Large File Upload

**Steps:**
1. Try to upload PDF > 25MB
2. Check validation

**Expected Result:**
- ✅ Upload rejected
- ✅ Error message: "File size must be less than 25MB"
- ✅ Store not updated

---

### 7. Performance Testing

#### Test 7.1: Selective Re-renders

**Steps:**
1. Open React DevTools → Profiler
2. Start recording
3. Upload a PDF
4. Stop recording
5. Check which components re-rendered

**Expected Result:**
- ✅ Only PDFManagerPage re-renders
- ✅ ChatPage does NOT re-render (if not visible)
- ✅ Other components unchanged

---

#### Test 7.2: Large PDF List

**Steps:**
1. Upload 20+ PDFs
2. Navigate between pages
3. Check performance

**Expected Result:**
- ✅ No lag when switching pages
- ✅ @ dropdown appears instantly
- ✅ List scrolls smoothly

---

### 8. Edge Cases

#### Test 8.1: Select Same PDF Twice

**Steps:**
1. Type `@`, select PDF "A"
2. Type `@` again, select PDF "A" again

**Expected Result:**
- ✅ PDF not added twice
- ✅ Only one badge shows
- ✅ No duplicate in store

---

#### Test 8.2: Delete Selected PDF

**Steps:**
1. Select PDF in chat
2. Go to PDFManager
3. Delete that PDF
4. Return to chat

**Expected Result:**
- ✅ Badge might still show (UI limitation)
- ✅ PDF removed from store selections
- ✅ Type `@` - deleted PDF not in list

---

#### Test 8.3: Rapid Operations

**Steps:**
1. Upload 3 PDFs quickly
2. Delete 2 PDFs quickly
3. Select 2 PDFs quickly

**Expected Result:**
- ✅ All operations complete
- ✅ No race conditions
- ✅ Store state consistent
- ✅ UI updates correctly

---

## 🔍 Debugging Tools

### Console Helpers

```javascript
// Get current store state
usePDFStore.getState()

// Subscribe to changes
const unsub = usePDFStore.subscribe(state => {
  console.log('Store updated:', state);
});

// Unsubscribe
unsub();

// Manual actions
usePDFStore.getState().fetchPDFs();
usePDFStore.getState().clearSelectedPdfs();

// Check persistence
JSON.parse(localStorage.getItem('pdf-storage'))
```

### React DevTools

1. Install React DevTools extension
2. Open DevTools → Components
3. Search for `PDFManagerPage` or `ChatPage`
4. Inspect props and state
5. Check which hooks are being used

---

## ✅ Test Results Template

Copy this for each test run:

```markdown
## Test Run - [Date]

**Tester:** [Name]
**Environment:** Development / Staging / Production
**Browser:** Chrome / Firefox / Safari

### Test Results

| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| 1 | Store Initialization | ✅ / ❌ | |
| 2.1 | Page Load & Auto-Fetch | ✅ / ❌ | |
| 2.2 | Upload PDF | ✅ / ❌ | |
| 2.3 | Delete PDF | ✅ / ❌ | |
| 2.4 | Refresh PDFs | ✅ / ❌ | |
| 3.1 | @ Mention Dropdown | ✅ / ❌ | |
| 3.2 | Select PDF | ✅ / ❌ | |
| 3.3 | Send Message with PDFs | ✅ / ❌ | |
| 3.4 | Remove Selected PDF | ✅ / ❌ | |
| 4.1 | Upload in Manager, Use in Chat | ✅ / ❌ | |
| 4.2 | Delete in Manager, Check Chat | ✅ / ❌ | |
| 5.1 | Page Refresh | ✅ / ❌ | |
| 5.2 | Browser Storage | ✅ / ❌ | |
| 5.3 | Clear Storage | ✅ / ❌ | |
| 6.1 | Backend Down | ✅ / ❌ | |
| 6.2 | Invalid File Upload | ✅ / ❌ | |
| 6.3 | Large File Upload | ✅ / ❌ | |
| 7.1 | Selective Re-renders | ✅ / ❌ | |
| 7.2 | Large PDF List | ✅ / ❌ | |
| 8.1 | Select Same PDF Twice | ✅ / ❌ | |
| 8.2 | Delete Selected PDF | ✅ / ❌ | |
| 8.3 | Rapid Operations | ✅ / ❌ | |

### Issues Found
- [List any issues]

### Overall Status
✅ All tests passed / ❌ Some tests failed
```

---

## 🎯 Acceptance Criteria

### Minimum Requirements
- [x] All store actions work correctly
- [x] PDFManagerPage integrated with store
- [x] ChatPage @ mentions use store
- [x] Persistence works (localStorage)
- [x] No linting errors
- [x] No console errors in normal operation

### Nice to Have
- [ ] React DevTools Profiler shows good performance
- [ ] All 20+ test cases pass
- [ ] Cross-tab sync verified
- [ ] Error states properly displayed in UI

---

## 📞 Support

If any tests fail:
1. Check browser console for errors
2. Verify backend is running
3. Check `.env` configuration
4. Review `AGENT5_COMPLETION_SUMMARY.md`
5. Check store state in console

---

**Happy Testing!** 🧪✨

