import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/intern';
import apiClient from '@/lib/api';


interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setAuthUser: (user: User, token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const inactivityLimitMs = 6 * 60 * 60 * 1000;

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('ilm_token');
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await apiClient.get('/users/me');
      const userData = response.data;
      setUser(userData);
      localStorage.setItem('ilm_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('ilm_token');
      localStorage.removeItem('ilm_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { access_token, user } = response.data;
      
      // Store token and user data
      localStorage.setItem('ilm_token', access_token);
      localStorage.setItem('ilm_user', JSON.stringify(user));
      localStorage.setItem('ilm_last_activity', Date.now().toString());
      setUser(user);
      
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Extract error message properly
      let errorMessage = 'Invalid email or password';
      
      if (error.response?.data) {
        const data = error.response.data;
        // Handle Pydantic validation errors
        if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map((err: any) => err.msg).join(', ');
        } else if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        }
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('ilm_token');
    localStorage.removeItem('ilm_user');
    localStorage.removeItem('ilm_last_activity');
    setUser(null);
    // Redirect to login page instead of using window.location for cleaner SPA behavior
  };

  const setAuthUser = (userData: User, token: string) => {
    localStorage.setItem('ilm_token', token);
    localStorage.setItem('ilm_user', JSON.stringify(userData));
    localStorage.setItem('ilm_last_activity', Date.now().toString());
    setUser(userData);
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    const updateActivity = () => {
      localStorage.setItem('ilm_last_activity', Date.now().toString());
    };

    const checkInactivity = () => {
      const last = Number(localStorage.getItem('ilm_last_activity') || 0);
      if (last && Date.now() - last > inactivityLimitMs) {
        localStorage.setItem('ilm_force_logout', Date.now().toString());
        logout();
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'ilm_force_logout') {
        logout();
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, updateActivity, true));
    window.addEventListener('storage', handleStorage);

    updateActivity();
    const interval = window.setInterval(checkInactivity, 60 * 1000);

    return () => {
      events.forEach((event) => window.removeEventListener(event, updateActivity, true));
      window.removeEventListener('storage', handleStorage);
      window.clearInterval(interval);
    };
  }, [user, inactivityLimitMs]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        setAuthUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
