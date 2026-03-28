/**
 * Series Routes
 * CRUD operations for TV series + search functionality
 */

const express = require('express');
const db = require('../database/db');
const authMiddleware = require('../middleware/authMiddleware');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all series with optional search and filters
router.get('/', (req, res, next) => {
  try {
    const { 
      q, 
      profile_id, 
      genre,
      year_min,
      year_max,
      rating_min,
      language,
      status,
      sort_by = 'uploaded_at',
      sort_order = 'DESC',
      limit = 50, 
      offset = 0 
    } = req.query;

    let query = `
      SELECT 
        s.*,
        (SELECT COUNT(*) FROM seasons WHERE series_id = s.id) as season_count,
        CASE 
          WHEN sw.id IS NOT NULL THEN 1 
          ELSE 0 
        END as in_watchlist
      FROM series s
      LEFT JOIN series_watchlist sw ON s.id = sw.series_id 
        AND sw.profile_id = ?
    `;

    const params = [profile_id || null];
    const conditions = [];

    // Search functionality
    if (q) {
      conditions.push(`(
        s.title LIKE ? OR 
        s.actors LIKE ? OR 
        s.genre LIKE ? OR 
        s.creator LIKE ?
      )`);
      const searchTerm = `%${q}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Genre filter
    if (genre) {
      conditions.push('s.genre LIKE ?');
      params.push(`%${genre}%`);
    }

    // Year range filter
    if (year_min) {
      conditions.push('s.year >= ?');
      params.push(parseInt(year_min));
    }

    if (year_max) {
      conditions.push('(s.end_year IS NULL AND s.year <= ?) OR (s.end_year IS NOT NULL AND s.end_year <= ?)');
      params.push(parseInt(year_max), parseInt(year_max));
    }

    // Rating filter
    if (rating_min) {
      conditions.push('CAST(s.imdb_rating AS REAL) >= ?');
      params.push(parseFloat(rating_min));
    }

    // Language filter
    if (language) {
      conditions.push('s.language LIKE ?');
      params.push(`%${language}%`);
    }

    // Status filter
    if (status) {
      conditions.push('s.status = ?');
      params.push(status);
    }

    // Add WHERE clause if there are conditions
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Sort options
    const allowedSortFields = ['title', 'year', 'imdb_rating', 'uploaded_at'];
    const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'uploaded_at';
    const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY s.${sortField} ${sortDirection} LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const series = db.prepare(query).all(...params);

    res.json({
      success: true,
      series,
      count: series.length,
      filters: { q, genre, year_min, year_max, rating_min, language, status, sort_by, sort_order }
    });
  } catch (error) {
    next(error);
  }
});

// Get single series by ID with all seasons and episodes
router.get('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const { profile_id } = req.query;

    // Get series details
    const series = db.prepare(`
      SELECT 
        s.*,
        CASE 
          WHEN sw.id IS NOT NULL THEN 1 
          ELSE 0 
        END as in_watchlist
      FROM series s
      LEFT JOIN series_watchlist sw ON s.id = sw.series_id 
        AND sw.profile_id = ?
      WHERE s.id = ?
    `).get(profile_id || null, id);

    if (!series) {
      return res.status(404).json({
        success: false,
        message: 'Series not found'
      });
    }

    // Get all seasons with their episodes
    const seasons = db.prepare(`
      SELECT * FROM seasons 
      WHERE series_id = ? 
      ORDER BY season_number ASC
    `).all(id);

    // For each season, get episodes with progress
    seasons.forEach(season => {
      const episodes = db.prepare(`
        SELECT 
          e.*,
          ep.timestamp_seconds,
          ep.duration_seconds,
          CASE 
            WHEN ep.duration_seconds > 0 
            THEN (ep.timestamp_seconds * 1.0 / ep.duration_seconds) * 100 
            ELSE 0 
          END as progress_percentage
        FROM episodes e
        LEFT JOIN episode_progress ep ON e.id = ep.episode_id 
          AND ep.profile_id = ?
        WHERE e.season_id = ?
        ORDER BY e.episode_number ASC
      `).all(profile_id || null, season.id);
      
      season.episodes = episodes;
    });

    series.seasons = seasons;

    res.json({
      success: true,
      series
    });
  } catch (error) {
    next(error);
  }
});

// Update series metadata
router.put('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      poster_url,
      backdrop_url,
      year,
      end_year,
      genre,
      creator,
      actors,
      imdb_rating,
      imdb_id,
      total_seasons,
      status,
      language,
      country
    } = req.body;

    const series = db.prepare('SELECT * FROM series WHERE id = ?').get(id);

    if (!series) {
      return res.status(404).json({
        success: false,
        message: 'Series not found'
      });
    }

    // Update series metadata
    const updateStmt = db.prepare(`
      UPDATE series SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        poster_url = COALESCE(?, poster_url),
        backdrop_url = COALESCE(?, backdrop_url),
        year = COALESCE(?, year),
        end_year = COALESCE(?, end_year),
        genre = COALESCE(?, genre),
        creator = COALESCE(?, creator),
        actors = COALESCE(?, actors),
        imdb_rating = COALESCE(?, imdb_rating),
        imdb_id = COALESCE(?, imdb_id),
        total_seasons = COALESCE(?, total_seasons),
        status = COALESCE(?, status),
        language = COALESCE(?, language),
        country = COALESCE(?, country)
      WHERE id = ?
    `);

    updateStmt.run(
      title || null,
      description || null,
      poster_url || null,
      backdrop_url || null,
      year || null,
      end_year || null,
      genre || null,
      creator || null,
      actors || null,
      imdb_rating || null,
      imdb_id || null,
      total_seasons || null,
      status || null,
      language || null,
      country || null,
      id
    );

    // Get updated series
    const updatedSeries = db.prepare('SELECT * FROM series WHERE id = ?').get(id);

    res.json({
      success: true,
      message: 'Series updated successfully',
      series: updatedSeries
    });
  } catch (error) {
    next(error);
  }
});

// Delete series (and all associated files)
router.delete('/:id', (req, res, next) => {
  try {
    const { id } = req.params;

    const series = db.prepare('SELECT * FROM series WHERE id = ?').get(id);

    if (!series) {
      return res.status(404).json({
        success: false,
        message: 'Series not found'
      });
    }

    // Get all episodes to delete their files
    const episodes = db.prepare(`
      SELECT file_path FROM episodes WHERE series_id = ?
    `).all(id);

    // Delete all episode video files
    episodes.forEach(episode => {
      if (episode.file_path) {
        const filePath = path.join(__dirname, '..', episode.file_path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    });

    // Delete all episode subtitle files
    const subtitles = db.prepare(`
      SELECT es.file_path 
      FROM episode_subtitles es
      JOIN episodes e ON es.episode_id = e.id
      WHERE e.series_id = ?
    `).all(id);

    subtitles.forEach(subtitle => {
      if (subtitle.file_path) {
        const filePath = path.join(__dirname, '..', subtitle.file_path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    });

    // Delete series directory
    const seriesDir = path.join(__dirname, '..', 'series', id.toString());
    if (fs.existsSync(seriesDir)) {
      fs.rmSync(seriesDir, { recursive: true, force: true });
    }

    // Delete series subtitle directory
    const seriesSubDir = path.join(__dirname, '..', 'subtitles', 'episodes');
    const episodeIds = db.prepare('SELECT id FROM episodes WHERE series_id = ?').all(id);
    episodeIds.forEach(ep => {
      const epSubDir = path.join(seriesSubDir, ep.id.toString());
      if (fs.existsSync(epSubDir)) {
        fs.rmSync(epSubDir, { recursive: true, force: true });
      }
    });

    // Delete from database (cascade will remove seasons, episodes, etc.)
    db.prepare('DELETE FROM series WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'Series deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
