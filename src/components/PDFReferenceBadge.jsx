/**
 * PDFReferenceBadge Component
 * Displays a badge/pill for a selected PDF reference in chat input
 * 
 * Agent 4 deliverable - Shows PDF filename with remove button
 */

import React from 'react';
import { FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PDFReferenceBadge({ pdf, onRemove, className }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        "bg-[#EEF2FF] text-[#3551F3] border border-[#3551F3]/20",
        "hover:bg-[#E0E7FF] transition-colors",
        "max-w-[200px]",
        className
      )}
    >
      <FileText className="w-3 h-3 flex-shrink-0" />
      <span className="truncate" title={pdf.filename}>
        {pdf.filename}
      </span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove(pdf);
          }}
          className="flex-shrink-0 hover:bg-[#3551F3] hover:text-white rounded-full p-0.5 transition-colors ml-0.5"
          aria-label={`Remove ${pdf.filename}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

/**
 * Container for multiple PDF badges
 * Used in chat input area
 */
export function PDFReferenceBadgeList({ pdfs, onRemove, className }) {
  if (!pdfs || pdfs.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {pdfs.map((pdf) => (
        <PDFReferenceBadge
          key={pdf.id || pdf.s3Key}
          pdf={pdf}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

export default PDFReferenceBadge;

