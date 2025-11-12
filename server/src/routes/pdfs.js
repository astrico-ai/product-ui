const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../utils/logger');
const { validatePDFFile, validatePDFFiles } = require('../utils/pdfValidator');
const { filesToBase64Array } = require('../utils/base64Encoder');
const s3Service = require('../services/s3Service');
const openrouterService = require('../services/openrouterService');
const pdfProcessingService = require('../services/pdfProcessingService');

const router = express.Router();

// Configure multer for file uploads (in-memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    // Basic MIME type check
    if (!file.mimetype.includes('pdf')) {
      cb(new Error('Only PDF files are allowed'));
    } else {
      cb(null, true);
    }
  },
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB
    files: 10 // Max 10 files per upload
  }
});

/**
 * POST /api/pdfs/upload
 * Upload one or multiple PDF files
 */
router.post('/upload', upload.array('files', 10), async (req, res) => {
  try {
    logger.debug('Upload request received', { fileCount: req.files?.length || 0 });

    // Validate files exist
    if (!req.files || req.files.length === 0) {
      logger.warn('Upload attempt with no files');
      return res.status(400).json({
        success: false,
        error: 'No files provided',
        code: 'NO_FILES_PROVIDED'
      });
    }

    // Validate each file
    const validation = validatePDFFiles(req.files);
    if (!validation.valid) {
      logger.warn('File validation failed', { errors: validation.errors });
      return res.status(400).json({
        success: false,
        error: 'File validation failed',
        errors: validation.errors,
        code: 'VALIDATION_FAILED'
      });
    }

    // Add unique ID to each file
    const filesWithId = req.files.map(file => ({
      ...file,
      id: uuidv4()
    }));

    // Upload to S3
    const uploadResult = await s3Service.uploadPDFs(filesWithId);

    if (!uploadResult.success && uploadResult.uploaded.length === 0) {
      logger.error('S3 upload completely failed', { failed: uploadResult.failed });
      return res.status(500).json({
        success: false,
        error: 'Failed to upload PDFs',
        details: uploadResult.failed,
        code: 'UPLOAD_FAILED'
      });
    }

    logger.info('Files uploaded successfully', {
      uploaded: uploadResult.uploaded.length,
      failed: uploadResult.failed.length
    });

    return res.status(200).json({
      success: uploadResult.success,
      pdfs: uploadResult.uploaded,
      failed: uploadResult.failed,
      message: `${uploadResult.uploaded.length} file(s) uploaded successfully${
        uploadResult.failed.length > 0 ? `, ${uploadResult.failed.length} failed` : ''
      }`
    });
  } catch (error) {
    logger.error('Upload endpoint error', { error: error.message });
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      code: 'UPLOAD_ERROR'
    });
  }
});

/**
 * GET /api/pdfs
 * List all uploaded PDFs
 */
router.get('/', async (req, res) => {
  try {
    logger.debug('List PDFs request received');

    const pdfs = await s3Service.listPDFs();

    logger.debug('PDFs listed', { count: pdfs.length });

    return res.status(200).json({
      success: true,
      pdfs,
      total: pdfs.length
    });
  } catch (error) {
    logger.error('List PDFs endpoint error', { error: error.message });
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to list PDFs',
      code: 'LIST_ERROR'
    });
  }
});

/**
 * DELETE /api/pdfs/:id
 * Delete a specific PDF
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id.trim().length === 0) {
      logger.warn('Delete request with missing ID');
      return res.status(400).json({
        success: false,
        error: 'PDF ID is required',
        code: 'MISSING_ID'
      });
    }

    logger.debug('Delete PDF request', { id });

    // List all PDFs to find the one to delete
    const pdfs = await s3Service.listPDFs();
    const pdfToDelete = pdfs.find(pdf => pdf.s3Key.includes(id) || pdf.etag === id);

    if (!pdfToDelete) {
      logger.warn('PDF not found for deletion', { id });
      return res.status(404).json({
        success: false,
        error: 'PDF not found',
        code: 'PDF_NOT_FOUND'
      });
    }

    // Delete from S3
    const deleteResult = await s3Service.deletePDF(pdfToDelete.s3Key);

    logger.info('PDF deleted successfully', { id, filename: pdfToDelete.filename });

    return res.status(200).json({
      success: true,
      message: 'PDF deleted successfully',
      id: pdfToDelete.s3Key,
      filename: pdfToDelete.filename
    });
  } catch (error) {
    logger.error('Delete PDFs endpoint error', { error: error.message });
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete PDF',
      code: 'DELETE_ERROR'
    });
  }
});

/**
 * POST /api/pdfs/analyze
 * Analyze one or more PDFs using OpenRouter API
 */
