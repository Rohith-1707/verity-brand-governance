import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle2,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

export const LoginPage: React.FC = () => {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-cyan-500 selection:text-slate-950 transition-colors duration-200">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center shadow-lg shadow-cyan-500/20 mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-slate-950 stroke-[2.5]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              VERITY Login Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              Every Claim Needs Evidence. Every Publication Needs Accountability.
            </p>
          </div>

          {/* Instant Authentication Card (No Password Needed) */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-cyan-500" />
                <span>One-Click Access • No Credentials Required</span>
              </div>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                Instant Sign In
              </span>
            </div>

            {/* Primary Action: Administrator (Rohith) */}
            <button
              type="button"
              onClick={() => handleDemo('admin')}
              disabled={loading}
              className="w-full p-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 hover:brightness-110 hover:scale-[1.01] transition-all flex items-center justify-between group disabled:opacity-50"
            >
              <div className="flex items-center space-x-3 text-left">
                <div className="w-10 h-10 rounded-lg bg-slate-950 text-cyan-400 flex items-center justify-center font-black text-base shadow-sm">
                  R
                </div>
                <div>
                  <div className="text-sm font-extrabold text-slate-950 flex items-center space-x-1.5">
                    <span>Sign In as Administrator (Rohith)</span>
                    <span className="text-[10px] bg-slate-900 text-cyan-300 px-1.5 py-0.2 rounded font-mono font-bold">ADMIN</span>
                  </div>
                  <div className="text-[11px] text-slate-800/90 font-medium mt-0.5">
                    Full organizational control, knowledge base truth & governance
                  </div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-950 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Other Roles */}
            <div className="pt-2">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">
                Or enter workspace as a specific team role:
              </p>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemo('reviewer')}
                  disabled={loading}
                  className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-emerald-300">
                        Reviewer (Elena Rostova)
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Inspect queue, evaluate claims & record approval verdicts
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDemo('creator')}
                  disabled={loading}
                  className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shrink-0"></span>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-cyan-300">
                        Creator (Marcus Vance)
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Upload marketing copy, verify claims & view diff revisions
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-cyan-500 group-hover:translate-x-1 transition" />
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Custom Corporate Email Login (No Password Required) */}
            <form onSubmit={handleSubmit} className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Or Sign In with Any Corporate Email
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Corporate Email (Password Not Required)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rohith@verity.acme.com"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs transition disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                <span>{loading ? 'Authenticating...' : 'Sign In Instantly (No Password)'}</span>
              </button>
            </form>
          </div>

          <div className="text-center text-xs text-slate-500">
            Evaluating VERITY brand governance platform. All roles granted full demonstration privileges.
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};
