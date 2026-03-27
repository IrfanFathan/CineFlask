/**
 * Subtitles Routes
 * Handles subtitle file upload and management
 */

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const db = require('../database/db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Configure multer for subtitle uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subtitlesDir = path.join(__dirname, '..', 'uploads', 'subtitles');
    if (!fs.existsSync(subtitlesDir)) {
      fs.mkdirSync(subtitlesDir, { recursive: true });
    }
    cb(null, subtitlesDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.srt' || ext === '.vtt') {
      cb(null, true);
    } else {
      cb(new Error('Only .srt and .vtt subtitle files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max for subtitle files
  }
});

// All routes require authentication
router.use(authMiddleware);

// Upload subtitle for a movie
router.post('/upload/:movieId', upload.single('subtitle'), (req, res, next) => {
  try {
    const { movieId } = req.params;
    const { language, label, isDefault } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No subtitle file uploaded'
      });
    }

    if (!language || !label) {
      return res.status(400).json({
        success: false,
        message: 'Language and label are required'
      });
    }

    // Check if movie exists and user owns it
    const movie = db.prepare('SELECT * FROM movies WHERE id = ? AND uploaded_by = ?').get(movieId, req.user.id);
    
    if (!movie) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Movie not found or access denied'
      });
    }

    // If setting as default, unset other defaults
    if (isDefault === 'true' || isDefault === true) {
      db.prepare('UPDATE subtitles SET is_default = 0 WHERE movie_id = ?').run(movieId);
    }

    // Save subtitle to database
    const result = db.prepare(`
      INSERT INTO subtitles (movie_id, language, label, file_path, is_default)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      movieId,
      language,
      label,
      `uploads/subtitles/${req.file.filename}`,
      isDefault === 'true' || isDefault === true ? 1 : 0
    );

    const subtitle = db.prepare('SELECT * FROM subtitles WHERE id = ?').get(result.lastInsertRowid);

    res.json({
      success: true,
      message: 'Subtitle uploaded successfully',
      subtitle
    });

  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
});

// Get all subtitles for a movie (no auth required for playback)
router.get('/:movieId', (req, res, next) => {
  try {
    const { movieId } = req.params;

    const subtitles = db.prepare(`
      SELECT id, movie_id, language, label, file_path, is_default, created_at
      FROM subtitles 
      WHERE movie_id = ?
      ORDER BY is_default DESC, language ASC
    `).all(movieId);

    res.json({
      success: true,
      subtitles
    });

  } catch (error) {
    next(error);
  }
});

// Delete subtitle
router.delete('/:id', (req, res, next) => {
  try {
    const { id } = req.params;

    // Get subtitle and check ownership
    const subtitle = db.prepare(`
      SELECT s.*, m.uploaded_by 
      FROM subtitles s
      JOIN movies m ON s.movie_id = m.id
      WHERE s.id = ?
    `).get(id);

    if (!subtitle) {
      return res.status(404).json({
        success: false,
        message: 'Subtitle not found'
      });
    }

    if (subtitle.uploaded_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete file
    const filePath = path.join(__dirname, '..', subtitle.file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    db.prepare('DELETE FROM subtitles WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'Subtitle deleted successfully'
    });

  } catch (error) {
    next(error);
  }
});

// Set default subtitle
router.put('/:id/default', (req, res, next) => {
  try {
    const { id } = req.params;

    // Get subtitle and check ownership
    const subtitle = db.prepare(`
      SELECT s.*, m.uploaded_by 
      FROM subtitles s
      JOIN movies m ON s.movie_id = m.id
      WHERE s.id = ?
    `).get(id);

    if (!subtitle) {
      return res.status(404).json({
        success: false,
        message: 'Subtitle not found'
      });
    }

    if (subtitle.uploaded_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Unset all defaults for this movie
    db.prepare('UPDATE subtitles SET is_default = 0 WHERE movie_id = ?').run(subtitle.movie_id);

    // Set this one as default
    db.prepare('UPDATE subtitles SET is_default = 1 WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'Default subtitle updated'
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
