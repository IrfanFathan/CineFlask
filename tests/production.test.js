/**
 * Production Features Integration Tests
 * Tests quota system, validation, and security features
 */

const assert = require('assert');
const db = require('../database/db');
const { isValidUsername, isValidPassword, isWeakPassword } = require('../helpers/validation');
const { getUserUploadStats, canUpload, recordUpload, updateUserQuota } = require('../helpers/quotaManager');

console.log('\n🧪 Running Production Features Integration Tests\n');

let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passedTests++;
  } catch (error) {
    console.log(`✗ ${name}`);
    console.log(`  Error: ${error.message}`);
    failedTests++;
  }
}

// ============================================
// VALIDATION TESTS
// ============================================

test('Username validation accepts valid usernames', () => {
  const result = isValidUsername('john_doe');
  assert.strictEqual(result.valid, true);
});

test('Username validation rejects short usernames', () => {
  const result = isValidUsername('ab');
  assert.strictEqual(result.valid, false);
  assert.ok(result.message.includes('3-20 characters'));
});

test('Username validation rejects special characters', () => {
  const result = isValidUsername('user@name');
  assert.strictEqual(result.valid, false);
  assert.ok(result.message.includes('letters, numbers'));
});

test('Password validation accepts secure passwords', () => {
  const result = isValidPassword('SecurePass123!');
  assert.strictEqual(result.valid, true);
});

test('Password validation rejects short passwords', () => {
  const result = isValidPassword('short');
  assert.strictEqual(result.valid, false);
  assert.ok(result.message.includes('8 characters'));
});

test('Weak password detection works correctly', () => {
  assert.strictEqual(isWeakPassword('password123'), true);
  assert.strictEqual(isWeakPassword('SecureP@ss2024'), false);
});

// ============================================
// QUOTA SYSTEM TESTS
// ============================================

test('Database has quota-related columns', () => {
  const columns = db.prepare("PRAGMA table_info(users)").all();
  const columnNames = columns.map(col => col.name);
  
  assert.ok(columnNames.includes('upload_quota_gb'), 'Missing upload_quota_gb column');
  assert.ok(columnNames.includes('daily_upload_limit'), 'Missing daily_upload_limit column');
  assert.ok(columnNames.includes('is_active'), 'Missing is_active column');
  assert.ok(columnNames.includes('is_admin'), 'Missing is_admin column');
});

test('Upload activity table exists', () => {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='upload_activity'").all();
  assert.strictEqual(tables.length, 1, 'upload_activity table not found');
});

test('Login attempts table exists', () => {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='login_attempts'").all();
  assert.strictEqual(tables.length, 1, 'login_attempts table not found');
});

test('API usage table exists', () => {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='api_usage'").all();
  assert.strictEqual(tables.length, 1, 'api_usage table not found');
});

test('System settings table exists', () => {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='system_settings'").all();
  assert.strictEqual(tables.length, 1, 'system_settings table not found');
});

// ============================================
// QUOTA MANAGER TESTS
// ============================================

// Create a test user for quota tests
let testUserId;
try {
  const bcrypt = require('bcrypt');
  const passwordHash = bcrypt.hashSync('TestPass123!', 12);
  
  const result = db.prepare(`
    INSERT INTO users (username, password_hash, upload_quota_gb, daily_upload_limit, is_active)
    VALUES (?, ?, 100, 10, 1)
  `).run('quota_test_user', passwordHash);
  
  testUserId = result.lastInsertRowid;
} catch (error) {
  // User might already exist from previous test run
  const existingUser = db.prepare("SELECT id FROM users WHERE username = 'quota_test_user'").get();
  if (existingUser) {
    testUserId = existingUser.id;
  } else {
    console.error('Failed to create test user:', error.message);
  }
}

