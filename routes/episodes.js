/**
 * Episodes Routes
 * Episode management with next/prev navigation logic
 */

const express = require('express');
const db = require('../database/db');
const authMiddleware = require('../middleware/authMiddleware');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get episode details with next/prev episode logic
router.get('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const { profile_id } = req.query;

    // Get episode details
    const episode = db.prepare(`
      SELECT 
        e.*,
        s.season_number,
        s.title as season_title,
        ser.id as series_id,
        ser.title as series_title,
        ser.poster_url as series_poster_url
      FROM episodes e
      JOIN seasons s ON e.season_id = s.id
      JOIN series ser ON e.series_id = ser.id
      WHERE e.id = ?
    `).get(id);

    if (!episode) {
      return res.status(404).json({
        success: false,
        message: 'Episode not found'
      });
    }

    // Get subtitles for this episode
    const subtitles = db.prepare(`
      SELECT * FROM episode_subtitles 
      WHERE episode_id = ?
      ORDER BY is_default DESC, language ASC
    `).all(id);

    episode.subtitles = subtitles;

    // Get playback progress
    if (profile_id) {
      const progress = db.prepare(`
        SELECT * FROM episode_progress 
        WHERE episode_id = ? AND profile_id = ?
      `).get(id, profile_id);
      
      episode.progress = progress;
    }

    // Find next episode (same season or next season)
    let nextEpisode = db.prepare(`
      SELECT 
        e.id,
        e.episode_number,
        e.title,
        s.season_number
      FROM episodes e
      JOIN seasons s ON e.season_id = s.id
      WHERE e.season_id = ? AND e.episode_number > ?
      ORDER BY e.episode_number ASC
      LIMIT 1
    `).get(episode.season_id, episode.episode_number);

    // If no next episode in current season, check first episode of next season
    if (!nextEpisode) {
      nextEpisode = db.prepare(`
        SELECT 
          e.id,
          e.episode_number,
          e.title,
          s.season_number
        FROM episodes e
        JOIN seasons s ON e.season_id = s.id
        WHERE s.series_id = ? AND s.season_number > ?
        ORDER BY s.season_number ASC, e.episode_number ASC
        LIMIT 1
      `).get(episode.series_id, episode.season_number);
    }

    episode.next_episode = nextEpisode;

    // Find previous episode (same season or previous season)
    let prevEpisode = db.prepare(`
      SELECT 
        e.id,
        e.episode_number,
        e.title,
        s.season_number
      FROM episodes e
      JOIN seasons s ON e.season_id = s.id
      WHERE e.season_id = ? AND e.episode_number < ?
      ORDER BY e.episode_number DESC
      LIMIT 1
    `).get(episode.season_id, episode.episode_number);

    // If no previous episode in current season, check last episode of previous season
    if (!prevEpisode) {
      prevEpisode = db.prepare(`
        SELECT 
          e.id,
          e.episode_number,
          e.title,
          s.season_number
        FROM episodes e
        JOIN seasons s ON e.season_id = s.id
        WHERE s.series_id = ? AND s.season_number < ?
        ORDER BY s.season_number DESC, e.episode_number DESC
        LIMIT 1
      `).get(episode.series_id, episode.season_number);
    }

    episode.prev_episode = prevEpisode;

    res.json({
      success: true,
      episode
    });
  } catch (error) {
    next(error);
  }
});

// Delete episode
router.delete('/:id', (req, res, next) => {
  try {
    const { id } = req.params;

    const episode = db.prepare('SELECT * FROM episodes WHERE id = ?').get(id);

    if (!episode) {
      return res.status(404).json({
        success: false,
        message: 'Episode not found'
      });
    }

    // Delete video file
    if (episode.file_path) {
      const filePath = path.join(__dirname, '..', episode.file_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete subtitle files
    const subtitles = db.prepare('SELECT * FROM episode_subtitles WHERE episode_id = ?').all(id);
    subtitles.forEach(subtitle => {
      if (subtitle.file_path) {
        const subPath = path.join(__dirname, '..', subtitle.file_path);
        if (fs.existsSync(subPath)) {
          fs.unlinkSync(subPath);
        }
      }
    });

    // Delete episode subtitle directory
    const epSubDir = path.join(__dirname, '..', 'subtitles', 'episodes', id.toString());
    if (fs.existsSync(epSubDir)) {
      fs.rmSync(epSubDir, { recursive: true, force: true });
    }

    // Delete from database (cascade will remove subtitles and progress)
    db.prepare('DELETE FROM episodes WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'Episode deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
