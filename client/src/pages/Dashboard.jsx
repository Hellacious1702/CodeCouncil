import React, { useState } from 'react';
import { Play, Copy, CheckCircle, ChevronDown, RotateCcw, Monitor } from 'lucide-react';
import CodeEditor from '../components/CodeEditor';
import DebateLog from '../components/DebateLog';
import { useReviewStore } from '../store/useReviewStore';

const Dashboard = () => {
  const { 
    code, setCode, 
    status, submitForReview, 
    language, setLanguage,
    isResolved, markResolved,
    reset 
  } = useReviewStore();

  const [copySuccess, setCopySuccess] = useState(false);

  const isAnalyzing = status === 'ANALYZING' || status === 'RESOLVING';

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const languages = ['javascript', 'python', 'cpp', 'go'];

  return (
    <div className="flex-1 flex flex-col pt-16 pb-0 min-h-screen bg-surface overflow-hidden">
      
      {/* Top Protocol Bar */}
      <div className="h-14 border-b border-outline-variant/30 flex items-center justify-between px-6 bg-surface-container-lowest/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 group cursor-pointer">
            <Monitor size={14} className="text-primary-container" />
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-xs font-mono uppercase tracking-widest text-primary outline-none cursor-pointer hover:text-primary-container transition-colors"
            >
              {languages.map(lang => (
                <option key={lang} value={lang} className="bg-surface text-on-surface">{lang}</option>
              ))}
            </select>
          </div>

          <div className="h-4 w-px bg-outline-variant/30" />

          <div className="flex items-center gap-4 text-[10px] font-mono text-outline uppercase tracking-[0.2em]">
            <span className={status === 'IDLE' ? 'text-primary' : ''}>Input</span>
            <span className="opacity-30">{'>>'}</span>
            <span className={isAnalyzing ? 'text-secondary animate-pulse' : ''}>Analyze</span>
            <span className="opacity-30">{'>>'}</span>
            <span className={status === 'COMPLETE' ? 'text-primary-container' : ''}>Resolve</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {status === 'COMPLETE' && (
            <button
              onClick={() => markResolved(!isResolved)}
              className={`flex items-center gap-2 px-3 py-1.5 border transition-all duration-300 text-[10px] uppercase tracking-widest font-bold ${
                isResolved 
                  ? 'bg-primary-container/20 border-primary-container text-primary-container' 
                  : 'border-outline/30 text-outline hover:border-primary-container/50'
              }`}
            >
              <CheckCircle size={12} className={isResolved ? 'fill-current' : ''} />
              {isResolved ? 'Resolved' : 'Mark Resolved'}
            </button>
          )}

          <button 
            onClick={submitForReview}
            disabled={isAnalyzing}
            className={`
              flex items-center gap-2 px-6 py-1.5 border border-primary-container/50 bg-primary-container/10
              text-primary-container uppercase tracking-widest text-[11px] font-bold hover:bg-primary-container hover:text-surface
              transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed
              ${isAnalyzing ? 'animate-pulse' : 'shadow-[0_0_15px_rgba(0,251,251,0.1)]'}
            `}
          >
            <Play size={12} fill="currentColor" className={isAnalyzing ? 'animate-spin' : ''} />
            {isAnalyzing ? 'Processing...' : 'Engage Engine'}
          </button>

          {status !== 'IDLE' && !isAnalyzing && (
            <button 
              onClick={reset}
              className="p-1.5 text-outline hover:text-primary transition-colors"
              title="Reset Session"
            >
              <RotateCcw size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Split Pane Container */}
      <div className="flex-1 flex w-full relative h-[calc(100vh-7.5rem)] overflow-hidden">
        
        {/* Left Pane - Code Editor */}
        <div className="w-[55%] h-full border-r border-outline-variant/30 bg-surface-container-lowest/30 relative flex flex-col">
          <div className="flex items-center justify-between px-6 py-2 bg-surface-container-low/50 border-b border-outline-variant/20">
            <span className="text-[10px] font-mono text-outline uppercase tracking-widest">Source Protocol</span>
            <button 
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-[10px] font-mono text-outline hover:text-primary-container transition-colors uppercase"
            >
              {copySuccess ? <CheckCircle size={12} /> : <Copy size={12} />}
              {copySuccess ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="flex-1 relative overflow-hidden bg-[#0a0a0a]">
            {/* Scanline effect for editor */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-10 opacity-30" />
            <CodeEditor 
              value={code} 
              onChange={setCode} 
              editable={!isAnalyzing} 
            />
          </div>
        </div>

        {/* Right Pane - Debate Log */}
        <div className="w-[45%] h-full bg-surface-container/30 relative overflow-y-auto custom-scrollbar">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(235,178,255,0.05),transparent_50%)] pointer-events-none" />
          <div className="p-6">
            <DebateLog />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
