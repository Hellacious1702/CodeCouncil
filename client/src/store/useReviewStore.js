import { create } from 'zustand';
import axios from 'axios';

// The state machine for the dashboard: IDLE -> ANALYZING -> RESOLVING -> COMPLETE / ERROR
export const useReviewStore = create((set) => ({
  status: 'IDLE',
  code: '// Enter JavaScript to review\nfunction example() {\n  return "Hello MAS!";\n}',
  results: null,
  error: null,

  setCode: (code) => set({ code }),
  
  submitForReview: async () => {
    set({ status: 'ANALYZING', error: null, results: null });
    
    try {
      // Step 1: Simulated delay to show the Security and Performance agents debating
      const res = await axios.post('http://localhost:5000/api/ai/review', {
        code: useReviewStore.getState().code,
        language: 'javascript'
      });
      
      // Step 2: The Judge's resolution begins
      set({ status: 'RESOLVING', results: res.data.data });
      
      // Step 3: Reveal final code after a dramatic UI pause
      setTimeout(() => {
        set({ status: 'COMPLETE' });
      }, 2000);

    } catch (err) {
      set({ status: 'ERROR', error: err.response?.data?.message || err.message });
    }
  },

  reset: () => set({ status: 'IDLE', results: null, error: null })
}));
