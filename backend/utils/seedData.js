const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Airport = require('../models/Airport');
const Flight = require('../models/Flight');
const User = require('../models/User');

const airportsData = [
  {
    code: 'DXB',
    name: 'Dubai International Airport',
    city: 'Dubai',
    country: 'United Arab Emirates',
    terminals: ['T1', 'T2', 'T3 VIP'],
  },
  {
    code: 'LHR',
    name: 'Heathrow Airport',
    city: 'London',
    country: 'United Kingdom',
    terminals: ['T2', 'T3', 'T5 VIP'],
  },
  {
    code: 'JFK',
    name: 'John F. Kennedy International Airport',
    city: 'New York',
    country: 'United States',
    terminals: ['T1', 'T4', 'T7 Prestige'],
  },
  {
    code: 'HND',
    name: 'Tokyo Haneda Airport',
    city: 'Tokyo',
    country: 'Japan',
    terminals: ['T1', 'T2', 'T3 Imperial'],
  },
  {
    code: 'SIN',
    name: 'Singapore Changi Airport',
    city: 'Singapore',
    country: 'Singapore',
    terminals: ['T1', 'T2', 'T3', 'T4 SilverKris'],
  },
  {
    code: 'CDG',
    name: 'Charles de Gaulle Airport',
    city: 'Paris',
    country: 'France',
    terminals: ['2E Royal', '2F', 'T1'],
  },
];

// Sample airlines for realistic flight variety
const airlinesData = [
  { name: 'GoldenWing Airways', logo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=120' },
  { name: 'Emirates First', logo: 'https://images.unsplash.com/photo-1520437358207-323b43b50729?w=120' },
  { name: 'Singapore Suites', logo: 'https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?w=120' },
  { name: 'Qatar QSuite', logo: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=120' },
  { name: 'British Airways Club', logo: 'https://images.unsplash.com/photo-1508873696983-2df5293cb39f?w=120' },
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in .env. Please configure connection string.');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('✈️ [Seed] Connected to MongoDB Atlas');

    // Clear existing airports & flights
    await Airport.deleteMany({});
    await Flight.deleteMany({});
    console.log('🧹 [Seed] Cleared legacy airports and flight records');

    // Insert airports
    const createdAirports = await Airport.insertMany(airportsData);
    console.log(`🌍 [Seed] Created ${createdAirports.length} global airport hubs`);

    // Create Demo User
    let demoUser = await User.findOne({ email: 'elite@goldenwing.com' });
    if (!demoUser) {
      demoUser = await User.create({
        name: 'Alexander Vance',
        email: 'elite@goldenwing.com',
        password: 'password123',
        phone: '+1 555-0199',
        role: 'user',
      });
      console.log('👑 [Seed] Created Demo User: elite@goldenwing.com / password123');
    }

    // Create Admin User
    let adminUser = await User.findOne({ email: 'admin@goldenwing.com' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Admin GoldenWing',
        email: 'admin@goldenwing.com',
        password: 'admin123',
        phone: '+1 555-0100',
        role: 'admin',
      });
      console.log('🔐 [Seed] Created Admin User: admin@goldenwing.com / admin123');
    }

    // Routes template
    const routes = [
      { src: 'DXB', dst: 'LHR', fn: 'GW-101', dur: '7h 30m', durMins: 450, price: 1850, cls: 'First Class' },
      { src: 'LHR', dst: 'JFK', fn: 'GW-204', dur: '8h 10m', durMins: 490, price: 2100, cls: 'First Class' },
      { src: 'JFK', dst: 'DXB', fn: 'GW-305', dur: '12h 20m', durMins: 740, price: 3400, cls: 'First Class' },
      { src: 'DXB', dst: 'SIN', fn: 'GW-402', dur: '7h 20m', durMins: 440, price: 1650, cls: 'Business' },
      { src: 'SIN', dst: 'HND', fn: 'GW-508', dur: '6h 50m', durMins: 410, price: 1450, cls: 'Business' },
      { src: 'HND', dst: 'CDG', fn: 'GW-601', dur: '13h 40m', durMins: 820, price: 3800, cls: 'First Class' },
      { src: 'CDG', dst: 'DXB', fn: 'GW-709', dur: '6h 40m', durMins: 400, price: 1550, cls: 'Business' },
      { src: 'LHR', dst: 'DXB', fn: 'GW-102', dur: '7h 20m', durMins: 440, price: 1800, cls: 'First Class' },
      { src: 'DXB', dst: 'JFK', fn: 'EK-201', dur: '14h 10m', durMins: 850, price: 2950, cls: 'First Class' },
      { src: 'SIN', dst: 'LHR', fn: 'SQ-318', dur: '13h 15m', durMins: 795, price: 2600, cls: 'Business' },
      { src: 'LHR', dst: 'CDG', fn: 'BA-308', dur: '1h 25m', durMins: 85, price: 420, cls: 'Economy' },
      { src: 'JFK', dst: 'HND', fn: 'JL-005', dur: '14h 25m', durMins: 865, price: 3100, cls: 'First Class' },
    ];

    const departureTimes = ['06:30', '08:45', '11:15', '14:30', '18:00', '21:45', '23:30'];
    const arrivalTimes = ['14:00', '16:55', '18:35', '21:00', '02:20', '07:30', '09:15'];

    const flightsToInsert = [];
    const today = new Date();

    // Generate flights across the next 14 days
    for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
      routes.forEach((route, idx) => {
        const depDate = new Date(today);
        depDate.setDate(today.getDate() + dayOffset);
        depDate.setHours(0, 0, 0, 0);

        const arrDate = new Date(depDate);
        if (route.durMins > 720) {
          arrDate.setDate(arrDate.getDate() + 1);
        }

        const airlineObj = airlinesData[idx % airlinesData.length];
        const totalSeats = route.cls === 'First Class' ? 60 : (route.cls === 'Business' ? 120 : 180);
        const bookedRatio = 0.2 + (idx * 0.05) % 0.5;
        const availableSeats = Math.round(totalSeats * (1 - bookedRatio));

        flightsToInsert.push({
          flightNumber: `${route.fn}-${dayOffset + 1}`,
          airline: airlineObj.name,
          airlineLogo: airlineObj.logo,
          source: route.src,
          destination: route.dst,
          departureTime: departureTimes[idx % departureTimes.length],
          arrivalTime: arrivalTimes[idx % arrivalTimes.length],
          duration: route.dur,
          durationMinutes: route.durMins,
          departureDate: depDate,
          arrivalDate: arrDate,
          price: route.price,
          totalSeats,
          availableSeats,
          travelClass: route.cls,
          status: 'Scheduled',
        });
      });
    }

    await Flight.insertMany(flightsToInsert);
    console.log(`✈️ [Seed] Inserted ${flightsToInsert.length} luxury flights across 14-day schedule`);

    console.log('✅ [Seed] Database seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ [Seed Error]:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
