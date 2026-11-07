import React, { useState, useEffect } from 'react';
import {
  Settings,
  Sliders,
  CheckCircle2,
  Building,
  Users,
  Shield,
  RotateCcw,
  Save,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [defaults, setDefaults] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeights = async () => {
      setLoading(true);
      try {
        const res = await api.getRiskWeights();
        setWeights(res.weights);
        setDefaults(res.defaults);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWeights();
  }, []);

  const handleWeightChange = (key: string, val: number) => {
    setWeights((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    try {
      await api.updateRiskWeights(weights);
      setSuccessMsg('Risk scoring weights successfully updated across the organization.');
    } catch (err: any) {
      alert(err.message || 'Failed to update weights');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setWeights(defaults);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-2.5">
          <Settings className="w-7 h-7 text-cyan-400" />
          <span>User & Organization Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure transparent risk assessment weights, enterprise governance policies, and team permissions.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Organization Info Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
          <Building className="w-4 h-4" />
          <span>Organization Tenant Profile</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-500 uppercase">Organization Name</div>
            <div className="font-bold text-white text-sm">{user?.org_name || 'Acme Global Technologies'}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-500 uppercase">Tenant Partition ID</div>
            <div className="font-mono font-bold text-cyan-400 text-xs truncate">{user?.org_id}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-500 uppercase">Active Persona</div>
            <div className="font-bold text-emerald-400 capitalize">{user?.role} Access</div>
          </div>
        </div>
      </div>

      {/* Configurable Risk Weights */}
      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Sliders className="w-4 h-4" />
              <span>Configurable Content Risk Scoring Weights</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Adjust point penalties for each governance factor. Total scores &gt;= 30 or any contradiction classify submissions as High Risk.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Standard Defaults</span>
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading risk configuration...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.keys(weights).map((factor) => {
              const val = weights[factor];
              const def = defaults[factor];
              return (
                <div
                  key={factor}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white capitalize">{factor}</span>
                    <span className="text-[10px] text-slate-500 font-mono">Default: {def}</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min={1}
                      max={50}
                      value={val}
                      onChange={(e) => handleWeightChange(factor, parseInt(e.target.value, 10))}
                      className="flex-1 accent-cyan-400 cursor-pointer"
                    />
                    <span className="font-mono font-bold text-cyan-400 text-sm w-8 text-right">
                      {val}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {factor === 'contradictory' && 'Direct numerical or factual conflict'}
                    {factor === 'outdated' && 'References expired review date or superseded text'}
                    {factor === 'unsupported' && 'Missing approved Knowledge Base evidence'}
                    {factor === 'guideline' && 'Prohibited brand terminology flagged'}
                    {factor === 'required' && 'Missing mandatory statutory disclaimer'}
                    {factor === 'review' && 'Ambiguous or weak semantic match'}
                    {factor === 'ai' && 'Advisory credibility or sensationalism signal'}
                    {factor === 'tone' && 'Advisory channel tone discrepancy'}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs transition flex items-center space-x-2 shadow"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Updating...' : 'Save Scoring Weights'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
