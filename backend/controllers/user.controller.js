const User = require('../models/User');

// ───────────────────────────────────────────────────
// @desc    Get current authenticated user's profile
// @route   GET /api/users/profile
// @access  Private (requires JWT)
// ───────────────────────────────────────────────────
const getProfile = async (req, res) => {
  // req.user is set by the protect middleware (password already excluded)
  res.json({
    success: true,
    data: req.user,
  });
};

// ───────────────────────────────────────────────────
// @desc    Update current authenticated user's profile
// @route   PUT /api/users/profile
// @access  Private (requires JWT)
// ───────────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, password } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update allowed fields only (email and role cannot be changed here)
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;

    // Allow password change (will be re-hashed by pre-save hook)
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long',
        });
      }
      user.password = password;
    }

    await user.save();

    // Return updated user (password stripped by toJSON transform)
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// ───────────────────────────────────────────────────
// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private + Admin
// ───────────────────────────────────────────────────
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// ───────────────────────────────────────────────────
// @desc    Delete a user by ID (admin only)
// @route   DELETE /api/users/:id
// @access  Private + Admin
// ───────────────────────────────────────────────────
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Admin cannot delete their own account',
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAllUsers,
  deleteUser,
};

