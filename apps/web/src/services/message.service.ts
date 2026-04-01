import { apiClient } from '../lib/axios';

const API_URL = '/api/messages';

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  createdAt: string;
  status: 'sent' | 'delivered' | 'seen';
}

export const messageService = {
  async getMessages(chatId: string): Promise<Message[]> {
    const response = await apiClient.get(`${API_URL}/${chatId}`);
    return response.data.data || [];
  },

  async sendMessage(chatId: string, content: string): Promise<Message> {
    const clientMessageId = crypto.randomUUID();
    const response = await apiClient.post(API_URL, {
      chatId,
      content,
      clientMessageId,
      type: 'text'
    });
    return response.data.data;
  }
};
