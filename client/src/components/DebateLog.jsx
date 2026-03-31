import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Shield, Zap, Search, Key } from 'lucide-react';
import { useReviewStore } from '../store/useReviewStore';

const DebateLog = () => {
  const { status, results, error } = useReviewStore();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { x: 50, opacity: 0 },
    show: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  if (status === 'IDLE') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-on-surface-variant p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded border-2 border-outline-variant/30 flex items-center justify-center bg-surface-container shadow-[0_0_20px_theme(colors.primary-container)]">
          <Search className="text-primary-container" size={32} />
        </div>
        <div>
          <h3 className="text-xl text-primary font-bold font-sans tracking-wide mb-2 uppercase">Awaiting Protocol</h3>
          <p className="font-mono text-sm max-w-sm font-light">
            Enter code in the Core Architect and engage the MAS Engine to begin multi-agent arbitration.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'ANALYZING') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 space-y-12">
        <div className="flex gap-16">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-14 h-14 bg-error-container/20 border border-error/50 flex items-center justify-center shadow-[0_0_15px_theme(colors.error)] animate-pulse">
              <Shield className="text-error" size={24} />
            </div>
            <span className="font-mono text-xs text-error uppercase tracking-widest">Agent_Sigma [SEC]</span>
          </div>
          <div className="flex flex-col items-center space-y-4">
            <div className="w-14 h-14 bg-secondary-container/20 border border-secondary/50 flex items-center justify-center shadow-[0_0_15px_theme(colors.secondary)] animate-pulse" style={{ animationDelay: '0.2s' }}>
              <Zap className="text-secondary" size={24} />
            </div>
            <span className="font-mono text-xs text-secondary uppercase tracking-widest">Agent_Delta [PERF]</span>
          </div>
        </div>
        <div className="relative w-full max-w-md h-[1px] bg-outline-variant overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-primary-container to-transparent animate-[scan_2s_ease-in-out_infinite]" />
        </div>
        <p className="font-mono text-xs text-on-surface-variant uppercase tracking-widest text-center">
          Executing Adversarial Traces...<br/>Generating Abstract Syntax Trees...
        </p>
      </div>
    );
  }

  if (status === 'ERROR') {
    return (
      <div className="p-6">
        <div className="border border-error/50 bg-error/10 p-4 font-mono text-sm text-error">
          <AlertTriangle className="mb-2" size={20} />
          {error}
        </div>
      </div>
    );
  }

  // RESOLVING or COMPLETE
  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <AnimatePresence>
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
          
          {/* Security Audit */}
          <motion.div variants={itemVariants} className="glass-card p-5 border-l-2 border-l-error">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={16} className="text-error" />
              <h4 className="font-sans text-xs uppercase tracking-widest font-bold text-error">Agent Sigma [Security]</h4>
            </div>
            <p className="font-mono text-sm text-on-surface-variant leading-relaxed">
              {results?.securityAudit}
            </p>
          </motion.div>

          {/* Performance Audit */}
          <motion.div variants={itemVariants} className="glass-card p-5 border-l-2 border-l-secondary">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} className="text-secondary" />
              <h4 className="font-sans text-xs uppercase tracking-widest font-bold text-secondary">Agent Delta [Performance]</h4>
            </div>
            <p className="font-mono text-sm text-on-surface-variant leading-relaxed">
              {results?.performanceAudit}
            </p>
          </motion.div>

          {/* Judge Resolution */}
          {status === 'COMPLETE' && (
            <motion.div variants={itemVariants} className="glass-card p-5 border border-primary-container shadow-[0_0_20px_rgba(0,251,251,0.15)] mt-8">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-outline-variant/30">
                <Key size={16} className="text-primary-container" />
                <h4 className="font-sans text-xs uppercase tracking-widest font-bold text-primary-container">The Judge [Resolution]</h4>
              </div>
              <p className="font-sans text-sm text-on-surface leading-loose mb-4">
                {results?.judgeResolution}
              </p>
              
              <div className="bg-surface p-4 border border-outline-variant/50 relative group">
                <span className="absolute -top-2 left-4 px-2 bg-surface text-[10px] font-mono text-outline uppercase tracking-wider">Optimized_Output.js</span>
                <pre className="font-mono text-xs text-primary/90 whitespace-pre-wrap overflow-x-auto mt-2">
                  {results?.optimizedCode}
                </pre>
              </div>
            </motion.div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// Add scan animation to Tailwind
// theme: { extend: { keyframes: { scan: { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(300%)' } } } } } }
export default DebateLog;
