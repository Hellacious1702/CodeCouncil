import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Review Store - MAS AI state machine
export const useReviewStore = create((set, get) => ({
  status: 'IDLE', // IDLE -> ANALYZING -> RESOLVING -> COMPLETE -> ERROR
  code: '// Enter JavaScript to review\nfunction example() {\n  return "Hello MAS!";\n}',
  results: null,
  error: null,

  setCode: (code) => set({ code }),

  submitForReview: async () => {
    set({ status: 'ANALYZING', error: null, results: null });

    try {
      // Grab JWT token if the user is authenticated
      const token = localStorage.getItem('cc_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.post(
        `${API_URL}/ai/review`,
        { code: get().code, language: 'javascript' },
        { headers }
      );

      const data = res.data.data;

      // Map backend fields to our UI-friendly names
      set({
        status: 'RESOLVING',
        results: {
          securityAudit: data.auditorOutput,
          performanceAudit: data.optimizerOutput,
          judgeResolution: data.judgeResolution,
          reasoningTrace: data.reasoningTrace,
          optimizedCode: data.judgeResolution,
          conflictDetected: data.conflictDetected,
        }
      });

      // Dramatic reveal delay for the Judge
      setTimeout(() => {
        set({ status: 'COMPLETE' });
      }, 2000);

    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      // Detect Gemini-specific 503 errors and provide a friendly message
      if (msg.includes('high demand') || msg.includes('UNAVAILABLE') || msg.includes('503')) {
        set({ status: 'ERROR', error: 'The Gemini AI model is currently experiencing high demand. Please wait a moment and try again.' });
      } else {
        set({ status: 'ERROR', error: msg });
      }
    }
  },

  reset: () => set({ status: 'IDLE', results: null, error: null })
}));
