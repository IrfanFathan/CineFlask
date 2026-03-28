/**
 * Metadata Search Routes
 * Search for movie/series metadata by title or IMDb ID
 */

const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { fetchMetadata, fetchMetadataByImdbId } = require('../helpers/metadata');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Search metadata by title
router.get('/search', async (req, res, next) => {
  try {
    const { title, year } = req.query;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    const metadata = await fetchMetadata(title, year);

    if (!metadata) {
      return res.status(404).json({
        success: false,
        message: 'Metadata not found'
      });
    }

    res.json({
      success: true,
      metadata
    });
  } catch (error) {
    next(error);
  }
});

// Search metadata by IMDb ID
router.get('/search/imdb/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'IMDb ID is required'
      });
    }

    const metadata = await fetchMetadataByImdbId(id);

    if (!metadata) {
      return res.status(404).json({
        success: false,
        message: 'Metadata not found for IMDb ID'
      });
    }

    res.json({
      success: true,
      metadata
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
