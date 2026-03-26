/**
 * Profile Routes
 * Manages user profiles (Netflix-style multiple profiles per account)
 */

const express = require('express');
const db = require('../database/db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all profiles for current user
router.get('/', (req, res, next) => {
  try {
    const profiles = db.prepare(
      'SELECT id, profile_name, avatar_color, is_kids, created_at FROM profiles WHERE user_id = ?'
    ).all(req.user.id);

    res.json({
      success: true,
      profiles
    });
  } catch (error) {
    next(error);
  }
});

// Create new profile (max 4 per user)
router.post('/', (req, res, next) => {
  try {
    const { profile_name, avatar_color, is_kids } = req.body;

    if (!profile_name) {
      return res.status(400).json({
        success: false,
        message: 'Profile name is required'
      });
    }

    // Check profile limit (max 4 profiles per user)
    const profileCount = db.prepare(
      'SELECT COUNT(*) as count FROM profiles WHERE user_id = ?'
    ).get(req.user.id);

    if (profileCount.count >= 4) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 4 profiles allowed per account'
      });
    }

    // Insert new profile
    const result = db.prepare(
      'INSERT INTO profiles (user_id, profile_name, avatar_color, is_kids) VALUES (?, ?, ?, ?)'
    ).run(
      req.user.id,
      profile_name,
      avatar_color || '#7c5cfc',
      is_kids ? 1 : 0
    );

    const profile = db.prepare(
      'SELECT id, profile_name, avatar_color, is_kids, created_at FROM profiles WHERE id = ?'
    ).get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Profile created successfully',
      profile
    });
  } catch (error) {
    next(error);
  }
});

// Update profile
router.put('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const { profile_name, avatar_color, is_kids } = req.body;

    // Verify profile belongs to user
    const profile = db.prepare(
      'SELECT * FROM profiles WHERE id = ? AND user_id = ?'
    ).get(id, req.user.id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Update profile
    db.prepare(
      'UPDATE profiles SET profile_name = ?, avatar_color = ?, is_kids = ? WHERE id = ?'
    ).run(
      profile_name || profile.profile_name,
      avatar_color || profile.avatar_color,
      is_kids !== undefined ? (is_kids ? 1 : 0) : profile.is_kids,
      id
    );

    const updatedProfile = db.prepare(
      'SELECT id, profile_name, avatar_color, is_kids, created_at FROM profiles WHERE id = ?'
    ).get(id);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedProfile
    });
  } catch (error) {
    next(error);
  }
});

// Delete profile
router.delete('/:id', (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify profile belongs to user
    const profile = db.prepare(
      'SELECT * FROM profiles WHERE id = ? AND user_id = ?'
    ).get(id, req.user.id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Prevent deleting the last profile
    const profileCount = db.prepare(
      'SELECT COUNT(*) as count FROM profiles WHERE user_id = ?'
    ).get(req.user.id);

    if (profileCount.count <= 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete the last profile'
      });
    }

    // Delete profile (cascade will remove related progress and watchlist)
    db.prepare('DELETE FROM profiles WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'Profile deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
