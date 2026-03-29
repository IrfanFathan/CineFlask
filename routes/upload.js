/**
 * Chunked Upload Routes
 * Handles large video file uploads in chunks for better reliability
 */

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const db = require('../database/db');
const authMiddleware = require('../middleware/authMiddleware');
const { fetchMetadata, fetchMetadataByImdbId, extractYear } = require('../helpers/metadataEnhanced');
const { canUpload, recordUpload, getUserUploadStats } = require('../helpers/quotaManager');

const router = express.Router();

// Configure multer for chunk uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(__dirname, '..', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    // Generate temporary random filename - will be renamed after upload
    const tempFilename = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    cb(null, tempFilename);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: (parseInt(process.env.MAX_FILE_SIZE_GB) || 50) * 1024 * 1024 * 1024 // GB to bytes
  }
});

// All routes require authentication
router.use(authMiddleware);

// Get user upload quota/stats
router.get('/quota', (req, res, next) => {
  try {
    const stats = getUserUploadStats(req.user.id);
    res.json({
      success: true,
      quota: stats
    });
  } catch (error) {
    next(error);
  }
});

// Initialize chunked upload
router.post('/init', (req, res, next) => {
  try {
    const { filename, fileSize, totalChunks } = req.body;

    if (!filename || !fileSize || !totalChunks) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: filename, fileSize, totalChunks'
      });
    }

    // Validate file extension
    const ext = path.extname(filename).toLowerCase();
    const allowedExts = ['.mp4', '.mkv', '.avi', '.mov', '.webm', '.m4v'];
    
    if (!allowedExts.includes(ext)) {
      return res.status(400).json({
        success: false,
        message: `Invalid file type. Allowed: ${allowedExts.join(', ')}`
      });
    }

    // Check upload quota and limits
    const uploadCheck = canUpload(req.user.id, fileSize);
    
    if (!uploadCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: uploadCheck.message,
        reason: uploadCheck.reason,
        quota: uploadCheck.stats
      });
    }

    // Generate unique upload ID
    const uploadId = crypto.randomBytes(16).toString('hex');

    res.json({
      success: true,
      uploadId,
      message: 'Upload initialized',
      quota: uploadCheck.stats
    });
  } catch (error) {
    next(error);
  }
});

// Upload single chunk
router.post('/chunk', upload.single('chunk'), (req, res, next) => {
  try {
    const { uploadId, chunkIndex, totalChunks } = req.body;

    console.log('Chunk upload:', { uploadId, chunkIndex, totalChunks, hasFile: !!req.file });

    if (!uploadId || chunkIndex === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing uploadId or chunkIndex in request body'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No chunk uploaded'
      });
    }

    // Rename the temp file to proper chunk name
    const tempDir = path.join(__dirname, '..', 'temp');
    const properChunkName = `${uploadId}_chunk_${chunkIndex}`;
    const properChunkPath = path.join(tempDir, properChunkName);
    
    // Check if target already exists (shouldn't happen, but just in case)
    if (fs.existsSync(properChunkPath)) {
      fs.unlinkSync(properChunkPath);
    }
    
    fs.renameSync(req.file.path, properChunkPath);

    console.log(`✓ Chunk ${chunkIndex} saved as ${properChunkName}`);

    res.json({
      success: true,
      message: `Chunk ${parseInt(chunkIndex) + 1}/${totalChunks} uploaded`,
      chunkIndex: parseInt(chunkIndex)
    });
  } catch (error) {
    console.error('Chunk upload error:', error);
    next(error);
  }
});

