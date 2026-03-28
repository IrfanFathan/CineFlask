/**
 * Input Validation Middleware
 * Common validation rules using express-validator
 */

const { body, param, query, validationResult } = require('express-validator');

// Middleware to check validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Common validation rules
const validators = {
  // Authentication
  register: [
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .isAlphanumeric()
      .withMessage('Username must contain only letters and numbers'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    handleValidationErrors
  ],

  login: [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
    handleValidationErrors
  ],

  // Profiles
  createProfile: [
    body('profile_name')
      .trim()
      .isLength({ min: 1, max: 30 })
      .withMessage('Profile name must be between 1 and 30 characters'),
    body('avatar_color')
      .optional()
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage('Invalid color format (use hex: #RRGGBB)'),
    body('is_kids')
      .optional()
      .isBoolean()
      .withMessage('is_kids must be boolean'),
    handleValidationErrors
  ],

  // Movies/Series metadata
  movieMetadata: [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Title must be between 1 and 255 characters'),
    body('year')
      .optional()
      .isInt({ min: 1800, max: 2100 })
      .withMessage('Year must be between 1800 and 2100'),
    body('imdb_rating')
      .optional()
      .isFloat({ min: 0, max: 10 })
      .withMessage('IMDb rating must be between 0 and 10'),
    body('language')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Language must be max 100 characters'),
    body('country')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Country must be max 100 characters'),
    handleValidationErrors
  ],

  // Progress tracking
  updateProgress: [
    body('timestamp_seconds')
      .isFloat({ min: 0 })
      .withMessage('Timestamp must be a positive number'),
    body('duration_seconds')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Duration must be a positive number'),
    handleValidationErrors
  ],

  // Pagination
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    handleValidationErrors
  ],

  // Filtering
  movieFilters: [
    query('genre')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Genre filter too long'),
    query('year_min')
      .optional()
      .isInt({ min: 1800, max: 2100 })
      .withMessage('Invalid year_min'),
    query('year_max')
      .optional()
      .isInt({ min: 1800, max: 2100 })
      .withMessage('Invalid year_max'),
    query('rating_min')
      .optional()
      .isFloat({ min: 0, max: 10 })
      .withMessage('Rating must be between 0 and 10'),
    query('language')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Language filter too long'),
    query('sort_by')
      .optional()
      .isIn(['title', 'year', 'imdb_rating', 'created_at'])
      .withMessage('Invalid sort_by field'),
    query('sort_order')
      .optional()
      .isIn(['ASC', 'DESC'])
      .withMessage('Sort order must be ASC or DESC'),
    handleValidationErrors
  ],

  // ID parameters
  idParam: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID must be a positive integer'),
    handleValidationErrors
  ],

  // IMDb ID
  imdbId: [
    param('id')
      .matches(/^tt\d{7,8}$/)
      .withMessage('Invalid IMDb ID format (expected tt1234567)'),
    handleValidationErrors
  ],

  // Metadata search
  metadataSearch: [
    query('title')
      .optional()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Title must be between 1 and 255 characters'),
    query('year')
      .optional()
      .isInt({ min: 1800, max: 2100 })
      .withMessage('Year must be between 1800 and 2100'),
    handleValidationErrors
  ],
};

module.exports = validators;
