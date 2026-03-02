import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8084/api';

export const authService = {
  register(payload) {
    return axios.post(`${API_BASE_URL}/auth/register`, payload);
  },
  login(payload) {
    return axios.post(`${API_BASE_URL}/auth/login`, payload);
  },
  refresh(refreshToken) {
    return axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
  },
  logout(refreshToken) {
    return axios.post(`${API_BASE_URL}/auth/logout`, { refreshToken });
  },
  getUsers(accessToken) {
    return axios.get(`${API_BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
  }
};
