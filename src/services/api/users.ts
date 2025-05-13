import { apiClient } from './client';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status?: 'online' | 'offline';
  lastSeen?: string;
}

export const searchUsers = async (query: string): Promise<User[]> => {
  try {
    const response = await apiClient.get(`/users/search?q=${encodeURIComponent(query)}`);
    return response.data.users;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

export const getUserProfile = async (userId: string): Promise<User> => {
  try {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data.user;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateProfile = async (data: {
  name?: string;
  avatar?: File;
}): Promise<User> => {
  try {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.avatar) formData.append('avatar', data.avatar);
    
    const response = await apiClient.put('/users/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.user;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};