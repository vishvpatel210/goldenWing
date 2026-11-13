const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const Passenger = require('../models/Passenger');
const { generatePNR, generateTicketNumber } = require('../utils/pnrGenerator');

// ─────────────────────────────────────────────────────────────
// 1. Create a flight booking with atomic double-booking prevention
// @route   POST /api/bookings
// @access  Private (JWT Protected)
// ─────────────────────────────────────────────────────────────
const createBooking = async (req, res, next) => {
  try {
    const {
      flightId,
      passengers,
      selectedSeats,
    } = req.body;

    // 2. Validate input parameters
    if (!flightId) {
      return res.status(400).json({ success: false, message: 'flightId is required' });
    }

    if (!Array.isArray(passengers) || passengers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one passenger must be provided with fullName and passportNumber',
      });
    }

    // 3. Seat selection & count validation
    const normalizedSeats = (selectedSeats || passengers.map((p) => p.seatNumber)).map((s) =>
      String(s).trim().toUpperCase()
    );

    if (normalizedSeats.length !== passengers.length) {
      return res.status(400).json({
        success: false,
        message: `Seat count (${normalizedSeats.length}) must match passenger count (${passengers.length})`,
      });
    }

    // Check for duplicate seat selections within the same request
    const uniqueSeats = new Set(normalizedSeats);
    if (uniqueSeats.size !== normalizedSeats.length) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate seat numbers detected in your selection',
      });
    }

    // Validate each passenger record
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.fullName || !p.passportNumber) {
        return res.status(400).json({
          success: false,
          message: `Passenger #${i + 1} is missing required fullName or passportNumber`,
        });
      }
    }

    // 4 & 5. ATOMIC RESERVATION STRATEGY:
    // Update the flight ONLY if:
    // a) Flight exists
    // b) availableSeats >= passengers.length
    // c) NONE of the normalizedSeats exist in flight.bookedSeats
    const updatedFlight = await Flight.findOneAndUpdate(
      {
        _id: flightId,
        availableSeats: { $gte: passengers.length },
        bookedSeats: { $nin: normalizedSeats },
      },
      {
        $inc: { availableSeats: -passengers.length },
        $push: { bookedSeats: { $each: normalizedSeats } },
      },
      { new: true }
    );

    // If updatedFlight is null, either seats are already taken or capacity is exceeded
    if (!updatedFlight) {
      const existingFlight = await Flight.findById(flightId);
      if (!existingFlight) {
        return res.status(404).json({ success: false, message: 'Flight not found' });
      }

      const alreadyBooked = normalizedSeats.filter((seat) =>
        existingFlight.bookedSeats.includes(seat)
      );

      if (alreadyBooked.length > 0) {
        return res.status(409).json({
          success: false,
          message: `Seat(s) ${alreadyBooked.join(', ')} have already been reserved. Please select alternative seats.`,
        });
      }

      return res.status(400).json({
        success: false,
        message: `Insufficient seats available on flight ${existingFlight.flightNumber}. Remaining: ${existingFlight.availableSeats}`,
      });
    }

    // 6. Calculate total fare (flight price * passenger count + taxes/VIP fees)
    const baseFare = updatedFlight.price * passengers.length;
    const taxesAndAirportFees = 120 * passengers.length;
    const totalAmount = baseFare + taxesAndAirportFees;

    // 7. Generate unique booking reference (PNR: e.g., "GW7B9X")
    const bookingReference = generatePNR();

    // 12. Generate digital ticket information
    const passengerDocs = [];
    const ticketNumbers = [];

    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      const seatNumber = normalizedSeats[i];
      const ticketNumber = generateTicketNumber();
      ticketNumbers.push(ticketNumber);

      // Save Passenger document
      const passengerRecord = await Passenger.create({
        fullName: p.fullName.trim(),
        passportNumber: p.passportNumber.trim().toUpperCase(),
        gender: p.gender || 'male',
        dateOfBirth: p.dateOfBirth,
        seatNumber,
        ticketNumber,
      });

      passengerDocs.push({
        fullName: passengerRecord.fullName,
        passportNumber: passengerRecord.passportNumber,
        gender: passengerRecord.gender,
        dateOfBirth: passengerRecord.dateOfBirth,
        seatNumber,
        ticketNumber,
      });
    }

    // QR Code payload
    const qrCodeData = JSON.stringify({
      bookingReference,
      flightNumber: updatedFlight.flightNumber,
      source: updatedFlight.source,
      destination: updatedFlight.destination,
      departureDate: updatedFlight.departureDate,
      departureTime: updatedFlight.departureTime,
      passengers: passengerDocs.map((p) => ({ name: p.fullName, seat: p.seatNumber })),
      verification: 'GW-LUXURY-PASS-VERIFIED',
    });

    // Create Booking
    const booking = await Booking.create({
      userId: req.user._id,
      flightId: updatedFlight._id,
      bookingReference,
      passengers: passengerDocs,
      selectedSeats: normalizedSeats,
      totalAmount,
      paymentStatus: 'Completed', // Simulated payment confirmation
      bookingStatus: 'Confirmed',
      digitalTicket: {
        ticketNumbers,
        qrCodeData,
        issuedAt: new Date(),
      },
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('flightId')
      .populate('userId', 'name email phone role');

    // Create frontend-friendly compatibility response
    const bookingData = populatedBooking.toObject();
    bookingData.pnr = bookingData.bookingReference;
    bookingData.user = bookingData.userId;
    bookingData.flight = bookingData.flightId;
    bookingData.status = bookingData.bookingStatus;
    bookingData.qrCodeData = qrCodeData;

    res.status(201).json({
      success: true,
      message: 'Flight reservation confirmed! Boarding pass and tickets generated.',
      data: bookingData,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// 8. Get logged-in user's bookings
// @route   GET /api/bookings/my-trips
// @access  Private (JWT Protected)
// ─────────────────────────────────────────────────────────────
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('flightId')
      .populate('userId', 'name email phone role')
      .sort({ createdAt: -1 });

    const formattedBookings = bookings.map((b) => {
      const obj = b.toObject();
      obj.pnr = obj.bookingReference;
      obj.user = obj.userId;
      obj.flight = obj.flightId;
      obj.status = obj.bookingStatus;
      obj.qrCodeData = obj.digitalTicket?.qrCodeData;
      return obj;
    });

    res.json({
      success: true,
      count: formattedBookings.length,
      data: formattedBookings,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// 9. Get booking details by ID or Reference
// @route   GET /api/bookings/:id
// @access  Private (JWT Protected)
// ─────────────────────────────────────────────────────────────
const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let query = {};

    if (id.toUpperCase().startsWith('GW')) {
      query = { bookingReference: id.toUpperCase() };
    } else if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      query = { bookingReference: id.toUpperCase() };
    }

    const booking = await Booking.findOne(query)
      .populate('flightId')
      .populate('userId', 'name email phone role');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `Booking not found with reference: ${id}`,
      });
    }

    // Ownership check (unless admin)
    if (booking.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this booking',
      });
    }

    const bookingObj = booking.toObject();
    bookingObj.pnr = bookingObj.bookingReference;
    bookingObj.user = bookingObj.userId;
    bookingObj.flight = bookingObj.flightId;
    bookingObj.status = bookingObj.bookingStatus;
    bookingObj.qrCodeData = bookingObj.digitalTicket?.qrCodeData;

    res.json({
      success: true,
      data: bookingObj,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// 10 & 11. Cancel bookings and restore seat availability
// @route   POST /api/bookings/:id/cancel
// @access  Private (JWT Protected)
// ─────────────────────────────────────────────────────────────
const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    let query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id }
      : { bookingReference: id.toUpperCase() };

    const booking = await Booking.findOne(query);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Ownership authorization
    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this reservation',
      });
    }

    if (booking.bookingStatus === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been cancelled',
      });
    }

    // 11. Atomic update to restore seat availability & remove booked seats
    await Flight.findByIdAndUpdate(booking.flightId, {
      $inc: { availableSeats: booking.selectedSeats.length },
      $pull: { bookedSeats: { $each: booking.selectedSeats } },
    });

    booking.bookingStatus = 'Cancelled';
    booking.paymentStatus = 'Refunded';
    await booking.save();

    res.json({
      success: true,
      message: 'Booking successfully cancelled and full refund credited to your account.',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
};
