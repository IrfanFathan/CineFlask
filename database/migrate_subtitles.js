/**
 * Migration script to add subtitles table
 * Run this to update existing database
 */

const db = require('./db');

console.log('🔄 Adding subtitles support to database...\n');

try {
  // Add subtitles table
  db.exec(`
    CREATE TABLE IF NOT EXISTS subtitles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      movie_id INTEGER NOT NULL,
      language TEXT NOT NULL,
      label TEXT NOT NULL,
      file_path TEXT NOT NULL,
      is_default INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
    )
  `);
  console.log('✓ Subtitles table created');

  // Add index
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_subtitles_movie ON subtitles(movie_id);
  `);
  console.log('✓ Subtitles index created');

  console.log('\n✅ Migration completed successfully!\n');
  
  db.close();
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}
