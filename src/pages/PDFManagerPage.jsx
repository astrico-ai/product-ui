/**
 * PDFManagerPage
 * Main page for managing PDF uploads and viewing uploaded PDFs
 * 
 * Agent 3 deliverable - Complete PDF management interface
 * Agent 5 integration - Now using Zustand store for state management
 * 
 * Integrates: PDFUploadArea + PDFList + Zustand store
 */

import React, { useState } from 'react';
import { FileText, Upload, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PDFUploadArea } from '@/components/PDFUploadArea';
import { PDFList } from '@/components/PDFList';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Agent 5: Import Zustand store and hooks
import { usePDFStore } from '@/stores/usePDFStore';
import { usePDFSync, usePDFUpload, usePDFDelete } from '@/hooks/usePDFSync';

export default function PDFManagerPage() {
  // Agent 5: Replace local state with Zustand store
  const pdfs = usePDFStore(state => state.pdfs);
  
  // Agent 5: Use sync hook for auto-loading PDFs
  const { isLoading, refresh } = usePDFSync({ 
    fetchOnMount: true,  // Auto-load on mount
    autoRefresh: false   // No auto-refresh for now
  });
  
  // Agent 5: Use upload hook
  const { uploadPDFs, isUploading } = usePDFUpload();
  
  // Agent 5: Use delete hook
  const { deletePDF, isDeleting } = usePDFDelete();
  
  // Local UI state (not managed by store)
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const { toast } = useToast();

  /**
   * Handle file upload
   * Agent 5: Now uses Zustand store action
   */
  const handleFilesSelected = async (files) => {
    if (files.length === 0) return;

    try {
      const response = await uploadPDFs(files);
      
      toast({
        title: "Upload successful",
        description: `${response.pdfs.length} PDF${response.pdfs.length === 1 ? '' : 's'} uploaded successfully`,
        variant: "default",
      });
      
      // Close modal after successful upload
      setUploadModalOpen(false);
    } catch (error) {
      console.error('Error uploading PDFs:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload PDFs. Please try again.",
        variant: "destructive",
      });
    }
  };

  /**
   * Handle PDF deletion
   * Agent 5: Now uses Zustand store action
   * @param {string} s3Key - The S3 key of the PDF to delete
   */
  const handleDelete = async (s3Key) => {
    try {
      await deletePDF(s3Key);
      
      toast({
        title: "PDF deleted",
        description: "The PDF has been successfully deleted",
        variant: "default",
      });
    } catch (error) {
      console.error('Error deleting PDF:', error);
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  /**
   * Manual refresh
   * Agent 5: Now uses sync hook's refresh function
   */
  const handleRefresh = async () => {
    toast({
      title: "Refreshing...",
      description: "Fetching latest PDF list",
    });
    await refresh();
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#3551F3] rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">PDF Manager</h1>
                <p className="text-sm text-gray-500">
                  Upload and manage your PDF documents
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setUploadModalOpen(true)}
              className="bg-[#3551F3] hover:bg-[#2941d9]"
              size="sm"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload PDF
            </Button>
            <Button
              onClick={handleRefresh}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="hover:bg-white"
            >
              <RefreshCcw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* PDF List Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">Your PDFs</h2>
            </div>
            {pdfs.length > 0 && (
              <span className="text-sm text-gray-500">
                {pdfs.length} document{pdfs.length === 1 ? '' : 's'}
              </span>
            )}
          </div>
          <PDFList
            pdfs={pdfs}
            onDelete={handleDelete}
            isDeleting={isDeleting}
            loading={isLoading}
          />
        </div>

      </div>

      {/* Upload Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload PDF Files</DialogTitle>
            <DialogDescription>
              Upload one or multiple PDF files to your library. Maximum 25MB per file.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <PDFUploadArea
              onFilesSelected={handleFilesSelected}
              isUploading={isUploading}
              disabled={isUploading}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

