#!/usr/bin/env node
/**
 * Cleanup Script for Temporary Upload Files
 * 
 * This script removes orphaned chunk files from the temp directory
 * that are older than 24 hours.
 * 
 * Usage:
 *   node scripts/cleanup-temp.js
 *   
 * Schedule with cron (daily at 2 AM):
 *   0 2 * * * /usr/bin/node /path/to/CineFlask/scripts/cleanup-temp.js
 */

const fs = require('fs');
const path = require('path');

const TEMP_DIR = path.join(__dirname, '..', 'temp');
const MAX_AGE_HOURS = 24;
const MAX_AGE_MS = MAX_AGE_HOURS * 60 * 60 * 1000;

console.log('🧹 Starting temp directory cleanup...');
console.log(`📁 Directory: ${TEMP_DIR}`);
console.log(`⏱️  Max age: ${MAX_AGE_HOURS} hours`);

try {
  if (!fs.existsSync(TEMP_DIR)) {
    console.log('❌ Temp directory does not exist');
    process.exit(1);
  }

  const files = fs.readdirSync(TEMP_DIR);
  let deletedCount = 0;
  let deletedSize = 0;
  let skippedCount = 0;

  const now = Date.now();

  for (const file of files) {
    // Skip .gitkeep and other non-chunk files
    if (file === '.gitkeep' || !file.includes('_chunk_')) {
      skippedCount++;
      continue;
    }

    const filePath = path.join(TEMP_DIR, file);
    const stats = fs.statSync(filePath);
    const age = now - stats.mtimeMs;

    if (age > MAX_AGE_MS) {
      console.log(`  🗑️  Deleting: ${file} (age: ${Math.round(age / (60 * 60 * 1000))}h)`);
      fs.unlinkSync(filePath);
      deletedCount++;
      deletedSize += stats.size;
    } else {
      skippedCount++;
    }
  }

  const deletedSizeMB = (deletedSize / (1024 * 1024)).toFixed(2);
  
  console.log('\n✅ Cleanup complete!');
  console.log(`   Deleted: ${deletedCount} files (${deletedSizeMB} MB)`);
  console.log(`   Skipped: ${skippedCount} files`);

} catch (error) {
  console.error('❌ Cleanup failed:', error.message);
  process.exit(1);
}
