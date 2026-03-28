/**
 * Episode Subtitles Routes
 * Handles subtitle file upload and management for episodes
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
    const episodeId = req.params.episodeId;
    const subtitlesDir = path.join(__dirname, '..', 'subtitles', 'episodes', episodeId);
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

// Get all subtitles for an episode
router.get('/:episodeId', (req, res, next) => {
  try {
    const { episodeId } = req.params;

    const subtitles = db.prepare(`
      SELECT * FROM episode_subtitles 
      WHERE episode_id = ?
      ORDER BY is_default DESC, language ASC
    `).all(episodeId);

    res.json({
      success: true,
      subtitles
    });
  } catch (error) {
    next(error);
  }
});

// Upload subtitle for an episode
router.post('/:episodeId', upload.single('subtitle'), (req, res, next) => {
  try {
    const { episodeId } = req.params;
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

    // Check if episode exists
    const episode = db.prepare('SELECT * FROM episodes WHERE id = ?').get(episodeId);
    
    if (!episode) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Episode not found'
      });
    }

    // If setting as default, unset other defaults
    if (isDefault === 'true' || isDefault === true) {
      db.prepare('UPDATE episode_subtitles SET is_default = 0 WHERE episode_id = ?').run(episodeId);
    }

    // Save subtitle to database
    const result = db.prepare(`
      INSERT INTO episode_subtitles (episode_id, language, label, file_path, is_default)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      episodeId,
      language,
      label,
      `subtitles/episodes/${episodeId}/${req.file.filename}`,
      isDefault === 'true' || isDefault === true ? 1 : 0
    );

    const subtitle = db.prepare('SELECT * FROM episode_subtitles WHERE id = ?').get(result.lastInsertRowid);

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

// Delete subtitle
router.delete('/:id', (req, res, next) => {
  try {
    const { id } = req.params;

    const subtitle = db.prepare('SELECT * FROM episode_subtitles WHERE id = ?').get(id);

    if (!subtitle) {
      return res.status(404).json({
        success: false,
        message: 'Subtitle not found'
      });
    }

    // Delete file
    const filePath = path.join(__dirname, '..', subtitle.file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    db.prepare('DELETE FROM episode_subtitles WHERE id = ?').run(id);

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

    const subtitle = db.prepare('SELECT * FROM episode_subtitles WHERE id = ?').get(id);

    if (!subtitle) {
      return res.status(404).json({
        success: false,
        message: 'Subtitle not found'
      });
    }

    // Unset all defaults for this episode
    db.prepare('UPDATE episode_subtitles SET is_default = 0 WHERE episode_id = ?').run(subtitle.episode_id);

    // Set this one as default
    db.prepare('UPDATE episode_subtitles SET is_default = 1 WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'Default subtitle updated'
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
