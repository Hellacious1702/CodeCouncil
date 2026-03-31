import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSettingsStore = create(
  persist(
    (set) => ({
      customSigmaPrompt: '',
      customDeltaPrompt: '',
      customJudgePrompt: '',
      neuralProvider: 'gemini', // 'gemini' | 'groq' | 'local'
      
      setSigmaPrompt: (prompt) => set({ customSigmaPrompt: prompt }),
      setDeltaPrompt: (prompt) => set({ customDeltaPrompt: prompt }),
      setJudgePrompt: (prompt) => set({ customJudgePrompt: prompt }),
      setNeuralProvider: (provider) => set({ neuralProvider: provider }),
      
      resetToDefault: () => set({ 
        customSigmaPrompt: '', 
        customDeltaPrompt: '', 
        customJudgePrompt: '',
        neuralProvider: 'gemini'
      }),
    }),
    {
      name: 'code-council-settings',
    }
  )
);
