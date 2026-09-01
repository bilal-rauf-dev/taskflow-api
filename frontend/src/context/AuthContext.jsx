import React, { createContext, useContext, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { GUEST_TOKEN, isGuestToken, createGuestUser } from '../api/guestSession';

const AuthContext = createContext(null);

const AUTH_KEYS = ['token', 'user'];

const getSessionStorage = () => {
  const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
  const token = storage.getItem('token');
  const serializedUser = storage.getItem('user');

  if (!token || !serializedUser) {
    return { token: null, user: null };
  }

  try {
    return { token, user: JSON.parse(serializedUser) };
  } catch {
    AUTH_KEYS.forEach((key) => storage.removeItem(key));
    return { token: null, user: null };
  }
};

const clearAuthStorage = () => {
  [localStorage, sessionStorage].forEach((storage) => {
    AUTH_KEYS.forEach((key) => storage.removeItem(key));
  });
};

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [session, setSession] = useState(getSessionStorage);
  const { token, user } = session;

  const saveSession = (authToken, authUser, remember) => {
    const storage = remember ? localStorage : sessionStorage;
    clearAuthStorage();
    storage.setItem('token', authToken);
    storage.setItem('user', JSON.stringify(authUser));
    setSession({ token: authToken, user: authUser });
  };

  const login = (authToken, authUser, remember = false) => {
    saveSession(authToken, authUser, remember);
  };

  // Guest Mode: a local-only session with no real backend involved. It reuses
  // the same token/user storage as a real login (with a sentinel token - see
  // api/guestSession.js) so isAuthenticated, ProtectedRoute, and every other
  // consumer of this context keep working unchanged. Task/board data itself
  // lives separately, in api/guestStore.js.
  const enterGuestMode = () => {
    saveSession(GUEST_TOKEN, createGuestUser(), true);
  };

  const updateSession = (authToken, authUser) => {
    saveSession(authToken, authUser, localStorage.getItem('token') !== null);
  };

  const logout = () => {
    clearAuthStorage();
    setSession({ token: null, user: null });
    navigate('/login', { replace: true });
  };

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      updateSession,
      logout,
      enterGuestMode,
      exitGuestMode: logout,
      isAuthenticated: Boolean(token),
      isAdmin: user?.role === 'admin',
      isGuest: isGuestToken(token)
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
