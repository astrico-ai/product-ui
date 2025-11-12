# 🤝 HANDOFF TO AGENT 5 - State Management & Zustand Integration

**From:** Agent 3 (Frontend PDF Management UI) ✅ COMPLETE  
**To:** Agent 5 (State Management & Data Flow)  
**Status:** Ready to Start

---

## 🎯 Your Mission

Create a **Zustand store** for global PDF state management and integrate it with:
1. PDF Manager page (upload, list, delete)
2. Chat page (PDF selection for @ mentions)
3. Any other components that need PDF data

Replace local state with centralized store for better data flow.

---

## ✅ What Agent 3 Delivered (Ready for You)

### 1. PDF Service Layer (`src/services/pdfService.js`)

All API methods ready to wrap in Zustand actions:

```javascript
import { uploadPDFs, listPDFs, deletePDF, analyzePDFs } from '@/services/pdfService';

// All functions return promises
// All handle errors internally
// All follow consistent API contract
```

### 2. Components Using Local State

These components currently use `useState` - you'll replace with Zustand:

**PDFManagerPage** (`src/pages/PDFManagerPage.jsx`)
```javascript
const [pdfs, setPdfs] = useState([]);
const [isLoading, setIsLoading] = useState(true);
const [isUploading, setIsUploading] = useState(false);
```

**ChatPage** (when Agent 4 adds it)
```javascript
const [selectedPdfs, setSelectedPdfs] = useState([]);
const [pdfs, setPdfs] = useState([]);
```

---

## 📦 Zustand Store Structure

### Create: `src/stores/usePDFStore.js`

```javascript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { uploadPDFs, listPDFs, deletePDF, analyzePDFs } from '@/services/pdfService';

export const usePDFStore = create(
  persist(
    (set, get) => ({
      // ============ STATE ============
      
      // All PDFs from backend
      pdfs: [],
      
      // PDFs selected for chat reference (Agent 4)
      selectedPdfs: [],
      
      // Loading states
      loading: false,
      uploading: false,
      deleting: false,
      analyzing: false,
      
      // Error state
      error: null,
      
      // Last sync timestamp
      lastSync: null,
      
      
      // ============ ACTIONS ============
      
      /**
       * Fetch all PDFs from backend
       */
      fetchPDFs: async () => {
        set({ loading: true, error: null });
        try {
          const result = await listPDFs();
          set({ 
            pdfs: result.pdfs, 
            loading: false,
            lastSync: new Date().toISOString()
          });
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },
      
      /**
       * Upload PDFs to backend
       */
      uploadPDFs: async (files) => {
        set({ uploading: true, error: null });
        try {
          const result = await uploadPDFs(files);
          
          // Add new PDFs to beginning of list
          set(state => ({ 
            pdfs: [...result.pdfs, ...state.pdfs],
            uploading: false 
          }));
          
          return result;
        } catch (error) {
          set({ error: error.message, uploading: false });
          throw error;
        }
      },
      
      /**
       * Delete PDF from backend
       */
      deletePDF: async (s3Key) => {
        set({ deleting: true, error: null });
        try {
          await deletePDF(s3Key);
          
          // Remove from both pdfs and selectedPdfs
          set(state => ({
            pdfs: state.pdfs.filter(p => p.s3Key !== s3Key),
            selectedPdfs: state.selectedPdfs.filter(p => p.s3Key !== s3Key),
            deleting: false
          }));
        } catch (error) {
          set({ error: error.message, deleting: false });
          throw error;
        }
      },
      
      /**
       * Analyze PDFs with AI (for Agent 4)
       */
      analyzePDFs: async (pdfIds, query, userMessage) => {
        set({ analyzing: true, error: null });
        try {
          const result = await analyzePDFs(pdfIds, query, userMessage);
          set({ analyzing: false });
          return result;
        } catch (error) {
          set({ error: error.message, analyzing: false });
          throw error;
        }
      },
      
      /**
       * Select PDF for chat reference
       */
      selectPDF: (pdf) => {
        set(state => {
          // Don't add duplicates
          const exists = state.selectedPdfs.some(p => p.s3Key === pdf.s3Key);
          if (exists) return state;
          
          return {
            selectedPdfs: [...state.selectedPdfs, pdf]
          };
        });
      },
      
      /**
       * Deselect PDF
       */
      deselectPDF: (s3Key) => {
        set(state => ({
          selectedPdfs: state.selectedPdfs.filter(p => p.s3Key !== s3Key)
        }));
      },
      
      /**
       * Clear all selected PDFs
       */
      clearSelectedPdfs: () => {
        set({ selectedPdfs: [] });
      },
      
      /**
       * Clear error
       */
      clearError: () => {
        set({ error: null });
      },
      
      /**
       * Manually set PDFs (for testing)
       */
      setPDFs: (pdfs) => {
        set({ pdfs });
      },
    }),
    {
      name: 'pdf-storage', // localStorage key
      partialPersist: (state) => ({
        // Only persist pdfs list, not loading states or selections
        pdfs: state.pdfs,
        lastSync: state.lastSync
      })
    }
  )
);

// Selectors for derived state
export const useHasSelectedPdfs = () => {
  const selectedPdfs = usePDFStore(state => state.selectedPdfs);
  return selectedPdfs.length > 0;
};

export const useSelectedPdfCount = () => {
  const selectedPdfs = usePDFStore(state => state.selectedPdfs);
  return selectedPdfs.length;
};

export const usePDFById = (s3Key) => {
  const pdfs = usePDFStore(state => state.pdfs);
  return pdfs.find(p => p.s3Key === s3Key);
};
```

