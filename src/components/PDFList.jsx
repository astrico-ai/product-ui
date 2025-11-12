/**
 * PDFList Component
 * Displays uploaded PDFs in a table with metadata and actions
 * 
 * Agent 3 deliverable - shows filename, size, upload date, and delete action
 */

import React, { useState } from 'react';
import { FileText, Trash2, Calendar, HardDrive, ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatFileSize } from '@/services/pdfService';

/**
 * Format date to readable format
 */
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
};

export function PDFList({ pdfs = [], onDelete, isDeleting = false, loading = false }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);

  const handleDeleteClick = (pdf) => {
    setSelectedPdf(pdf);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedPdf && onDelete) {
      // Use s3Key as identifier (Agent 1's API contract)
      onDelete(selectedPdf.s3Key);
    }
    setDeleteDialogOpen(false);
    setSelectedPdf(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedPdf(null);
  };

  if (loading) {
    return (
      <div className="w-full bg-white rounded-xl border border-gray-200 p-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
                <div className="w-24 h-8 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (pdfs.length === 0) {
    return (
      <div className="w-full bg-white rounded-xl border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">No PDFs uploaded yet</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Upload your first PDF document to get started. You can reference them in chat using @mentions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">
              Uploaded PDFs ({pdfs.length})
            </h3>
            <div className="text-xs text-gray-500">
              Total size: {formatFileSize(pdfs.reduce((sum, pdf) => sum + pdf.size, 0))}
            </div>
          </div>
        </div>

        {/* Table - Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pdfs.map((pdf) => (
                <TableRow key={pdf.s3Key} className="group">
                  <TableCell>
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-red-600" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 group-hover:text-[#3551F3] transition-colors">
                        {pdf.filename}
                      </span>
                      <span className="text-xs text-gray-500 truncate max-w-md" title={pdf.s3Key}>
                        S3: {pdf.s3Key}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <HardDrive className="w-4 h-4" />
                      <span className="text-sm">{formatFileSize(pdf.size)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{formatDate(pdf.uploadedAt)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {pdf.s3Url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(pdf.s3Url, '_blank')}
                          className="hover:bg-blue-50 hover:text-[#3551F3]"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(pdf)}
                        disabled={isDeleting}
                        className="hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Card View - Mobile */}
        <div className="md:hidden divide-y divide-gray-200">
          {pdfs.map((pdf) => (
            <div key={pdf.s3Key} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{pdf.filename}</h4>
                  <div className="flex flex-col gap-1 mt-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5" />
                      <span>{formatFileSize(pdf.size)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(pdf.uploadedAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {pdf.s3Url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(pdf.s3Url, '_blank')}
                      className="hover:bg-blue-50 hover:text-[#3551F3]"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(pdf)}
                    disabled={isDeleting}
                    className="hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Delete PDF
            </DialogTitle>
            <DialogDescription className="space-y-3 pt-2">
              <p>
                Are you sure you want to delete <span className="font-semibold text-gray-900">{selectedPdf?.filename}</span>?
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-900">
                <p className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>This action cannot be undone. Any chat references to this PDF will no longer work.</span>
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete PDF
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

