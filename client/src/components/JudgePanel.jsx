import React from 'react';
import { Gavel, Maximize2, CheckCircle, Code } from 'lucide-react';
import useReviewStore from '../store/useReviewStore';

const JudgePanel = () => {
  const { results, status, setFocusData } = useReviewStore();
  const isAnalyzing = status === 'ANALYZING' || status === 'RESOLVING';

  const handleFocus = () => {
    if (results?.judgeResolution) {
      setFocusData({
        type: 'judge',
        content: `VERDICT:\n${results.judgeResolution}\n\nREASONING_TRACE:\n${results.reasoningTrace || 'N/A'}`,
        provider: results.provider
      });
    }
  };

  return (
    <div className="flex flex-col h-full group">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-outline-variant/10 bg-surface-container-lowest/50">
        <div className="flex items-center gap-2">
          <Gavel size={12} className="text-primary-container" />
          <span className="text-[10px] font-mono text-outline uppercase tracking-widest font-bold">Judicial_Arbitrator [Synthesis]</span>
        </div>
        {results?.judgeResolution && (
          <button 
            onClick={handleFocus}
            className="text-outline hover:text-primary-container transition-colors"
            title="Focus Mode"
          >
            <Maximize2 size={12} />
          </button>
        )}
      </div>

      {/* Content Area */}
      <div 
        className={`flex-1 cc-panel-scroll p-6 font-mono text-[11px] leading-relaxed transition-all ${!results?.judgeResolution ? 'flex items-center justify-center' : ''}`}
      >
        {isAnalyzing ? (
          <div className="flex flex-col items-center gap-2 opacity-40">
            <Gavel size={24} className="animate-spin text-primary-container" />
            <span className="animate-pulse uppercase tracking-[0.2em]">Resolving Agent Conflict...</span>
          </div>
        ) : results?.judgeResolution ? (
          <div className="space-y-6">
            <div 
              onClick={handleFocus}
              className="p-4 border border-primary-container/20 bg-primary-container/5 rounded cursor-pointer hover:bg-primary-container/10 transition-all"
            >
               <div className="flex items-center gap-2 mb-3 text-primary-container uppercase text-[9px] font-bold tracking-widest">
                  <CheckCircle size={10} />
                  Resolution Summary
               </div>
               <p className="text-on-surface leading-normal text-xs">{results.judgeResolution}</p>
            </div>

            {results?.optimizedCode && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-outline uppercase text-[9px] font-bold tracking-widest">
                  <Code size={10} />
                  Optimized_Refactor
                </div>
                <div className="p-4 bg-surface-container-highest/20 border border-outline-variant/10 rounded text-[10px] whitespace-pre-wrap text-on-surface-variant font-mono">
                  {results.optimizedCode}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-20">
            <Gavel size={32} />
            <span className="uppercase tracking-[0.3em]">Arbitrator Standby</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default JudgePanel;
