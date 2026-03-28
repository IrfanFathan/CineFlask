/**
 * Series Watchlist Routes
 * Manages watchlist for TV series
 */

const express = require('express');
const db = require('../database/db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get series watchlist for profile
router.get('/', (req, res, next) => {
  try {
    const { profile_id } = req.query;

    if (!profile_id) {
      return res.status(400).json({
        success: false,
        message: 'profile_id query parameter is required'
      });
    }

    const series = db.prepare(`
      SELECT 
        s.*,
        sw.added_at,
        (SELECT COUNT(*) FROM seasons WHERE series_id = s.id) as season_count
      FROM series_watchlist sw
      JOIN series s ON sw.series_id = s.id
      WHERE sw.profile_id = ?
      ORDER BY sw.added_at DESC
    `).all(profile_id);

    res.json({
      success: true,
      series
    });
  } catch (error) {
    next(error);
  }
});

// Add series to watchlist
router.post('/', (req, res, next) => {
  try {
    const { seriesId, profileId } = req.body;

    if (!seriesId || !profileId) {
      return res.status(400).json({
        success: false,
        message: 'seriesId and profileId are required'
      });
    }

    // Check if series exists
    const series = db.prepare('SELECT * FROM series WHERE id = ?').get(seriesId);
    if (!series) {
      return res.status(404).json({
        success: false,
        message: 'Series not found'
      });
    }

    // Check if already in watchlist
    const existing = db.prepare(
      'SELECT * FROM series_watchlist WHERE series_id = ? AND profile_id = ?'
    ).get(seriesId, profileId);

    if (existing) {
      return res.json({
        success: true,
        message: 'Series already in watchlist'
      });
    }

    // Add to watchlist
    db.prepare(`
      INSERT INTO series_watchlist (series_id, profile_id)
      VALUES (?, ?)
    `).run(seriesId, profileId);

    res.json({
      success: true,
      message: 'Series added to watchlist'
    });
  } catch (error) {
    next(error);
  }
});

// Remove series from watchlist
router.delete('/:seriesId', (req, res, next) => {
  try {
    const { seriesId } = req.params;
    const { profile_id } = req.query;

    if (!profile_id) {
      return res.status(400).json({
        success: false,
        message: 'profile_id query parameter is required'
      });
    }

    db.prepare(`
      DELETE FROM series_watchlist 
      WHERE series_id = ? AND profile_id = ?
    `).run(seriesId, profile_id);

    res.json({
      success: true,
      message: 'Series removed from watchlist'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
