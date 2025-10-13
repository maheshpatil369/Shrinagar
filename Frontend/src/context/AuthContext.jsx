// FILENAME: src/context/AuthContext.jsx
//
// This file creates a global state manager for authentication.
// It handles login, logout, registration, and keeps track of the
// current user's data and token throughout the entire application.

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// --- API Client Setup ---
// We create a single, configured instance of Axios to communicate with the backend.

// IMPORTANT FOR YOUR LOCAL VITE PROJECT:
// 1. Create a file named .env in the root of your frontend project.
// 2. Add this line to the .env file: VITE_API_URL=http://localhost:8000
// 3. Uncomment the line below to use the environment variable.
// const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// This hardcoded URL is used to fix the compilation error and make the code runnable here.
// You should replace this with the line above in your actual project.
const baseURL = 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: baseURL,
});


// Use an interceptor to automatically add the JWT token to the
// 'Authorization' header for every protected API request.
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shringar_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 1. Create the context
const AuthContext = createContext();

// 2. Create the provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('shringar_token'));
  const [loading, setLoading] = useState(true); // To handle initial auth check

  // This effect runs when the app first loads.
  // It checks if a token exists in local storage and, if so,
  // fetches the user's profile to validate the session.
  useEffect(() => {
    const validateUser = async () => {
      if (token) {
        try {
          // The interceptor automatically adds the token to this request
          const { data } = await apiClient.get('/api/users/profile');
          setUser(data);
        } catch (error) {
          console.error('Session validation failed:', error);
          // If token is invalid, log the user out
          logout();
        }
      }
      setLoading(false);
    };
    validateUser();
  }, [token]);

  // --- Core Authentication Functions ---

  const login = async (email, password) => {
    try {
      const { data } = await apiClient.post('/api/auth/login', { email, password });
      localStorage.setItem('shringar_token', data.token);
      setToken(data.token);
      setUser(data); // The response from your API includes user details
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await apiClient.post('/api/auth/register', { name, email, password });
      localStorage.setItem('shringar_token', data.token);
      setToken(data.token);
      setUser(data);
      return { success: true };
    } catch (error) {
        return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('shringar_token');
    setToken(null);
    setUser(null);
  };

  // The value that will be available to all consuming components
  const value = {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* We don't render children until the initial auth check is complete */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 3. Create a custom hook for easy access to the context
export const useAuth = () => {
  return useContext(AuthContext);
};

