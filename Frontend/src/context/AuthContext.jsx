import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import apiClient from '../api/apiClient'; // Import the new API client
import Spinner from '../components/common/Spinner';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start with loading true

  // Function to check the user's authentication status with the backend
  const checkAuthStatus = useCallback(async () => {
    try {
      // This endpoint should return the user profile if the JWT cookie is valid
      const data = await apiClient('/users/profile');
      setUser(data);
    } catch (error) {
      // If the request fails (e.g., 401 Unauthorized), it means the user is not logged in
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (email, password) => {
    // The apiClient will throw an error on failure, which we can catch in the component
    const data = await apiClient('/auth/login', {
      body: { email, password },
      method: 'POST',
    });
    setUser(data);
    return data;
  };

  const register = async (name, email, password) => {
    const data = await apiClient('/auth/register', {
      body: { name, email, password },
      method: 'POST',
    });
    setUser(data);
    return data;
  };

  const logout = async () => {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails on the backend, clear the user state on the frontend
      setUser(null);
    }
  };

  const value = {
    user,
    setUser,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
  };

  // Render a loading spinner while checking auth status, then render the app
  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Spinner />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
