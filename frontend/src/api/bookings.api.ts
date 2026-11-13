import { apiClient } from './client';
import { ApiResponse, Booking, CabinClass, Passenger } from '../types';

export interface CreateBookingPayload {
  flightId: string;
  passengers: Array<{
    fullName: string;
    passportNumber: string;
    seatNumber: string;
    gender?: 'male' | 'female' | 'other';
    dateOfBirth?: string;
  }>;
  selectedSeats?: string[];
  cabinClass?: CabinClass;
  contactDetails?: {
    email: string;
    phone: string;
  };
  paymentMethod?: string;
}

export const bookingsApi = {
  // POST /api/bookings (Atomic seat lock, simulated payment & ticket generation)
  async createBooking(payload: CreateBookingPayload): Promise<Booking> {
    const res = await apiClient.post<ApiResponse<Booking>>('/bookings', payload);
    return res.data.data;
  },

  // GET /api/bookings/my-trips (Logged-in user bookings)
  async getMyBookings(): Promise<Booking[]> {
    const res = await apiClient.get<ApiResponse<Booking[]>>('/bookings/my-trips');
    return res.data.data;
  },

  // GET /api/bookings/:id (Booking details by ID or PNR)
  async getBookingById(id: string): Promise<Booking> {
    const res = await apiClient.get<ApiResponse<Booking>>(`/bookings/${id}`);
    return res.data.data;
  },

  // POST /api/bookings/:id/cancel (Cancel booking, restore seats, simulated refund)
  async cancelBooking(id: string): Promise<Booking> {
    const res = await apiClient.post<ApiResponse<Booking>>(`/bookings/${id}/cancel`);
    return res.data.data;
  },
};
