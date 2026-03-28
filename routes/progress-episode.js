/**
 * Episode Progress Routes
 * Saves and retrieves episode watch positions for resume functionality
 */

const express = require('express');
const db = require('../database/db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Save episode playback progress
router.post('/', (req, res, next) => {
  try {
    const { episodeId, seriesId, profileId, timestampSeconds, durationSeconds } = req.body;

    if (!episodeId || !seriesId || !profileId || timestampSeconds === undefined) {
      return res.status(400).json({
        success: false,
        message: 'episodeId, seriesId, profileId, and timestampSeconds are required'
      });
    }

    // Upsert (insert or update) progress
    db.prepare(`
      INSERT INTO episode_progress 
        (episode_id, series_id, profile_id, timestamp_seconds, duration_seconds, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(episode_id, profile_id) 
      DO UPDATE SET 
        timestamp_seconds = excluded.timestamp_seconds,
        duration_seconds = excluded.duration_seconds,
        updated_at = CURRENT_TIMESTAMP
    `).run(
      episodeId,
      seriesId,
      profileId,
      timestampSeconds,
      durationSeconds || null
    );

    res.json({
      success: true,
      message: 'Progress saved'
    });
  } catch (error) {
    next(error);
  }
});

// Get progress for specific episode
router.get('/:episodeId', (req, res, next) => {
  try {
    const { episodeId } = req.params;
    const { profile_id } = req.query;

    if (!profile_id) {
      return res.status(400).json({
        success: false,
        message: 'profile_id query parameter is required'
      });
    }

    const progress = db.prepare(`
      SELECT * FROM episode_progress 
      WHERE episode_id = ? AND profile_id = ?
    `).get(episodeId, profile_id);

    res.json({
      success: true,
      progress: progress || null
    });
  } catch (error) {
    next(error);
  }
});

// Get all in-progress series (Continue Watching)
router.get('/', (req, res, next) => {
  try {
    const { profile_id } = req.query;

    if (!profile_id) {
      return res.status(400).json({
        success: false,
        message: 'profile_id query parameter is required'
      });
    }

    // Get series with recent episode progress > 30s and < 95% watched
    const inProgress = db.prepare(`
      SELECT 
        ep.*,
        s.title as series_title,
        s.poster_url,
        s.genre,
        s.imdb_rating,
        e.episode_number,
        e.title as episode_title,
        e.id as episode_id,
        se.season_number,
        CASE 
          WHEN ep.duration_seconds > 0 
          THEN (ep.timestamp_seconds * 1.0 / ep.duration_seconds) * 100 
          ELSE 0 
        END as progress_percentage
      FROM episode_progress ep
      JOIN episodes e ON ep.episode_id = e.id
      JOIN seasons se ON e.season_id = se.id
      JOIN series s ON ep.series_id = s.id
      WHERE ep.profile_id = ?
        AND ep.timestamp_seconds > 30
        AND (
          ep.duration_seconds IS NULL 
          OR (ep.timestamp_seconds * 1.0 / ep.duration_seconds) < 0.95
        )
      ORDER BY ep.updated_at DESC
      LIMIT 20
    `).all(profile_id);

    // Group by series (show only most recent episode per series)
    const seriesMap = new Map();
    inProgress.forEach(item => {
      if (!seriesMap.has(item.series_id)) {
        seriesMap.set(item.series_id, item);
      }
    });

    const series = Array.from(seriesMap.values());

    res.json({
      success: true,
      series
    });
  } catch (error) {
    next(error);
  }
});

// Delete progress for an episode
router.delete('/:episodeId', (req, res, next) => {
  try {
    const { episodeId } = req.params;
    const { profile_id } = req.query;

    if (!profile_id) {
      return res.status(400).json({
        success: false,
        message: 'profile_id query parameter is required'
      });
    }

    db.prepare(`
      DELETE FROM episode_progress 
      WHERE episode_id = ? AND profile_id = ?
    `).run(episodeId, profile_id);

    res.json({
      success: true,
      message: 'Progress deleted'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
