const Airport = require('../models/Airport');

// @desc    Get all airports or search by query
// @route   GET /api/airports
// @access  Public
const getAirports = async (req, res, next) => {
  try {
    const { q } = req.query;
    let filter = {};

    if (q) {
      filter = {
        $or: [
          { code: { $regex: q, $options: 'i' } },
          { name: { $regex: q, $options: 'i' } },
          { city: { $regex: q, $options: 'i' } },
          { country: { $regex: q, $options: 'i' } },
        ],
      };
    }

    const airports = await Airport.find(filter).sort({ city: 1 });

    res.json({
      success: true,
      count: airports.length,
      data: airports,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single airport by code or ID
// @route   GET /api/airports/:id
// @access  Public
const getAirportById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let airport;

    if (id.length === 3) {
      airport = await Airport.findOne({ code: id.toUpperCase() });
    } else {
      airport = await Airport.findById(id);
    }

    if (!airport) {
      return res.status(404).json({
        success: false,
        message: `Airport not found with identifier: ${id}`,
      });
    }

    res.json({
      success: true,
      data: airport,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAirports,
  getAirportById,
};

