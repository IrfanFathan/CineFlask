/**
 * Admin Dashboard Routes
 * Provides system statistics, user management, and administrative controls
 */

const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');
const { getStats, clearAll, clearMetadata, clearMovieLists } = require('../helpers/cache');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

// Middleware: Admin only routes
router.use(authenticate);
router.use(requireAdmin);

/**
 * GET /api/admin/stats
 * Get comprehensive system statistics
 */
router.get('/stats', async (req, res) => {
  try {
    // Database statistics
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const profileCount = db.prepare('SELECT COUNT(*) as count FROM profiles').get().count;
    const movieCount = db.prepare('SELECT COUNT(*) as count FROM movies').get().count;
    const seriesCount = db.prepare('SELECT COUNT(*) as count FROM series').get().count;
    const episodeCount = db.prepare('SELECT COUNT(*) as count FROM episodes').get().count;
    
    // Storage statistics
    const moviesSize = db.prepare('SELECT COALESCE(SUM(file_size), 0) as size FROM movies').get().size;
    const episodesSize = db.prepare('SELECT COALESCE(SUM(file_size), 0) as size FROM episodes').get().size;
    const totalMediaSize = moviesSize + episodesSize;
    
    // Recent activity
    const recentUploads = db.prepare(`
      SELECT title, created_at FROM movies 
      ORDER BY created_at DESC LIMIT 5
    `).all();
    
    const recentSeries = db.prepare(`
      SELECT title, uploaded_at FROM series 
      ORDER BY uploaded_at DESC LIMIT 5
    `).all();
    
    // Most watched
    const mostWatchedMovies = db.prepare(`
      SELECT m.title, COUNT(DISTINCT p.profile_id) as watch_count
      FROM playback_progress p
      JOIN movies m ON p.movie_id = m.id
      GROUP BY m.id
      ORDER BY watch_count DESC
      LIMIT 5
    `).all();
    
    const mostWatchedSeries = db.prepare(`
      SELECT s.title, COUNT(DISTINCT ep.profile_id) as watch_count
      FROM episode_progress ep
      JOIN episodes e ON ep.episode_id = e.id
      JOIN series s ON e.series_id = s.id
      GROUP BY s.id
      ORDER BY watch_count DESC
      LIMIT 5
    `).all();
    
    // Cache statistics
    const cacheStats = getStats();
    
    // Disk usage
    const uploadsPath = path.join(__dirname, '..', 'uploads');
    let diskUsage = null;
    try {
      const { stdout } = await exec(`du -sh "${uploadsPath}" 2>/dev/null || echo "N/A"`);
      diskUsage = stdout.trim().split('\t')[0];
    } catch (error) {
      diskUsage = 'N/A';
    }
    
    // Database file size
    const dbPath = path.join(__dirname, '..', 'cinelocal.db');
    let dbSize = 0;
    try {
      const stats = fs.statSync(dbPath);
      dbSize = stats.size;
    } catch (error) {
      dbSize = 0;
    }
    
    res.json({
      success: true,
      stats: {
        database: {
          users: userCount,
          profiles: profileCount,
          movies: movieCount,
          series: seriesCount,
          episodes: episodeCount,
          dbSize: formatBytes(dbSize)
        },
        storage: {
          moviesSize: formatBytes(moviesSize),
          episodesSize: formatBytes(episodesSize),
          totalMediaSize: formatBytes(totalMediaSize),
          diskUsage: diskUsage
        },
        cache: {
          metadata: cacheStats.metadata,
          movieList: cacheStats.movieList
        },
        recentActivity: {
          uploads: recentUploads,
          series: recentSeries
        },
        popular: {
          movies: mostWatchedMovies,
          series: mostWatchedSeries
        }
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

/**
 * GET /api/admin/users
 * Get all users with their statistics
 */
router.get('/users', (req, res) => {
  try {
    const users = db.prepare(`
      SELECT 
        u.id,
        u.username,
        u.created_at,
        COUNT(DISTINCT p.id) as profile_count,
        COUNT(DISTINCT m.id) as uploaded_movies,
        COUNT(DISTINCT s.id) as uploaded_series
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN movies m ON u.id = m.uploaded_by
      LEFT JOIN series s ON u.id = s.uploaded_by
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `).all();
    
    res.json({
      success: true,
      users: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Delete a user (admin only)
 */
router.delete('/users/:id', (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Prevent deleting yourself
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account'
      });
    }
    
    // Check if user exists
    const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Delete user (cascades will handle related data)
    db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    
    res.json({
      success: true,
      message: `User ${user.username} deleted successfully`
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
});

/**
 * POST /api/admin/cache/clear
 * Clear all caches
 */
router.post('/cache/clear', (req, res) => {
  try {
    const { type } = req.body;
    
    if (type === 'metadata') {
      clearMetadata();
    } else if (type === 'lists') {
      clearMovieLists();
    } else {
      clearAll();
    }
    
    res.json({
      success: true,
      message: `Cache cleared: ${type || 'all'}`
    });
  } catch (error) {
    console.error('Clear cache error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache'
    });
  }
});

/**
 * GET /api/admin/logs
 * Get recent server logs (if available)
 */
router.get('/logs', async (req, res) => {
  try {
    const logFile = path.join(__dirname, '..', 'server.log');
    const lines = parseInt(req.query.lines) || 100;
    
    if (!fs.existsSync(logFile)) {
      return res.json({
        success: true,
        logs: [],
        message: 'No log file available'
      });
    }
    
    const { stdout } = await exec(`tail -n ${lines} "${logFile}"`);
    const logs = stdout.trim().split('\n');
    
    res.json({
      success: true,
      logs: logs
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch logs'
    });
  }
});

/**
 * GET /api/admin/system
 * Get system information
 */
router.get('/system', async (req, res) => {
  try {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    res.json({
      success: true,
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: formatUptime(uptime),
        memory: {
          rss: formatBytes(memoryUsage.rss),
          heapTotal: formatBytes(memoryUsage.heapTotal),
          heapUsed: formatBytes(memoryUsage.heapUsed),
          external: formatBytes(memoryUsage.external)
        },
        cpu: process.cpuUsage()
      }
    });
  } catch (error) {
    console.error('Get system info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch system information'
    });
  }
});

// Helper functions
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  
  return parts.join(' ');
}

module.exports = router;