---

## 🔄 Component Refactoring

### 1. PDFManagerPage Migration

**Before (local state):**
```javascript
const [pdfs, setPdfs] = useState([]);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  loadPDFs();
}, []);

const loadPDFs = async () => {
  setIsLoading(true);
  const result = await listPDFs();
  setPdfs(result.pdfs);
  setIsLoading(false);
};
```

**After (Zustand):**
```javascript
import { usePDFStore } from '@/stores/usePDFStore';

const pdfs = usePDFStore(state => state.pdfs);
const loading = usePDFStore(state => state.loading);
const fetchPDFs = usePDFStore(state => state.fetchPDFs);

useEffect(() => {
  fetchPDFs();
}, []);
```

### 2. Upload Handler Migration

**Before:**
```javascript
const handleUpload = async (files) => {
  setIsUploading(true);
  const result = await uploadPDFs(files);
  setPdfs(prev => [...result.pdfs, ...prev]);
  setIsUploading(false);
};
```

**After:**
```javascript
const uploadPDFs = usePDFStore(state => state.uploadPDFs);
const uploading = usePDFStore(state => state.uploading);

const handleUpload = async (files) => {
  await uploadPDFs(files);
  // State automatically updated in store
};
```

### 3. Delete Handler Migration

**Before:**
```javascript
const handleDelete = async (s3Key) => {
  setIsDeleting(true);
  await deletePDF(s3Key);
  setPdfs(prev => prev.filter(p => p.s3Key !== s3Key));
  setIsDeleting(false);
};
```

**After:**
```javascript
const deletePDF = usePDFStore(state => state.deletePDF);
const deleting = usePDFStore(state => state.deleting);

const handleDelete = async (s3Key) => {
  await deletePDF(s3Key);
  // State automatically updated in store
};
```

---

## 🎯 Integration Steps

### Step 1: Install Zustand

```bash
npm install zustand
```

### Step 2: Create Store

Create `src/stores/usePDFStore.js` with the structure above

### Step 3: Refactor PDFManagerPage

Replace all local state with store hooks:

```javascript
// src/pages/PDFManagerPage.jsx
import { usePDFStore } from '@/stores/usePDFStore';

export default function PDFManagerPage() {
  // Replace useState with store selectors
  const pdfs = usePDFStore(state => state.pdfs);
  const loading = usePDFStore(state => state.loading);
  const uploading = usePDFStore(state => state.uploading);
  const deleting = usePDFStore(state => state.deleting);
  
  // Replace functions with store actions
  const fetchPDFs = usePDFStore(state => state.fetchPDFs);
  const uploadPDFs = usePDFStore(state => state.uploadPDFs);
  const deletePDF = usePDFStore(state => state.deletePDF);
  
  useEffect(() => {
    fetchPDFs();
  }, [fetchPDFs]);
  
  // Rest of component...
}
```

