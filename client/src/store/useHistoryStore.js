import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const useHistoryStore = create((set) => ({
  history: [],
  loading: false,
  error: null,

  fetchHistory: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('cc_token');
      const res = await axios.get(`${API_URL}/ai/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ history: res.data.data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch history', loading: false });
    }
  },

  deleteReview: async (id) => {
    // Optional: Add logic if needing to delete history items
  }
}));
