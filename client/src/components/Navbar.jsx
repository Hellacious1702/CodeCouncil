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
    <nav className="fixed top-0 left-0 w-full z-50 glass-panel border-b border-outline-variant/30 h-16 flex items-center justify-between px-8">
      <div className="flex items-center gap-3">
        <Terminal className="text-secondary w-6 h-6" />
        <Link to="/" className="text-xl font-bold tracking-tight text-primary">
          CORE_REASONER<span className="text-primary-container">_v1.0</span>
        </Link>
      </div>
      
      <div className="flex items-center gap-8 text-sm uppercase tracking-widest text-on-surface-variant font-medium">
        <Link to="/dashboard" className="hover:text-primary transition-colors duration-200">Arena</Link>
        <Link to="/history" className="hover:text-primary transition-colors duration-200">History</Link>
        <a href="#" className="hover:text-primary transition-colors duration-200">Intelligence</a>
        
        {user ? (
          <div className="flex items-center gap-4 ml-4 pl-4 border-l border-outline-variant/30">
            <span className="flex items-center gap-2 text-primary-container text-xs font-mono normal-case">
              <User size={14} />
              {user.username}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-error/80 hover:text-error transition-colors text-xs"
            >
              <LogOut size={14} /> Exit
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="ml-4 px-4 py-1.5 border border-primary-container/50 text-primary-container hover:bg-primary-container hover:text-surface transition-all duration-200"
          >
            Access
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
