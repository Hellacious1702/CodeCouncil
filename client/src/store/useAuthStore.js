import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Auth Store - JWT persistence
export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('cc_user')) || null,
  token: localStorage.getItem('cc_token') || null,
  loading: false,
  error: null,

  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { username, password });
      const { _id, username: name, token } = res.data;
      localStorage.setItem('cc_user', JSON.stringify({ _id, username: name }));
      localStorage.setItem('cc_token', token);
      set({ user: { _id, username: name }, token, loading: false });
      return true;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Login failed', loading: false });
      return false;
    }
  },

  register: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { username, password });
      const { _id, username: name, token } = res.data;
      localStorage.setItem('cc_user', JSON.stringify({ _id, username: name }));
      localStorage.setItem('cc_token', token);
      set({ user: { _id, username: name }, token, loading: false });
      return true;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Registration failed', loading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('cc_user');
    localStorage.removeItem('cc_token');
    set({ user: null, token: null });
  },

  clearError: () => set({ error: null }),
}));
