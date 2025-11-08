import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

// API base URL
const API_BASE_URL = '/api/v1';

interface User {
  id: number;
  email: string;
  username: string;
  language: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string, language: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('synapse_token');
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch current user info
  const fetchUser = async (authToken: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setUser(response.data);
    } catch (error) {
      // Token invalid, clear it
      localStorage.removeItem('synapse_token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
    console.log('Login response:', response.data);
    const { token: newToken, user: userData } = response.data;

    if (!newToken) {
      console.error('No token received from server!');
      throw new Error('No authentication token received');
    }

    // Save token FIRST before setting state
    localStorage.setItem('synapse_token', newToken);
    console.log('Token saved to localStorage:', newToken.substring(0, 20) + '...');
    setToken(newToken);
    setUser(userData);
  };

  const register = async (email: string, username: string, password: string, language: string) => {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, {
      email,
      username,
      password,
      language,
    });
    console.log('Register response:', response.data);
    const { token: newToken, user: userData } = response.data;

    if (!newToken) {
      console.error('No token received from server!');
      throw new Error('No authentication token received');
    }

    // Save token FIRST before setting state
    localStorage.setItem('synapse_token', newToken);
    console.log('Token saved to localStorage:', newToken.substring(0, 20) + '...');
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('synapse_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
