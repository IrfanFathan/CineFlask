/**
 * OpenSubtitles API Routes
 */

const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticate } = require('../middleware/authMiddleware');
const opensubtitles = require('../helpers/opensubtitles');
const fs = require('fs');
const path = require('path');

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/opensubtitles/status
 * Check if OpenSubtitles integration is configured
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    configured: opensubtitles.isConfigured()
  });
});

/**
 * GET /api/opensubtitles/search/:imdbId
 * Search subtitles by IMDb ID
 */
router.get('/search/:imdbId', async (req, res) => {
  try {
    const { imdbId } = req.params;
    const { lang } = req.query; // e.g. 'en,es,fr'
    
    if (!opensubtitles.isConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'OpenSubtitles is not configured on this server.'
      });
    }

    const results = await opensubtitles.searchByImdbId(imdbId, lang || 'en');
    
    // Format results
    const formatted = results.map(sub => {
      const file = sub.attributes.files[0];
      return {
        id: file.file_id,
        filename: file.file_name,
        language: sub.attributes.language,
        languageCode: sub.attributes.language_code,
        fps: sub.attributes.fps,
        downloads: sub.attributes.download_count,
        uploader: sub.attributes.uploader?.name || 'Unknown',
        rating: sub.attributes.ratings || 0
      };
    });

    res.json({
      success: true,
      subtitles: formatted
    });
  } catch (error) {
    console.error('Subtitles search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search subtitles. Please try again later.'
    });
  }
});

/**
 * POST /api/opensubtitles/download/movie
 * Download subtitle for a movie
 */
router.post('/download/movie', async (req, res) => {
  try {
    const { fileId, movieId, language, languageCode } = req.body;
    
    if (!fileId || !movieId) {
      return res.status(400).json({ success: false, error: 'Missing required parameters' });
    }

    // Verify movie exists
    const movie = db.prepare('SELECT id FROM movies WHERE id = ?').get(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, error: 'Movie not found' });
    }

    // 1. Get download link from OS
    const downloadLink = await opensubtitles.getDownloadLink(fileId);

    // 2. Download and save the file
    const uploadDir = path.join(__dirname, '..', 'uploads', 'subtitles', 'movies');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Ensure it's a valid extension
    const ext = '.srt'; // OS usually converts/sends as srt or we save as it is
    const filename = `movie_${movieId}_${languageCode}_${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, filename);

    await opensubtitles.downloadSubtitle(downloadLink, filePath);

    // 3. Save to database
    const result = db.prepare(`
      INSERT INTO subtitles (movie_id, language, file_path)
      VALUES (?, ?, ?)
    `).run(movieId, language || languageCode, filename);

    res.json({
      success: true,
      message: 'Subtitle downloaded and attached successfully',
      subtitleId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Subtitle download error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download subtitle. ' + error.message
    });
  }
});

module.exports = router;
