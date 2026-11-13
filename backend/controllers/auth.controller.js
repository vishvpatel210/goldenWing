const User = require('../models/User');
const { generateToken } = require('../utils/token');

// ───────────────────────────────────────────────────
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// ───────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    // 1. Check if email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists',
      });
    }

    // 2. Validate password strength
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // 3. Create user (password is hashed automatically by pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
    });

    // 4. Generate JWT access token
    const token = generateToken(user._id);

    // 5. Return user data (password is stripped by toJSON transform)
    res.status(201).json({
      success: true,
      message: 'Registration successful. Welcome to GoldenWing!',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ───────────────────────────────────────────────────
// @desc    Authenticate user & issue JWT access token
// @route   POST /api/auth/login
// @access  Public
// ───────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input presence
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    // 2. Find user and explicitly include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // 3. Compare candidate password against stored bcrypt hash
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // 4. Generate JWT access token
    const token = generateToken(user._id);

    // 5. Return user data (password stripped by toJSON + select:false)
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
};
