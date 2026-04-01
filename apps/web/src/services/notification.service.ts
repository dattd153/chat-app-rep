import { apiClient } from '../lib/axios';

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
    const response = await apiClient.get(API_URL);
    return response.data.data || [];
  },

  async markAsRead(id: string): Promise<Notification> {
    const response = await apiClient.patch(`${API_URL}/${id}/read`, {});
    return response.data.data;
  },

  async markAllAsRead(): Promise<{ success: boolean }> {
    const response = await apiClient.patch(`${API_URL}/read-all`, {});
    return response.data.data;
  }
};
