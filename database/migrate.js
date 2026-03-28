/**
 * Database Migration Script
 * Adds new fields to existing database tables
 * Usage: node database/migrate.js
 */

const db = require('./db');

console.log('🔄 Running database migrations...\n');

try {
  // Check if language column exists in movies table
  const moviesColumns = db.prepare("PRAGMA table_info(movies)").all();
  const hasLanguage = moviesColumns.some(col => col.name === 'language');
  const hasCountry = moviesColumns.some(col => col.name === 'country');

  if (!hasLanguage) {
    db.exec(`ALTER TABLE movies ADD COLUMN language TEXT`);
    console.log('✓ Added language column to movies table');
  } else {
    console.log('⏭️  Language column already exists in movies table');
  }

  if (!hasCountry) {
    db.exec(`ALTER TABLE movies ADD COLUMN country TEXT`);
    console.log('✓ Added country column to movies table');
  } else {
    console.log('⏭️  Country column already exists in movies table');
  }

  // Check if language column exists in series table
  const seriesColumns = db.prepare("PRAGMA table_info(series)").all();
  const seriesHasLanguage = seriesColumns.some(col => col.name === 'language');
  const seriesHasCountry = seriesColumns.some(col => col.name === 'country');

  if (!seriesHasLanguage) {
    db.exec(`ALTER TABLE series ADD COLUMN language TEXT`);
    console.log('✓ Added language column to series table');
  } else {
    console.log('⏭️  Language column already exists in series table');
  }

  if (!seriesHasCountry) {
    db.exec(`ALTER TABLE series ADD COLUMN country TEXT`);
    console.log('✓ Added country column to series table');
  } else {
    console.log('⏭️  Country column already exists in series table');
  }

  console.log('\n✅ Database migrations completed successfully!\n');

  // Close database connection
  db.close();

} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}
