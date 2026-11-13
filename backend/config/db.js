const mongoose = require('mongoose');

/**
 * Connects to MongoDB Atlas / Local MongoDB instance
 * Reads connection URI strictly from environment variables
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('⚠️ [MongoDB Warning] MONGODB_URI is not defined in environment variables.');
    console.warn('⚠️ Please add your MongoDB Atlas connection string to .env');
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✈️ [MongoDB Atlas] Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ [MongoDB Connection Error]: ${error.message}`);
    // Non-fatal so that development server remains responsive to configuration
  }
};

module.exports = connectDB;

