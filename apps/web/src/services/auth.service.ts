const API_BASE_URL = 'http://localhost:3000/api';

export const authService = {
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || 'Login failed');
    }
    return result.data;
  },

  async register(email: string, password: string, name: string) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || 'Registration failed');
    }
    // Register only returns userId, accessToken. 
    // We might need to fetch the profile or just construct a partial user.
    return result.data;
  },

  async logout(refreshToken: string) {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
  }
};
