import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { History as HistoryIcon, Clock, ChevronRight, AlertTriangle, Cpu } from 'lucide-react';
import { useHistoryStore } from '../store/useHistoryStore';
import { Link } from 'react-router-dom';

const History = () => {
  const { history, fetchHistory, loading, error } = useHistoryStore();

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex-1 flex flex-col pt-24 pb-16 min-h-screen px-8 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary-container/10 border border-primary-container/30 rounded-full shadow-[0_0_20px_rgba(0,251,251,0.1)]">
            <HistoryIcon className="text-primary-container w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tighter text-primary uppercase">Protocol History</h1>
            <p className="text-xs font-mono text-outline uppercase tracking-widest mt-1">Archived Neural Reasoning Traces</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] font-mono text-outline uppercase">Operator Status</div>
          <div className="text-xs font-mono text-primary-container uppercase">Online / Sync Active</div>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary-container/20 border-t-primary-container rounded-full animate-spin" />
            <span className="text-xs font-mono text-outline uppercase animate-pulse">Syncing neural archives...</span>
          </div>
        </div>
      ) : error ? (
        <div className="glass-card p-12 border-l-4 border-l-error text-center">
          <AlertTriangle className="text-error w-12 h-12 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-on-surface uppercase mb-2">Sync Interrupted</h2>
          <p className="text-sm font-mono text-outline">{error}</p>
        </div>
      ) : history.length === 0 ? (
        <div className="glass-card p-16 text-center border-dashed border-2 border-outline-variant/30">
          <Cpu className="text-outline w-12 h-12 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-bold text-outline uppercase mb-2">Archives Empty</h2>
          <p className="text-sm font-mono text-outline/60 mb-8">No adversarial traces found in the primary datastore.</p>
          <Link 
            to="/dashboard" 
            className="px-8 py-3 bg-primary-container/10 border border-primary-container/50 text-primary-container uppercase tracking-widest text-sm font-bold hover:bg-primary-container hover:text-surface transition-all"
          >
            Initiate First Engagement
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {history.map((review, idx) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card group overflow-hidden border-l-4 border-l-outline-variant/50 hover:border-l-primary-container transition-all"
            >
              <Link to="/dashboard" className="flex items-center justify-between p-6">
                <div className="flex items-center gap-8">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-outline uppercase tracking-widest mb-1">Timestamp</span>
                    <span className="text-sm font-mono text-primary">{formatDate(review.createdAt)}</span>
                  </div>

                  <div className="h-8 w-px bg-outline-variant/20" />

                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-outline uppercase tracking-widest mb-1">Language</span>
                    <span className="text-sm font-mono text-on-surface uppercase">{review.language}</span>
                  </div>

                  <div className="h-8 w-px bg-outline-variant/20" />

                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-outline uppercase tracking-widest mb-1">Agent Conflict</span>
                    <span className={`text-sm font-mono ${review.conflictDetected ? 'text-secondary' : 'text-primary-container'}`}>
                      {review.conflictDetected ? 'CONFLICT DETECTED' : 'AGREEMENT REACHED'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-[10px] font-mono text-primary-container uppercase">
                    Restore Context <ChevronRight size={14} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
