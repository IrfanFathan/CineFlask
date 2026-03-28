/**
 * Phase 3 Integration Tests
 */

const assert = require('assert');

console.log('🧪 Running Phase 3 Tests (Admin & OpenSubtitles)\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(`  ${error.message}`);
    failed++;
  }
}

// Test 1: Admin Routes File Exists
test('Admin routes file exists', () => {
  const fs = require('fs');
  assert(fs.existsSync('routes/admin.js'), 'routes/admin.js not found');
});

// Test 2: OpenSubtitles Routes File Exists
test('OpenSubtitles routes file exists', () => {
  const fs = require('fs');
  assert(fs.existsSync('routes/opensubtitles.js'), 'routes/opensubtitles.js not found');
});

// Test 3: Batch Upload Frontend Exists
test('Batch upload page exists', () => {
  const fs = require('fs');
  assert(fs.existsSync('public/batch-upload.html'), 'public/batch-upload.html not found');
});

// Test 4: OpenSubtitles Helper Structure
test('OpenSubtitles helper exports correctly', () => {
  const os = require('../helpers/opensubtitles');
  assert(typeof os.isConfigured === 'function');
  assert(typeof os.searchByImdbId === 'function');
  assert(typeof os.getDownloadLink === 'function');
});

// Test 5: Verify authMiddleware modifications
test('authMiddleware exports standard and admin auth', () => {
  const auth = require('../middleware/authMiddleware');
  assert(typeof auth === 'function', 'authMiddleware default should be a function');
  assert(typeof auth.requireAdmin === 'function', 'requireAdmin should be exported');
});

// Summary
console.log(`\n${'='.repeat(50)}`);
console.log(`Tests Passed: ${passed}`);
console.log(`Tests Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);
console.log('='.repeat(50));

process.exit(failed > 0 ? 1 : 0);
