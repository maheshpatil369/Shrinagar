// /Frontend1/src/lib/api.ts
import axios from 'axios';
import { logout } from './auth'; // Import the logout function

export const api = axios.create({
  baseURL: '/api',
});

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response, // Directly return successful responses
  (error) => {
    // Check if the error is a 401 Unauthorized
    if (error.response && error.response.status === 401) {
      console.error("Authentication error: 401 Unauthorized. Logging out.");
      // If it is, call the logout function which will clear user data and redirect
      logout();
    }
    // IMPORTANT: Reject the promise so the calling component knows the request failed
    return Promise.reject(error);
  }
);
