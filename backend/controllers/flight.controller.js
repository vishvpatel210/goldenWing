const Flight = require('../models/Flight');

// Helper to convert "6h 15m" to total minutes for sorting
const parseDurationMinutes = (durationStr) => {
  if (typeof durationStr === 'number') return durationStr;
  if (!durationStr) return 0;
  const hoursMatch = durationStr.match(/(\d+)\s*h/i);
  const minsMatch = durationStr.match(/(\d+)\s*m/i);
  const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
  const mins = minsMatch ? parseInt(minsMatch[1], 10) : 0;
  return hours * 60 + mins;
};

// ───────────────────────────────────────────────────
// 1. Create Flight (Admin Only)
// @route   POST /api/flights
// @access  Private + Admin
// ───────────────────────────────────────────────────
const createFlight = async (req, res, next) => {
  try {
    const {
      flightNumber,
      airline,
      airlineLogo,
      source,
      destination,
      departureTime,
      arrivalTime,
      duration,
      departureDate,
      arrivalDate,
      price,
      totalSeats,
      availableSeats,
      travelClass,
      status,
    } = req.body;

    // Check duplicate flight number
    const existingFlight = await Flight.findOne({ flightNumber: flightNumber.toUpperCase() });
    if (existingFlight) {
      return res.status(400).json({
        success: false,
        message: `Flight number ${flightNumber.toUpperCase()} already exists`,
      });
    }

    const durationMinutes = parseDurationMinutes(duration);

    const flight = await Flight.create({
      flightNumber: flightNumber.toUpperCase(),
      airline: airline || 'GoldenWing Airways',
      airlineLogo,
      source: source.toUpperCase(),
      destination: destination.toUpperCase(),
      departureTime,
      arrivalTime,
      duration,
      durationMinutes,
      departureDate: new Date(departureDate),
      arrivalDate: new Date(arrivalDate || departureDate),
      price: Number(price),
      totalSeats: totalSeats ? Number(totalSeats) : 180,
      availableSeats: availableSeats !== undefined ? Number(availableSeats) : (totalSeats ? Number(totalSeats) : 180),
      travelClass: travelClass || 'First Class',
      status: status || 'Scheduled',
    });

    res.status(201).json({
      success: true,
      message: 'Flight created successfully',
      data: flight,
    });
  } catch (error) {
    next(error);
  }
};

// ───────────────────────────────────────────────────
// 2. Get All Flights (with pagination, search & filters)
// @route   GET /api/flights
// @access  Public
// 
// Query Params:
// - source, destination: 3-letter IATA code or city name
// - departureDate: YYYY-MM-DD
// - airline: filter by airline name
// - minPrice, maxPrice: price range
// - travelClass: 'Economy' | 'Business' | 'First Class'
// - sortBy: 'price_asc' | 'price_desc' | 'duration_asc' | 'duration_desc' | 'departure_asc'
// - page: page number (default 1)
// - limit: items per page (default 10)
// ───────────────────────────────────────────────────
const getFlights = async (req, res, next) => {
  try {
    const {
      source,
      destination,
      departureDate,
      airline,
      minPrice,
      maxPrice,
      travelClass,
      status,
      sortBy = 'price_asc',
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    // 3. Search flights by source and destination
    if (source) {
      filter.source = { $regex: new RegExp(`^${source.trim()}$`, 'i') };
    }
    if (destination) {
      filter.destination = { $regex: new RegExp(`^${destination.trim()}$`, 'i') };
    }

    // 4. Filter by departure date (match entire 24h day)
    if (departureDate) {
      const startOfDay = new Date(departureDate);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(departureDate);
      endOfDay.setUTCHours(23, 59, 59, 999);

      filter.departureDate = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    // 5. Filter by airline
    if (airline) {
      filter.airline = { $regex: airline.trim(), $options: 'i' };
    }

    // 6. Filter by price
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    // Filter by travel class
    if (travelClass) {
      filter.travelClass = travelClass;
    }

    // Filter by flight status
    if (status) {
      filter.status = status;
    }

    // 7. Sort by price and duration
    let sort = {};
    switch (sortBy) {
      case 'price_asc':
        sort = { price: 1 };
        break;
      case 'price_desc':
        sort = { price: -1 };
        break;
      case 'duration_asc':
        sort = { durationMinutes: 1, price: 1 };
        break;
      case 'duration_desc':
        sort = { durationMinutes: -1 };
        break;
      case 'departure_asc':
        sort = { departureDate: 1, departureTime: 1 };
        break;
      default:
        sort = { price: 1 };
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [flights, total] = await Promise.all([
      Flight.find(filter).sort(sort).skip(skip).limit(limitNum),
      Flight.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      count: flights.length,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
      data: flights,
    });
  } catch (error) {
    next(error);
  }
};

// ───────────────────────────────────────────────────
// 8. Get Flight Details by ID
// @route   GET /api/flights/:id
// @access  Public
// ───────────────────────────────────────────────────
const getFlightById = async (req, res, next) => {
  try {
    const flight = await Flight.findById(req.params.id);

    if (!flight) {
      return res.status(404).json({
        success: false,
        message: `Flight not found with identifier: ${req.params.id}`,
      });
    }

    res.json({
      success: true,
      data: flight,
    });
  } catch (error) {
    next(error);
  }
};

// ───────────────────────────────────────────────────
// 9. Update Flight Information (Admin Only)
// @route   PUT /api/flights/:id
// @access  Private + Admin
// ───────────────────────────────────────────────────
const updateFlight = async (req, res, next) => {
  try {
    const flight = await Flight.findById(req.params.id);

    if (!flight) {
      return res.status(404).json({
        success: false,
        message: `Flight not found with identifier: ${req.params.id}`,
      });
    }

    // If duration is being updated, recalculate durationMinutes
    if (req.body.duration) {
      req.body.durationMinutes = parseDurationMinutes(req.body.duration);
    }

    // Uppercase codes if supplied
    if (req.body.flightNumber) req.body.flightNumber = req.body.flightNumber.toUpperCase();
    if (req.body.source) req.body.source = req.body.source.toUpperCase();
    if (req.body.destination) req.body.destination = req.body.destination.toUpperCase();

    const updatedFlight = await Flight.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Flight updated successfully',
      data: updatedFlight,
    });
  } catch (error) {
    next(error);
  }
};

// ───────────────────────────────────────────────────
// 10. Delete Flight (Admin Only)
// @route   DELETE /api/flights/:id
// @access  Private + Admin
// ───────────────────────────────────────────────────
const deleteFlight = async (req, res, next) => {
  try {
    const flight = await Flight.findById(req.params.id);

    if (!flight) {
      return res.status(404).json({
        success: false,
        message: `Flight not found with identifier: ${req.params.id}`,
      });
    }

    await Flight.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: `Flight ${flight.flightNumber} deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFlight,
  getFlights,
  getFlightById,
  updateFlight,
  deleteFlight,
};
