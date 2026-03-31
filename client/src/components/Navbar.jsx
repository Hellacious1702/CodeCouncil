import { Link } from 'react-router-dom';
import { Terminal } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 glass-panel border-b border-outline-variant/30 h-16 flex items-center justify-between px-8">
      <div className="flex items-center gap-3">
        <Terminal className="text-secondary w-6 h-6" />
        <Link to="/" className="text-xl font-bold tracking-tight text-primary">
          CORE_REASONER<span className="text-primary-container">_v1.0</span>
        </Link>
      </div>
      
      <div className="flex items-center gap-8 text-sm uppercase tracking-widest text-on-surface-variant font-medium">
        <Link to="/dashboard" className="hover:text-primary transition-colors duration-200">Arena</Link>
        <a href="#" className="hover:text-primary transition-colors duration-200">Intelligence</a>
        <a href="#" className="hover:text-primary transition-colors duration-200">Protocol</a>
      </div>
    </nav>
  );
};

export default Navbar;
