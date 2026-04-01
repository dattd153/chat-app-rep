import { apiClient } from '../lib/axios';

const API_URL = '/api/users';

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  online?: boolean;
  status?: string;
}

export const userService = {
  async getUser(userId: string): Promise<UserProfile | null> {
    try {
      const response = await apiClient.get(`${API_URL}/${userId}`);
      return response.data.data;
    } catch {
      return null;
    }
  },

  async searchUsers(query: string): Promise<UserProfile[]> {
    try {
      const response = await apiClient.get(`${API_URL}/search?q=${query}`);
      return response.data.data || [];
    } catch {
      return [];
    }
  },

  async sendFriendRequest(friendId: string): Promise<{ success: boolean }> {
    const response = await apiClient.post(`${API_URL}/friends/request`, { friendId });
    return response.data.data;
  },

  async acceptFriendRequest(friendId: string): Promise<{ success: boolean }> {
    const response = await apiClient.post(`${API_URL}/friends/accept`, { friendId });
    return response.data.data;
  },

  async getFriendList(): Promise<UserProfile[]> {
    try {
      const response = await apiClient.get(`${API_URL}/friends`);
      return response.data.data || [];
    } catch {
      return [];
    }
  },

  async getPendingRequests(): Promise<UserProfile[]> {
    try {
      const response = await apiClient.get(`${API_URL}/friends/pending`);
      return response.data.data || [];
    } catch {
      return [];
    }
  }
};
