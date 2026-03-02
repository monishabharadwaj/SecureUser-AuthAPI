import { useEffect, useMemo, useState } from 'react';
import { AuthContext } from './AuthContext';
import { refreshTokenStorage } from './tokenStorage';
import { authService } from '../api/authService';
import { configureApiClient } from '../api/client';

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(refreshTokenStorage.get());
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const saveSession = ({ accessToken: nextAccessToken, refreshToken: nextRefreshToken, user: nextUser }) => {
    setAccessToken(nextAccessToken);
    setRefreshToken(nextRefreshToken);
    setUser(nextUser ?? null);
    if (nextRefreshToken) {
      refreshTokenStorage.set(nextRefreshToken);
    }
  };

  const clearSession = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    refreshTokenStorage.clear();
  };

  const login = async (credentials) => {
    const { data } = await authService.login(credentials);
    saveSession(data);
    return data;
  };

  const register = async (payload) => {
    const { data } = await authService.register(payload);
    return data;
  };

  const refreshAccessToken = async (currentRefreshToken) => {
    const { data } = await authService.refresh(currentRefreshToken);
    return data;
  };

  const logout = async () => {
    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } finally {
      clearSession();
    }
  };

  useEffect(() => {
    configureApiClient({
      getAccessToken: () => accessToken,
      getRefreshToken: () => refreshToken,
      onNewTokens: (tokens) => {
        saveSession({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          user: tokens.user || user
        });
      },
      onAuthFailure: clearSession,
      onRefreshRequest: refreshAccessToken
    });
  }, [accessToken, refreshToken, user]);

  useEffect(() => {
    const restore = async () => {
      if (!refreshToken) {
        setIsBootstrapping(false);
        return;
      }

      try {
        const tokens = await refreshAccessToken(refreshToken);
        saveSession(tokens);
      } catch {
        clearSession();
      } finally {
        setIsBootstrapping(false);
      }
    };

    restore();
  }, []);

  const value = useMemo(
    () => ({
      accessToken,
      refreshToken,
      user,
      isAuthenticated: Boolean(accessToken),
      isBootstrapping,
      login,
      register,
      logout
    }),
    [accessToken, refreshToken, user, isBootstrapping]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
