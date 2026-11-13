const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
} = require('../controllers/booking.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateBody } = require('../middleware/validate.middleware');

// All booking routes require JWT authentication
router.use(protect);

// POST /api/bookings — Create booking with seat reservation & ticket generation
router.post('/', validateBody(['flightId', 'passengers']), createBooking);

// GET /api/bookings/my-trips — List current user's reservations
router.get('/my-trips', getMyBookings);

// GET /api/bookings/:id — Get booking details & digital ticket by ID or Reference
router.get('/:id', getBookingById);

// POST /api/bookings/:id/cancel — Cancel booking and restore available seats
router.post('/:id/cancel', cancelBooking);

module.exports = router;
