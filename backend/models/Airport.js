const mongoose = require('mongoose');

const airportSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Airport 3-letter IATA code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [3, 'Airport code must be 3 letters'],
      maxlength: [3, 'Airport code must be 3 letters'],
    },
    name: {
      type: String,
      required: [true, 'Airport full name is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City name is required'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country name is required'],
      trim: true,
    },
    terminals: {
      type: [String],
      default: ['T1', 'T2', 'T3 VIP'],
    },
  },
  {
    timestamps: true,
  }
);

airportSchema.index({ code: 1, city: 1, name: 1 });

module.exports = mongoose.model('Airport', airportSchema);

