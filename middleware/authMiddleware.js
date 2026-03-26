/**
 * JWT Authentication Middleware
 * Verifies JWT tokens on protected routes
 * Attaches decoded user data to req.user for use in route handlers
 */

const jwt = require('jsonwebtoken');

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

module.exports = authMiddleware;
