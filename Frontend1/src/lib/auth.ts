// /Frontend1/src/lib/auth.ts
// This file has been updated with logout and getCurrentUser functions.

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
  const response = await api.post('/auth/users', credentials);
  if (response.status !== 201) {
    const errorMessage = response.data?.message || 'Signup failed';
    throw new Error(errorMessage);
  }
  return response.data;
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

