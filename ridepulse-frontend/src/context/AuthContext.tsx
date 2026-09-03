import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

export interface DriverUser {
  id: string;
  name: string;
  email: string;
  role: string;
  assignedShuttle?: string | null;
}

interface AuthContextType {
  driverUser: DriverUser | null;
  driverToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'ridepulse_driver_token';
const USER_KEY = 'ridepulse_driver_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [driverUser, setDriverUser] = useState<DriverUser | null>(null);
  const [driverToken, setDriverToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load existing session on initial mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);

      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.role === 'driver') {
          setDriverToken(storedToken);
          setDriverUser(parsedUser);
        }
      }
    } catch (err) {
      console.error('Error loading stored auth session:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();

      // Basic validation
      if (!cleanEmail || !cleanPassword) {
        return { success: false, message: 'Please provide both email and password.' };
      }

      // Try Backend API First
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user && data.user.role === 'driver') {
            const token = data.token || 'mock_jwt_token_driver';
            setDriverToken(token);
            setDriverUser(data.user);
            localStorage.setItem(TOKEN_KEY, token);
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            return { success: true };
          } else if (data.user && data.user.role !== 'driver') {
            return { success: false, message: 'Access denied. Account is not a registered driver.' };
          }
        }
      } catch (err) {
        console.warn('Backend API connection unavailable, evaluating credentials locally:', err);
      }

      // Explicit local fallback check for required demo driver credentials: driver@gmail.com / 123456789
      if (cleanEmail === 'driver@gmail.com' && cleanPassword === '123456789') {
        const demoUser: DriverUser = {
          id: 'drv-101',
          name: 'John Doe',
          email: 'driver@gmail.com',
          role: 'driver',
          assignedShuttle: 'sh-101',
        };
        const demoToken = 'ridepulse_demo_driver_session_token_123456789';

        setDriverToken(demoToken);
        setDriverUser(demoUser);
        localStorage.setItem(TOKEN_KEY, demoToken);
        localStorage.setItem(USER_KEY, JSON.stringify(demoUser));
        return { success: true };
      }

      return { success: false, message: 'Invalid email or password. Please check your credentials.' };
    },
    []
  );

  const logout = useCallback(() => {
    setDriverUser(null);
    setDriverToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        driverUser,
        driverToken,
        isAuthenticated: !!driverUser && !!driverToken,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
