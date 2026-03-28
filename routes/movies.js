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

// Get all movies with optional search and filters
router.get('/', (req, res, next) => {
  try {
    const { 
      q, 
      genre, 
      year_min, 
      year_max, 
      rating_min,
      language,
      sort_by = 'created_at',
      sort_order = 'DESC',
      limit = 50, 
      offset = 0 
    } = req.query;

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
    const conditions = [];

    // Search functionality
    if (q) {
      conditions.push(`(
        m.title LIKE ? OR 
        m.actors LIKE ? OR 
        m.genre LIKE ? OR 
        m.director LIKE ?
      )`);
      const searchTerm = `%${q}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Genre filter
    if (genre) {
      conditions.push('m.genre LIKE ?');
      params.push(`%${genre}%`);
    }

    // Year range filter
    if (year_min) {
      conditions.push('CAST(m.year AS INTEGER) >= ?');
      params.push(parseInt(year_min));
    }

    if (year_max) {
      conditions.push('CAST(m.year AS INTEGER) <= ?');
      params.push(parseInt(year_max));
    }

    // Rating filter
    if (rating_min) {
      conditions.push('CAST(m.imdb_rating AS REAL) >= ?');
      params.push(parseFloat(rating_min));
    }

    // Language filter
    if (language) {
      conditions.push('m.language LIKE ?');
      params.push(`%${language}%`);
    }

    // Add WHERE clause if there are conditions
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Sort options
    const allowedSortFields = ['title', 'year', 'imdb_rating', 'created_at'];
    const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY m.${sortField} ${sortDirection} LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const movies = db.prepare(query).all(...params);

    res.json({
      success: true,
      movies,
      count: movies.length,
      filters: { q, genre, year_min, year_max, rating_min, language, sort_by, sort_order }
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

// Update movie metadata (only uploader can edit)
router.put('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      year,
      description,
      poster_url,
      genre,
      actors,
      director,
      runtime,
      imdb_rating,
      imdb_id,
      language,
      country
    } = req.body;

    const movie = db.prepare('SELECT * FROM movies WHERE id = ?').get(id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Check ownership
    if (movie.uploaded_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own uploads'
      });
    }

    // Update movie metadata
    const updateStmt = db.prepare(`
      UPDATE movies SET
        title = COALESCE(?, title),
        year = COALESCE(?, year),
        description = COALESCE(?, description),
        poster_url = COALESCE(?, poster_url),
        genre = COALESCE(?, genre),
        actors = COALESCE(?, actors),
        director = COALESCE(?, director),
        runtime = COALESCE(?, runtime),
        imdb_rating = COALESCE(?, imdb_rating),
        imdb_id = COALESCE(?, imdb_id),
        language = COALESCE(?, language),
        country = COALESCE(?, country)
      WHERE id = ?
    `);

    updateStmt.run(
      title || null,
      year || null,
      description || null,
      poster_url || null,
      genre || null,
      actors || null,
      director || null,
      runtime || null,
      imdb_rating || null,
      imdb_id || null,
      language || null,
      country || null,
      id
    );

    // Get updated movie
    const updatedMovie = db.prepare('SELECT * FROM movies WHERE id = ?').get(id);

    res.json({
      success: true,
      message: 'Movie updated successfully',
      movie: updatedMovie
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
