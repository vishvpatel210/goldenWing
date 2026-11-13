const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getAllUsers,
  deleteUser,
} = require('../controllers/user.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

// All user routes require authentication
router.use(protect);

// GET  /api/users/profile — Get current user's profile
router.get('/profile', getProfile);

// PUT  /api/users/profile — Update current user's profile
router.put('/profile', updateProfile);

// Admin-only routes
// GET    /api/users       — List all users
router.get('/', adminOnly, getAllUsers);

// DELETE /api/users/:id   — Delete a user
router.delete('/:id', adminOnly, deleteUser);

module.exports = router;

