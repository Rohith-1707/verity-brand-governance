import React, { useState, useEffect } from 'react';
import {
  ScrollText,
  Plus,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Info,
  Scale
} from 'lucide-react';
import { api, GuidelineItem } from '../../api';

export const BrandGuidelinesPage: React.FC = () => {
  const [guidelines, setGuidelines] = useState<GuidelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  // Form states
  const [kind, setKind] = useState<'banned' | 'required'>('banned');
  const [value, setValue] = useState('');
  const [reason, setReason] = useState('');
  const [platform, setPlatform] = useState('Any');

  const fetchGuidelines = async () => {
    setLoading(true);
    try {
      const data = await api.getGuidelines();
      setGuidelines(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuidelines();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    setAdding(true);
    try {
      await api.addGuideline({ kind, value: value.trim(), reason: reason.trim() || undefined, platform });
      setValue('');
      setReason('');
      fetchGuidelines();
    } catch (err: any) {
      alert(err.message || 'Failed to add guideline rule');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string, textVal: string) => {
    if (!window.confirm(`Delete rule for "${textVal}"?`)) return;
    try {
      await api.deleteGuideline(id);
      fetchGuidelines();
    } catch (err: any) {
      alert(err.message || 'Failed to remove guideline');
    }
  };

  const banned = guidelines.filter((g) => g.kind === 'banned');
  const required = guidelines.filter((g) => g.kind === 'required');

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-2.5">
          <ScrollText className="w-7 h-7 text-cyan-400" />
          <span>Brand Guidelines & Compliance Rules</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Define mandatory prohibited phrases, statutory disclaimers, and platform constraints.
        </p>
      </div>

      {/* Mandatory Governance Alert */}
      <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/50 text-xs text-slate-300 flex items-start space-x-3">
        <Scale className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-white">Strict Compliance Invariance:</strong> Creator context (e.g. playful Instagram tone or informal email) is considered solely for advisory guidance. Contextual preferences never override mandatory prohibited terminology or required statutory text.
        </p>
      </div>

      {/* Add Guideline Form */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5">
          <Plus className="w-4 h-4" />
          <span>Add Brand Guideline Rule</span>
        </div>

        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Rule Type</label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none"
            >
              <option value="banned">Prohibited Term (Banned)</option>
              <option value="required">Mandatory Required Text</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Platform Scope</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none"
            >
              <option value="Any">All Platforms (Any)</option>
              <option value="Website">Website Only</option>
              <option value="Instagram">Instagram / Social</option>
              <option value="Press Release">Press Release</option>
              <option value="Customer Email">Customer Email</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Exact Phrase / Term <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={kind === 'banned' ? 'e.g. unbeatable, 100% unbreakable' : 'e.g. Terms and conditions apply.'}
              required
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-white placeholder-slate-600 outline-none"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Compliance Justification / Guidance Reason
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Unsubstantiated superlative prohibited by statutory consumer protection standards."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-white placeholder-slate-600 outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={adding}
              className="w-full py-2.5 rounded-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs transition disabled:opacity-50"
            >
              {adding ? 'Saving...' : 'Add Guideline'}
            </button>
          </div>
        </form>
      </div>

      {/* Guidelines Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prohibited Terms */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <h2 className="text-base font-bold text-white">Prohibited Brand Terms ({banned.length})</h2>
            </div>
          </div>

          <div className="space-y-3">
            {banned.map((b) => (
              <div
                key={b.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-rose-300">"{b.value}"</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                      {b.platform}
                    </span>
                  </div>
                  {b.reason && <p className="text-slate-400 text-[11px] mt-1">{b.reason}</p>}
                </div>
                <button
                  onClick={() => handleDelete(b.id, b.value)}
                  className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                  title="Remove Rule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Required Mandatory Text */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">Mandatory Disclaimers ({required.length})</h2>
            </div>
          </div>

          <div className="space-y-3">
            {required.map((r) => (
              <div
                key={r.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-emerald-300">"{r.value}"</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                      {r.platform}
                    </span>
                  </div>
                  {r.reason && <p className="text-slate-400 text-[11px] mt-1">{r.reason}</p>}
                </div>
                <button
                  onClick={() => handleDelete(r.id, r.value)}
                  className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                  title="Remove Rule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
