/**
 * Authentication Routes
 * Handles user registration and login with enhanced security
 */

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const { isValidUsername, isValidPassword, isWeakPassword, sanitizeString } = require('../helpers/validation');

const router = express.Router();

// Register new user
router.post('/register', async (req, res, next) => {
  const ipAddress = req.ip || req.connection.remoteAddress;
  
  try {
    const { username, password, email } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      });
    }

    // Validate username
    const usernameValidation = isValidUsername(username);
    if (!usernameValidation.valid) {
      return res.status(400).json({ 
        success: false, 
        message: usernameValidation.message 
      });
    }

    // Validate password
    const passwordValidation = isValidPassword(password, false); // Not strict for better UX
    if (!passwordValidation.valid) {
      return res.status(400).json({ 
        success: false, 
        message: passwordValidation.message 
      });
    }

    // Check for weak passwords
    if (isWeakPassword(password)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password is too common. Please choose a stronger password.' 
      });
    }

    // Sanitize inputs
    const cleanUsername = sanitizeString(username);
    const cleanEmail = email ? sanitizeString(email) : null;

    // Check if username already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(cleanUsername);
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username already taken' 
      });
    }

    // Hash password (cost factor 12)
    const password_hash = await bcrypt.hash(password, 12);

    // Insert user into database with enhanced fields
    const result = db.prepare(`
      INSERT INTO users (username, password_hash, email, upload_quota_gb, daily_upload_limit, is_active)
      VALUES (?, ?, ?, 100, 10, 1)
    `).run(cleanUsername, password_hash, cleanEmail);

    const userId = result.lastInsertRowid;

    // Create default profile for the user
    db.prepare(
      'INSERT INTO profiles (user_id, profile_name, avatar_color) VALUES (?, ?, ?)'
    ).run(userId, cleanUsername, '#7c5cfc');

    // Record successful registration
    db.prepare(`
      INSERT INTO login_attempts (username, ip_address, success)
      VALUES (?, ?, 1)
    `).run(cleanUsername, ipAddress);

    // Generate JWT token (expires in 7 days)
    const token = jwt.sign(
      { id: userId, username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        username: cleanUsername,
        email: cleanEmail
      }
    });

  } catch (error) {
    // Record failed registration attempt
    try {
      if (req.body.username) {
        db.prepare(`
          INSERT INTO login_attempts (username, ip_address, success)
          VALUES (?, ?, 0)
        `).run(sanitizeString(req.body.username), ipAddress);
      }
    } catch (logError) {
      console.error('Failed to log registration attempt:', logError);
    }
    
    next(error);
  }
});

// Login existing user
router.post('/login', async (req, res, next) => {
  const ipAddress = req.ip || req.connection.remoteAddress;
  
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      });
    }

    const cleanUsername = sanitizeString(username);

    // Check for too many failed attempts from this IP
    const recentFailures = db.prepare(`
      SELECT COUNT(*) as count
      FROM login_attempts
      WHERE ip_address = ? 
        AND success = 0 
        AND attempted_at > datetime('now', '-30 minutes')
    `).get(ipAddress);

    if (recentFailures.count >= 5) {
      return res.status(429).json({ 
        success: false, 
        message: 'Too many failed login attempts. Please try again in 30 minutes.' 
      });
    }

    // Find user by username
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(cleanUsername);

    if (!user) {
      // Record failed attempt
      db.prepare(`
        INSERT INTO login_attempts (username, ip_address, success)
        VALUES (?, ?, 0)
      `).run(cleanUsername, ipAddress);
      
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      });
    }

    // Check if account is active
    if (user.is_active === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'Account has been deactivated. Please contact administrator.' 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      // Record failed attempt
      db.prepare(`
        INSERT INTO login_attempts (username, ip_address, success)
        VALUES (?, ?, 0)
      `).run(cleanUsername, ipAddress);
      
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      });
    }

    // Update last login time
    db.prepare(`
      UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?
    `).run(user.id);

    // Record successful login
    db.prepare(`
      INSERT INTO login_attempts (username, ip_address, success)
      VALUES (?, ?, 1)
    `).run(cleanUsername, ipAddress);

    // Generate JWT token (expires in 7 days)
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });

  } catch (error) {
    next(error);
  }
});

// Verify token endpoint (useful for frontend to check if token is still valid)
router.get('/verify', require('../middleware/authMiddleware'), (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

module.exports = router;
