import axios from 'axios';

const API_URL = '/api/users';

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
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
  }
};
