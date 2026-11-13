const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const User = require('../models/User');

// ─────────────────────────────────────────────────────────────
// 1. Admin Dashboard Analytics (Total bookings, revenue, stats)
// @route   GET /api/admin/analytics
// @access  Private + Admin
// ─────────────────────────────────────────────────────────────
const getAdminAnalytics = async (req, res, next) => {
  try {
    const [
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      totalFlights,
      totalUsers,
      revenueResult,
      recentBookings,
      flightOccupancyStats,
    ] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ bookingStatus: 'Confirmed' }),
      Booking.countDocuments({ bookingStatus: 'Cancelled' }),
      Flight.countDocuments(),
      User.countDocuments({ role: 'user' }),
      // Calculate revenue from non-cancelled bookings
      Booking.aggregate([
        { $match: { bookingStatus: { $ne: 'Cancelled' }, paymentStatus: 'Completed' } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
      ]),
      // Recent 5 bookings
      Booking.find()
        .populate('flightId', 'flightNumber airline source destination departureDate')
        .populate('userId', 'name email phone')
        .sort({ createdAt: -1 })
        .limit(5),
      // Flight occupancy overview
      Flight.aggregate([
        {
          $group: {
            _id: null,
            totalCapacity: { $sum: '$totalSeats' },
            totalAvailable: { $sum: '$availableSeats' },
          },
        },
      ]),
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
    const occupancy = flightOccupancyStats.length > 0 ? flightOccupancyStats[0] : { totalCapacity: 0, totalAvailable: 0 };
    const bookedSeatsCount = Math.max(0, occupancy.totalCapacity - occupancy.totalAvailable);
    const overallOccupancyRate = occupancy.totalCapacity > 0 ? Math.round((bookedSeatsCount / occupancy.totalCapacity) * 100) : 0;

    res.json({
      success: true,
      data: {
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        totalRevenue,
        totalFlights,
        totalUsers,
        overallOccupancyRate,
        bookedSeatsCount,
        recentBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// 2. View all bookings with full passenger details & pagination
// @route   GET /api/admin/bookings
// @access  Private + Admin
// ─────────────────────────────────────────────────────────────
const getAllAdminBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const filter = {};

    if (status) {
      filter.bookingStatus = status;
    }

    if (search) {
      filter.$or = [
        { bookingReference: { $regex: search.trim(), $options: 'i' } },
        { 'passengers.fullName': { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('flightId', 'flightNumber airline source destination departureTime arrivalTime price departureDate')
        .populate('userId', 'name email phone role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Booking.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      count: bookings.length,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// 3. Manage flight seat availability directly
// @route   PUT /api/admin/flights/:id/seats
// @access  Private + Admin
// ─────────────────────────────────────────────────────────────
const updateFlightSeats = async (req, res, next) => {
  try {
    const { totalSeats, availableSeats, bookedSeats } = req.body;
    const flight = await Flight.findById(req.params.id);

    if (!flight) {
      return res.status(404).json({ success: false, message: 'Flight not found' });
    }

    if (totalSeats !== undefined) {
      flight.totalSeats = Math.max(1, Number(totalSeats));
    }
    if (availableSeats !== undefined) {
      flight.availableSeats = Math.max(0, Math.min(flight.totalSeats, Number(availableSeats)));
    }
    if (Array.isArray(bookedSeats)) {
      flight.bookedSeats = bookedSeats.map((s) => String(s).toUpperCase());
    }

    await flight.save();

    res.json({
      success: true,
      message: 'Flight seat inventory updated successfully',
      data: flight,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminAnalytics,
  getAllAdminBookings,
  updateFlightSeats,
};

