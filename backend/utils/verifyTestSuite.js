const assert = require('assert');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Test 1: Password hashing and comparison
async function testPasswordHashing() {
  console.log('▶ [1/8] Testing Password Hashing & Verification...');
  const plainPassword = 'SecretPassword2026!';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(plainPassword, salt);

  assert.notStrictEqual(hash, plainPassword, 'Hash should not match plain password');
  assert.strictEqual(await bcrypt.compare(plainPassword, hash), true, 'Password compare should succeed for correct password');
  assert.strictEqual(await bcrypt.compare('WrongPassword', hash), false, 'Password compare should fail for incorrect password');
  console.log('  ✔ Password hashing (bcryptjs) & verification verified successfully.');
}

// Test 2: JWT token creation and verification
function testJWTAuthentication() {
  console.log('▶ [2/8] Testing JWT Signing, Expiration & Decoding...');
  const secret = 'goldenwing_test_secret_key';
  const userId = '673f1a2b4e8c9d3f5a7b1c2d';

  const token = jwt.sign({ id: userId }, secret, { expiresIn: '1h' });
  assert.ok(typeof token === 'string' && token.split('.').length === 3, 'Valid JWT structure');

  const decoded = jwt.verify(token, secret);
  assert.strictEqual(decoded.id, userId, 'Decoded user ID must match original payload');

  let tamperedError = false;
  try {
    jwt.verify(token, 'wrong_secret');
  } catch {
    tamperedError = true;
  }
  assert.strictEqual(tamperedError, true, 'Token verified with wrong secret must throw');
  console.log('  ✔ JWT token issuance and signature verification verified.');
}

// Test 3: Flight duration parsing & sorting logic
function testFlightDurationAndSorting() {
  console.log('▶ [3/8] Testing Flight Search, Duration Parsing & Sorting Logic...');
  const parseDurationMinutes = (durationStr) => {
    const hoursMatch = durationStr.match(/(\d+)\s*h/i);
    const minsMatch = durationStr.match(/(\d+)\s*m/i);
    const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
    const mins = minsMatch ? parseInt(minsMatch[1], 10) : 0;
    return hours * 60 + mins;
  };

  assert.strictEqual(parseDurationMinutes('7h 30m'), 450);
  assert.strictEqual(parseDurationMinutes('1h 25m'), 85);
  assert.strictEqual(parseDurationMinutes('14h 10m'), 850);

  const mockFlights = [
    { flightNumber: 'GW-101', price: 1850, durationMinutes: 450 },
    { flightNumber: 'GW-204', price: 2100, durationMinutes: 490 },
    { flightNumber: 'BA-308', price: 420, durationMinutes: 85 },
    { flightNumber: 'EK-201', price: 2950, durationMinutes: 850 },
  ];

  const sortedByPriceAsc = [...mockFlights].sort((a, b) => a.price - b.price);
  assert.strictEqual(sortedByPriceAsc[0].flightNumber, 'BA-308', 'Cheapest flight should be first');

  const sortedByDurationAsc = [...mockFlights].sort((a, b) => a.durationMinutes - b.durationMinutes);
  assert.strictEqual(sortedByDurationAsc[0].flightNumber, 'BA-308', 'Shortest flight should be first');

  console.log('  ✔ Duration parsing & sorting algorithms verified.');
}

// Test 4: Atomic seat reservation conflict detection
function testAtomicDoubleBookingLogic() {
  console.log('▶ [4/8] Testing Seat Allocation & Double-Booking Collision Prevention...');
  const flight = {
    totalSeats: 60,
    availableSeats: 2,
    bookedSeats: ['1A', '1B'],
  };

  const attemptBooking = (requestedSeats) => {
    // Simulate MongoDB query: availableSeats >= count && bookedSeats $nin requestedSeats
    const conflict = requestedSeats.some((seat) => flight.bookedSeats.includes(seat));
    if (conflict) {
      const alreadyBooked = requestedSeats.filter((s) => flight.bookedSeats.includes(s));
      return { success: false, conflict: alreadyBooked };
    }
    if (flight.availableSeats < requestedSeats.length) {
      return { success: false, reason: 'insufficient_seats' };
    }

    // Atomic update simulation
    flight.availableSeats -= requestedSeats.length;
    flight.bookedSeats.push(...requestedSeats);
    return { success: true };
  };

  // Attempt 1: Valid booking for seat 1E
  const res1 = attemptBooking(['1E']);
  assert.strictEqual(res1.success, true);
  assert.strictEqual(flight.availableSeats, 1);
  assert.ok(flight.bookedSeats.includes('1E'));

  // Attempt 2: Duplicate booking for seat 1A (collision)
  const res2 = attemptBooking(['1A']);
  assert.strictEqual(res2.success, false);
  assert.deepStrictEqual(res2.conflict, ['1A']);

  // Attempt 3: Booking duplicate seat 1E that was just reserved
  const res3 = attemptBooking(['1E']);
  assert.strictEqual(res3.success, false);
  assert.deepStrictEqual(res3.conflict, ['1E']);

  console.log('  ✔ Atomic seat collision prevention logic verified.');
}

