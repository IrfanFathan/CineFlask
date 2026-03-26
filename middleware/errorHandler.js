/**
 * Global Error Handler Middleware
 * Catches all errors and returns consistent JSON responses
 * Place this last in Express middleware chain
 */

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: `File too large. Maximum size is ${process.env.MAX_FILE_SIZE_GB || 50}GB`
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Unexpected file field'
    });
  }

  // Database errors
  if (err.code === 'SQLITE_CONSTRAINT') {
    return res.status(400).json({
      success: false,
      message: 'Database constraint violation (duplicate entry or invalid reference)'
    });
  }

  // Default to 500 server error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
