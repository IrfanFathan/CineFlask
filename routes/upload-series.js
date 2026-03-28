/**
 * Series Upload Routes
 * Handles series creation and chunked episode uploads
 */

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const db = require('../database/db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Dynamic import for fetch
let fetch;
(async () => {
  fetch = (await import('node-fetch')).default;
})();

// Configure multer for chunk uploads (reuse from existing upload.js)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(__dirname, '..', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const tempFilename = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    cb(null, tempFilename);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: (parseInt(process.env.MAX_FILE_SIZE_GB) || 50) * 1024 * 1024 * 1024
  }
});

// All routes require authentication
router.use(authMiddleware);

// Initialize series creation (with OMDB fetch)
router.post('/series/init', async (req, res, next) => {
  try {
    const { seriesTitle, imdbId } = req.body;

    if (!seriesTitle && !imdbId) {
      return res.status(400).json({
        success: false,
        message: 'Either seriesTitle or imdbId is required'
      });
    }

    // Fetch metadata from OMDB
    const apiKey = process.env.OMDB_API_KEY;
    let seriesData = {
      title: seriesTitle || 'Unknown Series',
      year: null,
      end_year: null,
      description: 'No description available.',
      poster_url: null,
      backdrop_url: null,
      imdb_id: imdbId || null,
      genre: null,
      creator: null,
      actors: null,
      imdb_rating: null,
      total_seasons: null,
      status: 'Continuing'
    };

    if (apiKey && apiKey !== 'your_omdb_api_key_here') {
      try {
        if (!fetch) {
          fetch = (await import('node-fetch')).default;
        }

        let url;
        if (imdbId) {
          url = `http://www.omdbapi.com/?apikey=${apiKey}&i=${imdbId}&type=series`;
        } else {
          url = `http://www.omdbapi.com/?apikey=${apiKey}&t=${encodeURIComponent(seriesTitle)}&type=series`;
        }

        console.log(`📡 Fetching series metadata from OMDB...`);
        const response = await fetch(url);
        const data = await response.json();

        if (data.Response !== 'False') {
          seriesData.title = data.Title || seriesData.title;
          seriesData.description = data.Plot !== 'N/A' ? data.Plot : seriesData.description;
          seriesData.poster_url = data.Poster !== 'N/A' ? data.Poster : null;
          seriesData.imdb_id = data.imdbID || seriesData.imdb_id;
          seriesData.genre = data.Genre !== 'N/A' ? data.Genre : null;
          seriesData.creator = data.Writer !== 'N/A' ? data.Writer : null;
          seriesData.actors = data.Actors !== 'N/A' ? data.Actors : null;
          seriesData.imdb_rating = data.imdbRating !== 'N/A' ? data.imdbRating : null;
          seriesData.total_seasons = data.totalSeasons !== 'N/A' ? parseInt(data.totalSeasons) : null;
          
          // Parse year range
          if (data.Year && data.Year.includes('–')) {
            const [startYear, endYear] = data.Year.split('–');
            seriesData.year = parseInt(startYear);
            seriesData.end_year = endYear ? parseInt(endYear) : null;
            seriesData.status = endYear ? 'Ended' : 'Continuing';
          } else if (data.Year) {
            seriesData.year = parseInt(data.Year.replace(/\D/g, ''));
          }

          console.log(`✓ Fetched metadata for: ${seriesData.title}`);
        } else {
          console.warn('⚠️  OMDB: Series not found');
        }
      } catch (error) {
        console.warn('⚠️  Could not fetch series metadata:', error.message);
      }
    }

    // Create series record
    const result = db.prepare(`
      INSERT INTO series (
        title, poster_url, backdrop_url, description, year, end_year,
        genre, creator, actors, imdb_rating, imdb_id, total_seasons, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      seriesData.title,
      seriesData.poster_url,
      seriesData.backdrop_url,
      seriesData.description,
      seriesData.year,
      seriesData.end_year,
      seriesData.genre,
      seriesData.creator,
      seriesData.actors,
      seriesData.imdb_rating,
      seriesData.imdb_id,
      seriesData.total_seasons,
      seriesData.status
    );

    const series = db.prepare('SELECT * FROM series WHERE id = ?').get(result.lastInsertRowid);

    // Create series directory
    const seriesDir = path.join(__dirname, '..', 'series', series.id.toString());
    if (!fs.existsSync(seriesDir)) {
      fs.mkdirSync(seriesDir, { recursive: true });
    }

    res.json({
      success: true,
      message: 'Series created successfully',
      seriesId: series.id,
      seriesData: series
    });
  } catch (error) {
    next(error);
  }
});

// Add season to series (with OMDB season metadata fetch)
router.post('/series/season', async (req, res, next) => {
  try {
    const { seriesId, seasonNumber, title, year } = req.body;

    if (!seriesId || seasonNumber === undefined) {
      return res.status(400).json({
        success: false,
        message: 'seriesId and seasonNumber are required'
      });
    }

    // Check if series exists
    const series = db.prepare('SELECT * FROM series WHERE id = ?').get(seriesId);
    
    if (!series) {
      return res.status(404).json({
        success: false,
        message: 'Series not found'
      });
    }

    // Check if season already exists
    const existingSeason = db.prepare(
      'SELECT * FROM seasons WHERE series_id = ? AND season_number = ?'
    ).get(seriesId, seasonNumber);

    if (existingSeason) {
      return res.status(400).json({
        success: false,
        message: 'Season already exists'
      });
    }

    // Fetch season metadata from OMDB
    let episodeCount = null;
    if (series.imdb_id && process.env.OMDB_API_KEY && process.env.OMDB_API_KEY !== 'your_omdb_api_key_here') {
      try {
        if (!fetch) {
          fetch = (await import('node-fetch')).default;
        }

        const url = `http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${series.imdb_id}&Season=${seasonNumber}`;
        console.log(`📡 Fetching season ${seasonNumber} metadata...`);

        const response = await fetch(url);
        const data = await response.json();

        if (data.Response !== 'False' && data.Episodes) {
          episodeCount = data.Episodes.length;
          console.log(`✓ Found ${episodeCount} episodes for season ${seasonNumber}`);
        }
      } catch (error) {
        console.warn('⚠️  Could not fetch season metadata:', error.message);
      }
    }

    // Create season
    const seasonTitle = title || `Season ${seasonNumber}`;
    const result = db.prepare(`
      INSERT INTO seasons (series_id, season_number, title, year, episode_count)
      VALUES (?, ?, ?, ?, ?)
    `).run(seriesId, seasonNumber, seasonTitle, year, episodeCount);

    // Update series total_seasons count
    const seasonCount = db.prepare('SELECT COUNT(*) as count FROM seasons WHERE series_id = ?').get(seriesId);
    db.prepare('UPDATE series SET total_seasons = ? WHERE id = ?').run(seasonCount.count, seriesId);

    const season = db.prepare('SELECT * FROM seasons WHERE id = ?').get(result.lastInsertRowid);

    // Create season directory
    const seasonDir = path.join(__dirname, '..', 'series', seriesId.toString(), `s${seasonNumber}`);
    if (!fs.existsSync(seasonDir)) {
      fs.mkdirSync(seasonDir, { recursive: true });
    }

    res.json({
      success: true,
      message: 'Season created successfully',
      seasonId: season.id,
      season
    });
  } catch (error) {
    next(error);
  }
});

// Initialize episode upload (chunked)
router.post('/episode/init', (req, res, next) => {
  try {
    const { filename, filesize, seasonId, episodeNumber } = req.body;

    if (!filename || !filesize || !seasonId || episodeNumber === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: filename, filesize, seasonId, episodeNumber'
      });
    }

    // Validate file extension
    const ext = path.extname(filename).toLowerCase();
    const allowedExts = ['.mp4', '.mkv', '.avi', '.mov', '.webm', '.m4v'];
    
    if (!allowedExts.includes(ext)) {
      return res.status(400).json({
        success: false,
        message: `Invalid file type. Allowed: ${allowedExts.join(', ')}`
      });
    }

    // Check if season exists
    const season = db.prepare('SELECT * FROM seasons WHERE id = ?').get(seasonId);
    if (!season) {
      return res.status(404).json({
        success: false,
        message: 'Season not found'
      });
    }

    // Check if episode already exists
    const existingEpisode = db.prepare(
      'SELECT * FROM episodes WHERE season_id = ? AND episode_number = ?'
    ).get(seasonId, episodeNumber);

    if (existingEpisode) {
      return res.status(400).json({
        success: false,
        message: 'Episode already exists'
      });
    }

    // Generate unique upload ID
    const uploadId = crypto.randomBytes(16).toString('hex');

    res.json({
      success: true,
      uploadId,
      message: 'Episode upload initialized'
    });
  } catch (error) {
    next(error);
  }
});

// Upload episode chunk (reuse existing chunk upload logic)
router.post('/episode/chunk', upload.single('chunk'), (req, res, next) => {
  try {
    const { uploadId, chunkIndex, totalChunks } = req.body;

    if (!uploadId || chunkIndex === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing uploadId or chunkIndex'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No chunk uploaded'
      });
    }

    // Rename to proper chunk name
    const tempDir = path.join(__dirname, '..', 'temp');
    const properChunkName = `${uploadId}_chunk_${chunkIndex}`;
    const properChunkPath = path.join(tempDir, properChunkName);
    
    if (fs.existsSync(properChunkPath)) {
      fs.unlinkSync(properChunkPath);
    }
    
    fs.renameSync(req.file.path, properChunkPath);

    res.json({
      success: true,
      message: `Chunk ${parseInt(chunkIndex) + 1}/${totalChunks} uploaded`,
      chunkIndex: parseInt(chunkIndex)
    });
  } catch (error) {
    next(error);
  }
});

// Complete episode upload
router.post('/episode/complete', async (req, res, next) => {
  try {
    const { uploadId, seasonId, episodeNumber, filename, totalChunks, title, description } = req.body;

    if (!uploadId || !seasonId || episodeNumber === undefined || !filename || !totalChunks) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Get season and series info
    const season = db.prepare(`
      SELECT s.*, se.id as series_id 
      FROM seasons s
      JOIN series se ON s.series_id = se.id
      WHERE s.id = ?
    `).get(seasonId);

    if (!season) {
      return res.status(404).json({
        success: false,
        message: 'Season not found'
      });
    }

    const tempDir = path.join(__dirname, '..', 'temp');
    const seasonDir = path.join(__dirname, '..', 'series', season.series_id.toString(), `s${season.season_number}`);

    // Ensure season directory exists
    if (!fs.existsSync(seasonDir)) {
      fs.mkdirSync(seasonDir, { recursive: true });
    }

    // Generate final filename
    const ext = path.extname(filename);
    const basename = path.basename(filename, ext);
    const finalFilename = `${Date.now()}_${basename}${ext}`;
    const finalPath = path.join(seasonDir, finalFilename);

    console.log(`Merging ${totalChunks} chunks for episode ${episodeNumber}...`);

    // Merge chunks
    const writeStream = fs.createWriteStream(finalPath);

    for (let i = 0; i < parseInt(totalChunks); i++) {
      const chunkPath = path.join(tempDir, `${uploadId}_chunk_${i}`);
      
      if (!fs.existsSync(chunkPath)) {
        throw new Error(`Missing chunk ${i}`);
      }

      const chunkBuffer = fs.readFileSync(chunkPath);
      writeStream.write(chunkBuffer);
      fs.unlinkSync(chunkPath);
    }

    writeStream.end();

    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    // Get file size
    const stats = fs.statSync(finalPath);
    const relativePath = `series/${season.series_id}/s${season.season_number}/${finalFilename}`;

    // Create episode title from episode number if not provided
    const episodeTitle = title || `Episode ${episodeNumber}`;

    // Save episode to database
    const result = db.prepare(`
      INSERT INTO episodes (
        season_id, series_id, episode_number, title, description,
        filename, file_path, file_size
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      seasonId,
      season.series_id,
      episodeNumber,
      episodeTitle,
      description || null,
      finalFilename,
      relativePath,
      stats.size
    );

    const episode = db.prepare('SELECT * FROM episodes WHERE id = ?').get(result.lastInsertRowid);

    console.log(`✓ Episode ${episodeNumber} uploaded successfully`);

    res.json({
      success: true,
      message: 'Episode uploaded successfully',
      episodeId: episode.id,
      episode
    });

  } catch (error) {
    console.error('Episode upload error:', error);
    next(error);
  }
});

// Cancel upload
router.post('/episode/cancel', (req, res, next) => {
  try {
    const { uploadId, totalChunks } = req.body;

    if (!uploadId) {
      return res.status(400).json({
        success: false,
        message: 'Upload ID required'
      });
    }

    const tempDir = path.join(__dirname, '..', 'temp');

    // Delete all chunks
    for (let i = 0; i < parseInt(totalChunks || 999); i++) {
      const chunkPath = path.join(tempDir, `${uploadId}_chunk_${i}`);
      if (fs.existsSync(chunkPath)) {
        fs.unlinkSync(chunkPath);
      }
    }

    res.json({
      success: true,
      message: 'Upload cancelled'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
