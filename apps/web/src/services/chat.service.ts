import { apiClient } from '../lib/axios';

const API_URL = '/api/chats';

export interface Chat {
  id: string;
  name?: string;
  type: 'direct' | 'group';
  participants: string[];
  lastMessage?: {
    content: string;
    senderId: string;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const chatService = {
  async getChats(): Promise<Chat[]> {
    const response = await apiClient.get(API_URL);
    return response.data.data || [];
  },

  async createChat(participantIds: string[]): Promise<Chat> {
    const response = await apiClient.post(API_URL, {
      type: 'direct',
      memberIds: participantIds
    });
    return response.data.data;
  },

  async getChatMembers(chatId: string) {
    const response = await apiClient.get(`${API_URL}/${chatId}/members`);
    return response.data.data;
  }
};
