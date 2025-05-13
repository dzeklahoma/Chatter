import { apiClient } from './client';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const response = await apiClient.post('/auth/login', { email, password });
    const { token, user } = response.data;
    
    // Store the token in localStorage
    localStorage.setItem('token', token);
    
    return user;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Login failed. Please try again.');
  }
};

export const registerUser = async (
  name: string,
  email: string, 
  password: string
): Promise<User> => {
  try {
    const response = await apiClient.post('/auth/register', { name, email, password });
    const { token, user } = response.data;
    
    // Store the token in localStorage
    localStorage.setItem('token', token);
    
    return user;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Registration failed. Please try again.');
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('token');
  } catch (error) {
    console.error('Logout error:', error);
    // Still remove token on frontend even if server logout fails
    localStorage.removeItem('token');
  }
};

export const checkAuthStatus = async (): Promise<User | null> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }
    
    const response = await apiClient.get('/auth/me');
    return response.data.user;
  } catch (error) {
    console.error('Auth check error:', error);
    localStorage.removeItem('token');
    return null;
  }
};