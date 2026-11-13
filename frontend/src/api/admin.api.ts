import { apiClient } from './client';
import { ApiResponse, Booking, Flight } from '../types';

export interface AdminAnalytics {
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  totalFlights: number;
  totalUsers: number;
  overallOccupancyRate: number;
  bookedSeatsCount: number;
  recentBookings: Booking[];
}

export interface CreateFlightInput {
  flightNumber: string;
  airline?: string;
  airlineLogo?: string;
  source: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  departureDate: string;
  arrivalDate?: string;
  price: number;
  totalSeats?: number;
  availableSeats?: number;
  travelClass?: 'Economy' | 'Premium Economy' | 'Business' | 'First Class';
  status?: 'Scheduled' | 'Boarding' | 'Departed' | 'Arrived' | 'Delayed' | 'Cancelled';
}

export const adminApi = {
  // GET /api/admin/analytics (Dashboard statistics & revenue)
  async getAnalytics(): Promise<AdminAnalytics> {
    const res = await apiClient.get<ApiResponse<AdminAnalytics>>('/admin/analytics');
    return res.data.data;
  },

  // GET /api/admin/bookings (All bookings with passenger info)
  async getAllBookings(params?: { status?: string; search?: string; page?: number; limit?: number }): Promise<{
    bookings: Booking[];
    total: number;
  }> {
    const res = await apiClient.get<ApiResponse<Booking[]>>('/admin/bookings', { params });
    return {
      bookings: res.data.data,
      total: (res.data as any).pagination?.total || res.data.count || 0,
    };
  },

  // POST /api/flights (Add a flight)
  async createFlight(data: CreateFlightInput): Promise<Flight> {
    const res = await apiClient.post<ApiResponse<Flight>>('/flights', data);
    return res.data.data;
  },

  // PUT /api/flights/:id (Update flight details)
  async updateFlight(id: string, data: Partial<CreateFlightInput>): Promise<Flight> {
    const res = await apiClient.put<ApiResponse<Flight>>(`/flights/${id}`, data);
    return res.data.data;
  },

  // DELETE /api/flights/:id (Delete flight)
  async deleteFlight(id: string): Promise<void> {
    await apiClient.delete(`/flights/${id}`);
  },

  // PUT /api/admin/flights/:id/seats (Manage flight seat inventory)
  async updateSeats(id: string, data: { totalSeats?: number; availableSeats?: number; bookedSeats?: string[] }): Promise<Flight> {
    const res = await apiClient.put<ApiResponse<Flight>>(`/admin/flights/${id}/seats`, data);
    return res.data.data;
  },
};

