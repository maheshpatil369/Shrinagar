import axios from 'axios';
import { logout } from './auth';

export const api = axios.create({
  baseURL: '/api',
});

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token fails verification, log out
      logout();
    }
    return Promise.reject(error);
  }
);

// FIX: Exporting the default axios instance for use in lib/admin.ts
export { axios };