import axios from 'axios';
import { API_BASE_URL } from './config';
import { guestAdapter } from './guestAdapter';
import { isGuestToken } from './guestSession';

const api = axios.create({
  baseURL: API_BASE_URL
});

api.interceptors.request.use(
  (config) => {
    // Mirrors AuthContext's own storage resolution: a "remember me" login
    // lands in localStorage, otherwise the session lives in sessionStorage.
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Guest Mode never touches the network: every request is instead served
    // out of localStorage by guestAdapter, which returns the same response
    // shape the real backend would. See AuthContext#enterGuestMode.
    if (isGuestToken(token)) {
      config.adapter = guestAdapter;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
