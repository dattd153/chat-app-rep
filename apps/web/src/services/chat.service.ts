import axios from 'axios';

const API_URL = '/api/chats';

export interface Chat {
  id: string;
  name?: string;
  type: 'private' | 'group';
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
    const token = localStorage.getItem('accessToken');
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` }
    });
    // The response is { success: true, data: [...] } based on our controller patterns
    return response.data.data || [];
  },

  async createChat(participantIds: string[]): Promise<Chat> {
    const token = localStorage.getItem('accessToken');
    const response = await axios.post(API_URL, { 
      type: 'direct', 
      memberIds: participantIds 
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  },

  async getChatMembers(chatId: string) {
    const token = localStorage.getItem('accessToken');
    const response = await axios.get(`${API_URL}/${chatId}/members`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  }
};
