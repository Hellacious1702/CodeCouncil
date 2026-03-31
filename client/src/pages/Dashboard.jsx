import React from 'react';
import { Play } from 'lucide-react';
import CodeEditor from '../components/CodeEditor';
import DebateLog from '../components/DebateLog';
import { useReviewStore } from '../store/useReviewStore';

const Dashboard = () => {
  const { code, setCode, submitForReview, status } = useReviewStore();

  const isAnalyzing = status === 'ANALYZING' || status === 'RESOLVING';

  return (
    <div className="flex-1 flex flex-col pt-16 pb-10 min-h-screen bg-surface overflow-hidden">
      
      {/* Top Protocol Bar */}
      <div className="h-12 border-b border-outline-variant/30 flex items-center justify-between px-6 bg-surface-container-lowest text-xs font-mono">
        <div className="flex items-center gap-4 text-outline">
          <span className="uppercase tracking-widest text-primary">Core Architect [Input]</span>
          <span className="opacity-50">|</span>
          <span className="uppercase tracking-widest text-secondary">Neural Reasoner [Log]</span>
        </div>
        
        <button 
          onClick={submitForReview}
          disabled={isAnalyzing}
          className={`
            flex items-center gap-2 px-4 py-1.5 border border-primary-container/50 bg-primary-container/10
            text-primary-container uppercase tracking-widest hover:bg-primary-container hover:text-surface
            transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed
            ${isAnalyzing ? 'animate-pulse' : ''}
          `}
        >
          <Play size={14} className={isAnalyzing ? 'animate-spin' : ''} />
          {isAnalyzing ? 'Executing...' : 'Engage MAS Engine'}
        </button>
      </div>

      {/* Split Pane Container */}
      <div className="flex-1 flex w-full relative h-[calc(100vh-6.5rem)]">
        
        {/* Left Pane - Code Editor */}
        <div className="w-[60%] h-full border-r border-outline-variant/30 bg-surface-container-lowest/50 relative group">
          <div className="h-full p-4 relative z-10 glass-card mx-6 my-6 border-l-4 border-l-primary-container/80 shadow-[0_0_30px_rgba(0,251,251,0.05)]">
            <CodeEditor 
              value={code} 
              onChange={setCode} 
              editable={!isAnalyzing && status !== 'COMPLETE'} 
            />
          </div>
        </div>

        {/* Right Pane - Debate Log */}
        <div className="w-[40%] h-full bg-surface-container/30 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(235,178,255,0.05),transparent_50%)] pointer-events-none" />
          <DebateLog />
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
