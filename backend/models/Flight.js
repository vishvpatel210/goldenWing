const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema(
  {
    flightNumber: {
      type: String,
      required: [true, 'Flight number is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    airline: {
      type: String,
      required: [true, 'Airline name is required'],
      default: 'GoldenWing Airways',
      trim: true,
    },
    airlineLogo: {
      type: String,
      default: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=120',
      trim: true,
    },
    source: {
      type: String,
      required: [true, 'Source city/airport is required'],
      uppercase: true,
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination city/airport is required'],
      uppercase: true,
      trim: true,
    },
    departureTime: {
      type: String, // e.g. "08:30" or "08:30 AM"
      required: [true, 'Departure time is required'],
      trim: true,
    },
    arrivalTime: {
      type: String, // e.g. "14:45" or "02:45 PM"
      required: [true, 'Arrival time is required'],
      trim: true,
    },
    duration: {
      type: String, // e.g. "6h 15m"
      required: [true, 'Flight duration is required'],
      trim: true,
    },
    durationMinutes: {
      type: Number, // internal numeric field for sorting by duration
      default: 0,
    },
    departureDate: {
      type: Date,
      required: [true, 'Departure date is required'],
    },
    arrivalDate: {
      type: Date,
      required: [true, 'Arrival date is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be non-negative'],
    },
    totalSeats: {
      type: Number,
      required: [true, 'Total seats count is required'],
      min: [1, 'Total seats must be at least 1'],
      default: 180,
    },
    availableSeats: {
      type: Number,
      required: [true, 'Available seats count is required'],
      min: [0, 'Available seats cannot be negative'],
      default: 180,
    },
    bookedSeats: {
      type: [String], // Array of uppercase seat identifiers, e.g. ["1A", "1B", "12C"]
      default: [],
    },
    travelClass: {
      type: String,
      enum: ['Economy', 'Premium Economy', 'Business', 'First Class'],
      default: 'First Class',
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Boarding', 'Departed', 'Arrived', 'Delayed', 'Cancelled'],
      default: 'Scheduled',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for high-performance searching and filtering
flightSchema.index({ source: 1, destination: 1, departureDate: 1 });
flightSchema.index({ airline: 1 });
flightSchema.index({ price: 1 });
flightSchema.index({ durationMinutes: 1 });
flightSchema.index({ bookedSeats: 1 });

module.exports = mongoose.model('Flight', flightSchema);
