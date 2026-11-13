const express = require('express');
const router = express.Router();
const {
  createFlight,
  getFlights,
  getFlightById,
  updateFlight,
  deleteFlight,
} = require('../controllers/flight.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const { validateBody } = require('../middleware/validate.middleware');

// Public routes
// GET /api/flights — Get all flights with filters, search, sorting & pagination
router.get('/', getFlights);

// GET /api/flights/:id — Get single flight details by ID
router.get('/:id', getFlightById);

// Admin-only routes
// POST /api/flights — Create a new flight
router.post(
  '/',
  protect,
  adminOnly,
  validateBody([
    'flightNumber',
    'source',
    'destination',
    'departureTime',
    'arrivalTime',
    'duration',
    'departureDate',
    'price',
  ]),
  createFlight
);

// PUT /api/flights/:id — Update flight details
router.put('/:id', protect, adminOnly, updateFlight);

// DELETE /api/flights/:id — Delete flight
router.delete('/:id', protect, adminOnly, deleteFlight);

module.exports = router;
