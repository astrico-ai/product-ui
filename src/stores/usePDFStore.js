/**
 * PDF Store - Zustand store for managing PDF state across the application
 * 
 * Features:
 * - Fetches and caches available PDFs from backend
 * - Manages selected PDFs for @ mention functionality
 * - Syncs with pdfService for backend operations
 * - Provides actions for PDF selection/deselection
 * - Upload and delete operations with UI state management
 */

import { create } from 'zustand';
import { listPDFs, uploadPDFs as uploadPDFsService, deletePDF as deletePDFService } from '../services/pdfService';

/**
 * Zustand store for PDF management
 */
export const usePDFStore = create((set, get) => ({
  // State
  pdfs: [],                    // All available PDFs from backend
  selectedPdfs: [],            // Currently selected PDFs for @ mention
  loading: false,              // Loading state for fetch operations
  uploading: false,            // Loading state for upload operations
  deleting: false,             // Loading state for delete operations
  error: null,                 // Error message if any
  lastFetched: null,           // Timestamp of last fetch (alias: lastSync)
  lastSync: null,              // Alias for lastFetched (for backward compatibility)

  /**
   * Fetch all PDFs from backend
   * Updates the pdfs array with latest data
   */
  fetchPDFs: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await listPDFs();
      
      if (response.success) {
        const timestamp = Date.now();
        set({ 
          pdfs: response.pdfs || [], 
          loading: false,
          lastFetched: timestamp,
          lastSync: timestamp  // Keep both in sync
        });
      } else {
        throw new Error('Failed to fetch PDFs');
      }
    } catch (error) {
      console.error('Error fetching PDFs in store:', error);
      set({ 
        error: error.message || 'Failed to load PDFs',
        loading: false 
      });
    }
  },

  /**
   * Upload PDFs to backend
   * @param {File[]} files - Array of files to upload
   * @returns {Promise<Object>} - Upload result
   */
  uploadPDFs: async (files) => {
    set({ uploading: true, error: null });
    
    try {
      const response = await uploadPDFsService(files);
      
      if (response.success) {
        // Add uploaded PDFs to the beginning of the list
        const { pdfs } = get();
        const newPdfs = [...(response.pdfs || []), ...pdfs];
        
        set({ 
          pdfs: newPdfs,
          uploading: false 
        });
        
        return response;
      } else {
        throw new Error(response.error || 'Failed to upload PDFs');
      }
    } catch (error) {
      console.error('Error uploading PDFs in store:', error);
      set({ 
        error: error.message || 'Failed to upload PDFs',
        uploading: false 
      });
      throw error;
    }
  },

  /**
   * Delete a PDF from backend
   * @param {string} s3Key - S3 key of PDF to delete
   * @returns {Promise<void>}
   */
  deletePDF: async (s3Key) => {
    set({ deleting: true, error: null });
    
    try {
      const response = await deletePDFService(s3Key);
      
      if (response.success) {
        // Remove from both pdfs and selectedPdfs
        const { pdfs, selectedPdfs } = get();
        
        set({ 
          pdfs: pdfs.filter(pdf => pdf.s3Key !== s3Key),
          selectedPdfs: selectedPdfs.filter(pdf => pdf.s3Key !== s3Key),
          deleting: false 
        });
        
        return response;
      } else {
        throw new Error(response.error || 'Failed to delete PDF');
      }
    } catch (error) {
      console.error('Error deleting PDF in store:', error);
      set({ 
        error: error.message || 'Failed to delete PDF',
        deleting: false 
      });
      throw error;
    }
  },

  /**
   * Clear error state
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * Add a PDF to the selected list
   * @param {Object} pdf - PDF object to select
   */
  selectPDF: (pdf) => {
    const { selectedPdfs } = get();
    
    // Check if already selected (by s3Key or id)
    const isAlreadySelected = selectedPdfs.some(
      p => (p.s3Key || p.id) === (pdf.s3Key || pdf.id)
    );
    
    if (!isAlreadySelected) {
      set({ selectedPdfs: [...selectedPdfs, pdf] });
    }
  },

  /**
   * Remove a PDF from the selected list
   * @param {string} pdfIdOrKey - PDF s3Key or id to remove
   */
  deselectPDF: (pdfIdOrKey) => {
    const { selectedPdfs } = get();
    
    set({ 
      selectedPdfs: selectedPdfs.filter(
        pdf => (pdf.s3Key || pdf.id) !== pdfIdOrKey
      ) 
    });
  },

  /**
   * Clear all selected PDFs
   */
  clearSelectedPdfs: () => {
    set({ selectedPdfs: [] });
  },

  /**
   * Add a newly uploaded PDF to the available list
   * @param {Object} pdf - PDF object to add
   */
  addPDF: (pdf) => {
    const { pdfs } = get();
    set({ pdfs: [pdf, ...pdfs] }); // Add to beginning (most recent)
  },

  /**
   * Remove a deleted PDF from the available list
   * Also removes from selected list if it was selected
   * @param {string} s3Key - S3 key of PDF to remove
   */
  removePDF: (s3Key) => {
    const { pdfs, selectedPdfs } = get();
    
    set({ 
      pdfs: pdfs.filter(pdf => pdf.s3Key !== s3Key),
      selectedPdfs: selectedPdfs.filter(pdf => pdf.s3Key !== s3Key)
    });
  },

  /**
   * Reset the store to initial state
   */
  reset: () => {
    set({
      pdfs: [],
      selectedPdfs: [],
      loading: false,
      uploading: false,
      deleting: false,
      error: null,
      lastFetched: null,
      lastSync: null
    });
  },

  /**
   * Check if a PDF is currently selected
   * @param {string} pdfIdOrKey - PDF s3Key or id to check
   * @returns {boolean}
   */
  isPDFSelected: (pdfIdOrKey) => {
    const { selectedPdfs } = get();
    return selectedPdfs.some(
      pdf => (pdf.s3Key || pdf.id) === pdfIdOrKey
    );
  },

  /**
   * Get selected PDF IDs for API submission
   * @returns {string[]} Array of s3Keys
   */
  getSelectedPdfIds: () => {
    const { selectedPdfs } = get();
    return selectedPdfs.map(pdf => pdf.s3Key || pdf.id);
  }
}));

export default usePDFStore;