// Complete upload - merge chunks and save to database
router.post('/complete', async (req, res, next) => {
  const ipAddress = req.ip || req.connection.remoteAddress;
  
  try {
    const { uploadId, filename, totalChunks, title, imdbId } = req.body;

    console.log('Complete upload request:', { uploadId, filename, totalChunks, title, imdbId });

    if (!uploadId || !filename || !totalChunks) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const tempDir = path.join(__dirname, '..', 'temp');
    const uploadsDir = path.join(__dirname, '..', 'uploads');

    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate final filename (keep extension, add timestamp)
    const ext = path.extname(filename);
    const basename = path.basename(filename, ext);
    const finalFilename = `${Date.now()}_${basename}${ext}`;
    const finalPath = path.join(uploadsDir, finalFilename);

    console.log(`Merging ${totalChunks} chunks into ${finalFilename}...`);

    // Merge chunks
    const writeStream = fs.createWriteStream(finalPath);

    for (let i = 0; i < parseInt(totalChunks); i++) {
      const chunkPath = path.join(tempDir, `${uploadId}_chunk_${i}`);
      
      if (!fs.existsSync(chunkPath)) {
        console.error(`Missing chunk ${i} at ${chunkPath}`);
        throw new Error(`Missing chunk ${i}`);
      }

      const chunkBuffer = fs.readFileSync(chunkPath);
      console.log(`  Chunk ${i}: ${chunkBuffer.length} bytes`);
      writeStream.write(chunkBuffer);

      // Delete chunk after merging
      fs.unlinkSync(chunkPath);
    }

    writeStream.end();

    // Wait for write to complete
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    // Get file size
    const stats = fs.statSync(finalPath);
    console.log(`✓ Final file size: ${stats.size} bytes`);

    // Double-check quota before finalizing
    const uploadCheck = canUpload(req.user.id, stats.size);
    if (!uploadCheck.allowed) {
      // Delete the uploaded file
      fs.unlinkSync(finalPath);
      
      return res.status(403).json({
        success: false,
        message: uploadCheck.message,
        reason: uploadCheck.reason,
        quota: uploadCheck.stats
      });
    }

    // Fetch metadata - use IMDb ID if provided, otherwise use title
    let metadata;
    if (imdbId) {
      console.log(`📡 Fetching metadata by IMDb ID: ${imdbId}`);
      metadata = await fetchMetadataByImdbId(imdbId, req.user.id, ipAddress);
    } else {
      const movieTitle = title || basename;
      const year = extractYear(filename);
      metadata = await fetchMetadata(movieTitle, year, req.user.id, ipAddress);
    }

    // Save to database
    const result = db.prepare(`
      INSERT INTO movies (
        title, year, description, file_path, file_size,
        poster_url, imdb_id, genre, actors, director, runtime, imdb_rating,
        language, country, uploaded_by, upload_ip
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      metadata.title,
      metadata.year,
      metadata.description,
      `uploads/${finalFilename}`,
      stats.size,
      metadata.poster_url,
      metadata.imdb_id,
      metadata.genre,
      metadata.actors,
      metadata.director,
      metadata.runtime,
      metadata.imdb_rating,
      metadata.language,
      metadata.country,
      req.user.id,
      ipAddress
    );

    // Record upload activity
    recordUpload(req.user.id, stats.size);

    const movie = db.prepare('SELECT * FROM movies WHERE id = ?').get(result.lastInsertRowid);

    console.log(`✓ Movie added to database with ID ${movie.id}`);

    // Get updated quota stats
    const updatedQuota = getUserUploadStats(req.user.id);

    res.json({
      success: true,
      message: 'Upload completed successfully',
      movie,
      quota: updatedQuota
    });

  } catch (error) {
    console.error('Complete upload error:', error);
    next(error);
  }
});

// Cancel upload - cleanup temp chunks
router.post('/cancel', (req, res, next) => {
  try {
    const { uploadId, totalChunks } = req.body;

    if (!uploadId) {
      return res.status(400).json({
        success: false,
        message: 'Upload ID required'
      });
    }

    const tempDir = path.join(__dirname, '..', 'temp');

    // Delete all chunks for this upload
    for (let i = 0; i < parseInt(totalChunks || 999); i++) {
      const chunkPath = path.join(tempDir, `${uploadId}_chunk_${i}`);
      if (fs.existsSync(chunkPath)) {
        fs.unlinkSync(chunkPath);
      }
    }

    res.json({
      success: true,
      message: 'Upload cancelled and temp files cleaned up'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
