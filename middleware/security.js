/**
 * Security Middleware
 * Configures helmet for security headers
 */

const helmet = require('helmet');

// Configure helmet with appropriate settings for media streaming
const securityHeaders = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts for frontend
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles
      imgSrc: ["'self'", "data:", "https:", "http:"], // Allow external images (posters from OMDB)
      mediaSrc: ["'self'", "blob:"], // Allow self-hosted media and blob URLs
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
  
  // Cross-Origin Resource Policy - allow same-origin
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow loading resources across origins for LAN access
  
  // DNS Prefetch Control
  dnsPrefetchControl: { allow: false },
  
  // Expect-CT
  expectCt: {
    maxAge: 86400, // 24 hours
    enforce: true,
  },
  
  // Frameguard
  frameguard: { action: 'deny' }, // Prevent clickjacking
  
  // Hide Powered By
  hidePoweredBy: true,
  
  // HSTS (HTTP Strict Transport Security)
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  
  // IE No Open
  ieNoOpen: true,
  
  // No Sniff
  noSniff: true,
  
  // Referrer Policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  
  // XSS Filter
  xssFilter: true,
});

module.exports = securityHeaders;
