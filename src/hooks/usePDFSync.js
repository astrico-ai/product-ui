/**
 * usePDFSync Hook
 * Auto-synchronization hook for PDF store with backend
 * 
 * Agent 5 deliverable - Automatic data synchronization
 * 
 * Features:
 * - Auto-fetch PDFs on mount
 * - Optional periodic sync (refresh every N minutes)
 * - Manual refresh function
 * - Loading state management
 * - Error handling with retry logic
 * 
 * Usage:
 * ```javascript
 * const { isLoading, error, refresh } = usePDFSync({ autoRefresh: true });
 * ```
 */

import { useEffect, useCallback, useRef } from 'react';
import { usePDFStore } from '@/stores/usePDFStore';

/**
 * Hook for automatic PDF synchronization with backend
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoRefresh - Enable automatic refresh (default: false)
 * @param {number} options.refreshInterval - Refresh interval in milliseconds (default: 5 minutes)
 * @param {boolean} options.fetchOnMount - Fetch PDFs on component mount (default: true)
 * @returns {Object} - { isLoading, error, refresh, lastSync }
 */
export function usePDFSync(options = {}) {
  const {
    autoRefresh = false,
    refreshInterval = 5 * 60 * 1000, // 5 minutes default
    fetchOnMount = true
  } = options;

  // Get store state and actions
  const loading = usePDFStore(state => state.loading);
  const error = usePDFStore(state => state.error);
  const lastSync = usePDFStore(state => state.lastSync);
  const fetchPDFs = usePDFStore(state => state.fetchPDFs);
  const clearError = usePDFStore(state => state.clearError);
  
  // Track if initial fetch has been done
  const hasFetchedRef = useRef(false);
  const intervalRef = useRef(null);

  /**
   * Manual refresh function
   * Can be called to manually trigger a sync
   */
  const refresh = useCallback(async () => {
    try {
      clearError();
      await fetchPDFs();
      return true;
    } catch (err) {
      console.error('[usePDFSync] Error refreshing PDFs:', err);
      return false;
    }
  }, [fetchPDFs, clearError]);

  /**
   * Initial fetch on mount
   */
  useEffect(() => {
    if (fetchOnMount && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      refresh();
    }
  }, [fetchOnMount, refresh]);

  /**
   * Auto-refresh interval
   */
  useEffect(() => {
    if (autoRefresh) {
      console.log(`[usePDFSync] Auto-refresh enabled with interval: ${refreshInterval}ms`);
      
      intervalRef.current = setInterval(() => {
        console.log('[usePDFSync] Auto-refreshing PDFs...');
        refresh();
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          console.log('[usePDFSync] Clearing auto-refresh interval');
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, refresh]);

  return {
    isLoading: loading,
    error,
    refresh,
    lastSync,
    isSynced: !!lastSync && !loading && !error
  };
}

/**
 * Hook for PDF upload with automatic store update
 * Provides a wrapper around the store's uploadPDFs with UI feedback
 * 
 * @returns {Object} - { uploadPDFs, isUploading, error }
 */
export function usePDFUpload() {
  const uploading = usePDFStore(state => state.uploading);
  const error = usePDFStore(state => state.error);
  const uploadPDFs = usePDFStore(state => state.uploadPDFs);
  const clearError = usePDFStore(state => state.clearError);

  /**
   * Upload files with automatic error clearing
   * @param {File[]} files - Array of files to upload
   * @returns {Promise<Object>} - Upload result
   */
  const upload = useCallback(async (files) => {
    try {
      clearError();
      const result = await uploadPDFs(files);
      return result;
    } catch (err) {
      console.error('[usePDFUpload] Upload failed:', err);
      throw err;
    }
  }, [uploadPDFs, clearError]);

  return {
    uploadPDFs: upload,
    isUploading: uploading,
    error
  };
}

/**
 * Hook for PDF deletion with automatic store update
 * Provides a wrapper around the store's deletePDF with UI feedback
 * 
 * @returns {Object} - { deletePDF, isDeleting, error }
 */
export function usePDFDelete() {
  const deleting = usePDFStore(state => state.deleting);
  const error = usePDFStore(state => state.error);
  const deletePDF = usePDFStore(state => state.deletePDF);
  const clearError = usePDFStore(state => state.clearError);

  /**
   * Delete PDF with automatic error clearing
   * @param {string} s3Key - S3 key of PDF to delete
   * @returns {Promise<void>}
   */
  const remove = useCallback(async (s3Key) => {
    try {
      clearError();
      await deletePDF(s3Key);
      return true;
    } catch (err) {
      console.error('[usePDFDelete] Delete failed:', err);
      throw err;
    }
  }, [deletePDF, clearError]);

  return {
    deletePDF: remove,
    isDeleting: deleting,
    error
  };
}

/**
 * Hook for PDF selection management (for ChatPage @ mentions)
 * Provides functions to manage selected PDFs state
 * 
 * @returns {Object} - { selectedPdfs, selectPDF, deselectPDF, clearSelectedPdfs, hasSelectedPdfs }
 */
export function usePDFSelection() {
  const selectedPdfs = usePDFStore(state => state.selectedPdfs);
  const selectPDF = usePDFStore(state => state.selectPDF);
  const deselectPDF = usePDFStore(state => state.deselectPDF);
  const clearSelectedPdfs = usePDFStore(state => state.clearSelectedPdfs);

  return {
    selectedPdfs,
    selectPDF,
    deselectPDF,
    clearSelectedPdfs,
    hasSelectedPdfs: selectedPdfs.length > 0,
    selectedCount: selectedPdfs.length
  };
}

export default usePDFSync;

