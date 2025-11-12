# 🤝 HANDOFF TO AGENT 4 - Chat @ Mention Integration

**From:** Agent 3 (Frontend PDF Management UI) ✅ COMPLETE  
**To:** Agent 4 (Chat Integration with @ Mention System)  
**Status:** Ready to Start

---

## 🎯 Your Mission

Build the **@ mention system** in the chat interface that allows users to:
1. Type `@` in chat to trigger PDF selection dropdown
2. Select one or multiple PDFs to reference
3. Send chat message with PDF references
4. Call OpenRouter API to analyze PDFs with user's query
5. Display AI response with indication of which PDFs were analyzed

---

## ✅ What Agent 3 Delivered (Ready for You)

### 1. PDF Service API (`src/services/pdfService.js`)

All API methods are ready to use:

```javascript
import { listPDFs, analyzePDFs } from '@/services/pdfService';

// Get all PDFs for dropdown
const { pdfs } = await listPDFs();
// Returns: { success: true, pdfs: [{s3Key, filename, size, uploadedAt, s3Url}], total }

// Analyze PDFs with AI
const result = await analyzePDFs(
  ['s3Key1', 's3Key2'],           // Array of PDF s3Keys
  'What are the key points?',      // User's query
  'Optional context message'       // Optional
);
// Returns: { success, analysis, referencedPdfs, tokensUsed, model, timestamp }
```

### 2. PDF Manager Page (`src/pages/PDFManagerPage.jsx`)

- Users can upload PDFs
- All PDFs stored in AWS S3
- Users can view their PDF library at `/pdf-manager`

### 3. Backend API (Agent 1)

**Analyze Endpoint is READY:**
```
POST http://localhost:3000/api/pdfs/analyze

Request:
{
  "pdfIds": ["s3Key1", "s3Key2"],
  "query": "User's question about the PDFs",
  "userMessage": "optional additional context"
}

Response:
{
  "success": true,
  "analysis": "AI-generated analysis text...",
  "referencedPdfs": [
    { "id": "s3Key1", "filename": "doc1.pdf" },
    { "id": "s3Key2", "filename": "doc2.pdf" }
  ],
  "tokensUsed": { "input": 2500, "output": 350, "total": 2850 },
  "model": "anthropic/claude-3.5-sonnet",
  "timestamp": "2025-11-04T10:30:00.000Z"
}
```

---

## 📋 Components You Need to Build

### 1. PDFMentionDropdown Component

**Location:** `src/components/PDFMentionDropdown.jsx`

**Purpose:** Dropdown that appears when user types `@` in chat

**Props:**
```javascript
{
  pdfs: Array<{s3Key, filename, size}>,  // From listPDFs()
  onSelect: (pdf) => void,                // Called when PDF selected
  position: {x, y},                       // Cursor position
  searchQuery: string                     // Filter text after @
}
```

**Features:**
- Shows list of available PDFs
- Filterable by filename (type after @)
- Keyboard navigation (arrow keys)
- Enter to select
- Escape to close
- Highlight matching text

**Example UI:**
```
┌─────────────────────────────┐
│ @ Select PDF                │
├─────────────────────────────┤
│ 📄 Product_Requirements.pdf │  ← Hover state
│ 📄 Technical_Specs.pdf      │
│ 📄 User_Guide.pdf           │
└─────────────────────────────┘
```

---

### 2. PDFReferenceBadge Component

**Location:** `src/components/PDFReferenceBadge.jsx`

**Purpose:** Pill/badge showing selected PDF in chat input

**Props:**
```javascript
{
  pdf: {s3Key, filename},
  onRemove: () => void,
  size: 'sm' | 'md'
}
```

**Example UI:**
```
Chat input: "Summarize this document"

[📄 Product_Requirements.pdf ×]
```

