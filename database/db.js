/**
 * Database Connection Module
 * Provides a singleton SQLite database connection using better-sqlite3
 * All queries are synchronous for simplicity
 */

const Database = require('better-sqlite3');
const path = require('path');

// Database file location (root of project)
const DB_PATH = path.join(__dirname, '..', 'cinelocal.db');

// Create database connection
// verbose: logs all SQL queries (useful for debugging, can be removed in production)
const db = new Database(DB_PATH, { 
  verbose: process.env.NODE_ENV === 'development' ? console.log : null 
});

// Enable foreign keys (SQLite disables them by default)
db.pragma('foreign_keys = ON');

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');

module.exports = db;
