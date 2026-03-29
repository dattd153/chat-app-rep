import axios from 'axios';

const API_URL = '/api/notifications';

export interface Notification {
  _id: string;
  userId: string;
  type: 'message' | 'friend_request' | 'friend_accepted';
  refId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    const token = localStorage.getItem('accessToken');
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data || [];
  },

  async markAsRead(id: string): Promise<Notification> {
    const token = localStorage.getItem('accessToken');
    const response = await axios.patch(`${API_URL}/${id}/read`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  },

  async markAllAsRead(): Promise<{ success: boolean }> {
    const token = localStorage.getItem('accessToken');
    const response = await axios.patch(`${API_URL}/read-all`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  }
};
