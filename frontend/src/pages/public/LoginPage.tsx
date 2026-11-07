import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

export const LoginPage: React.FC = () => {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      await login(email);
      navigate('/app/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role: 'admin' | 'creator' | 'reviewer') => {
    setLoading(true);
    setError(null);
    try {
      await demoLogin(role);
      navigate('/app/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-16 sm:py-20">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center shadow-lg shadow-cyan-500/20 mx-auto mb-4">
              <ShieldCheck className="w-7 h-7 text-slate-950 stroke-[2.5]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Sign In to VERITY
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Every Claim Needs Evidence. Every Publication Needs Accountability.
            </p>
          </div>

          {/* Quick Demo Switcher Card for Hackathon Judges */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-cyan-950/40 to-slate-900 border border-cyan-800/60 shadow-xl space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Instant Evaluator Demo Access</span>
            </div>
            <p className="text-xs text-slate-300">
              Select any role to test platform capabilities without credential setup:
            </p>
            <div className="grid grid-cols-1 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleDemo('admin')}
                disabled={loading}
                className="w-full text-left p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 transition flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-purple-300 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                    <span>Administrator (Sarah Chen)</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Manage approved documents, guidelines, risk weights & audit trail
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition" />
              </button>

              <button
                type="button"
                onClick={() => handleDemo('reviewer')}
                disabled={loading}
                className="w-full text-left p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 transition flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-emerald-300 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>Reviewer (Elena Rostova)</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Inspect prioritised queue, record judgements & resolve change impact alerts
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition" />
              </button>

              <button
                type="button"
                onClick={() => handleDemo('creator')}
                disabled={loading}
                className="w-full text-left p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 transition flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-cyan-300 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    <span>Creator (Marcus Vance)</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Submit marketing copy, verify claims & track revision diffs
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition" />
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Standard Login Form */}
          <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
              Or Sign In with Corporate Email
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Corporate Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@verity.acme.com"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-xs text-white placeholder-slate-600 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-xs text-white placeholder-slate-600 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-white text-xs transition disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-cyan-400 hover:underline font-semibold">
              Register New Organization
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};