**Styling:**
- Blue background (#3551F3)
- White text
- Small X button to remove
- Rounded pill shape
- File icon + filename

---

### 3. usePDFMention Hook

**Location:** `src/hooks/usePDFMention.jsx`

**Purpose:** Handle @ mention detection and state

**Interface:**
```javascript
const {
  showDropdown,        // boolean - show/hide dropdown
  selectedPdfs,        // Array<{s3Key, filename}>
  dropdownPosition,    // {x, y} - where to show dropdown
  searchQuery,         // string - text after @
  handleKeyDown,       // (event) => void - keyboard handler
  handleSelect,        // (pdf) => void - select PDF
  handleRemove,        // (s3Key) => void - remove PDF
  clearSelectedPdfs,   // () => void - clear all
} = usePDFMention(inputRef);
```

**Logic:**
```javascript
// Detect @ symbol
- Watch for @ key press
- Show dropdown at cursor position
- Track text after @ for filtering

// Handle selection
- Add PDF to selectedPdfs array
- Close dropdown
- Clear @ symbol from input

// Handle removal
- Remove PDF from selectedPdfs
- Don't affect input text

// Handle message send
- Include selectedPdfs in message object
- Clear selectedPdfs after send
```

---

## 🔗 Integration Points

### Where to Integrate: `src/pages/ChatPage.jsx`

**Current ChatPage structure:**
```javascript
export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  
  // Your additions:
  const { 
    showDropdown, 
    selectedPdfs, 
    handleKeyDown,
    handleSelect,
    handleRemove,
    clearSelectedPdfs 
  } = usePDFMention(inputRef);
  
  const [pdfs, setPdfs] = useState([]);
  
  // Load PDFs on mount
  useEffect(() => {
    loadAvailablePDFs();
  }, []);
  
  const loadAvailablePDFs = async () => {
    const result = await listPDFs();
    setPdfs(result.pdfs);
  };
  
  const handleSendMessage = async () => {
    if (!inputValue.trim() && selectedPdfs.length === 0) return;
    
    // If PDFs are selected, call analyze API
    if (selectedPdfs.length > 0) {
      const analysis = await analyzePDFs(
        selectedPdfs.map(p => p.s3Key),
        inputValue
      );
      
      // Add AI response to messages
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: analysis.analysis,
        sender: 'assistant',
        referencedPdfs: analysis.referencedPdfs,
        tokensUsed: analysis.tokensUsed
      }]);
      
      clearSelectedPdfs();
    } else {
      // Regular chat message (existing logic)
    }
    
    setInputValue('');
  };
  
  return (
    <div>
      {/* Chat messages */}
      
      {/* Chat input */}
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        
        {/* PDF Badges */}
        <div className="flex gap-2 mt-2">
          {selectedPdfs.map(pdf => (
            <PDFReferenceBadge
              key={pdf.s3Key}
              pdf={pdf}
              onRemove={() => handleRemove(pdf.s3Key)}
            />
          ))}
        </div>
        
        {/* Dropdown */}
        {showDropdown && (
          <PDFMentionDropdown
            pdfs={pdfs}
            onSelect={handleSelect}
            position={dropdownPosition}
          />
        )}
      </div>
    </div>
  );
}
```

---

## 🎨 UI/UX Requirements

### 1. @ Mention Trigger
- Detect `@` key press in chat input
- Show dropdown immediately below cursor
- Filter PDFs as user types after @

### 2. PDF Selection
- Click or Enter to select
- Multiple PDFs can be selected
- Show selected PDFs as badges above/below input

### 3. Message with PDFs
- Include PDF references in message object
- Show small PDF icons in message bubble
- Indicate which PDFs were analyzed in AI response

### 4. AI Response Display
- Show "Analyzed X PDFs" indicator
- Display referenced PDF names
- Show token usage (optional)
- Loading state during analysis

---

## 📦 Data Structures

### Message Object (with PDFs)
```javascript
{
  id: string,
  text: string,
  sender: 'user' | 'assistant',
  timestamp: Date,
  referencedPdfs: [
    { s3Key: string, filename: string }
  ],
  tokensUsed: { input: number, output: number, total: number }
}
```

### Selected PDFs State
```javascript
[
  { s3Key: 'pdfs/2025-11-04/abc123/file1.pdf', filename: 'file1.pdf' },
  { s3Key: 'pdfs/2025-11-04/def456/file2.pdf', filename: 'file2.pdf' }
]
```

---

## 🧪 Testing Checklist

- [ ] Type `@` in chat - dropdown appears
- [ ] Type after `@` - PDFs filter by name
- [ ] Click PDF - it gets selected, dropdown closes
- [ ] Selected PDF shows as badge
- [ ] Click X on badge - PDF removed
- [ ] Select multiple PDFs - all show as badges
- [ ] Send message with PDFs - analyze API called
- [ ] AI response includes PDF references
- [ ] Loading state shows during analysis
- [ ] Error handling if analysis fails
- [ ] PDFs cleared after message sent
- [ ] Keyboard navigation works (arrows, Enter, Escape)

---

## 🚨 Error Handling

Handle these errors gracefully:

```javascript
// PDF analysis errors
try {
  const result = await analyzePDFs(pdfIds, query);
} catch (error) {
  if (error.message.includes('rate limit')) {
    // Show: "Too many requests. Please wait a moment."
  } else if (error.message.includes('timeout')) {
    // Show: "Analysis took too long. Try with fewer PDFs."
  } else {
    // Show: "Failed to analyze PDFs. Please try again."
  }
}
```

---

## 💡 Implementation Tips

### 1. Dropdown Positioning

```javascript
const getCaretPosition = (input) => {
  const rect = input.getBoundingClientRect();
  return { x: rect.left, y: rect.bottom + 5 };
};
```

### 2. @ Detection

```javascript
const handleKeyDown = (e) => {
  if (e.key === '@') {
    setShowDropdown(true);
    setDropdownPosition(getCaretPosition(e.target));
  }
  
  if (e.key === 'Escape') {
    setShowDropdown(false);
  }
};
```

### 3. Filter PDFs

```javascript
const filteredPdfs = pdfs.filter(pdf =>
  pdf.filename.toLowerCase().includes(searchQuery.toLowerCase())
);
```

---

## 🔄 State Flow

```
User types "@"
    ↓
Show dropdown with all PDFs
    ↓
User types "prod"
    ↓
Filter to show only "Product_Requirements.pdf"
    ↓
User clicks or presses Enter
    ↓
Add to selectedPdfs array
    ↓
Show badge in chat input
    ↓
User types message: "Summarize this"
    ↓
User clicks Send
    ↓
Call analyzePDFs(selectedPdfs, "Summarize this")
    ↓
Show loading state
    ↓
Display AI response with PDF indicators
    ↓
Clear selectedPdfs
```

---

## 📚 API Reference

### listPDFs()
```javascript
import { listPDFs } from '@/services/pdfService';

const result = await listPDFs();
// Returns: { success, pdfs: [], total }
```

### analyzePDFs()
```javascript
import { analyzePDFs } from '@/services/pdfService';

const result = await analyzePDFs(
  ['s3Key1', 's3Key2'],  // PDF IDs
  'What are the main points?',  // Query
  'Additional context'  // Optional
);
// Returns: { success, analysis, referencedPdfs, tokensUsed, model, timestamp }
```

---

## 🎯 Success Criteria

Your implementation is complete when:

- [ ] User can type `@` to see PDF dropdown
- [ ] User can select single or multiple PDFs
- [ ] Selected PDFs show as badges
- [ ] User can remove selected PDFs
- [ ] Message with PDFs calls analyze API
- [ ] AI response displays correctly
- [ ] Loading states show during analysis
- [ ] Errors handled gracefully
- [ ] Keyboard navigation works
- [ ] Mobile responsive

---

## 🤝 Coordination with Agent 5

Agent 5 will later:
- Move PDF list to Zustand store
- Add global `selectedPdfs` state
- Sync across components

For now, use local state in ChatPage. Agent 5 will refactor later.

---

## 📞 Questions?

If you need:
- More details about the analyze API
- Help with dropdown positioning
- Clarification on message structure

Check:
- `AGENT3_DELIVERABLES.md` - Full Agent 3 documentation
- `AGENT3_BACKEND_INTEGRATION.md` - API integration guide
- `src/services/pdfService.js` - API service implementation

---

## 🚀 Ready to Start!

You have everything you need:
- ✅ PDF list API ready
- ✅ Analyze API ready (OpenRouter integration)
- ✅ PDF Manager working
- ✅ Service methods documented
- ✅ Clear requirements

**Next Step:** Create the @ mention dropdown and start integrating into ChatPage!

---

**Agent 3 Status:** ✅ COMPLETE  
**Agent 4 Status:** 🚀 READY TO START  
**Estimated Time:** 1-2 days

