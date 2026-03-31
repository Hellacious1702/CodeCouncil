import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, RotateCcw, Shield, Zap, Key } from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';

const NeuralSettings = ({ isOpen, onClose }) => {
  const { 
    customSigmaPrompt, setSigmaPrompt,
    customDeltaPrompt, setDeltaPrompt,
    customJudgePrompt, setJudgePrompt,
    neuralProvider, setNeuralProvider,
    resetToDefault
  } = useSettingsStore();

  if (!isOpen) return null;

  const providers = [
    { id: 'gemini', name: 'Deep Neural', sub: 'Gemini 2.5', color: 'text-primary-container', desc: 'Slower, but high-reasoning arbitration.' },
    { id: 'groq', name: 'Fast Neural', sub: 'Llama 3', color: 'text-secondary', desc: 'Lightning fast, high availability.' },
    { id: 'local', name: 'Hard-Coded Logic', sub: 'RSA Engine', color: 'text-outline', desc: 'Deterministic analysis. No API required.' }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-surface/80 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-2xl bg-surface border border-outline-variant/50 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 bg-surface-container-low">
            <div className="flex items-center gap-3">
              <Settings className="text-primary-container w-5 h-5" />
              <h2 className="text-lg font-bold tracking-tighter text-on-surface uppercase">Neural Reconfiguration</h2>
            </div>
            <button onClick={onClose} className="text-outline hover:text-on-surface transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar">
            
            {/* Provider Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-outline">
                <Settings size={14} />
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-on-surface/60">Select Neural Provider</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {providers.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setNeuralProvider(p.id)}
                    className={`
                      flex flex-col p-3 border text-left transition-all duration-300
                      ${neuralProvider === p.id 
                        ? 'bg-surface-container-low border-primary-container shadow-[0_0_15px_rgba(0,251,251,0.1)]' 
                        : 'bg-transparent border-outline-variant/20 hover:border-outline-variant/50 opacity-60 hover:opacity-100'}
                    `}
                  >
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${p.color}`}>{p.name}</span>
                    <span className="text-[8px] font-mono opacity-50 mt-1">{p.sub}</span>
                    <p className="text-[7px] text-outline mt-2 leading-tight uppercase font-mono">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-outline-variant/10 w-full" />
            
            {/* Sigma Override */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-error">
                <Shield size={14} />
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold">Sigma Overrider [SEC]</span>
              </div>
              <textarea 
                value={customSigmaPrompt}
                onChange={(e) => setSigmaPrompt(e.target.value)}
                placeholder="Defaults to Hostile Paranoid Audit..."
                className="w-full h-24 bg-surface-container-lowest border border-outline-variant/30 p-3 text-xs font-mono text-on-surface outline-none focus:border-error/50 transition-colors resize-none"
              />
            </div>

            {/* Delta Override */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-secondary">
                <Zap size={14} />
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold">Delta Overrider [PERF]</span>
              </div>
              <textarea 
                value={customDeltaPrompt}
                onChange={(e) => setDeltaPrompt(e.target.value)}
                placeholder="Defaults to Ruthless Performance Audit..."
                className="w-full h-24 bg-surface-container-lowest border border-outline-variant/30 p-3 text-xs font-mono text-on-surface outline-none focus:border-secondary/50 transition-colors resize-none"
              />
            </div>

            {/* Judge Override */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-primary-container">
                <Key size={14} />
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold">Judicial Resolver</span>
              </div>
              <textarea 
                value={customJudgePrompt}
                onChange={(e) => setJudgePrompt(e.target.value)}
                placeholder="Defaults to Elite Architect Synthesis..."
                className="w-full h-24 bg-surface-container-lowest border border-outline-variant/30 p-3 text-xs font-mono text-on-surface outline-none focus:border-primary-container/50 transition-colors resize-none"
              />
            </div>

          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-outline-variant/30 bg-surface-container-low flex justify-between items-center">
            <button 
              onClick={resetToDefault}
              className="flex items-center gap-2 text-[10px] font-mono text-outline hover:text-error transition-colors uppercase tracking-widest"
            >
              <RotateCcw size={12} /> Purge Overrides
            </button>
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-primary-container text-surface text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary-container/80 transition-all"
            >
              Sync Neural Link
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NeuralSettings;
