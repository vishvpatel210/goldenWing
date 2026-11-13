const express = require('express');
const router = express.Router();
const { getAirports, getAirportById } = require('../controllers/airport.controller');

router.get('/', getAirports);
router.get('/:id', getAirportById);

module.exports = router;

