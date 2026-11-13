const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token for user authentication
 * @param {string} userId - Mongo ObjectId of user
 * @returns {string} Signed JWT
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'goldenwing_luxury_jwt_secret_key',
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    }
  );
};

/**
 * Verify a JWT token
 * @param {string} token
 * @returns {object} Decoded payload
 */
const verifyToken = (token) => {
  return jwt.verify(
    token,
    process.env.JWT_SECRET || 'goldenwing_luxury_jwt_secret_key'
  );
};

module.exports = {
  generateToken,
  verifyToken,
};

