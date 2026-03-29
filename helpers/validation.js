/**
 * Validation Helper
 * Comprehensive validation functions for user inputs
 */

/**
 * Validate email format
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate username
 * - 3-20 characters
 * - Alphanumeric, underscore, hyphen only
 * - No spaces
 */
function isValidUsername(username) {
  if (!username || typeof username !== 'string') return false;
  
  const trimmed = username.trim();
  
  if (trimmed.length < 3 || trimmed.length > 20) {
    return { valid: false, message: 'Username must be 3-20 characters long' };
  }
  
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(trimmed)) {
    return { valid: false, message: 'Username can only contain letters, numbers, underscores, and hyphens' };
  }
  
  return { valid: true };
}

/**
 * Validate password strength
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character (optional for basic security)
 */
function isValidPassword(password, strict = false) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (password.length > 128) {
    return { valid: false, message: 'Password must not exceed 128 characters' };
  }
  
  if (strict) {
    // Strict mode: require uppercase, lowercase, number, and special char
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    if (!hasUpperCase) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!hasLowerCase) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!hasNumber) {
      return { valid: false, message: 'Password must contain at least one number' };
    }
    if (!hasSpecialChar) {
      return { valid: false, message: 'Password must contain at least one special character' };
    }
  }
  
  return { valid: true };
}

/**
 * Sanitize string input (prevent XSS)
 */
function sanitizeString(str) {
  if (!str || typeof str !== 'string') return '';
  
  return str
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .substring(0, 500); // Limit length
}

/**
 * Validate IP address format
 */
function isValidIP(ip) {
  if (!ip || typeof ip !== 'string') return false;
  
  // IPv4 regex
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipv4Regex.test(ip)) return false;
  
  // Check each octet is 0-255
  const octets = ip.split('.');
  return octets.every(octet => {
    const num = parseInt(octet, 10);
    return num >= 0 && num <= 255;
  });
}

/**
 * Validate file size against limit
 */
function isValidFileSize(sizeBytes, maxSizeGB = 50) {
  const maxBytes = maxSizeGB * 1024 * 1024 * 1024;
  return sizeBytes <= maxBytes;
}

/**
 * Check for common weak passwords
 */
const WEAK_PASSWORDS = [
  'password', 'password123', '12345678', 'qwerty', 'abc123',
  'letmein', 'welcome', 'monkey', '1234567890', 'admin',
  'password1', 'Password1', 'Pass123', 'admin123'
];

function isWeakPassword(password) {
  const lower = password.toLowerCase();
  return WEAK_PASSWORDS.some(weak => lower.includes(weak));
}

/**
 * Validate request against rate limit
 */
function checkRateLimit(attempts, maxAttempts, windowMs, lastAttempt) {
  if (!lastAttempt) return true;
  
  const now = Date.now();
  const timeSinceLastAttempt = now - new Date(lastAttempt).getTime();
  
  // If window has passed, reset
  if (timeSinceLastAttempt > windowMs) {
    return true;
  }
  
  // Check if under limit
  return attempts < maxAttempts;
}

module.exports = {
  isValidEmail,
  isValidUsername,
  isValidPassword,
  sanitizeString,
  isValidIP,
  isValidFileSize,
  isWeakPassword,
  checkRateLimit
};
