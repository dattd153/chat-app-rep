import { apiClient } from '../lib/axios';

export const authService = {
  async login(email: string, password: string) {
    const response = await apiClient.post('/api/auth/login', { email, password });
    // refreshToken is set as httpOnly cookie by server — not in response body
    return response.data.data; // { user, accessToken, expiresIn }
  },

  async register(email: string, password: string, name: string) {
    const response = await apiClient.post('/api/auth/register', { email, password, name });
    // refreshToken is set as httpOnly cookie by server — not in response body
    return response.data.data; // { userId, accessToken }
  },

  async logout() {
    // Server clears the httpOnly cookie
    await apiClient.post('/api/auth/logout');
  },
};
