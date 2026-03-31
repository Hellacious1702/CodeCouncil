import React from 'react';
import { Zap, Maximize2 } from 'lucide-react';
import useReviewStore from '../store/useReviewStore';

const DeltaPanel = () => {
  const { results, status, setFocusData } = useReviewStore();
  const isAnalyzing = status === 'ANALYZING' || status === 'RESOLVING';

  const handleFocus = () => {
    if (results?.optimizerOutput) {
      setFocusData({
        type: 'delta',
        content: results.optimizerOutput,
        provider: results.provider
      });
    }
  };

  return (
    <div className="flex flex-col h-full group">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-outline-variant/10 bg-surface-container-lowest/50">
        <div className="flex items-center gap-2">
          <Zap size={12} className="text-secondary" />
          <span className="text-[10px] font-mono text-outline uppercase tracking-widest font-bold">Agent_Delta [Performance]</span>
        </div>
        {results?.optimizerOutput && (
          <button 
            onClick={handleFocus}
            className="text-outline hover:text-secondary transition-colors"
            title="Focus Mode"
          >
            <Maximize2 size={12} />
          </button>
        )}
      </div>

      {/* Content Area */}
      <div 
        onClick={handleFocus}
        className={`flex-1 cc-panel-scroll p-4 font-mono text-[11px] leading-relaxed cursor-pointer transition-all hover:bg-surface-bright/5 ${!results?.optimizerOutput ? 'flex items-center justify-center' : ''}`}
      >
        {isAnalyzing ? (
          <div className="flex flex-col items-center gap-2 opacity-40">
            <Zap size={24} className="animate-pulse text-secondary" />
            <span className="animate-pulse uppercase tracking-[0.2em]">Tracing Execution Path...</span>
          </div>
        ) : results?.optimizerOutput ? (
          <div className="text-on-surface-variant whitespace-pre-wrap selection:bg-secondary/30">
            {results.optimizerOutput}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-20">
            <Zap size={32} />
            <span className="uppercase tracking-[0.3em]">Optimizer Standby</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeltaPanel;
