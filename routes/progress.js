/**
 * Playback Progress Routes
 * Saves and retrieves video watch positions for resume functionality
 */

const express = require('express');
const db = require('../database/db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Save playback progress
router.post('/', (req, res, next) => {
  try {
    const { movie_id, profile_id, timestamp_seconds, duration_seconds } = req.body;

    if (!movie_id || timestamp_seconds === undefined) {
      return res.status(400).json({
        success: false,
        message: 'movie_id and timestamp_seconds are required'
      });
    }

    // Upsert (insert or update) progress
    db.prepare(`
      INSERT INTO playback_progress 
        (user_id, profile_id, movie_id, timestamp_seconds, duration_seconds, last_watched)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id, profile_id, movie_id) 
      DO UPDATE SET 
        timestamp_seconds = excluded.timestamp_seconds,
        duration_seconds = excluded.duration_seconds,
        last_watched = CURRENT_TIMESTAMP
    `).run(
      req.user.id,
      profile_id || null,
      movie_id,
      timestamp_seconds,
      duration_seconds || null
    );

    res.json({
      success: true,
      message: 'Progress saved'
    });
  } catch (error) {
    next(error);
  }
});

// Get progress for specific movie
router.get('/:movie_id', (req, res, next) => {
  try {
    const { movie_id } = req.params;
    const { profile_id } = req.query;

    const progress = db.prepare(`
      SELECT * FROM playback_progress 
      WHERE user_id = ? 
        AND (profile_id IS NULL OR profile_id = ?)
        AND movie_id = ?
    `).get(req.user.id, profile_id || null, movie_id);

    if (!progress) {
      return res.json({
        success: true,
        progress: null
      });
    }

    res.json({
      success: true,
      progress
    });
  } catch (error) {
    next(error);
  }
});

// Get all in-progress movies (Continue Watching)
router.get('/', (req, res, next) => {
  try {
    const { profile_id } = req.query;

    // Get movies with progress > 30s and < 95% watched
    const inProgress = db.prepare(`
      SELECT 
        p.*,
        m.title,
        m.year,
        m.poster_url,
        m.genre,
        m.imdb_rating,
        CASE 
          WHEN p.duration_seconds > 0 
          THEN (p.timestamp_seconds / p.duration_seconds) * 100 
          ELSE 0 
        END as progress_percentage
      FROM playback_progress p
      JOIN movies m ON p.movie_id = m.id
      WHERE p.user_id = ?
        AND (p.profile_id IS NULL OR p.profile_id = ?)
        AND p.timestamp_seconds > 30
        AND (
          p.duration_seconds IS NULL 
          OR (p.timestamp_seconds / p.duration_seconds) < 0.95
        )
      ORDER BY p.last_watched DESC
      LIMIT 20
    `).all(req.user.id, profile_id || null);

    res.json({
      success: true,
      movies: inProgress
    });
  } catch (error) {
    next(error);
  }
});

// Delete progress for a movie (reset watch position)
router.delete('/:movie_id', (req, res, next) => {
  try {
    const { movie_id } = req.params;
    const { profile_id } = req.query;

    db.prepare(`
      DELETE FROM playback_progress 
      WHERE user_id = ? 
        AND (profile_id IS NULL OR profile_id = ?)
        AND movie_id = ?
    `).run(req.user.id, profile_id || null, movie_id);

    res.json({
      success: true,
      message: 'Progress deleted'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
