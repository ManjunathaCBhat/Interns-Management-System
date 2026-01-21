import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/intern';
import apiClient from '@/lib/api';


interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    password: string,
    role: 'intern' | 'admin'
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
      const { access_token } = response.data;
      
      // Store token
      localStorage.setItem('ilm_token', access_token);
      
      // Fetch user profile
      await fetchCurrentUser();
      
      return { success: true };
    } catch (error: any) {
  console.error('Register error:', error.response?.data);

  return {
    success: false,
    error:
      error.response?.data?.detail ||
      error.response?.data?.message ||
      'Backend registration failed',
     };
  }
};

  const register = async (
  name: string,
  email: string,
  password: string,
  role: 'intern' | 'admin'
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await apiClient.post('/auth/register', {
  full_name: name,
  email,
  password,
  role: role.toUpperCase(), // INTERN | ADMIN
});
    return { success: true };
  } catch (error: any) {
    console.error('Register error:', error);
    return {
      success: false,
      error: error.response?.data?.detail || 'Registration failed',
    };
  }
};

  const logout = () => {
    localStorage.removeItem('ilm_token');
    localStorage.removeItem('ilm_user');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
  value={{
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
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