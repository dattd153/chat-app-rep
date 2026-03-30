import axios from 'axios';

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
    const token = localStorage.getItem('accessToken');
    try {
      const response = await axios.get(`${API_URL}/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch {
      return null;
    }
  },

  async searchUsers(query: string): Promise<UserProfile[]> {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await axios.get(`${API_URL}/search?q=${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data || [];
    } catch {
      return [];
    }
  },

  async sendFriendRequest(friendId: string): Promise<{ success: boolean }> {
    const token = localStorage.getItem('accessToken');
    const response = await axios.post(`${API_URL}/friends/request`, { friendId }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  },

  async acceptFriendRequest(friendId: string): Promise<{ success: boolean }> {
    const token = localStorage.getItem('accessToken');
    const response = await axios.post(`${API_URL}/friends/accept`, { friendId }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  },

  async getFriendList(): Promise<UserProfile[]> {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await axios.get(`${API_URL}/friends`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data || [];
    } catch {
      return [];
    }
  },

  async getPendingRequests(): Promise<UserProfile[]> {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await axios.get(`${API_URL}/friends/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data || [];
    } catch {
      return [];
    }
  }
};
