import { apiClient } from './client';
import { ApiResponse, AuthResponse, User } from '../types';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  // POST /api/auth/register
  async register(data: RegisterPayload): Promise<AuthResponse> {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return res.data.data;
  },

  // POST /api/auth/login
  async login(data: LoginPayload): Promise<AuthResponse> {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return res.data.data;
  },

  // GET /api/users/profile (requires JWT)
  async getProfile(): Promise<User> {
    const res = await apiClient.get<ApiResponse<User>>('/users/profile');
    return res.data.data;
  },

  // PUT /api/users/profile (requires JWT)
  async updateProfile(data: Partial<Pick<User, 'name' | 'phone'>> & { password?: string }): Promise<User> {
    const res = await apiClient.put<ApiResponse<User>>('/users/profile', data);
    return res.data.data;
  },
};
