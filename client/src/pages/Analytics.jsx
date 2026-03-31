import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Activity, Shield, Zap, TrendingUp } from 'lucide-react';
import { useHistoryStore } from '../store/useHistoryStore';

const Analytics = () => {
  const { history, fetchHistory, loading } = useHistoryStore();

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const stats = useMemo(() => {
    if (!history.length) return null;

    const total = history.length;
    const conflicts = history.filter(h => h.conflictDetected).length;
    const languages = history.reduce((acc, h) => {
      acc[h.language] = (acc[h.language] || 0) + 1;
      return acc;
    }, {});

    // Last 7 days conflict trend (mock buckets for now based on history)
    const recentHistory = [...history].sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt)).slice(-10);
    const chartData = recentHistory.map((h, i) => ({
      val: h.conflictDetected ? 80 : 30,
      label: new Date(h.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
    }));

    return { total, conflicts, languages, chartData };
  }, [history]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center pt-24 min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-container" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col pt-24 pb-16 px-8 max-w-6xl mx-auto w-full min-h-screen">
      <div className="flex items-center gap-4 mb-12">
        <div className="p-3 bg-secondary/10 border border-secondary/30 rounded-full">
          <Activity className="text-secondary w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tighter text-secondary uppercase">Neural Analytics</h1>
          <p className="text-[10px] font-mono text-outline uppercase tracking-widest mt-1">Cross-Agent Reasoning Metrics</p>
        </div>
      </div>

      {!stats ? (
        <div className="glass-card p-12 text-center text-outline uppercase font-mono">Insufficient data for neural mapping.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Metric Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 border-l-2 border-primary-container flex justify-between items-end"
          >
            <div>
              <span className="block text-[10px] font-mono text-outline uppercase tracking-widest mb-1">Total Protocols</span>
              <span className="text-4xl font-bold text-on-surface">{stats.total}</span>
            </div>
            <TrendingUp size={24} className="text-primary-container opacity-30" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 border-l-2 border-secondary flex justify-between items-end"
          >
            <div>
              <span className="block text-[10px] font-mono text-outline uppercase tracking-widest mb-1">Conflict Rate</span>
              <span className="text-4xl font-bold text-on-surface">{Math.round((stats.conflicts / stats.total) * 100)}%</span>
            </div>
            <Zap size={24} className="text-secondary opacity-30" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 border-l-2 border-error flex justify-between items-end"
          >
            <div>
              <span className="block text-[10px] font-mono text-outline uppercase tracking-widest mb-1">Audit Density</span>
              <span className="text-4xl font-bold text-on-surface">{stats.total * 2}</span>
            </div>
            <Shield size={24} className="text-error opacity-30" />
          </motion.div>
        </div>
      )}

      {/* Chart Section */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-card p-8 flex flex-col h-[400px]">
            <h3 className="text-xs font-mono text-outline uppercase tracking-widest mb-8 flex items-center gap-2">
              <BarChart2 size={14} /> Cognitive Friction History
            </h3>
            <div className="flex-1 flex items-end gap-3 px-4">
              {stats.chartData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-crosshair">
                   <div className="w-full relative">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${d.val}%` }}
                        className={`w-full ${d.val > 50 ? 'bg-secondary shadow-[0_0_15px_theme(colors.secondary)]' : 'bg-primary-container shadow-[0_0_15px_theme(colors.primary-container)]'} opacity-60 group-hover:opacity-100 transition-opacity`}
                      />
                   </div>
                   <span className="text-[8px] font-mono text-outline rotate-45 mt-4 origin-left whitespace-nowrap">{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-8 flex flex-col">
            <h3 className="text-xs font-mono text-outline uppercase tracking-widest mb-8">Language Distribution</h3>
            <div className="space-y-6">
              {Object.entries(stats.languages).map(([lang, count], i) => (
                <div key={lang} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-mono uppercase">
                    <span className="text-on-surface">{lang}</span>
                    <span className="text-outline">{Math.round((count / stats.total) * 100)}%</span>
                  </div>
                  <div className="h-1 bg-outline-variant/20 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / stats.total) * 100}%` }}
                      className="h-full bg-primary-container"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
