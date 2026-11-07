import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Sun, Moon, Sparkles, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, theme, toggleTheme, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors duration-200">
      <Link to="/" className="flex items-center space-x-3 group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
          <ShieldCheck className="w-6 h-6 text-slate-950 stroke-[2.5]" />
        </div>
        <div>
          <span className="text-xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-slate-700 to-cyan-600 dark:from-white dark:via-slate-200 dark:to-cyan-300 bg-clip-text text-transparent">
            VERITY
          </span>
          <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-800/60">
            Brand Governance
          </span>
        </div>
      </Link>

      <div className="hidden md:flex items-center space-x-7 text-sm font-medium text-slate-600 dark:text-slate-300">
        <Link to="/" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Platform</Link>
        <Link to="/features" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Innovations</Link>
        <Link to="/how-it-works" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Pipeline</Link>
        <Link to="/about" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Responsible AI</Link>
      </div>

      <div className="flex items-center space-x-2.5 sm:space-x-3">
        {/* Light & Dark Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition font-bold text-xs shadow-sm"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 font-bold hidden sm:inline">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-cyan-600" />
              <span className="text-cyan-700 font-bold hidden sm:inline">Dark</span>
            </>
          )}
        </button>

        {user ? (
          <div className="flex items-center space-x-2">
            <Link
              to="/app/dashboard"
              className="flex items-center space-x-1.5 text-xs sm:text-sm font-bold bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 px-4 py-2 rounded-lg shadow-md hover:brightness-110 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Console ({user.name.split(' ')[0]})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Link
              to="/login"
              className="flex items-center space-x-1.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <LogIn className="w-4 h-4 text-cyan-500" />
              <span>Sign In</span>
            </Link>
            <Link
              to="/login"
              className="flex items-center space-x-1.5 text-xs sm:text-sm font-bold bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 px-4 py-2 rounded-lg shadow-md hover:brightness-110 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Platform</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
