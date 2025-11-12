/**
 * PDFMentionDropdown Component
 * Dropdown that appears when @ is typed in chat input
 * Allows user to select PDFs to reference in their message
 * 
 * Agent 4 deliverable - PDF selection dropdown with filtering
 */

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Highlight matching text in filename
 */
const highlightMatch = (text, query) => {
  if (!query) return text;
  
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <>
      {parts.map((part, index) => 
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={index} className="bg-yellow-200 text-gray-900 font-semibold">
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
};

export function PDFMentionDropdown({
  pdfs = [],
  selectedPdfs = [],
  onSelect,
  onClose,
  searchQuery = '',
  position = { top: 0, left: 0 },
  loading = false,
  highlightedIndex = 0,
  className
}) {
  const dropdownRef = useRef(null);

  // Filter PDFs based on search query
  const filteredPdfs = pdfs.filter(pdf => 
    pdf.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if a PDF is already selected
  const isPdfSelected = (pdf) => {
    return selectedPdfs.some(
      selected => (selected.id || selected.s3Key) === (pdf.id || pdf.s3Key)
    );
  };

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (loading) {
    return (
      <div
        ref={dropdownRef}
        className={cn(
          "fixed z-[100] w-80 bg-white rounded-lg shadow-lg border border-gray-200",
          "overflow-hidden",
          className
        )}
        style={{ top: `${position.top}px`, left: `${position.left}px` }}
      >
        <div className="p-2 space-y-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse px-3 py-2">
              <div className="h-3.5 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (filteredPdfs.length === 0) {
    return (
      <div
        ref={dropdownRef}
        className={cn(
          "fixed z-[100] w-80 bg-white rounded-lg shadow-lg border border-gray-200",
          "overflow-hidden",
          className
        )}
        style={{ top: `${position.top}px`, left: `${position.left}px` }}
      >
        <div className="px-3 py-2 text-xs text-gray-500">
          {searchQuery 
            ? `No matches for "${searchQuery}"`
            : "No PDFs available"}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={dropdownRef}
      className={cn(
        "fixed z-[100] w-80 bg-white rounded-lg shadow-lg border border-gray-200",
        "overflow-hidden py-1",
        className
      )}
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      <div className="max-h-64 overflow-y-auto">
        {filteredPdfs.map((pdf, index) => {
          const isSelected = isPdfSelected(pdf);
          const isHighlighted = index === highlightedIndex;

          return (
            <button
              key={pdf.id || pdf.s3Key}
              onClick={() => onSelect?.(pdf)}
              className={cn(
                "w-full px-3 py-1.5 text-left text-sm transition-colors",
                "hover:bg-[#EEF2FF] focus:bg-[#EEF2FF] focus:outline-none",
                isHighlighted && "bg-[#EEF2FF]",
                isSelected && "text-[#3551F3] font-medium"
              )}
            >
              {highlightMatch(pdf.filename, searchQuery)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default PDFMentionDropdown;

