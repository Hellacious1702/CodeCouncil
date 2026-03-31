/* Dashboard.jsx - Production-Grade Monolith v3.0 */
import React, { useState } from 'react';
import useReviewStore from '../store/useReviewStore';
import { useSettingsStore } from '../store/useSettingsStore';
import CodeEditor from '../components/CodeEditor';
import SigmaPanel from '../components/SigmaPanel';
import DeltaPanel from '../components/DeltaPanel';
import JudgePanel from '../components/JudgePanel';
import FocusModal from '../components/FocusModal';
import NeuralSettings from '../components/NeuralSettings';
import { Play, RotateCcw, Settings, CheckCircle, Monitor } from 'lucide-react';

const Dashboard = () => {
  const { 
    code, setCode, 
    status, results, submitReview, 
    language, setLanguage,
    reset,
    focusData, closeFocus
  } = useReviewStore();

  const { neuralProvider } = useSettingsStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const isAnalyzing = status === 'ANALYZING' || status === 'RESOLVING';

  const handleEngage = () => {
    submitReview();
  };

  const languages = ['javascript', 'python', 'cpp', 'go'];

  return (
    <div className="flex-1 flex flex-col pt-16 min-h-screen bg-surface overflow-hidden font-sans">
      
      {/* MONOLITH HEADER PROTOCOL */}
      <div className="h-14 border-b border-outline-variant/30 flex items-center justify-between px-6 bg-surface-container-low/90 backdrop-blur-md z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 group cursor-pointer">
            <Monitor size={14} className="text-primary-container" />
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-[10px] font-mono uppercase tracking-[0.2em] text-primary outline-none cursor-pointer hover:text-primary-container transition-colors"
            >
              {languages.map(lang => (
                <option key={lang} value={lang} className="bg-surface-container-highest text-on-surface">{lang}</option>
              ))}
            </select>
          </div>

          <div className="h-4 w-px bg-outline-variant/20" />

          {/* Neural Status Stream */}
          <div className="flex items-center gap-4 text-[9px] font-mono text-outline uppercase tracking-[0.25em]">
            <span className={status === 'IDLE' ? 'text-primary' : ''}>Idle</span>
            <span className="opacity-20">{'>>'}</span>
            <span className={isAnalyzing ? 'text-secondary animate-pulse' : ''}>Neural_Stream</span>
            <span className="opacity-20">{'>>'}</span>
            <span className={status === 'COMPLETE' ? 'text-primary-container' : ''}>Synthesis_Ready</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={handleEngage}
            disabled={isAnalyzing}
            className={`
              flex items-center gap-2 px-6 py-1.5 border border-primary-container/40 bg-primary-container/5
              text-primary-container uppercase tracking-widest text-[10px] font-bold hover:bg-primary-container hover:text-surface
              transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed
              ${isAnalyzing ? 'glow-cyan' : ''}
            `}
          >
            <Play size={10} fill="currentColor" className={isAnalyzing ? 'animate-spin' : ''} />
            {isAnalyzing ? 'Neural Processing...' : 'Engage Engine'}
          </button>

          <button 
            onClick={reset}
            className="p-1.5 text-outline hover:text-primary transition-colors border border-transparent hover:border-outline-variant/30 rounded"
          >
            <RotateCcw size={14} />
          </button>

          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 text-outline hover:text-secondary transition-colors border border-transparent hover:border-outline-variant/30 rounded"
          >
            <Settings size={14} />
          </button>
        </div>
      </div>

      {/* FIXED 4-QUADRANT GRID */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 grid-rows-2 gap-px bg-outline-variant/10 h-[calc(100vh-120px)] overflow-hidden">
        
        {/* Block 1: CORE ARCHITECT (Editor) */}
        <div className="cc-quadrant-fixed bg-surface-container-low/40 relative">
           <div className="px-4 py-2 bg-surface-container-lowest/50 border-b border-outline-variant/10">
              <span className="text-[9px] font-mono text-outline uppercase tracking-widest font-bold">Protocol: Core_Architect [Input]</span>
           </div>
           <div className="flex-1 relative overflow-hidden">
             <CodeEditor 
                value={code} 
                onChange={setCode} 
                editable={!isAnalyzing} 
              />
           </div>
        </div>

        {/* Block 2: AGENT SIGMA (Security) */}
        <div className="cc-quadrant-fixed bg-surface-container-low/40 border-l border-outline-variant/10 overflow-hidden">
           <SigmaPanel />
        </div>

        {/* Block 3: THE JUDGE (Arbitration) */}
        <div className="cc-quadrant-fixed bg-surface-container-low/40 border-t border-outline-variant/10 overflow-hidden">
           <JudgePanel />
        </div>

        {/* Block 4: AGENT DELTA (Performance) */}
        <div className="cc-quadrant-fixed bg-surface-container-low/40 border-t border-l border-outline-variant/10 overflow-hidden">
           <DeltaPanel />
        </div>

      </div>

      {/* NEURAL MODALS */}
      <NeuralSettings 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

      <FocusModal 
        isOpen={focusData?.isOpen} 
        onClose={closeFocus} 
        data={focusData} 
      />
    </div>
  );
};

export default Dashboard;
