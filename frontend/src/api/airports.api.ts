import { apiClient } from './client';
import { Airport, ApiResponse } from '../types';

export const airportsApi = {
  async getAirports(query?: string): Promise<Airport[]> {
    const res = await apiClient.get<ApiResponse<Airport[]>>('/airports', {
      params: query ? { q: query } : undefined,
    });
    return res.data.data;
  },
};

