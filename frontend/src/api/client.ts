import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { storage } from '../utils/storage';

/**
 * Dynamically resolves the API base URL based on environment and platform.
 * 1. Checks EXPO_PUBLIC_API_URL environment variable first (if supplied in .env)
 * 2. In browser / web mode -> http://localhost:5000/api
 * 3. On physical device with Expo Go -> Uses dynamic host machine IP (Constants.expoConfig?.hostUri)
 * 4. Android Emulator fallback -> http://10.0.2.2:5000/api
 * 5. iOS Simulator fallback -> http://localhost:5000/api
 */
const getBaseUrl = (): string => {
  // Check process.env.EXPO_PUBLIC_API_URL first
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api';
  }

  // If running via Expo Go on physical phone or simulator
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    const ip = debuggerHost.split(':')[0];
    return `http://${ip}:5000/api`;
  }

  // Android emulator loopback
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }

  // iOS simulator loopback
  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer token from Expo SecureStore
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await storage.getItem('goldenwing_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Failed to retrieve token from storage', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Format error messages & handle 401 unauthenticated
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 401 Unauthorized / Token Expired handling
    if (error.response?.status === 401) {
      try {
        await storage.removeItem('goldenwing_token');
        await storage.removeItem('goldenwing_user');
      } catch {
        // Ignore removal error
      }
    }

    const customMessage =
      error.response?.data?.message ||
      (error.message === 'Network Error'
        ? 'Cannot connect to GoldenWing luxury servers. Please check your network or server status.'
        : error.message) ||
      'An unexpected error occurred while communicating with the flight service.';

    return Promise.reject(new Error(customMessage));
  }
);
