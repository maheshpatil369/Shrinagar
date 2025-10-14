import { api, type SignupData, type LoginData } from './api';

export type UserRole = 'buyer' | 'seller' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export const signup = async (data: SignupData): Promise<User> => {
  const response = await api.register(data);
  const authUser: User = response.user;
  localStorage.setItem('user', JSON.stringify(authUser));
  localStorage.setItem('auth_token', `mock_token_${authUser.id}`);
  return authUser;
};

export const login = async (data: LoginData): Promise<User> => {
  const response = await api.login(data);
  const authUser: User = response.user;
  localStorage.setItem('user', JSON.stringify(authUser));
  localStorage.setItem('auth_token', `mock_token_${authUser.id}`);
  return authUser;
};

export const logout = async () => {
  await api.logout();
  localStorage.removeItem('user');
  localStorage.removeItem('auth_token');
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('auth_token');
};
