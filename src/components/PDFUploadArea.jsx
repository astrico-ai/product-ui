/**
 * PDFUploadArea Component
 * Drag-and-drop file upload area for PDF files
 * 
 * Agent 3 deliverable - supports both click-to-upload and drag-and-drop
 */

import React, { useState, useRef } from 'react';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { validatePDF, formatFileSize } from '@/services/pdfService';

export function PDFUploadArea({ onFilesSelected, isUploading = false, disabled = false }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only set dragging to false if we're leaving the dropzone itself
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const processFiles = (files) => {
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    const newErrors = [];
    const validFiles = [];

    pdfFiles.forEach(file => {
      const validation = validatePDF(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        newErrors.push({ filename: file.name, error: validation.error });
      }
    });

    // Check for non-PDF files
    const nonPdfFiles = files.filter(file => file.type !== 'application/pdf');
    nonPdfFiles.forEach(file => {
      newErrors.push({ filename: file.name, error: 'Only PDF files are allowed' });
    });

    setErrors(newErrors);
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0 && onFilesSelected) {
      onFilesSelected(selectedFiles);
      // Clear selected files after upload starts
      setSelectedFiles([]);
      setErrors([]);
    }
  };

  const openFileDialog = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Drag and Drop Area */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer",
          isDragging && !disabled && !isUploading
            ? "border-[#3551F3] bg-[#EEF2FF] scale-[1.02]"
            : "border-gray-300 bg-white hover:border-[#3551F3] hover:bg-gray-50",
          (disabled || isUploading) && "opacity-50 cursor-not-allowed"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,application/pdf"
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled || isUploading}
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300",
              isDragging && !disabled && !isUploading
                ? "bg-[#3551F3] scale-110"
                : "bg-[#EEF2FF]"
            )}
          >
            <Upload
              className={cn(
                "w-8 h-8 transition-colors duration-300",
                isDragging && !disabled && !isUploading ? "text-white" : "text-[#3551F3]"
              )}
            />
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {isDragging ? "Drop files here" : "Upload PDF Files"}
            </h3>
            <p className="text-sm text-gray-500">
              Drag and drop your PDF files here, or click to browse
            </p>
            <p className="text-xs text-gray-400">
              Maximum file size: 25MB per file
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="pointer-events-none"
            disabled={disabled || isUploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            Select Files
          </Button>
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <div
              key={index}
              className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm"
            >
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-red-900">{error.filename}</p>
                <p className="text-red-700">{error.error}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setErrors(prev => prev.filter((_, i) => i !== index));
                }}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              Selected Files ({selectedFiles.length})
            </h4>
            <Button
              onClick={handleUpload}
              disabled={isUploading || disabled}
              size="sm"
              className="bg-[#3551F3] hover:bg-[#2941d9]"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'File' : 'Files'}
                </>
              )}
            </Button>
          </div>

          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  disabled={isUploading}
                  className="p-1 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