### Step 4: Integrate with ChatPage (Agent 4)

```javascript
// src/pages/ChatPage.jsx (Agent 4 will use this)
import { usePDFStore } from '@/stores/usePDFStore';

export default function ChatPage() {
  // Get PDFs for @ mention dropdown
  const pdfs = usePDFStore(state => state.pdfs);
  const selectedPdfs = usePDFStore(state => state.selectedPdfs);
  
  // Actions
  const selectPDF = usePDFStore(state => state.selectPDF);
  const deselectPDF = usePDFStore(state => state.deselectPDF);
  const clearSelectedPdfs = usePDFStore(state => state.clearSelectedPdfs);
  const analyzePDFs = usePDFStore(state => state.analyzePDFs);
  
  const handleSendMessage = async () => {
    if (selectedPdfs.length > 0) {
      const result = await analyzePDFs(
        selectedPdfs.map(p => p.s3Key),
        inputValue
      );
      // Display result
      clearSelectedPdfs();
    }
  };
}
```

### Step 5: Add DevTools (Optional)

```javascript
import { devtools } from 'zustand/middleware';

export const usePDFStore = create(
  devtools(
    persist(
      (set, get) => ({
        // ... store implementation
      }),
      { name: 'pdf-storage' }
    ),
    { name: 'PDFStore' }
  )
);
```

---

## 🧪 Testing Checklist

### Store Functionality
- [ ] `fetchPDFs()` loads PDFs from backend
- [ ] `uploadPDFs()` adds new PDFs to store
- [ ] `deletePDF()` removes PDF from store
- [ ] `selectPDF()` adds to selectedPdfs
- [ ] `deselectPDF()` removes from selectedPdfs
- [ ] `clearSelectedPdfs()` empties selection
- [ ] Loading states update correctly
- [ ] Errors are captured and stored

### Component Integration
- [ ] PDFManagerPage uses store
- [ ] Upload updates store automatically
- [ ] Delete updates store automatically
- [ ] Refresh fetches from store
- [ ] ChatPage (Agent 4) can access PDFs
- [ ] Selected PDFs shared across components

### Persistence
- [ ] PDFs list persists in localStorage
- [ ] Page refresh keeps PDFs
- [ ] Selected PDFs clear on refresh (by design)
- [ ] Loading states reset on refresh

### Performance
- [ ] Only re-render when relevant state changes
- [ ] Use selectors to avoid unnecessary renders
- [ ] No memory leaks

---

## 📊 State Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      ZUSTAND STORE                           │
│                                                              │
│  State:                                                      │
│  - pdfs: []                                                  │
│  - selectedPdfs: []                                          │
│  - loading, uploading, deleting, analyzing                   │
│                                                              │
│  Actions:                                                    │
│  - fetchPDFs()                                               │
│  - uploadPDFs()                                              │
│  - deletePDF()                                               │
│  - selectPDF() / deselectPDF() / clearSelectedPdfs()         │
│  - analyzePDFs()                                             │
└─────────────────────────────────────────────────────────────┘
            ↓                              ↓
    ┌───────────────┐            ┌───────────────┐
    │ PDFManagerPage│            │   ChatPage    │
    │               │            │  (Agent 4)    │
    │ - Upload      │            │               │
    │ - List        │            │ - @ mention   │
    │ - Delete      │            │ - Selection   │
    │ - Refresh     │            │ - Analysis    │
    └───────────────┘            └───────────────┘
```

---

## 🔧 Advanced Features (Optional)

### 1. Auto-Refresh

Automatically fetch PDFs every 5 minutes:

```javascript
// In store or component
useEffect(() => {
  const interval = setInterval(() => {
    fetchPDFs();
  }, 5 * 60 * 1000); // 5 minutes
  
  return () => clearInterval(interval);
}, []);
```

### 2. Optimistic Updates

Update UI immediately, rollback on error:

```javascript
deletePDF: async (s3Key) => {
  const previousPdfs = get().pdfs;
  
  // Optimistic update
  set(state => ({
    pdfs: state.pdfs.filter(p => p.s3Key !== s3Key)
  }));
  
  try {
    await deletePDF(s3Key);
  } catch (error) {
    // Rollback on error
    set({ pdfs: previousPdfs, error: error.message });
    throw error;
  }
},
```

### 3. Sync Status

Track sync status for offline support:

```javascript
// Add to state
syncStatus: 'synced' | 'syncing' | 'error',

