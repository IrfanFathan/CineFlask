/**
 * Production Migration Script
 * Adds upload quotas, activity tracking, and security enhancements
 * Usage: node database/migrate-production.js
 */

const db = require('./db');

console.log('🔄 Running production migration...\n');

try {
  // Add new columns to users table for account management
  const userColumns = db.prepare("PRAGMA table_info(users)").all();
  const userColumnNames = userColumns.map(col => col.name);

  if (!userColumnNames.includes('email')) {
    db.exec(`ALTER TABLE users ADD COLUMN email TEXT`);
    console.log('✓ Added email column to users');
  }

  if (!userColumnNames.includes('is_admin')) {
    db.exec(`ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0`);
    console.log('✓ Added is_admin column to users');
  }

  if (!userColumnNames.includes('is_active')) {
    db.exec(`ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1`);
    console.log('✓ Added is_active column to users');
  }

  if (!userColumnNames.includes('last_login')) {
    db.exec(`ALTER TABLE users ADD COLUMN last_login DATETIME`);
    console.log('✓ Added last_login column to users');
  }

  if (!userColumnNames.includes('upload_quota_gb')) {
    db.exec(`ALTER TABLE users ADD COLUMN upload_quota_gb INTEGER DEFAULT 100`);
    console.log('✓ Added upload_quota_gb column to users');
  }

  if (!userColumnNames.includes('daily_upload_limit')) {
    db.exec(`ALTER TABLE users ADD COLUMN daily_upload_limit INTEGER DEFAULT 10`);
    console.log('✓ Added daily_upload_limit column to users');
  }

  // Add new columns to movies table for better tracking
  const movieColumns = db.prepare("PRAGMA table_info(movies)").all();
  const movieColumnNames = movieColumns.map(col => col.name);

  if (!movieColumnNames.includes('language')) {
    db.exec(`ALTER TABLE movies ADD COLUMN language TEXT`);
    console.log('✓ Added language column to movies');
  }

  if (!movieColumnNames.includes('country')) {
    db.exec(`ALTER TABLE movies ADD COLUMN country TEXT`);
    console.log('✓ Added country column to movies');
  }

  if (!movieColumnNames.includes('upload_ip')) {
    db.exec(`ALTER TABLE movies ADD COLUMN upload_ip TEXT`);
    console.log('✓ Added upload_ip column to movies');
  }

  if (!movieColumnNames.includes('is_approved')) {
    db.exec(`ALTER TABLE movies ADD COLUMN is_approved INTEGER DEFAULT 1`);
    console.log('✓ Added is_approved column to movies');
  }

  // Create upload_activity table for tracking daily uploads
  db.exec(`
    CREATE TABLE IF NOT EXISTS upload_activity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      upload_date DATE NOT NULL,
      upload_count INTEGER DEFAULT 1,
      total_size_bytes INTEGER DEFAULT 0,
      last_upload DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, upload_date)
    )
  `);
  console.log('✓ Upload activity table created');

  // Create login_attempts table for security tracking
  db.exec(`
    CREATE TABLE IF NOT EXISTS login_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      ip_address TEXT NOT NULL,
      success INTEGER NOT NULL,
      attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✓ Login attempts table created');

  // Create api_usage table for tracking API calls
  db.exec(`
    CREATE TABLE IF NOT EXISTS api_usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      api_name TEXT NOT NULL,
      endpoint TEXT,
      user_id INTEGER,
      ip_address TEXT,
      success INTEGER DEFAULT 1,
      error_message TEXT,
      response_time_ms INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);
  console.log('✓ API usage table created');

  // Create system_settings table for configurable limits
  db.exec(`
    CREATE TABLE IF NOT EXISTS system_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      setting_key TEXT UNIQUE NOT NULL,
      setting_value TEXT NOT NULL,
      description TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✓ System settings table created');

  // Insert default system settings
  const settings = [
    ['default_upload_quota_gb', '100', 'Default upload quota per user in GB'],
    ['default_daily_upload_limit', '10', 'Default number of uploads per day per user'],
    ['max_file_size_gb', '50', 'Maximum single file size in GB'],
    ['enable_email_verification', 'false', 'Require email verification for new accounts'],
    ['enable_upload_approval', 'false', 'Require admin approval for uploads'],
    ['max_failed_login_attempts', '5', 'Maximum failed login attempts before lockout'],
    ['lockout_duration_minutes', '30', 'Account lockout duration in minutes'],
    ['api_cache_duration_minutes', '60', 'Duration to cache API responses'],
  ];

  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO system_settings (setting_key, setting_value, description)
    VALUES (?, ?, ?)
  `);

  settings.forEach(([key, value, desc]) => {
    insertSetting.run(key, value, desc);
  });
  console.log('✓ Default system settings inserted');

  // Create indexes for new tables
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_upload_activity_user_date ON upload_activity(user_id, upload_date);
    CREATE INDEX IF NOT EXISTS idx_login_attempts_username ON login_attempts(username);
    CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address);
    CREATE INDEX IF NOT EXISTS idx_api_usage_user ON api_usage(user_id);
    CREATE INDEX IF NOT EXISTS idx_api_usage_api_name ON api_usage(api_name);
    CREATE INDEX IF NOT EXISTS idx_api_usage_created ON api_usage(created_at);
  `);
  console.log('✓ New indexes created');

  console.log('\n✅ Production migration completed successfully!\n');

  // Close database connection
  db.close();

} catch (error) {
  console.error('❌ Migration failed:', error.message);
  console.error(error);
  process.exit(1);
}
