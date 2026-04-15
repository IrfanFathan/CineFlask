/**
 * Seasons Routes
 * Season management for TV series
 */

const express = require('express');
const db = require('../database/db');
const authMiddleware = require('../middleware/authMiddleware');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Lazy-load fetch to avoid race condition
let fetch;
async function getFetch() {
  if (!fetch) {
    fetch = (await import('node-fetch')).default;
  }
  return fetch;
}

// All routes require authentication
router.use(authMiddleware);

// Create new season
router.post('/', async (req, res, next) => {
  try {
    const { series_id, season_number, title, year } = req.body;

    if (!series_id || season_number === undefined) {
      return res.status(400).json({
        success: false,
        message: 'series_id and season_number are required'
      });
    }

    // Check if series exists
    const series = db.prepare('SELECT * FROM series WHERE id = ?').get(series_id);
    
    if (!series) {
      return res.status(404).json({
        success: false,
        message: 'Series not found'
      });
    }

    // Check if season already exists
    const existingSeason = db.prepare(
      'SELECT * FROM seasons WHERE series_id = ? AND season_number = ?'
    ).get(series_id, season_number);

    if (existingSeason) {
      return res.status(400).json({
        success: false,
        message: 'Season already exists for this series'
      });
    }

    // Fetch season metadata from OMDB if we have an IMDb ID
    let episodeCount = null;
    let seasonYear = year;

    if (series.imdb_id && process.env.OMDB_API_KEY && process.env.OMDB_API_KEY !== 'your_omdb_api_key_here') {
      try {
        if (!fetch) {
          fetch = (await import('node-fetch')).default;
        }

        const url = `http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${series.imdb_id}&Season=${season_number}`;
        console.log(`📡 Fetching season ${season_number} metadata for ${series.title}...`);

        const fetchFn = await getFetch();
        const response = await fetchFn(url);
        const data = await response.json();

        if (data.Response !== 'False' && data.Episodes) {
          episodeCount = data.Episodes.length;
          console.log(`✓ Found ${episodeCount} episodes for season ${season_number}`);
        }
      } catch (error) {
        console.warn('⚠️  Could not fetch season metadata from OMDB:', error.message);
      }
    }

    // Create season
    const seasonTitle = title || `Season ${season_number}`;
    
    const result = db.prepare(`
      INSERT INTO seasons (series_id, season_number, title, year, episode_count)
      VALUES (?, ?, ?, ?, ?)
    `).run(series_id, season_number, seasonTitle, seasonYear, episodeCount);

    // Update series total_seasons count
    const seasonCount = db.prepare('SELECT COUNT(*) as count FROM seasons WHERE series_id = ?').get(series_id);
    db.prepare('UPDATE series SET total_seasons = ? WHERE id = ?').run(seasonCount.count, series_id);

    const season = db.prepare('SELECT * FROM seasons WHERE id = ?').get(result.lastInsertRowid);

    res.json({
      success: true,
      message: 'Season created successfully',
      season
    });
  } catch (error) {
    next(error);
  }
});

// Get season details with episodes
router.get('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const { profile_id } = req.query;

    // Get season details
    const season = db.prepare(`
      SELECT 
        s.*,
        ser.title as series_title,
        ser.poster_url as series_poster_url
      FROM seasons s
      JOIN series ser ON s.series_id = ser.id
      WHERE s.id = ?
    `).get(id);

    if (!season) {
      return res.status(404).json({
        success: false,
        message: 'Season not found'
      });
    }

    // Get all episodes for this season with progress
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
    `).all(profile_id || null, id);

    season.episodes = episodes;

    res.json({
      success: true,
      season
    });
  } catch (error) {
    next(error);
  }
});

// Delete season and all its episodes
router.delete('/:id', (req, res, next) => {
  try {
    const { id } = req.params;

    const season = db.prepare(`
      SELECT s.*, se.id as series_id 
      FROM seasons s
      JOIN series se ON s.series_id = se.id
      WHERE s.id = ?
    `).get(id);

    if (!season) {
      return res.status(404).json({
        success: false,
        message: 'Season not found'
      });
    }

    // Get all episodes to delete their files
    const episodes = db.prepare('SELECT * FROM episodes WHERE season_id = ?').all(id);

    // Delete all episode video files
    episodes.forEach(episode => {
      if (episode.file_path) {
        const filePath = path.join(__dirname, '..', episode.file_path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      // Delete episode subtitle directory
      const epSubDir = path.join(__dirname, '..', 'subtitles', 'episodes', episode.id.toString());
      if (fs.existsSync(epSubDir)) {
        fs.rmSync(epSubDir, { recursive: true, force: true });
      }
    });

    // Delete season directory
    const seasonDir = path.join(__dirname, '..', 'series', season.series_id.toString(), `s${season.season_number}`);
    if (fs.existsSync(seasonDir)) {
      fs.rmSync(seasonDir, { recursive: true, force: true });
    }

    // Delete from database (cascade will remove episodes)
    db.prepare('DELETE FROM seasons WHERE id = ?').run(id);

    // Update series total_seasons count
    const seasonCount = db.prepare('SELECT COUNT(*) as count FROM seasons WHERE series_id = ?').get(season.series_id);
    db.prepare('UPDATE series SET total_seasons = ? WHERE id = ?').run(seasonCount.count, season.series_id);

    res.json({
      success: true,
      message: 'Season and all episodes deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
