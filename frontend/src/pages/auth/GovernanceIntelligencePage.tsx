import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  ScrollText,
  ShieldCheck,
  Scale,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { api, GovernanceInsightsData } from '../../api';

export const GovernanceIntelligencePage: React.FC = () => {
  const [data, setData] = useState<GovernanceInsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      try {
        const res = await api.getGovernanceIntelligence();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-2.5">
          <BrainCircuit className="w-7 h-7 text-cyan-400" />
          <span>Adaptive Governance Intelligence</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Analyzes review feedback and recurring failure patterns to recommend actionable guideline clarifications.
        </p>
      </div>

      {/* Philosophy Banner */}
      <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/50 text-xs text-slate-300 flex items-start space-x-3">
        <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-white">Human-Governed Recommendations:</strong> VERITY surfaces recurring editorial friction, misunderstood product specifications, and repeated guideline violations. Recommendations are presented to administrators for review; official company guidelines are <em>never automatically modified</em> without explicit human authorization.
        </p>
      </div>

      {/* Aggregate Intelligence Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[10px] font-bold uppercase text-slate-400">Total Reviewed Decisions</div>
          <div className="text-2xl font-black text-white">
            {data?.summary?.total_reviewed ?? 0}
          </div>
          <div className="text-[10px] text-slate-500">Historical reviewer evaluations</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[10px] font-bold uppercase text-slate-400">Analyzed Publications</div>
          <div className="text-2xl font-black text-cyan-400">
            {data?.summary?.total_submissions_analyzed ?? 0}
          </div>
          <div className="text-[10px] text-slate-500">Across all channels</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[10px] font-bold uppercase text-slate-400">Recurring Violations</div>
          <div className="text-2xl font-black text-amber-400">
            {data?.summary?.recurring_violations_detected ?? 0}
          </div>
          <div className="text-[10px] text-slate-500">Distinct guideline friction points</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-[10px] font-bold uppercase text-slate-400">Unsupported Patterns</div>
          <div className="text-2xl font-black text-rose-400">
            {data?.summary?.common_unsupported_assertions ?? 0}
          </div>
          <div className="text-[10px] text-slate-500">Missing documentation</div>
        </div>
      </div>

      {/* Actionable Recommendations for Administrators */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center space-x-2">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-white">
            Recommended Brand Guideline Clarifications ({data?.recommendations?.length || 0})
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {data?.recommendations && data.recommendations.length > 0 ? (
            data.recommendations.map((rec, i) => (
              <div
                key={i}
                className="p-5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                    {rec.category}
                  </span>
                  <span className="text-[10px] text-slate-500">Intelligence Confidence: High</span>
                </div>

                <div className="text-sm font-semibold text-slate-200">
                  Observation: {rec.observation}
                </div>

                <p className="text-slate-300 leading-relaxed">
                  {rec.recommendation}
                </p>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 text-teal-300 font-mono text-[11px] flex items-start space-x-2">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                  <span>{rec.actionable_suggestion}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              No recurrent friction patterns detected yet.
            </div>
          )}
        </div>
      </div>

      {/* Frequent Friction Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Guideline Violations */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Top Recurring Guideline Flags</span>
          </h3>

          <div className="space-y-2">
            {data?.top_guideline_violations && data.top_guideline_violations.length > 0 ? (
              data.top_guideline_violations.map((v, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <span className="text-slate-200 font-medium">"{v.item}"</span>
                  <span className="font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/50">
                    {v.count}x flagged
                  </span>
                </div>
              ))
            ) : (
              <div className="py-4 text-center text-xs text-slate-500">No recurring violations recorded.</div>
            )}
          </div>
        </div>

        {/* Top Unsupported Assertions */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
            <TrendingDown className="w-4 h-4 text-rose-400" />
            <span>Recurring Unsupported Assertions</span>
          </h3>

          <div className="space-y-2">
            {data?.top_unsupported_claims && data.top_unsupported_claims.length > 0 ? (
              data.top_unsupported_claims.map((c, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <span className="text-slate-200 font-medium">"{c.item}"</span>
                  <span className="font-bold text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/50">
                    {c.count}x submitted
                  </span>
                </div>
              ))
            ) : (
              <div className="py-4 text-center text-xs text-slate-500">No repeated unsupported claims.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
