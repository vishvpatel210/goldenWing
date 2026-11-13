import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../api/auth.api';
import { storage } from '../utils/storage';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadSavedSession();
  }, []);

  const loadSavedSession = async () => {
    try {
      const savedToken = await storage.getItem('goldenwing_token');
      const savedUser = await storage.getItem('goldenwing_user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        // Verify token validity by silently fetching latest profile
        try {
          const freshUser = await authApi.getProfile();
          setUser(freshUser);
          await storage.setItem('goldenwing_user', JSON.stringify(freshUser));
        } catch {
          // Token expired or invalid - clear session
          await logout();
        }
      }
    } catch (e) {
      console.warn('Failed to restore auth session:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const data = await authApi.login(credentials);
      setUser(data.user);
      setToken(data.token);
      await storage.setItem('goldenwing_token', data.token);
      await storage.setItem('goldenwing_user', JSON.stringify(data.user));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: { name: string; email: string; password: string; phone?: string }) => {
    setIsLoading(true);
    try {
      const data = await authApi.register(userData);
      setUser(data.user);
      setToken(data.token);
      await storage.setItem('goldenwing_token', data.token);
      await storage.setItem('goldenwing_user', JSON.stringify(data.user));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await storage.removeItem('goldenwing_token');
    await storage.removeItem('goldenwing_user');
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const freshUser = await authApi.getProfile();
      setUser(freshUser);
      await storage.setItem('goldenwing_user', JSON.stringify(freshUser));
    } catch (err) {
      console.warn('Profile refresh failed:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
