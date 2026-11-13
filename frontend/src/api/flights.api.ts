import { apiClient } from './client';
import { ApiResponse, CabinClass, Flight } from '../types';

export interface SearchFlightParams {
  source?: string;
  destination?: string;
  departureDate?: string;
  airline?: string;
  minPrice?: number;
  maxPrice?: number;
  travelClass?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'duration_asc' | 'duration_desc' | 'departure_asc';
  page?: number;
  limit?: number;
  // Legacy aliases
  origin?: string;
  cabinClass?: CabinClass;
}

export interface FlightPaginationResult {
  flights: Flight[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const flightsApi = {
  // GET /api/flights (Search with query parameters, filtering, sorting and pagination)
  async searchFlights(params: SearchFlightParams): Promise<Flight[]> {
    const queryParams: Record<string, any> = { ...params };

    // Support legacy parameter name aliases
    if (params.origin && !params.source) {
      queryParams.source = params.origin;
    }
    if (params.cabinClass && !params.travelClass) {
      if (params.cabinClass === 'first') queryParams.travelClass = 'First Class';
      else if (params.cabinClass === 'business') queryParams.travelClass = 'Business';
      else queryParams.travelClass = 'Economy';
    }

    const res = await apiClient.get<ApiResponse<Flight[]>>('/flights', { params: queryParams });
    return res.data.data;
  },

  // GET /api/flights/:id
  async getFlightById(id: string): Promise<Flight> {
    const res = await apiClient.get<ApiResponse<Flight>>(`/flights/${id}`);
    return res.data.data;
  },

  // GET /api/flights (Featured: top 6 sorted by price)
  async getFeaturedFlights(): Promise<Flight[]> {
    const res = await apiClient.get<ApiResponse<Flight[]>>('/flights', {
      params: { limit: 6, sortBy: 'price_asc' },
    });
    return res.data.data;
  },
};
