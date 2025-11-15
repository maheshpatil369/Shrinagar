// maheshpatil369/shrinagar/Shrinagar-f1ede353ebcd0107a58d8a5b477911c8c5eb4f1d/Frontend1/src/lib/api.ts
import axios from 'axios';
import { logout } from './auth'; // Import the logout function

export const api = axios.create({
  baseURL: '/api',
});

// Add a response interceptor
api.interceptors.response.use(
  (response) => response, // Directly return successful responses
  (error) => {
    // Check if the error is a 401 Unauthorized response
    if (error.response && error.response.status === 401) {
      // If it is, log the user out. This will clear the invalid token
      // and redirect them to the login page.
      logout();
    }
    // For all other errors, just pass them along
    return Promise.reject(error);
  }
);