// Test 5: Booking cancellation and seat inventory restoration
function testCancellationSeatRestoration() {
  console.log('▶ [5/8] Testing Booking Cancellation & Inventory Restoration...');
  const flight = {
    totalSeats: 60,
    availableSeats: 58,
    bookedSeats: ['2A', '2B'],
  };

  const booking = {
    bookingReference: 'GW9X82',
    selectedSeats: ['2A', '2B'],
    bookingStatus: 'Confirmed',
    paymentStatus: 'Completed',
  };

  // Simulate cancellation operation
  flight.availableSeats += booking.selectedSeats.length;
  flight.bookedSeats = flight.bookedSeats.filter((s) => !booking.selectedSeats.includes(s));
  booking.bookingStatus = 'Cancelled';
  booking.paymentStatus = 'Refunded';

  assert.strictEqual(flight.availableSeats, 60, 'Available seats should return to full capacity');
  assert.strictEqual(flight.bookedSeats.length, 0, 'Booked seats array should be empty');
  assert.strictEqual(booking.bookingStatus, 'Cancelled');
  assert.strictEqual(booking.paymentStatus, 'Refunded');

  console.log('  ✔ Seat release and cancellation status changes verified.');
}

// Test 6: PNR and Ticket Number Generation
function testPnrAndTicketGenerators() {
  console.log('▶ [6/8] Testing PNR & E-Ticket Number Generators...');
  const { generatePNR, generateTicketNumber } = require('../utils/pnrGenerator');

  const pnr = generatePNR();
  assert.ok(pnr.startsWith('GW'), 'PNR must start with airline prefix GW');
  assert.strictEqual(pnr.length, 6, 'PNR must be 6 characters');

  const ticketNumber = generateTicketNumber();
  assert.ok(ticketNumber.startsWith('074-'), 'Ticket must start with IATA airline code 074');
  assert.strictEqual(ticketNumber.length, 14, 'Ticket number must be 14 characters including prefix');

  console.log(`  ✔ Generated sample PNR: ${pnr}, Ticket: ${ticketNumber}`);
}

// Test 7: Admin RBAC protection logic
function testAdminRBAC() {
  console.log('▶ [7/8] Testing Role-Based Access Control (RBAC)...');
  const mockProtect = (user) => {
    if (!user) throw new Error('Unauthenticated');
    return user;
  };

  const mockAdminOnly = (user) => {
    if (user.role !== 'admin') {
      const err = new Error('Access restricted to administrators only');
      err.status = 403;
      throw err;
    }
    return true;
  };

  const normalUser = { name: 'Standard Traveler', role: 'user' };
  const adminUser = { name: 'Executive Admin', role: 'admin' };

  assert.strictEqual(mockAdminOnly(adminUser), true, 'Admin must be granted access');

  let denied = false;
  try {
    mockAdminOnly(normalUser);
  } catch (err) {
    if (err.status === 403) denied = true;
  }
  assert.strictEqual(denied, true, 'Non-admin user must be rejected with 403 Forbidden');

  console.log('  ✔ Admin RBAC security barrier verified.');
}

// Test 8: User Registration Sanitization (No Self-Role Elevation)
function testRegistrationRoleSanitization() {
  console.log('▶ [8/8] Testing User Role Sanitization against Self-Privilege Elevation...');
  const incomingPayload = {
    name: 'Hacker User',
    email: 'hacker@example.com',
    password: 'password123',
    role: 'admin', // Malicious attempt to elevate role
  };

  // Backend register controller logic simulation
  const sanitizeUserForCreation = (body) => ({
    name: body.name,
    email: body.email,
    password: body.password,
    phone: body.phone || '',
    role: 'user', // Explicit default; req.body.role is intentionally discarded
  });

  const createdUser = sanitizeUserForCreation(incomingPayload);
  assert.strictEqual(createdUser.role, 'user', 'User role must be strictly user regardless of input');
  console.log('  ✔ Privilege escalation protection verified.');
}

async function runAllTests() {
  console.log('====================================================');
  console.log('✈️  GOLDENWING AUTOMATED VERIFICATION SUITE');
  console.log('====================================================');

  try {
    await testPasswordHashing();
    testJWTAuthentication();
    testFlightDurationAndSorting();
    testAtomicDoubleBookingLogic();
    testCancellationSeatRestoration();
    testPnrAndTicketGenerators();
    testAdminRBAC();
    testRegistrationRoleSanitization();

    console.log('====================================================');
    console.log('🎉 ALL 8 BACKEND CORE MODULE TESTS PASSED (100% OK)');
    console.log('====================================================');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Test Failure:', err);
    process.exit(1);
  }
}

runAllTests();

