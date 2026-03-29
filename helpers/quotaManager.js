/**
 * Upload Quota Manager
 * Tracks and enforces upload limits per user
 */

const db = require('../database/db');

/**
 * Get user's current upload statistics
 */
function getUserUploadStats(userId) {
  // Get user's quota settings
  const user = db.prepare(`
    SELECT upload_quota_gb, daily_upload_limit
    FROM users
    WHERE id = ?
  `).get(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Get total uploaded size
  const totalStats = db.prepare(`
    SELECT 
      COUNT(*) as total_uploads,
      COALESCE(SUM(file_size), 0) as total_bytes
    FROM movies
    WHERE uploaded_by = ?
  `).get(userId);

  // Get today's uploads
  const today = new Date().toISOString().split('T')[0];
  const todayStats = db.prepare(`
    SELECT upload_count, total_size_bytes
    FROM upload_activity
    WHERE user_id = ? AND upload_date = ?
  `).get(userId, today);

  const totalGB = (totalStats.total_bytes / (1024 * 1024 * 1024)).toFixed(2);
  const quotaGB = user.upload_quota_gb || 100;
  const remainingGB = Math.max(0, quotaGB - parseFloat(totalGB));

  return {
    userId,
    quota: {
      totalGB: quotaGB,
      usedGB: parseFloat(totalGB),
      remainingGB: parseFloat(remainingGB.toFixed(2)),
      percentageUsed: ((parseFloat(totalGB) / quotaGB) * 100).toFixed(1)
    },
    daily: {
      limit: user.daily_upload_limit || 10,
      uploadedToday: todayStats?.upload_count || 0,
      remainingToday: Math.max(0, (user.daily_upload_limit || 10) - (todayStats?.upload_count || 0))
    },
    totals: {
      allTimeUploads: totalStats.total_uploads,
      allTimeBytes: totalStats.total_bytes
    }
  };
}

/**
 * Check if user can upload a file
 */
function canUpload(userId, fileSizeBytes) {
  const stats = getUserUploadStats(userId);
  
  // Check daily limit
  if (stats.daily.uploadedToday >= stats.daily.limit) {
    return {
      allowed: false,
      reason: 'daily_limit',
      message: `Daily upload limit reached (${stats.daily.limit} uploads per day)`,
      stats
    };
  }

  // Check quota limit
  const fileSizeGB = fileSizeBytes / (1024 * 1024 * 1024);
  if (stats.quota.remainingGB < fileSizeGB) {
    return {
      allowed: false,
      reason: 'quota_exceeded',
      message: `Upload quota exceeded. Remaining: ${stats.quota.remainingGB}GB, File size: ${fileSizeGB.toFixed(2)}GB`,
      stats
    };
  }

  return {
    allowed: true,
    stats
  };
}

/**
 * Record upload activity
 */
function recordUpload(userId, fileSizeBytes) {
  const today = new Date().toISOString().split('T')[0];

  // Insert or update daily activity
  const stmt = db.prepare(`
    INSERT INTO upload_activity (user_id, upload_date, upload_count, total_size_bytes, last_upload)
    VALUES (?, ?, 1, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id, upload_date) DO UPDATE SET
      upload_count = upload_count + 1,
      total_size_bytes = total_size_bytes + ?,
      last_upload = CURRENT_TIMESTAMP
  `);

  stmt.run(userId, today, fileSizeBytes, fileSizeBytes);
}

/**
 * Update user quota (admin function)
 */
function updateUserQuota(userId, quotaGB, dailyLimit) {
  const stmt = db.prepare(`
    UPDATE users
    SET upload_quota_gb = ?, daily_upload_limit = ?
    WHERE id = ?
  `);

  const result = stmt.run(quotaGB, dailyLimit, userId);
  return result.changes > 0;
}

/**
 * Get upload activity for date range
 */
function getUploadActivity(userId, startDate, endDate) {
  const stmt = db.prepare(`
    SELECT upload_date, upload_count, total_size_bytes, last_upload
    FROM upload_activity
    WHERE user_id = ? AND upload_date BETWEEN ? AND ?
    ORDER BY upload_date DESC
  `);

  return stmt.all(userId, startDate, endDate);
}

/**
 * Get all users' quota status (admin function)
 */
function getAllUsersQuotaStatus() {
  const stmt = db.prepare(`
    SELECT 
      u.id,
      u.username,
      u.upload_quota_gb,
      u.daily_upload_limit,
      COUNT(m.id) as total_uploads,
      COALESCE(SUM(m.file_size), 0) as total_bytes
    FROM users u
    LEFT JOIN movies m ON u.id = m.uploaded_by
    GROUP BY u.id
  `);

  const users = stmt.all();

  return users.map(user => ({
    userId: user.id,
    username: user.username,
    quotaGB: user.upload_quota_gb,
    usedGB: (user.total_bytes / (1024 * 1024 * 1024)).toFixed(2),
    percentageUsed: ((user.total_bytes / (user.upload_quota_gb * 1024 * 1024 * 1024)) * 100).toFixed(1),
    totalUploads: user.total_uploads
  }));
}

/**
 * Clean up old activity records (keep last 90 days)
 */
function cleanupOldActivity() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 90);
  const cutoff = cutoffDate.toISOString().split('T')[0];

  const stmt = db.prepare(`
    DELETE FROM upload_activity
    WHERE upload_date < ?
  `);

  const result = stmt.run(cutoff);
  return result.changes;
}

module.exports = {
  getUserUploadStats,
  canUpload,
  recordUpload,
  updateUserQuota,
  getUploadActivity,
  getAllUsersQuotaStatus,
  cleanupOldActivity
};