if (testUserId) {
  test('getUserUploadStats returns correct structure', () => {
    const stats = getUserUploadStats(testUserId);
    
    assert.ok(stats.quota, 'Missing quota object');
    assert.ok(stats.daily, 'Missing daily object');
    assert.ok(stats.totals, 'Missing totals object');
    assert.strictEqual(typeof stats.quota.totalGB, 'number');
    assert.strictEqual(typeof stats.daily.limit, 'number');
  });

  test('canUpload allows upload within quota', () => {
    const fileSizeBytes = 1024 * 1024 * 1024; // 1GB
    const result = canUpload(testUserId, fileSizeBytes);
    
    assert.strictEqual(result.allowed, true, 'Should allow upload within quota');
    assert.ok(result.stats, 'Should include stats');
  });

  test('canUpload blocks upload exceeding quota', () => {
    const fileSizeBytes = 200 * 1024 * 1024 * 1024; // 200GB (exceeds 100GB quota)
    const result = canUpload(testUserId, fileSizeBytes);
    
    assert.strictEqual(result.allowed, false, 'Should block upload exceeding quota');
    assert.strictEqual(result.reason, 'quota_exceeded');
    assert.ok(result.message.includes('quota exceeded'), 'Should have descriptive message');
  });

  test('recordUpload creates activity record', () => {
    const fileSizeBytes = 1024 * 1024 * 100; // 100MB
    const today = new Date().toISOString().split('T')[0];
    
    // Clear any existing activity for today
    db.prepare('DELETE FROM upload_activity WHERE user_id = ? AND upload_date = ?').run(testUserId, today);
    
    recordUpload(testUserId, fileSizeBytes);
    
    const activity = db.prepare(`
      SELECT * FROM upload_activity WHERE user_id = ? AND upload_date = ?
    `).get(testUserId, today);
    
    assert.ok(activity, 'Activity record should exist');
    assert.strictEqual(activity.upload_count, 1);
    assert.strictEqual(activity.total_size_bytes, fileSizeBytes);
  });

  test('recordUpload increments existing activity', () => {
    const fileSizeBytes = 1024 * 1024 * 100; // 100MB
    const today = new Date().toISOString().split('T')[0];
    
    recordUpload(testUserId, fileSizeBytes);
    
    const activity = db.prepare(`
      SELECT * FROM upload_activity WHERE user_id = ? AND upload_date = ?
    `).get(testUserId, today);
    
    assert.ok(activity.upload_count >= 2, 'Upload count should increment');
  });

  test('updateUserQuota changes user limits', () => {
    const newQuota = 250;
    const newDailyLimit = 25;
    
    const success = updateUserQuota(testUserId, newQuota, newDailyLimit);
    assert.strictEqual(success, true, 'Update should succeed');
    
    const user = db.prepare('SELECT upload_quota_gb, daily_upload_limit FROM users WHERE id = ?').get(testUserId);
    assert.strictEqual(user.upload_quota_gb, newQuota);
    assert.strictEqual(user.daily_upload_limit, newDailyLimit);
    
    // Restore original values
    updateUserQuota(testUserId, 100, 10);
  });

  test('canUpload blocks after daily limit reached', () => {
    const today = new Date().toISOString().split('T')[0];
    
    // Set upload count to daily limit
    db.prepare(`
      INSERT OR REPLACE INTO upload_activity (user_id, upload_date, upload_count, total_size_bytes)
      VALUES (?, ?, 10, 0)
    `).run(testUserId, today);
    
    const result = canUpload(testUserId, 1024);
    
    assert.strictEqual(result.allowed, false, 'Should block after daily limit');
    assert.strictEqual(result.reason, 'daily_limit');
    
    // Clean up
    db.prepare('DELETE FROM upload_activity WHERE user_id = ? AND upload_date = ?').run(testUserId, today);
  });
}

// ============================================
// SECURITY FEATURES TESTS
// ============================================

test('Movies table has upload_ip column', () => {
  const columns = db.prepare("PRAGMA table_info(movies)").all();
  const columnNames = columns.map(col => col.name);
  assert.ok(columnNames.includes('upload_ip'), 'Missing upload_ip column');
});

test('Movies table has is_approved column', () => {
  const columns = db.prepare("PRAGMA table_info(movies)").all();
  const columnNames = columns.map(col => col.name);
  assert.ok(columnNames.includes('is_approved'), 'Missing is_approved column');
});

test('System settings have default values', () => {
  const settings = db.prepare('SELECT * FROM system_settings').all();
  assert.ok(settings.length > 0, 'System settings should have default values');
  
  const quotaSetting = settings.find(s => s.setting_key === 'default_upload_quota_gb');
  assert.ok(quotaSetting, 'Should have default_upload_quota_gb setting');
  assert.strictEqual(quotaSetting.setting_value, '100');
});

// ============================================
// FILE VALIDATION TESTS
// ============================================

test('Validation helper exports all required functions', () => {
  const validation = require('../helpers/validation');
  assert.strictEqual(typeof validation.isValidEmail, 'function');
  assert.strictEqual(typeof validation.isValidUsername, 'function');
  assert.strictEqual(typeof validation.isValidPassword, 'function');
  assert.strictEqual(typeof validation.sanitizeString, 'function');
  assert.strictEqual(typeof validation.isWeakPassword, 'function');
});

test('Quota manager exports all required functions', () => {
  const quotaManager = require('../helpers/quotaManager');
  assert.strictEqual(typeof quotaManager.getUserUploadStats, 'function');
  assert.strictEqual(typeof quotaManager.canUpload, 'function');
  assert.strictEqual(typeof quotaManager.recordUpload, 'function');
  assert.strictEqual(typeof quotaManager.updateUserQuota, 'function');
  assert.strictEqual(typeof quotaManager.getAllUsersQuotaStatus, 'function');
});

test('Enhanced metadata helper exports required functions', () => {
  const metadata = require('../helpers/metadataEnhanced');
  assert.strictEqual(typeof metadata.fetchMetadata, 'function');
  assert.strictEqual(typeof metadata.fetchMetadataByImdbId, 'function');
  assert.strictEqual(typeof metadata.getCircuitBreakerStatus, 'function');
});

// ============================================
// CLEANUP
// ============================================

// Clean up test user
if (testUserId) {
  try {
    db.prepare('DELETE FROM upload_activity WHERE user_id = ?').run(testUserId);
    db.prepare('DELETE FROM users WHERE id = ?').run(testUserId);
  } catch (error) {
    console.log('Note: Test user cleanup skipped (may not exist)');
  }
}

// ============================================
// RESULTS
// ============================================

console.log('\n==================================================');
console.log(`Tests Passed: ${passedTests}`);
console.log(`Tests Failed: ${failedTests}`);
console.log(`Total: ${passedTests + failedTests}`);
console.log('==================================================\n');

process.exit(failedTests > 0 ? 1 : 0);
