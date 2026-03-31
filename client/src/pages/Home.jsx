import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
  return (
    <div className="relative flex-1 flex items-center justify-center pt-16 pb-10 min-h-screen overflow-hidden">
      {/* Abstract Grid Texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#3a4a4915_1px,transparent_1px),linear-gradient(to_bottom,#3a4a4915_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Floating Neon Glows */}
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-primary-container/20 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2 opacity-50 pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-secondary-container/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 opacity-40 pointer-events-none" />

      <main className="z-10 flex flex-col items-center text-center px-4 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="glass-card px-6 py-2 mb-8"
        >
          <span className="text-sm font-mono tracking-widest text-primary-container uppercase">
            System Initialization Sequence Complete
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-primary via-on-surface to-outline drop-shadow-2xl mb-8"
          style={{ letterSpacing: "-0.04em" }}
        >
          CodeCouncil MAS
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
          className="text-xl md:text-2xl text-on-surface-variant max-w-3xl mb-12 font-light leading-relaxed"
        >
          A highly advanced <strong>Tripartite Multi-Agent System</strong>. Submit your code to the ultimate cognitive friction engine. Security conflicts with Performance. The Judge resolves.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
        >
          <Link
            to="/dashboard"
            className="group relative inline-flex items-center justify-center px-10 py-5 bg-surface-container-highest border border-primary-container/30 text-primary-container hover:text-surface-container-highest hover:bg-primary-container transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-container to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 font-mono tracking-widest uppercase text-lg font-bold">
              Enter the Arena
            </span>
            <span className="absolute -bottom-2 -right-2 w-8 h-8 bg-surface transform rotate-45 border-t border-l border-primary-container/30 group-hover:border-transparent transition-colors duration-300" />
            <span className="absolute -top-2 -left-2 w-8 h-8 bg-surface transform rotate-45 border-b border-r border-primary-container/30 group-hover:border-transparent transition-colors duration-300" />
          </Link>
        </motion.div>
      </main>
    </div>
  );
};

export default Home;
