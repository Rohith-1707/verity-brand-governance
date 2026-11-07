import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  ShieldAlert,
  ArrowRight,
  Filter,
  Check
} from 'lucide-react';
import { api, ImpactAlert } from '../../api';

export const ChangeImpactPage: React.FC = () => {
  const [impacts, setImpacts] = useState<ImpactAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'open' | 'resolved' | 'all'>('open');
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const fetchImpacts = async () => {
    setLoading(true);
    try {
      const data = await api.getImpacts();
      setImpacts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImpacts();
  }, []);

  const handleResolve = async (id: string) => {
    setResolvingId(id);
    try {
      await api.resolveImpact(id);
      fetchImpacts();
    } catch (err: any) {
      alert(err.message || 'Failed to resolve impact alert');
    } finally {
      setResolvingId(null);
    }
  };

  const filtered = impacts.filter((i) => {
    if (filter === 'all') return true;
    return i.status === filter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-2.5">
          <GitCompare className="w-7 h-7 text-cyan-400" />
          <span>Cross-Content Change Impact Analysis</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          When an approved organizational fact changes, identify registered content assets containing the previous information.
        </p>
      </div>

      {/* Information Banner */}
      <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/50 text-xs text-slate-300 flex items-start space-x-3">
        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Deterministic Asset Grounding:</strong> Change impact tracking evaluates all registered brochures, press releases, and campaign publications. When an authoritative document (such as warranty or battery life specifications) is superseded, affected content assets are flagged with exact sentence locations for human review.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2">
        {(['open', 'resolved', 'all'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
              filter === s
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {s} Alerts
          </button>
        ))}
      </div>

      {/* Impact Alerts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading change impact alerts...</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center p-8 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="font-bold text-slate-200">No {filter !== 'all' ? filter : ''} change impact alerts.</p>
            <p className="text-slate-500">All registered publications are aligned with currently approved Knowledge Base facts.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`p-6 rounded-2xl border transition space-y-4 ${
                item.status === 'open'
                  ? 'bg-slate-900 border-rose-800/50'
                  : 'bg-slate-900/50 border-slate-800 opacity-75'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      item.status === 'open'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {item.status} Alert
                  </span>
                  <span className="text-xs text-slate-400">
                    Source Document: <strong className="text-slate-200">{item.document_title || 'Knowledge Base Document'}</strong>
                  </span>
                </div>

                <div className="text-[11px] text-slate-500">
                  Detected: {new Date(item.created_at).toLocaleString()}
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-1">
                  Affected Asset: {item.content_title}
                </h3>
                <span className="text-xs font-mono text-cyan-400">
                  Location: {item.location}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-500">
                    Superseded / Previous Organizational Phrasing
                  </div>
                  <div className="text-slate-300 italic">
                    "{item.old_text}"
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-rose-400">
                    Affected Text In Registered Asset
                  </div>
                  <div className="text-rose-200 font-semibold">
                    "{item.sentence}"
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className="text-xs text-slate-400">
                  {item.status === 'open'
                    ? 'Requires creator revision or reviewer sign-off to resolve.'
                    : 'Alert has been reviewed and resolved.'}
                </span>

                {item.status === 'open' && (
                  <button
                    onClick={() => handleResolve(item.id)}
                    disabled={resolvingId === item.id}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition flex items-center space-x-1.5 shadow"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{resolvingId === item.id ? 'Resolving...' : 'Mark Alert Resolved'}</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
