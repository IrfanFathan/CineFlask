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

  // Subtitles table - stores subtitle files for movies
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

  // Series table - stores TV series metadata from OMDB
  db.exec(`
    CREATE TABLE IF NOT EXISTS series (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT,
      poster_url TEXT,
      backdrop_url TEXT,
      description TEXT,
      year INTEGER,
      end_year INTEGER,
      genre TEXT,
      creator TEXT,
      actors TEXT,
      imdb_rating TEXT,
      imdb_id TEXT UNIQUE,
      total_seasons INTEGER,
      status TEXT,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✓ Series table created');

  // Seasons table - stores season information for each series
  db.exec(`
    CREATE TABLE IF NOT EXISTS seasons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      series_id INTEGER NOT NULL,
      season_number INTEGER NOT NULL,
      title TEXT,
      year INTEGER,
      poster_url TEXT,
      episode_count INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE,
      UNIQUE(series_id, season_number)
    )
  `);
  console.log('✓ Seasons table created');

  // Episodes table - stores individual episode information
  db.exec(`
    CREATE TABLE IF NOT EXISTS episodes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      season_id INTEGER NOT NULL,
      series_id INTEGER NOT NULL,
      episode_number INTEGER NOT NULL,
      title TEXT,
      description TEXT,
      filename TEXT,
      file_path TEXT,
      file_size INTEGER,
      duration_seconds INTEGER,
      imdb_rating TEXT,
      runtime TEXT,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (season_id) REFERENCES seasons(id) ON DELETE CASCADE,
      FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE,
      UNIQUE(season_id, episode_number)
    )
  `);
  console.log('✓ Episodes table created');

  // Episode subtitles table - stores subtitle files for episodes
  db.exec(`
    CREATE TABLE IF NOT EXISTS episode_subtitles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      episode_id INTEGER NOT NULL,
      language TEXT NOT NULL,
      label TEXT,
      file_path TEXT,
      is_default INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE
    )
  `);
  console.log('✓ Episode subtitles table created');

  // Episode progress table - stores resume positions for episodes
  db.exec(`
    CREATE TABLE IF NOT EXISTS episode_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      episode_id INTEGER NOT NULL,
      series_id INTEGER NOT NULL,
      profile_id INTEGER NOT NULL,
      timestamp_seconds INTEGER DEFAULT 0,
      duration_seconds INTEGER,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE,
      FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
      UNIQUE(episode_id, profile_id)
    )
  `);
  console.log('✓ Episode progress table created');

  // Series watchlist table - stores watchlist for series
  db.exec(`
    CREATE TABLE IF NOT EXISTS series_watchlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      series_id INTEGER NOT NULL,
      profile_id INTEGER NOT NULL,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
      UNIQUE(series_id, profile_id)
    )
  `);
  console.log('✓ Series watchlist table created');

  // Create indexes for faster queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_movies_uploaded_by ON movies(uploaded_by);
    CREATE INDEX IF NOT EXISTS idx_movies_title ON movies(title);
    CREATE INDEX IF NOT EXISTS idx_progress_user_profile ON playback_progress(user_id, profile_id);
    CREATE INDEX IF NOT EXISTS idx_progress_last_watched ON playback_progress(last_watched);
    CREATE INDEX IF NOT EXISTS idx_watchlist_user_profile ON watchlist(user_id, profile_id);
    CREATE INDEX IF NOT EXISTS idx_profiles_user ON profiles(user_id);
    CREATE INDEX IF NOT EXISTS idx_subtitles_movie ON subtitles(movie_id);
    CREATE INDEX IF NOT EXISTS idx_seasons_series ON seasons(series_id);
    CREATE INDEX IF NOT EXISTS idx_episodes_season ON episodes(season_id);
    CREATE INDEX IF NOT EXISTS idx_episodes_series ON episodes(series_id);
    CREATE INDEX IF NOT EXISTS idx_ep_progress_profile ON episode_progress(profile_id);
    CREATE INDEX IF NOT EXISTS idx_series_watchlist_profile ON series_watchlist(profile_id);
    CREATE INDEX IF NOT EXISTS idx_episode_subtitles_episode ON episode_subtitles(episode_id);
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
