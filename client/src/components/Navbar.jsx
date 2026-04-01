import { Link, useNavigate } from 'react-router-dom';
import { Terminal, LogOut, User } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 glass-panel border-b border-outline-variant/30 h-16 flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <Terminal className="text-secondary w-5 h-5 md:w-6 md:h-6" />
        <Link to="/" className="text-lg md:text-xl font-bold tracking-tight text-primary">
          CORE<span className="hidden md:inline">_REASONER</span><span className="text-primary-container">_v1</span>
        </Link>
      </div>
      
      <div className="flex items-center overflow-x-auto no-scrollbar ml-auto pl-2 gap-4 md:gap-8 text-[10px] md:text-sm uppercase tracking-[0.2em] text-on-surface-variant font-medium">
        <Link to="/dashboard" className="hover:text-primary transition-colors duration-200 shrink-0">Arena</Link>
        <Link to="/history" className="hover:text-primary transition-colors duration-200 shrink-0 hidden md:block">History</Link>
        <Link to="/analytics" className="hover:text-primary transition-colors duration-200 shrink-0 hidden md:block">Analytics</Link>
        
        {user ? (
          <div className="flex items-center gap-3 md:gap-4 md:ml-4 md:pl-4 md:border-l border-outline-variant/30 shrink-0">
            <span className="flex items-center gap-1.5 md:gap-2 text-primary-container text-[10px] md:text-xs font-mono normal-case">
              <User size={12} className="md:w-[14px] md:h-[14px]" />
              {user.username}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-error/80 hover:text-error transition-colors text-[10px] md:text-xs"
            >
              <LogOut size={12} className="md:w-[14px] md:h-[14px]" /> <span className="hidden md:inline">Exit</span>
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="ml-2 md:ml-4 px-3 py-1 md:px-4 md:py-1.5 border border-primary-container/50 text-primary-container hover:bg-primary-container hover:text-surface transition-all duration-200 text-[10px] md:text-xs shrink-0"
          >
            Access
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
