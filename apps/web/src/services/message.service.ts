import axios from 'axios';

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
    const token = localStorage.getItem('accessToken');
    const response = await axios.get(`${API_URL}/${chatId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data || [];
  },

  async sendMessage(chatId: string, content: string): Promise<Message> {
    const token = localStorage.getItem('accessToken');
    // Generate a unique ID for idempotency/duplication prevention
    const clientMessageId = crypto.randomUUID();
    
    // type is 'text' by default for now
    const payload = { 
      chatId, 
      content,
      clientMessageId,
      type: 'text'
    };
    
    const response = await axios.post(API_URL, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  }
};
