import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Sun, Moon, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, theme, toggleTheme } = useAuth();

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors">
      <Link to="/" className="flex items-center space-x-3 group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
          <ShieldCheck className="w-6 h-6 text-slate-950 stroke-[2.5]" />
        </div>
        <div>
          <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-300 bg-clip-text text-transparent">
            VERITY
          </span>
          <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-400 border border-cyan-800/60">
            Brand Governance
          </span>
        </div>
      </Link>

      <div className="hidden md:flex items-center space-x-7 text-sm font-medium text-slate-300">
        <Link to="/" className="hover:text-cyan-400 transition-colors">Platform</Link>
        <Link to="/features" className="hover:text-cyan-400 transition-colors">Innovations</Link>
        <Link to="/how-it-works" className="hover:text-cyan-400 transition-colors">Pipeline</Link>
        <Link to="/about" className="hover:text-cyan-400 transition-colors">Responsible AI</Link>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 hover:text-white transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
        </button>

        {user ? (
          <Link
            to="/app/dashboard"
            className="flex items-center space-x-2 text-xs sm:text-sm font-semibold bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 px-4 py-2 rounded-lg shadow-md hover:brightness-110 transition"
          >
            <span>Open Console</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <div className="flex items-center space-x-2">
            <Link
              to="/login"
              className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800/50 transition"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              className="flex items-center space-x-1.5 text-xs sm:text-sm font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-3.5 py-2 rounded-lg shadow-sm transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Try Demo</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
