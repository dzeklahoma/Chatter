import { apiClient } from './client';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Chat {
  id: string;
  name?: string;
  type: 'private' | 'group';
  members: User[];
  createdAt: string;
  updatedAt: string;
  lastMessage?: {
    content: string;
    senderId: string;
    timestamp: string;
  };
  unreadCount: number;
}

export const getChats = async (): Promise<Chat[]> => {
  try {
    const response = await apiClient.get('/chats');
    return response.data.chats;
  } catch (error) {
    console.error('Error fetching chats:', error);
    throw error;
  }
};

export const getChat = async (chatId: string): Promise<Chat> => {
  try {
    const response = await apiClient.get(`/chats/${chatId}`);
    return response.data.chat;
  } catch (error) {
    console.error(`Error fetching chat ${chatId}:`, error);
    throw error;
  }
};

export const createPrivateChat = async (userId: string): Promise<Chat> => {
  try {
    const response = await apiClient.post('/chats/private', { userId });
    return response.data.chat;
  } catch (error) {
    console.error('Error creating private chat:', error);
    throw error;
  }
};

export const createGroupChat = async (name: string, memberIds: string[]): Promise<Chat> => {
  try {
    const response = await apiClient.post('/chats/group', { name, memberIds });
    return response.data.chat;
  } catch (error) {
    console.error('Error creating group chat:', error);
    throw error;
  }
};

export const updateGroupChat = async (chatId: string, name: string): Promise<Chat> => {
  try {
    const response = await apiClient.put(`/chats/group/${chatId}`, { name });
    return response.data.chat;
  } catch (error) {
    console.error('Error updating group chat:', error);
    throw error;
  }
};

export const addGroupMembers = async (chatId: string, memberIds: string[]): Promise<Chat> => {
  try {
    const response = await apiClient.post(`/chats/group/${chatId}/members`, { memberIds });
    return response.data.chat;
  } catch (error) {
    console.error('Error adding members to group chat:', error);
    throw error;
  }
};

export const removeGroupMember = async (chatId: string, memberId: string): Promise<Chat> => {
  try {
    const response = await apiClient.delete(`/chats/group/${chatId}/members/${memberId}`);
    return response.data.chat;
  } catch (error) {
    console.error('Error removing member from group chat:', error);
    throw error;
  }
};