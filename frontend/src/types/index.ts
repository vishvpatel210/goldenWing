export type CabinClass = 'economy' | 'business' | 'first';

export interface Airport {
  _id: string;
  code: string;
  name: string;
  city: string;
  country: string;
  terminals: string[];
}

export interface Seat {
  seatNumber: string;
  cabinClass: CabinClass;
  isBooked: boolean;
  priceMultiplier?: number;
}

export interface FlightClassInfo {
  price: number;
  availableSeats: number;
  baggageAllowance: string;
}

export interface Flight {
  _id: string;
  flightNumber: string;
  airline: string;
  aircraft: string;
  departureAirport: Airport;
  arrivalAirport: Airport;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  gate: string;
  terminal: string;
  status: 'Scheduled' | 'Boarding' | 'Departed' | 'Arrived' | 'Delayed' | 'Cancelled';
  classes: {
    economy: FlightClassInfo;
    business: FlightClassInfo;
    first: FlightClassInfo;
  };
  seats: Seat[];
}

export interface Passenger {
  fullName: string;
  passportNumber: string;
  seatNumber: string;
  ticketNumber?: string;
  gender?: 'male' | 'female' | 'other';
}

export interface Booking {
  _id: string;
  pnr: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role?: string;
    frequentFlyerNumber?: string;
    membershipTier?: string;
  };
  flight: Flight;
  cabinClass: CabinClass;
  passengers: Passenger[];
  contactDetails: {
    email: string;
    phone: string;
  };
  totalAmount: number;
  paymentStatus: 'Pending' | 'Completed' | 'Refunded' | 'Failed';
  paymentMethod: string;
  status: 'Confirmed' | 'Cancelled' | 'Completed';
  qrCodeData?: string;
  createdAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  passportNumber?: string;
  frequentFlyerNumber?: string;
  membershipTier?: string;
  savedPassengers?: Array<{
    fullName: string;
    passportNumber: string;
    gender?: 'male' | 'female' | 'other';
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
}

