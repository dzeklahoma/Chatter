import { apiClient } from './client';

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  encrypted: boolean;
}

export const getMessages = async (chatId: string): Promise<Message[]> => {
  try {
    const response = await apiClient.get(`/messages/${chatId}`);
    return response.data.messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

export const sendMessage = async (
  chatId: string,
  content: string,
  type: 'text' | 'image' | 'file' = 'text',
  file?: File
): Promise<Message> => {
  try {
    if (type === 'text') {
      const response = await apiClient.post(`/messages/${chatId}`, { content, type });
      return response.data.message;
    } else {
      // Handle file uploads
      const formData = new FormData();
      formData.append('content', content);
      formData.append('type', type);
      if (file) {
        formData.append('file', file);
      }
      
      const response = await apiClient.post(`/messages/${chatId}/media`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.message;
    }
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const markMessageAsRead = async (messageId: string): Promise<void> => {
  try {
    await apiClient.put(`/messages/${messageId}/read`);
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

export const deleteMessage = async (messageId: string): Promise<void> => {
  try {
    await apiClient.delete(`/messages/${messageId}`);
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};