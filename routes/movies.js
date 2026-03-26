/**
 * Movie Routes
 * CRUD operations for movies + search functionality
 */

const express = require('express');
const db = require('../database/db');
const authMiddleware = require('../middleware/authMiddleware');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all movies with optional search
router.get('/', (req, res, next) => {
  try {
    const { q, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT 
        m.*,
        u.username as uploaded_by_username,
        CASE 
          WHEN w.id IS NOT NULL THEN 1 
          ELSE 0 
        END as in_watchlist
      FROM movies m
      JOIN users u ON m.uploaded_by = u.id
      LEFT JOIN watchlist w ON m.id = w.movie_id 
        AND w.user_id = ? 
        AND (w.profile_id IS NULL OR w.profile_id = ?)
    `;

    const params = [req.user.id, req.query.profile_id || null];

    // Search functionality
    if (q) {
      query += ` WHERE (
        m.title LIKE ? OR 
        m.actors LIKE ? OR 
        m.genre LIKE ? OR 
        m.director LIKE ?
      )`;
      const searchTerm = `%${q}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ` ORDER BY m.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const movies = db.prepare(query).all(...params);

    res.json({
      success: true,
      movies,
      count: movies.length
    });
  } catch (error) {
    next(error);
  }
});

// Get single movie by ID
router.get('/:id', (req, res, next) => {
  try {
    const { id } = req.params;

    const movie = db.prepare(`
      SELECT 
        m.*,
        u.username as uploaded_by_username,
        CASE 
          WHEN w.id IS NOT NULL THEN 1 
          ELSE 0 
        END as in_watchlist
      FROM movies m
      JOIN users u ON m.uploaded_by = u.id
      LEFT JOIN watchlist w ON m.id = w.movie_id 
        AND w.user_id = ? 
        AND (w.profile_id IS NULL OR w.profile_id = ?)
      WHERE m.id = ?
    `).get(req.user.id, req.query.profile_id || null, id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    res.json({
      success: true,
      movie
    });
  } catch (error) {
    next(error);
  }
});

// Delete movie (only uploader or admin can delete)
router.delete('/:id', (req, res, next) => {
  try {
    const { id } = req.params;

    const movie = db.prepare('SELECT * FROM movies WHERE id = ?').get(id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Check ownership (in production, you might want admin override)
    if (movie.uploaded_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own uploads'
      });
    }

    // Delete video file from filesystem
    const filePath = path.join(__dirname, '..', movie.file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database (cascade will remove progress and watchlist entries)
    db.prepare('DELETE FROM movies WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'Movie deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
