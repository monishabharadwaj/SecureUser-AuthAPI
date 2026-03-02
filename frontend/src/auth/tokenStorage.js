const REFRESH_TOKEN_KEY = 'secureuser_refresh_token';

export const refreshTokenStorage = {
  get() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  set(token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },
  clear() {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};