// Add to actions
markSyncStatus: (status) => set({ syncStatus: status }),
```

---

## 💡 Best Practices

### 1. Selector Pattern

Instead of:
```javascript
const store = usePDFStore();
```

Use specific selectors:
```javascript
const pdfs = usePDFStore(state => state.pdfs);
const loading = usePDFStore(state => state.loading);
```

**Why:** Only re-render when selected state changes

### 2. Action Separation

Keep actions in store, not in components:

```javascript
// ❌ Don't do this in component
const handleUpload = async (files) => {
  const result = await uploadPDFs(files);
  const pdfs = usePDFStore.getState().pdfs;
  usePDFStore.setState({ pdfs: [...result.pdfs, ...pdfs] });
};

// ✅ Do this in store
uploadPDFs: async (files) => {
  const result = await uploadPDFs(files);
  set(state => ({ pdfs: [...result.pdfs, ...state.pdfs] }));
}
```

### 3. Error Handling

Always capture errors in store:

```javascript
try {
  // API call
} catch (error) {
  set({ error: error.message });
  throw error; // Re-throw for component handling
}
```

---

## 🚨 Common Pitfalls

### 1. Infinite Loops

❌ **Don't:**
```javascript
useEffect(() => {
  fetchPDFs();
}, [fetchPDFs]); // fetchPDFs changes every render
```

✅ **Do:**
```javascript
const fetchPDFs = usePDFStore(state => state.fetchPDFs);

useEffect(() => {
  fetchPDFs();
}, []); // Empty deps - only run once
```

### 2. Stale State

❌ **Don't:**
```javascript
const pdfs = usePDFStore(state => state.pdfs);
setTimeout(() => {
  console.log(pdfs); // Stale!
}, 1000);
```

✅ **Do:**
```javascript
setTimeout(() => {
  const pdfs = usePDFStore.getState().pdfs; // Fresh!
  console.log(pdfs);
}, 1000);
```

### 3. Over-Subscribing

❌ **Don't:**
```javascript
const store = usePDFStore(); // Subscribes to ALL state
```

✅ **Do:**
```javascript
const pdfs = usePDFStore(state => state.pdfs); // Only pdfs
```

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "zustand": "^4.4.0"
  }
}
```

---

## 🎯 Success Criteria

Your implementation is complete when:

- [ ] Zustand store created and working
- [ ] PDFManagerPage uses store (no local state)
- [ ] Upload, list, delete all use store actions
- [ ] PDFs persist in localStorage
- [ ] ChatPage (Agent 4) can access PDFs
- [ ] Selected PDFs state managed globally
- [ ] No duplicate API calls
- [ ] Loading states work correctly
- [ ] Errors handled gracefully
- [ ] Performance optimized (selective re-renders)

---

## 📚 Resources

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Zustand Persist Middleware](https://github.com/pmndrs/zustand#persist-middleware)
- [Zustand DevTools](https://github.com/pmndrs/zustand#redux-devtools)

---

## 🤝 Coordination

### With Agent 3 (Me)
- All service methods ready
- Components structured for easy refactoring
- No breaking changes needed

### With Agent 4
- Provide `selectedPdfs` state
- Provide select/deselect actions
- Provide `analyzePDFs` action

---

## 🚀 Ready to Start!

You have everything you need:
- ✅ Service layer ready to wrap
- ✅ Clear store structure
- ✅ Components ready to refactor
- ✅ Integration points defined
- ✅ Testing checklist provided

**Next Step:** Install Zustand and create the store!

---

**Agent 3 Status:** ✅ COMPLETE  
**Agent 5 Status:** 🚀 READY TO START  
**Estimated Time:** 1 day

