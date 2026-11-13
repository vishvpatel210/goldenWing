const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Passenger full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    passportNumber: {
      type: String,
      required: [true, 'Passport or ID number is required'],
      trim: true,
      uppercase: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'male',
    },
    dateOfBirth: {
      type: Date,
    },
    seatNumber: {
      type: String,
      required: [true, 'Assigned seat number is required'],
      trim: true,
      uppercase: true,
    },
    ticketNumber: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Passenger', passengerSchema);

