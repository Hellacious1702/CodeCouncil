import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Terminal, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) navigate('/dashboard');
  };

  return (
    <div className="relative flex-1 flex items-center justify-center pt-16 pb-10 min-h-screen overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-primary-container/15 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Terminal className="text-primary-container w-6 h-6" />
          <h1 className="text-2xl font-bold tracking-tight text-primary uppercase">
            System Access
          </h1>
        </div>

        {/* Login Card */}
        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-mono uppercase tracking-widest text-outline">
              Operator ID
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); clearError(); }}
              required
              className="w-full bg-surface-container-lowest border-b-2 border-outline-variant/50 focus:border-primary-container px-4 py-3 text-on-surface font-mono text-sm outline-none transition-colors duration-300"
              placeholder="Enter username"
              style={{ caretColor: '#00fbfb' }}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono uppercase tracking-widest text-outline">
              Access Key
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError(); }}
              required
              className="w-full bg-surface-container-lowest border-b-2 border-outline-variant/50 focus:border-primary-container px-4 py-3 text-on-surface font-mono text-sm outline-none transition-colors duration-300"
              placeholder="Enter password"
              style={{ caretColor: '#00fbfb' }}
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="border-l-2 border-l-error bg-error/10 px-4 py-2 text-xs font-mono text-error"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary-container/10 border border-primary-container/50 text-primary-container uppercase tracking-widest text-sm font-bold hover:bg-primary-container hover:text-surface transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="animate-pulse">Authenticating...</span>
            ) : (
              <>Authorize <ArrowRight size={16} /></>
            )}
          </button>

          <p className="text-center text-xs text-on-surface-variant font-mono">
            No credentials?{' '}
            <Link to="/signup" className="text-primary-container hover:text-primary transition-colors underline">
              Register new operator
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
