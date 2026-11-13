const mongoose = require('mongoose');

const passengerSnapshotSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Passenger name is required'],
      trim: true,
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
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    flightId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flight',
      required: [true, 'Flight ID is required'],
    },
    bookingReference: {
      type: String,
      required: [true, 'Booking reference is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    passengers: {
      type: [passengerSnapshotSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'A booking must have at least one passenger',
      },
    },
    selectedSeats: {
      type: [String],
      required: [true, 'Selected seats are required'],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'At least one seat must be selected',
      },
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Completed', 'Refunded', 'Failed'],
      default: 'Completed',
    },
    bookingStatus: {
      type: String,
      enum: ['Confirmed', 'Cancelled', 'Completed'],
      default: 'Confirmed',
    },
    digitalTicket: {
      ticketNumbers: [String],
      qrCodeData: String,
      issuedAt: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Indexes
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ flightId: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
