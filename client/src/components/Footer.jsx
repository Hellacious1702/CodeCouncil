import { ShieldCheck, Activity } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 w-full z-50 bg-surface border-t border-outline-variant/30 h-10 flex items-center justify-between px-8 text-xs font-mono text-on-surface-variant tracking-wider uppercase">
      <div className="flex items-center gap-6">
        <span className="flex items-center gap-2 hover:text-primary cursor-pointer transition-colors duration-200">
          <ShieldCheck className="w-3.5 h-3.5" /> Security Logs
        </span>
        <span className="hover:text-primary cursor-pointer transition-colors duration-200">API Docs</span>
      </div>
      
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-primary-container animate-pulse shadow-[0_0_8px_theme(colors.primary-container)]"></span>
          System Status: Optimal
        </span>
        <span className="text-secondary opacity-70">LATENCY: 12ms</span>
      </div>
    </footer>
  );
};

export default Footer;
