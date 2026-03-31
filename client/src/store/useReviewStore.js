import { create } from 'zustand';
import axios from 'axios';
import { useSettingsStore } from './useSettingsStore';

const API_URL = 'http://localhost:5050/api';

// Review Store - MAS AI state machine
export const useReviewStore = create((set, get) => ({
  status: 'IDLE', // IDLE -> ANALYZING -> RESOLVING -> COMPLETE -> ERROR
  code: '// Enter code to review\nfunction example() {\n  return "Hello MAS!";\n}',
  language: 'javascript',
  results: null,
  error: null,
  isResolved: false,
  focusData: { isOpen: false, type: null, content: null, provider: null },

  setFocusData: (data) => set({ focusData: { ...data, isOpen: true } }),
  closeFocus: () => set((state) => ({ focusData: { ...state.focusData, isOpen: false } })),

  setLanguage: (language) => set({ language }),

  setCode: (code) => {
    const { status } = get();
    // Auto-reset if user starts typing after review is complete or while resolving/failing
    if (status !== 'IDLE' && status !== 'ANALYZING') {
      set({ code, status: 'IDLE', results: null, error: null, isResolved: false });
    } else {
      set({ code });
    }
  },

  markResolved: (val) => set({ isResolved: val }),

  submitReview: async () => {
    const { code, language } = get();
    const { customSigmaPrompt, customDeltaPrompt, customJudgePrompt, neuralProvider } = useSettingsStore.getState();
    set({ status: 'ANALYZING', error: null, results: null, isResolved: false });

    try {
      // Grab JWT token if the user is authenticated
      const token = localStorage.getItem('cc_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.post(
        `${API_URL}/ai/review`,
        { 
          code, 
          language,
          provider: neuralProvider,
          customSigmaPrompt,
          customDeltaPrompt,
          customJudgePrompt 
        },
        { headers }
      );

      const data = res.data.data;

      // Map backend fields to our UI-friendly names
      set({
        status: 'RESOLVING',
        results: {
          id: data._id,
          auditorOutput: data.auditorOutput,
          optimizerOutput: data.optimizerOutput,
          judgeResolution: data.judgeResolution,
          reasoningTrace: data.reasoningTrace,
          optimizedCode: data.optimizedCode || data.judgeResolution,
          conflictDetected: data.conflictDetected,
          provider: data.provider
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

  reset: () => set({ status: 'IDLE', results: null, error: null, isResolved: false })
}));

export default useReviewStore;
