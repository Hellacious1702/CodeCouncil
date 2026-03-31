import React from 'react';
import { Shield, Maximize2 } from 'lucide-react';
import useReviewStore from '../store/useReviewStore';

const SigmaPanel = () => {
  const { results, status, setFocusData } = useReviewStore();
  const isAnalyzing = status === 'ANALYZING' || status === 'RESOLVING';

  const handleFocus = () => {
    if (results?.auditorOutput) {
      setFocusData({
        type: 'sigma',
        content: results.auditorOutput,
        provider: results.provider
      });
    }
  };

  return (
    <div className="flex flex-col h-full group">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-outline-variant/10 bg-surface-container-lowest/50">
        <div className="flex items-center gap-2">
          <Shield size={12} className="text-error" />
          <span className="text-[10px] font-mono text-outline uppercase tracking-widest font-bold">Agent_Sigma [Security]</span>
        </div>
        {results?.auditorOutput && (
          <button 
            onClick={handleFocus}
            className="text-outline hover:text-error transition-colors"
            title="Focus Mode"
          >
            <Maximize2 size={12} />
          </button>
        )}
      </div>

      {/* Content Area */}
      <div 
        onClick={handleFocus}
        className={`flex-1 cc-panel-scroll p-4 font-mono text-[11px] leading-relaxed cursor-pointer transition-all hover:bg-surface-bright/5 ${!results?.auditorOutput ? 'flex items-center justify-center' : ''}`}
      >
        {isAnalyzing ? (
          <div className="flex flex-col items-center gap-2 opacity-40">
            <Shield size={24} className="animate-pulse text-error" />
            <span className="animate-pulse uppercase tracking-[0.2em]">Intercepting Neural Stream...</span>
          </div>
        ) : results?.auditorOutput ? (
          <div className="text-on-surface-variant whitespace-pre-wrap selection:bg-error/30">
            {results.auditorOutput}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-20">
            <Shield size={32} />
            <span className="uppercase tracking-[0.3em]">Auditor Standby</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SigmaPanel;
