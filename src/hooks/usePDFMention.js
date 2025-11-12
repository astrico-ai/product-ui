/**
 * usePDFMention Hook
 * Custom hook for handling @ mention functionality in chat
 * 
 * Agent 4 deliverable - Handles @ detection, PDF fetching, selection logic
 * Agent 5 integration - Now syncs with Zustand store for selected PDFs
 * 
 * Features:
 * - Detects @ symbol in input
 * - Fetches available PDFs from Zustand store (synced with backend)
 * - Manages selected PDFs in Zustand store
 * - Handles keyboard navigation
 * - Filters PDFs based on search query after @
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePDFStore } from '@/stores/usePDFStore';

/**
 * Hook for managing PDF @ mentions in chat input
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.useStore - Use Zustand store for state (default: true)
 * @returns {Object} - PDF mention state and actions
 */
export function usePDFMention(options = {}) {
  const { useStore = true } = options;
  
  // Agent 5: Get PDFs and selection from Zustand store
  const storePdfs = usePDFStore(state => state.pdfs);
  const storeSelectedPdfs = usePDFStore(state => state.selectedPdfs);
  const storeSelectPDF = usePDFStore(state => state.selectPDF);
  const storeDeselectPDF = usePDFStore(state => state.deselectPDF);
  const storeClearSelectedPdfs = usePDFStore(state => state.clearSelectedPdfs);
  const fetchPDFsFromStore = usePDFStore(state => state.fetchPDFs);
  
  // Local state for dropdown UI
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [loading, setLoading] = useState(false);
  
  // Refs
  const inputRef = useRef(null);
  const lastAtSymbolPos = useRef(-1);

  // Use store data if enabled, otherwise use local state (backward compatibility)
  const availablePdfs = useStore ? storePdfs : [];
  const selectedPdfs = useStore ? storeSelectedPdfs : [];

  /**
   * Fetch available PDFs from backend
   * Agent 5: Now uses store's fetch action
   */
  const fetchPDFs = useCallback(async () => {
    if (!useStore) return; // Skip if not using store
    
    setLoading(true);
    try {
      await fetchPDFsFromStore();
    } catch (error) {
      console.error('Error fetching PDFs for mention:', error);
    } finally {
      setLoading(false);
    }
  }, [useStore, fetchPDFsFromStore]);

  /**
   * Detect @ symbol in input and show dropdown
   */
  const handleInputChange = useCallback((inputValue, cursorPosition, inputElement) => {
    console.log('🔍 handleInputChange CALLED', {
      inputValue,
      cursorPosition,
      hasInputElement: !!inputElement,
      inputValueType: typeof inputValue,
      cursorType: typeof cursorPosition
    });

    if (!inputElement) {
      console.log('❌ No input element provided');
      return;
    }

    // Store input ref
    inputRef.current = inputElement;

    // Find @ symbol before cursor
    const textBeforeCursor = inputValue.substring(0, cursorPosition);
    console.log('📝 Text before cursor:', textBeforeCursor);
    
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    console.log('📍 Last @ index:', lastAtIndex);

    if (lastAtIndex !== -1) {
      // Extract search query after @
      const query = textBeforeCursor.substring(lastAtIndex + 1);
      
      // Only show dropdown if @ is at start or after whitespace
      const charBeforeAt = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : ' ';
      const isValidAtPosition = charBeforeAt === ' ' || lastAtIndex === 0;

      console.log('✅ @ found!', {
        query,
        charBeforeAt: charBeforeAt === ' ' ? 'SPACE' : charBeforeAt,
        isValidAtPosition,
        lastAtIndex
      });

      if (isValidAtPosition) {
        lastAtSymbolPos.current = lastAtIndex;
        setSearchQuery(query);
        setShowDropdown(true);
        setHighlightedIndex(0);

        // Wait for next frame to ensure input is rendered
        requestAnimationFrame(() => {
          const rect = inputElement.getBoundingClientRect();
          const dropdownHeight = 250; // Approximate dropdown height
          const spaceAbove = rect.top;
          const spaceBelow = window.innerHeight - rect.bottom;
          
          console.log('🎯 Input rect:', {
            top: rect.top,
            bottom: rect.bottom,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            windowHeight: window.innerHeight,
            spaceAbove,
            spaceBelow
          });
          
          // Position below input if there's enough space, otherwise above
          const shouldPositionBelow = spaceBelow > dropdownHeight;
          
          const position = {
            top: shouldPositionBelow 
              ? rect.bottom + 8                  // 8px gap below input
              : rect.top - dropdownHeight - 8,   // 8px gap above input
            left: rect.left                       // Align with input left edge
          };
          
          console.log('🎯 Setting dropdown position:', position, {
            shouldPositionBelow,
            spaceAbove,
            spaceBelow
          });
          
          setDropdownPosition(position);
        });

        // Fetch PDFs if not already loaded
        if (availablePdfs.length === 0 && !loading) {
          console.log('📥 Fetching PDFs...');
          fetchPDFs();
        }

        return;
      } else {
        console.log('❌ @ not in valid position (char before:', charBeforeAt, ')');
      }
    } else {
      console.log('❌ No @ found in text');
    }

    // Hide dropdown if @ not found or not in valid position
    setShowDropdown(false);
    setSearchQuery('');
  }, [availablePdfs.length, loading, fetchPDFs]);

  /**
   * Select a PDF and add to selected list
   * Agent 5: Now uses store actions
   */
  const selectPDF = useCallback((pdf, inputValue, setInputValue) => {
    // Add to selected PDFs if not already selected
    const isAlreadySelected = selectedPdfs.some(
      p => (p.id || p.s3Key) === (pdf.id || pdf.s3Key)
    );

    if (!isAlreadySelected) {
      if (useStore) {
        storeSelectPDF(pdf);
      }
    }

    // Remove @ and search query from input
    if (lastAtSymbolPos.current !== -1 && inputValue && setInputValue) {
      const before = inputValue.substring(0, lastAtSymbolPos.current);
      const after = inputValue.substring(lastAtSymbolPos.current + searchQuery.length + 1);
      setInputValue(before + after);
    }

    // Close dropdown
    setShowDropdown(false);
    setSearchQuery('');
    
    // Focus back on input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, [selectedPdfs, searchQuery, useStore, storeSelectPDF]);

  /**
   * Remove a PDF from selected list
   * Agent 5: Now uses store actions
   */
  const removePDF = useCallback((pdf) => {
    if (useStore) {
      storeDeselectPDF(pdf.s3Key || pdf.id);
    }
  }, [useStore, storeDeselectPDF]);

  /**
   * Clear all selected PDFs
   * Agent 5: Now uses store actions
   */
  const clearSelectedPDFs = useCallback(() => {
    if (useStore) {
      storeClearSelectedPdfs();
    }
  }, [useStore, storeClearSelectedPdfs]);

  /**
   * Handle keyboard navigation in dropdown
   */
  const handleKeyDown = useCallback((event, inputValue, setInputValue) => {
    if (!showDropdown) return false;

    const filteredPdfs = availablePdfs.filter(pdf =>
      pdf.filename.toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredPdfs.length - 1 ? prev + 1 : 0
        );
        return true;

      case 'ArrowUp':
        event.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredPdfs.length - 1
        );
        return true;

      case 'Enter':
        if (filteredPdfs[highlightedIndex]) {
          event.preventDefault();
          selectPDF(filteredPdfs[highlightedIndex], inputValue, setInputValue);
          return true;
        }
        break;

      case 'Escape':
        event.preventDefault();
        setShowDropdown(false);
        setSearchQuery('');
        return true;

      default:
        break;
    }

    return false;
  }, [showDropdown, availablePdfs, searchQuery, highlightedIndex, selectPDF]);

  /**
   * Close dropdown
   */
  const closeDropdown = useCallback(() => {
    setShowDropdown(false);
    setSearchQuery('');
    setHighlightedIndex(0);
  }, []);

  /**
   * Get selected PDF IDs for API submission
   */
  const getSelectedPdfIds = useCallback(() => {
    return selectedPdfs.map(pdf => pdf.id || pdf.s3Key);
  }, [selectedPdfs]);

  /**
   * Refresh PDF list (useful after upload/delete)
   * Agent 5: Refreshes from store if using store
   */
  const refreshPDFs = useCallback(() => {
    if (useStore) {
      fetchPDFs();
    }
  }, [fetchPDFs, useStore]);

  // Initial fetch of PDFs
  // Agent 5: Only fetch if store is empty or not using store
  useEffect(() => {
    if (useStore && storePdfs.length === 0) {
      fetchPDFs();
    }
  }, []);  // Run only once on mount

  return {
    // State
    availablePdfs,
    selectedPdfs,
    showDropdown,
    searchQuery,
    loading,
    highlightedIndex,
    dropdownPosition,

    // Actions
    handleInputChange,
    selectPDF,
    removePDF,
    clearSelectedPDFs,
    handleKeyDown,
    closeDropdown,
    getSelectedPdfIds,
    refreshPDFs,

    // Utils
    hasSelectedPdfs: selectedPdfs.length > 0,
  };
}

export default usePDFMention;

