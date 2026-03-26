/**
 * Watchlist Routes
 * Manages user's favorite/bookmarked movies
 */

const express = require('express');
const db = require('../database/db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get user's watchlist
router.get('/', (req, res, next) => {
  try {
    const { profile_id } = req.query;

    const watchlist = db.prepare(`
      SELECT 
        w.*,
        m.*,
        w.added_at as watchlist_added_at
      FROM watchlist w
      JOIN movies m ON w.movie_id = m.id
      WHERE w.user_id = ?
        AND (w.profile_id IS NULL OR w.profile_id = ?)
      ORDER BY w.added_at DESC
    `).all(req.user.id, profile_id || null);

    res.json({
      success: true,
      movies: watchlist
    });
  } catch (error) {
    next(error);
  }
});

// Add movie to watchlist
router.post('/', (req, res, next) => {
  try {
    const { movie_id, profile_id } = req.body;

    if (!movie_id) {
      return res.status(400).json({
        success: false,
        message: 'movie_id is required'
      });
    }

    // Check if movie exists
    const movie = db.prepare('SELECT id FROM movies WHERE id = ?').get(movie_id);
    
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Add to watchlist (ignore if already exists due to UNIQUE constraint)
    try {
      db.prepare(`
        INSERT INTO watchlist (user_id, profile_id, movie_id)
        VALUES (?, ?, ?)
      `).run(req.user.id, profile_id || null, movie_id);

      res.json({
        success: true,
        message: 'Added to watchlist'
      });
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT') {
        return res.json({
          success: true,
          message: 'Already in watchlist'
        });
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
});

// Remove movie from watchlist
router.delete('/:movie_id', (req, res, next) => {
  try {
    const { movie_id } = req.params;
    const { profile_id } = req.query;

    db.prepare(`
      DELETE FROM watchlist 
      WHERE user_id = ? 
        AND (profile_id IS NULL OR profile_id = ?)
        AND movie_id = ?
    `).run(req.user.id, profile_id || null, movie_id);

    res.json({
      success: true,
      message: 'Removed from watchlist'
    });
  } catch (error) {
    next(error);
  }
});

// Check if movie is in watchlist
router.get('/check/:movie_id', (req, res, next) => {
  try {
    const { movie_id } = req.params;
    const { profile_id } = req.query;

    const item = db.prepare(`
      SELECT id FROM watchlist 
      WHERE user_id = ? 
        AND (profile_id IS NULL OR profile_id = ?)
        AND movie_id = ?
    `).get(req.user.id, profile_id || null, movie_id);

    res.json({
      success: true,
      inWatchlist: !!item
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
