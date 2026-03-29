/**
 * Admin Quota Management Routes
 * Manages user upload quotas and monitors system usage
 */

const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');
const { getAllUsersQuotaStatus, updateUserQuota, getUploadActivity } = require('../helpers/quotaManager');
const { getCircuitBreakerStatus } = require('../helpers/metadataEnhanced');

// Middleware: Admin only routes
router.use(authenticate);
router.use(requireAdmin);

/**
 * GET /api/admin/quota/users
 * Get all users' quota status
 */
router.get('/users', (req, res, next) => {
  try {
    const quotaStatus = getAllUsersQuotaStatus();
    
    res.json({
      success: true,
      users: quotaStatus
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/quota/user/:userId
 * Update user's quota settings
 */
router.put('/user/:userId', (req, res, next) => {
  try {
    const { userId } = req.params;
    const { quotaGB, dailyLimit } = req.body;

    if (!quotaGB || !dailyLimit) {
      return res.status(400).json({
        success: false,
        message: 'quotaGB and dailyLimit are required'
      });
    }

    if (quotaGB < 1 || quotaGB > 10000) {
      return res.status(400).json({
        success: false,
        message: 'Quota must be between 1GB and 10000GB'
      });
    }

    if (dailyLimit < 1 || dailyLimit > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Daily limit must be between 1 and 1000'
      });
    }

    const success = updateUserQuota(userId, quotaGB, dailyLimit);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Quota updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/quota/activity
 * Get upload activity for all users or specific user
 */
router.get('/activity', (req, res, next) => {
  try {
    const { userId, startDate, endDate } = req.query;

    if (userId) {
      // Get activity for specific user
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const end = endDate || new Date().toISOString().split('T')[0];
      
      const activity = getUploadActivity(userId, start, end);
      
      res.json({
        success: true,
        userId: parseInt(userId),
        startDate: start,
        endDate: end,
        activity
      });
    } else {
      // Get today's activity for all users
      const today = new Date().toISOString().split('T')[0];
      const allActivity = db.prepare(`
        SELECT 
          u.id,
          u.username,
          ua.upload_count,
          ua.total_size_bytes,
          ua.last_upload
        FROM users u
        LEFT JOIN upload_activity ua ON u.id = ua.user_id AND ua.upload_date = ?
        ORDER BY ua.upload_count DESC
      `).all(today);

      res.json({
        success: true,
        date: today,
        activity: allActivity
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/quota/stats
 * Get system-wide quota statistics
 */
router.get('/stats', (req, res, next) => {
  try {
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_users,
        SUM(upload_quota_gb) as total_quota_gb,
        AVG(upload_quota_gb) as avg_quota_gb,
        SUM(daily_upload_limit) as total_daily_limit,
        AVG(daily_upload_limit) as avg_daily_limit
      FROM users
      WHERE is_active = 1
    `).get();

    const usage = db.prepare(`
      SELECT 
        COUNT(*) as total_movies,
        COALESCE(SUM(file_size), 0) as total_bytes
      FROM movies
    `).get();

    const today = new Date().toISOString().split('T')[0];
    const todayActivity = db.prepare(`
      SELECT 
        SUM(upload_count) as total_uploads,
        SUM(total_size_bytes) as total_bytes
      FROM upload_activity
      WHERE upload_date = ?
    `).get(today);

    res.json({
      success: true,
      quotas: {
        totalUsers: stats.total_users,
        totalQuotaGB: stats.total_quota_gb,
        avgQuotaGB: parseFloat(stats.avg_quota_gb || 0).toFixed(2),
        totalDailyLimit: stats.total_daily_limit,
        avgDailyLimit: parseFloat(stats.avg_daily_limit || 0).toFixed(2)
      },
      usage: {
        totalMovies: usage.total_movies,
        totalGB: (usage.total_bytes / (1024 * 1024 * 1024)).toFixed(2),
        percentageUsed: ((usage.total_bytes / (stats.total_quota_gb * 1024 * 1024 * 1024)) * 100).toFixed(1)
      },
      today: {
        uploads: todayActivity.total_uploads || 0,
        sizeGB: ((todayActivity.total_bytes || 0) / (1024 * 1024 * 1024)).toFixed(2)
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/quota/api-health
 * Get API health and circuit breaker status
 */
router.get('/api-health', (req, res, next) => {
  try {
    const circuitBreaker = getCircuitBreakerStatus();
    
    // Get recent API usage stats
    const recentCalls = db.prepare(`
      SELECT 
        api_name,
        COUNT(*) as total_calls,
        SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_calls,
        AVG(response_time_ms) as avg_response_time,
        MAX(created_at) as last_call
      FROM api_usage
      WHERE created_at > datetime('now', '-1 hour')
      GROUP BY api_name
    `).all();

    res.json({
      success: true,
      circuitBreaker,
      recentActivity: recentCalls.map(call => ({
        apiName: call.api_name,
        totalCalls: call.total_calls,
        successfulCalls: call.successful_calls,
        successRate: ((call.successful_calls / call.total_calls) * 100).toFixed(1) + '%',
        avgResponseTime: parseFloat(call.avg_response_time || 0).toFixed(0) + 'ms',
        lastCall: call.last_call
      }))
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/quota/login-attempts
 * Get recent login attempts for security monitoring
 */
router.get('/login-attempts', (req, res, next) => {
  try {
    const { limit = 50 } = req.query;

    const attempts = db.prepare(`
      SELECT username, ip_address, success, attempted_at
      FROM login_attempts
      ORDER BY attempted_at DESC
      LIMIT ?
    `).all(limit);

    // Get failed attempts summary
    const failedSummary = db.prepare(`
      SELECT 
        ip_address,
        COUNT(*) as failed_count,
        MAX(attempted_at) as last_attempt
      FROM login_attempts
      WHERE success = 0 AND attempted_at > datetime('now', '-1 hour')
      GROUP BY ip_address
      HAVING failed_count >= 3
      ORDER BY failed_count DESC
    `).all();

    res.json({
      success: true,
      recentAttempts: attempts,
      suspiciousIPs: failedSummary
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/quota/user/:userId/reset
 * Reset user's upload activity (emergency reset)
 */
router.post('/user/:userId/reset', (req, res, next) => {
  try {
    const { userId } = req.params;

    // Delete user's upload activity history
    const result = db.prepare(`
      DELETE FROM upload_activity WHERE user_id = ?
    `).run(userId);

    res.json({
      success: true,
      message: `Reset upload activity for user ${userId}`,
      recordsDeleted: result.changes
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/quota/user/:userId/status
 * Activate or deactivate user account
 */
router.put('/user/:userId/status', (req, res, next) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: 'isActive field is required'
      });
    }

    const result = db.prepare(`
      UPDATE users SET is_active = ? WHERE id = ?
    `).run(isActive ? 1 : 0, userId);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
