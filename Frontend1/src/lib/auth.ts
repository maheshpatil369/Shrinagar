// /Frontend1/src/lib/auth.ts
// This file has been updated with the correct signup endpoint and logout/getCurrentUser functions.

import { api } from './api'; // Correctly using a named import

// This User interface now matches the backend response, including 'role'
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'seller' | 'admin';
  token: string;
}

// Type for the login form credentials
interface LoginCredentials {
  email: string;
  password: string;
}

// Type for the signup form credentials, now including the role
interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'seller';
}

export async function login(credentials: LoginCredentials): Promise<User> {
  const response = await api.post('/auth/login', credentials);
  if (response.status !== 200) {
    const errorMessage = response.data?.message || 'Login failed';
    throw new Error(errorMessage);
  }
  return response.data;
}

export async function signup(credentials: SignupCredentials): Promise<User> {
  // CORRECTED: The endpoint was changed from '/api/auth/users' to '/api/auth/register'
  // to match the backend routes defined in your README.md.
  const response = await api.post('/auth/register', credentials);
  if (response.status !== 201) {
    const errorMessage = response.data?.message || 'Signup failed';
    throw new Error(errorMessage);
  }
  return response.data;
}

// New function to verify token with the backend
export async function verifyToken(token: string): Promise<User> {
  try {
    // FIXED: Changed from api.post to api.get to match the backend route definition.
    // A GET request does not have a body, so the headers object is the second argument.
    const response = await api.get(
      '/auth/verify-token',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status !== 200) {
      throw new Error('Token verification failed');
    }
    return response.data;
  } catch (err) {
    // If token is invalid, backend sends 401, which axios throws as an error.
    // We clear the invalid user info from storage and re-throw the error.
    localStorage.removeItem('userInfo');
    throw err;
  }
}


// New function to get user data from localStorage
export function getCurrentUser(): User | null {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    return JSON.parse(userInfo);
  }
  return null;
}

// New function to handle user logout
export function logout() {
  localStorage.removeItem('userInfo');
  window.location.href = '/auth'; // Redirect to login page
}
