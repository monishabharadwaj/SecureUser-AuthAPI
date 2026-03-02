import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8084/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL
});

let getAccessToken = () => null;
let getRefreshToken = () => null;
let onNewTokens = () => {};
let onAuthFailure = () => {};
let onRefreshRequest = async () => {
  throw new Error('Refresh handler not configured');
};

let isRefreshing = false;
let queue = [];

function flushQueue(error, token = null) {
  queue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
      return;
    }
    resolve(token);
  });
  queue = [];
}

export function configureApiClient(config) {
  getAccessToken = config.getAccessToken;
  getRefreshToken = config.getRefreshToken;
  onNewTokens = config.onNewTokens;
  onAuthFailure = config.onAuthFailure;
  onRefreshRequest = config.onRefreshRequest;
}

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      onAuthFailure();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    isRefreshing = true;

    try {
      const tokens = await onRefreshRequest(refreshToken);
      onNewTokens(tokens);
      flushQueue(null, tokens.accessToken);
      originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      flushQueue(refreshError, null);
      onAuthFailure();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
