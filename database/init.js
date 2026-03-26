/**
 * Database Initialization Script
 * Run this once to create all tables
 * Usage: node database/init.js
 */

const db = require('./db');

console.log('🗄️  Initializing CineLocal database...\n');

try {
  // Users table - stores authentication data
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✓ Users table created');

  // Profiles table - multiple profiles per user (like Netflix)
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      profile_name TEXT NOT NULL,
      avatar_color TEXT DEFAULT '#7c5cfc',
      is_kids INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, profile_name)
    )
  `);
  console.log('✓ Profiles table created');

  // Movies table - stores video metadata from OMDB
  db.exec(`
    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      year TEXT,
      description TEXT,
      file_path TEXT NOT NULL,
      file_size INTEGER,
      poster_url TEXT,
      imdb_id TEXT,
      genre TEXT,
      actors TEXT,
      director TEXT,
      runtime TEXT,
      imdb_rating TEXT,
      uploaded_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log('✓ Movies table created');

  // Playback progress table - stores resume positions
  db.exec(`
    CREATE TABLE IF NOT EXISTS playback_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      profile_id INTEGER,
      movie_id INTEGER NOT NULL,
      timestamp_seconds REAL NOT NULL DEFAULT 0,
      duration_seconds REAL,
      last_watched DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
      UNIQUE(user_id, profile_id, movie_id)
    )
  `);
  console.log('✓ Playback progress table created');

  // Watchlist table - favorites/bookmark feature
  db.exec(`
    CREATE TABLE IF NOT EXISTS watchlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      profile_id INTEGER,
      movie_id INTEGER NOT NULL,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
      UNIQUE(user_id, profile_id, movie_id)
    )
  `);
  console.log('✓ Watchlist table created');

  // Create indexes for faster queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_movies_uploaded_by ON movies(uploaded_by);
    CREATE INDEX IF NOT EXISTS idx_movies_title ON movies(title);
    CREATE INDEX IF NOT EXISTS idx_progress_user_profile ON playback_progress(user_id, profile_id);
    CREATE INDEX IF NOT EXISTS idx_progress_last_watched ON playback_progress(last_watched);
    CREATE INDEX IF NOT EXISTS idx_watchlist_user_profile ON watchlist(user_id, profile_id);
    CREATE INDEX IF NOT EXISTS idx_profiles_user ON profiles(user_id);
  `);
  console.log('✓ Database indexes created');

  console.log('\n✅ Database initialized successfully!\n');
  console.log('You can now start the server with: npm start\n');

  // Close database connection
  db.close();

} catch (error) {
  console.error('❌ Database initialization failed:', error.message);
  process.exit(1);
}