router.post('/analyze', async (req, res) => {
  try {
    const { pdfIds, query, userMessage } = req.body;

    logger.debug('Analyze PDFs request', { pdfCount: pdfIds?.length || 0 });

    // Validate request
    if (!pdfIds || !Array.isArray(pdfIds) || pdfIds.length === 0) {
      logger.warn('Analyze request with missing PDF IDs');
      return res.status(400).json({
        success: false,
        error: 'At least one PDF ID is required',
        code: 'MISSING_PDF_IDS'
      });
    }

    if (!query || query.trim().length === 0) {
      logger.warn('Analyze request with empty query');
      return res.status(400).json({
        success: false,
        error: 'Query is required',
        code: 'MISSING_QUERY'
      });
    }

    // Get all available PDFs
    const allPdfs = await s3Service.listPDFs();

    // Validate PDF IDs (s3Keys)
    const validation = pdfProcessingService.validatePDFIds(pdfIds, allPdfs);
    if (!validation.valid) {
      logger.warn('PDF validation failed during analysis', { invalidIds: validation.invalidIds });
      return res.status(400).json({
        success: false,
        error: 'One or more PDFs not found',
        invalidIds: validation.invalidIds,
        code: 'INVALID_PDF_IDS'
      });
    }

    // Get the requested PDFs using exact s3Key match
    const selectedPdfs = allPdfs.filter(pdf => validation.validIds.includes(pdf.s3Key));

    // Allow switching between URL and Base64 via query parameter for debugging
    const useBase64 = req.query.useBase64 === 'true' || req.body.useBase64 === true;

    let enrichedPdfs;
    
    if (useBase64) {
      // Base64 approach (for debugging URL access issues)
      logger.info('Using Base64 encoding for PDF analysis (DEBUG MODE)', {
        pdfCount: selectedPdfs.length
      });
      
      const base64Pdfs = await pdfProcessingService.processS3KeysToBase64(
        selectedPdfs.map(p => p.s3Key)
      );
      
      enrichedPdfs = base64Pdfs.map((pdf) => ({
        ...pdf,
        id: pdf.s3Key
      }));
    } else {
      // URL-based approach (more efficient, default)
      logger.info('Using signed URLs for PDF analysis', {
        pdfCount: selectedPdfs.length
      });
      
      const pdfUrls = await pdfProcessingService.processS3KeysToUrls(
        selectedPdfs.map(p => p.s3Key),
        3600 // 1 hour expiration
      );
      
      enrichedPdfs = pdfUrls.map((pdf) => ({
        ...pdf,
        id: pdf.s3Key
      }));
    }

    logger.info('PDFs prepared for analysis', {
      pdfCount: enrichedPdfs.length,
      method: useBase64 ? 'base64' : 'url-based'
    });

    // Analyze using OpenRouter
    const analysisResult = await openrouterService.analyzePDFs(
      enrichedPdfs,
      query,
      userMessage
    );

    logger.info('PDF analysis completed', {
      pdfCount: enrichedPdfs.length,
      tokensUsed: analysisResult.tokensUsed.total
    });

    // Format response
    const formattedResponse = openrouterService.formatAnalysisResponse(
      analysisResult,
      selectedPdfs
    );

    return res.status(200).json({
      success: true,
      analysis: formattedResponse.analysis,
      referencedPdfs: formattedResponse.referencedPdfs,
      tokensUsed: formattedResponse.tokensUsed,
      model: formattedResponse.model,
      timestamp: formattedResponse.timestamp
    });
  } catch (error) {
    logger.error('Analyze PDFs endpoint error', { error: error.message });

    // Handle specific error types
    if (error.message.includes('rate limit')) {
      return res.status(429).json({
        success: false,
        error: error.message,
        code: 'RATE_LIMITED',
        retryAfter: 60
      });
    }

    if (error.message.includes('timeout')) {
      return res.status(504).json({
        success: false,
        error: 'Analysis request timed out',
        code: 'TIMEOUT'
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze PDFs',
      code: 'ANALYSIS_ERROR'
    });
  }
});

/**
 * Error handling middleware for multer
 */
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    logger.error('Multer error', { code: error.code, message: error.message });

    if (error.code === 'FILE_TOO_LARGE') {
      return res.status(413).json({
        success: false,
        error: 'File is too large. Maximum size is 25MB',
        code: 'FILE_TOO_LARGE'
      });
    }

    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(413).json({
        success: false,
        error: 'Too many files. Maximum is 10 files per upload',
        code: 'TOO_MANY_FILES'
      });
    }

    return res.status(400).json({
      success: false,
      error: error.message,
      code: 'UPLOAD_ERROR'
    });
  }

  if (error) {
    logger.error('Route error', { error: error.message });
    return res.status(400).json({
      success: false,
      error: error.message || 'Bad request',
      code: 'REQUEST_ERROR'
    });
  }

  next();
});

module.exports = router;
