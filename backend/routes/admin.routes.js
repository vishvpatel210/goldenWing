const express = require('express');
const router = express.Router();
const {
  getAdminAnalytics,
  getAllAdminBookings,
  updateFlightSeats,
} = require('../controllers/admin.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

// All admin routes strictly guarded with JWT protect + role-based adminOnly
router.use(protect);
router.use(adminOnly);

// GET /api/admin/analytics — Dashboard statistics & revenue
router.get('/analytics', getAdminAnalytics);

// GET /api/admin/bookings — All bookings with passenger details & search
router.get('/bookings', getAllAdminBookings);

// PUT /api/admin/flights/:id/seats — Manage flight seat inventory
router.put('/flights/:id/seats', updateFlightSeats);

module.exports = router;

