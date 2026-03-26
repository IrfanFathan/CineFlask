/**
 * Authentication Routes
 * Handles user registration and login
 */

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database/db');

const router = express.Router();

// Register new user
router.post('/register', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      });
    }

    if (username.length < 3) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username must be at least 3 characters long' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Check if username already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username already taken' 
      });
    }

    // Hash password (cost factor 12)
    const password_hash = await bcrypt.hash(password, 12);

    // Insert user into database
    const result = db.prepare(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)'
    ).run(username, password_hash);

    const userId = result.lastInsertRowid;

    // Create default profile for the user
    db.prepare(
      'INSERT INTO profiles (user_id, profile_name, avatar_color) VALUES (?, ?, ?)'
    ).run(userId, username, '#7c5cfc');

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
        username
      }
    });

  } catch (error) {
    next(error);
  }
});

// Login existing user
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      });
    }

    // Find user by username
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      });
    }

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
