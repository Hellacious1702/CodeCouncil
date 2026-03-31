import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Shield, Zap, Key } from 'lucide-react';

const FocusModal = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  const getDetails = () => {
    switch (data.type) {
      case 'sigma': return { icon: <Shield className="text-error" />, title: 'Agent Sigma | Security Audit Trace', color: 'border-error/30' };
      case 'delta': return { icon: <Zap className="text-secondary" />, title: 'Agent Delta | Performance Optimization Trace', color: 'border-secondary/30' };
      case 'judge': return { icon: <Key className="text-primary-container" />, title: 'Judicial Settlement | Architectural Verdict', color: 'border-primary-container/30' };
      default: return { icon: <Maximize2 />, title: 'Neural Trace', color: 'border-outline/30' };
    }
  };

  const { icon, title, color } = getDetails();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-surface/90 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 30 }}
          className={`relative w-full max-w-5xl h-full max-h-[85vh] bg-surface-container-low border ${color} shadow-2xl flex flex-col overflow-hidden`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-outline-variant/20 bg-surface-container-lowest">
            <div className="flex items-center gap-4">
              {icon}
              <h2 className="text-xl font-bold tracking-tighter uppercase font-mono">{title}</h2>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-surface-bright/20 transition-colors text-outline hover:text-on-surface"
            >
              <X size={24} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-surface-container-lowest/30">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Meta Info */}
              <div className="flex gap-4 text-[10px] font-mono text-outline uppercase tracking-widest border-b border-outline-variant/10 pb-4">
                <span>Timestamp: {new Date().toISOString()}</span>
                <span>•</span>
                <span>Protocol: Production-Grade {data.provider?.toUpperCase()}</span>
              </div>

              {/* Main Content */}
              <div className="text-on-surface-variant leading-relaxed text-lg whitespace-pre-wrap font-mono selection:bg-primary-container selection:text-surface">
                {data.content}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-surface-container-lowest border-t border-outline-variant/20 flex justify-between items-center">
            <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
                <span className="text-[10px] font-mono text-outline uppercase">Neural Stream Active</span>
            </div>
            <button 
                onClick={onClose}
                className="px-8 py-2 bg-outline-variant/20 hover:bg-outline-variant/40 text-on-surface text-[10px] font-bold uppercase tracking-widest transition-all"
            >
                Terminate Focus
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default FocusModal;
