/**
 * Video Streaming Routes
 * Serves video files with HTTP range request support
 * Required for seek functionality on all browsers/devices
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const db = require('../database/db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Stream video with range support (no auth required - HTML5 video can't send custom headers)
router.get('/:id', (req, res, next) => {
  try {
    const { id } = req.params;

    // Get movie from database
    const movie = db.prepare('SELECT * FROM movies WHERE id = ?').get(id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }

    // Build full file path
    const videoPath = path.join(__dirname, '..', movie.file_path);

    // Check if file exists
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({
        success: false,
        message: 'Video file not found on server'
      });
    }

    // Get file stats
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    // Always advertise range support
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Type', getContentType(videoPath));

    // If range header exists, send partial content (required for seek / iOS)
    if (range) {
      // Parse range header (format: "bytes=start-end")
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      // If end is omitted, send 1MB chunks for better buffering
      const CHUNK = 1024 * 1024; // 1 MB
      const end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + CHUNK - 1, fileSize - 1);

      // Validate range - start must be within file, end must not exceed last byte
      if (isNaN(start) || isNaN(end) || start >= fileSize || end >= fileSize || start > end) {
        return res.status(416).set({
          'Content-Range': `bytes */${fileSize}`
        }).end();
      }

      const chunksize = (end - start) + 1;
      const fileStream = fs.createReadStream(videoPath, { start, end });

      // Handle stream errors (e.g. file deleted during playback)
      fileStream.on('error', (err) => {
        console.error('Stream error:', err);
        if (!res.headersSent) {
          res.status(500).end();
        }
      });

      // Set headers for partial content
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': getContentType(videoPath),
        'Cache-Control': 'no-store' // Prevent caching issues on seek
      });

      fileStream.pipe(res);
    } else {
      // No range header - send entire file
      const fileStream = fs.createReadStream(videoPath);

      fileStream.on('error', (err) => {
        console.error('Stream error:', err);
        if (!res.headersSent) res.status(500).end();
      });

      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': getContentType(videoPath),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-store'
      });

      fileStream.pipe(res);
    }

  } catch (error) {
    next(error);
  }
});


/**
 * Get MIME type based on file extension
 */
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.mp4': 'video/mp4',
    '.mkv': 'video/x-matroska',
    '.avi': 'video/x-msvideo',
    '.mov': 'video/quicktime',
    '.webm': 'video/webm',
    '.m4v': 'video/mp4'
  };
  return types[ext] || 'video/mp4';
}

module.exports = router;
