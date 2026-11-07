import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  Scale,
  Clock,
  Layers,
  HelpCircle,
  FileText
} from 'lucide-react';
import { api, BrandHealthData } from '../../api';

export const BrandHealthPage: React.FC = () => {
  const [health, setHealth] = useState<BrandHealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      setLoading(true);
      try {
        const data = await api.getBrandHealth();
        setHealth(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHealth();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-2.5">
          <Activity className="w-7 h-7 text-cyan-400" />
          <span>Brand Health & Integrity Index</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Transparent, explainable organization-wide index tracking factual grounding and review completion.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Calculating brand health metrics...</div>
      ) : !health || health.score === null ? (
        /* Empty State */
        <div className="py-20 text-center p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <FileText className="w-12 h-12 text-slate-600 mx-auto" />
          <h2 className="text-base font-bold text-white">Insufficient Operational Data</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            {health?.message || 'Upload approved policies and submit content publications to generate an authentic brand health index. No simulated or decorative statistics are shown.'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Main Health Score Banner */}
          <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-lg">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/80">
                Grounded Index Level
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Brand Status:{' '}
                <span
                  className={
                    health.score >= 80
                      ? 'text-emerald-400'
                      : health.score >= 60
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }
                >
                  {health.status || 'Active'}
                </span>
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Calculated across {health.total_submissions} registered publications and verified claims in the Knowledge Base.
              </p>
              <div className="text-[11px] text-slate-500 font-mono">
                Measurement Period: {health.period || 'All Recorded History'}
              </div>
            </div>

            {/* Circular Gauge / Score Display */}
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl min-w-[200px]">
              <div className="text-5xl sm:text-6xl font-black text-white tracking-tight">
                {health.score}
              </div>
              <div className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                out of 100 points
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(5, health.score))}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Mathematical Formula Explanation */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Scale className="w-4 h-4" />
              <span>Transparent Index Formula</span>
            </div>
            <p className="text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded-xl border border-slate-800">
              {health.formula}
            </p>
            <p className="text-[11px] text-slate-500">
              Weights reflect organizational risk priorities: factual evidence grounding carries 35% weight, while triage health, freshness, and review completion share the remaining 65%.
            </p>
          </div>

          {/* 5 Explainable Components Breakdown */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Formula Component Breakdown
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {health.components?.map((comp, idx) => {
                const percentage = Math.round((comp.points / comp.max) * 100);
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{comp.name}</span>
                      <span className="font-mono text-xs font-bold text-cyan-400">
                        {comp.points} / {comp.max} pts ({percentage}%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-teal-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {comp.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
