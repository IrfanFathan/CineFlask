/**
 * JWT Authentication Middleware
 * Verifies JWT tokens on protected routes
 * Attaches decoded user data to req.user for use in route handlers
 */

const jwt = require('jsonwebtoken');
const db = require('../database/db');

const authMiddleware = (req, res, next) => {
  try {
    // Get token from Authorization header (format: "Bearer <token>")
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    // Extract token (remove "Bearer " prefix)
    const token = authHeader.substring(7);

    // Verify token and decode payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists in database (handles DB wipes)
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User account no longer exists. Please log in again.' 
      });
    }

    // Attach user data to request object for use in routes
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired. Please login again.' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token.' 
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: 'Authentication error.' 
    });
  }
};

/**
 * Admin-only middleware
 * Requires authentication first, then checks if user is admin (first user)
 */
const requireAdmin = (req, res, next) => {
  try {
    // Check if user is authenticated (should be set by authMiddleware)
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get the first user ID (admin)
    const firstUser = db.prepare('SELECT id FROM users ORDER BY id ASC LIMIT 1').get();
    
    if (!firstUser || req.user.id !== firstUser.id) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization error'
    });
  }
};

module.exports = authMiddleware;
module.exports.authenticate = authMiddleware;
module.exports.requireAdmin = requireAdmin;
