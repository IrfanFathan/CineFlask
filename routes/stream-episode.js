/**
 * Episode Streaming Routes
 * Serves episode video files with HTTP range request support
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const db = require('../database/db');

const router = express.Router();

// Stream episode video with range support (no auth - HTML5 video can't send headers)
router.get('/:id', (req, res, next) => {
  try {
    const { id } = req.params;

    // Get episode from database
    const episode = db.prepare('SELECT * FROM episodes WHERE id = ?').get(id);

    if (!episode) {
      return res.status(404).json({
        success: false,
        message: 'Episode not found'
      });
    }

    // Build full file path
    const videoPath = path.join(__dirname, '..', episode.file_path);

    // Check if file exists
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({
        success: false,
        message: 'Episode video file not found on server'
      });
    }

    // Get file stats
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    // If range header exists, send partial content (required for seek)
    if (range) {
      // Parse range header (format: "bytes=start-end")
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      // Validate range
      if (start >= fileSize || end >= fileSize) {
        res.status(416).set({
          'Content-Range': `bytes */${fileSize}`
        });
        return res.end();
      }

      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(videoPath, { start, end });

      // Set headers for partial content
      res.status(206).set({
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': getContentType(videoPath)
      });

      file.pipe(res);
    } else {
      // No range header - send entire file
      res.status(200).set({
        'Content-Length': fileSize,
        'Content-Type': getContentType(videoPath),
        'Accept-Ranges': 'bytes'
      });

      fs.createReadStream(videoPath).pipe(res);
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
