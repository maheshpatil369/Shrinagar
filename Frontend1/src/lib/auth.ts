// Frontend1/src/lib/auth.ts
import { api } from './api';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'seller' | 'admin';
  token: string;
  sellerProfile?: string; // Optional field from user model
  wishlist?: string[]; // Optional field from user model
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'seller';
}

export async function login(credentials: LoginCredentials): Promise<User> {
  const response = await api.post('/auth/login', credentials);
  if (response.status !== 200 || !response.data) {
    const errorMessage = response.data?.message || 'Login failed';
    throw new Error(errorMessage);
  }
  return response.data;
}

export async function signup(credentials: SignupCredentials): Promise<User> {
  const response = await api.post('/auth/register', credentials);
  if (response.status !== 201 || !response.data) {
    const errorMessage = response.data?.message || 'Signup failed';
    throw new Error(errorMessage);
  }
  return response.data;
}

export async function verifyToken(token: string): Promise<User> {
  try {
    const response = await api.get(
      '/auth/verify-token',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status !== 200 || !response.data) {
      throw new Error('Token verification failed');
    }
    return response.data;
  } catch (err) {
    localStorage.removeItem('userInfo');
    throw err;
  }
}

export function getCurrentUser(): User | null {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    try {
      return JSON.parse(userInfo);
    } catch (e) {
      localStorage.removeItem('userInfo');
      return null;
    }
  }
  return null;
}

export function logout() {
  localStorage.removeItem('userInfo');
}
