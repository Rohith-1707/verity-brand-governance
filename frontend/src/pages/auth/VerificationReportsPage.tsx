import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldAlert,
  GitCompare,
  FileText,
  UserCheck,
  Layers,
  Sparkles,
  X
} from 'lucide-react';
import { api, SubmissionItem, SubmissionDetail } from '../../api';

export const VerificationReportsPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');

  // Selected report detail view
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<SubmissionDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const data = await api.getSubmissions();
      setSubmissions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const openReport = async (id: string) => {
    setSelectedId(id);
    setLoadingDetail(true);
    try {
      const data = await api.getSubmission(id);
      setDetail(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const filtered = submissions.filter((s) => {
    const matchSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.creator_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchRisk = riskFilter === 'all' || s.risk_level === riskFilter;
    return matchSearch && matchStatus && matchRisk;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-2.5">
          <FileSpreadsheet className="w-7 h-7 text-cyan-400" />
          <span>Verification Reports Dossier</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Inspect claim traces, explainable risk calculations, word-level diffs, and review decisions.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by publication title or creator name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-400 text-xs text-white placeholder-slate-500 outline-none transition"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="revision">Revision</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 outline-none"
          >
            <option value="all">All Risk Levels</option>
            <option value="High">High Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="Low">Low Risk</option>
          </select>
        </div>
      </div>

      {/* Submissions List Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading verification reports...</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-500 space-y-2">
            <FileText className="w-8 h-8 text-slate-600 mx-auto" />
            <p>No verification records match your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-3">Publication Title</th>
                  <th className="py-3 px-3">Creator</th>
                  <th className="py-3 px-3">Version</th>
                  <th className="py-3 px-3">Risk Level</th>
                  <th className="py-3 px-3">Issues</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-semibold text-slate-200">
                      <div>{s.title}</div>
                      <div className="text-[10px] text-slate-500">
                        Submitted: {new Date(s.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{s.creator_name}</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-300">v{s.version}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          s.risk_level === 'High'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : s.risk_level === 'Medium'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {s.risk_level} ({s.risk_score} pts)
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {s.unresolved_issues} issue{s.unresolved_issues !== 1 ? 's' : ''}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          s.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : s.status === 'rejected'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : s.status === 'revision'
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => openReport(s.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 transition"
                      >
                        Open Dossier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Comprehensive Report Modal */}
      {selectedId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] flex flex-col overflow-hidden">
            {loadingDetail ? (
              <div className="py-20 text-center text-xs text-slate-400">Loading comprehensive dossier...</div>
            ) : detail ? (
              <>
                {/* Modal Header */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded border border-cyan-800/60">
                        {detail.context.platform || 'General'} • {detail.context.tone || 'Standard'} Tone
                      </span>
                      <span className="text-xs text-slate-400">By {detail.creator_name}</span>
                    </div>
                    <h2 className="text-xl font-bold text-white mt-1">{detail.title}</h2>
                  </div>
                  <button
                    onClick={() => { setSelectedId(null); setDetail(null); }}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                  {/* Active Version Snapshot */}
                  {detail.versions && detail.versions.length > 0 && (
                    <div className="space-y-4">
                      {/* Explainable Risk Scoring Table */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white uppercase tracking-wider">
                            Explainable Risk Scoring Breakdown
                          </span>
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded uppercase tracking-wider ${
                              detail.versions[detail.versions.length - 1].risk.level === 'High'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : detail.versions[detail.versions.length - 1].risk.level === 'Medium'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            Level: {detail.versions[detail.versions.length - 1].risk.level} ({detail.versions[detail.versions.length - 1].risk.score} pts)
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed italic">
                          {detail.versions[detail.versions.length - 1].risk.why}
                        </p>

                        <div className="overflow-x-auto pt-1">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-slate-800/80 text-slate-500 text-[10px] uppercase">
                                <th className="py-1.5 px-2">Risk Factor</th>
                                <th className="py-1.5 px-2">Occurrences</th>
                                <th className="py-1.5 px-2">Assigned Weight</th>
                                <th className="py-1.5 px-2 text-right">Points</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40 text-[11px]">
                              {detail.versions[detail.versions.length - 1].risk.rows.map((row, idx) => (
                                <tr key={idx}>
                                  <td className="py-1.5 px-2 capitalize font-medium text-slate-300">{row.factor}</td>
                                  <td className="py-1.5 px-2 text-slate-400">{row.count}</td>
                                  <td className="py-1.5 px-2 text-slate-400">{row.weight}</td>
                                  <td className="py-1.5 px-2 text-right font-bold text-cyan-400">+{row.points}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Word-Level Diff (If revised) */}
                      {detail.diff && (
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-teal-400 uppercase tracking-wider">
                            <span className="flex items-center space-x-1.5">
                              <Layers className="w-4 h-4" />
                              <span>Word-Level Revision Diff</span>
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">Comparing v{detail.versions.length - 1} vs v{detail.versions.length}</span>
                          </div>
                          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono leading-relaxed whitespace-pre-wrap">
                            {detail.diff.map((d, i) => (
                              <span
                                key={i}
                                className={
                                  d.op === 'added'
                                    ? 'bg-emerald-500/30 text-emerald-300 px-1 py-0.5 rounded font-bold'
                                    : d.op === 'removed'
                                    ? 'bg-rose-500/30 text-rose-300 line-through px-1 py-0.5 rounded'
                                    : 'text-slate-300'
                                }
                              >
                                {d.text}{' '}
                              </span>
                            ))}
                          </div>

                          {detail.changes && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                              <div className="p-2 rounded bg-emerald-950/30 border border-emerald-900/40 text-emerald-300">
                                <strong>Resolved Issues ({detail.changes.resolved.length}):</strong>
                                <div className="mt-1 text-[10px]">{detail.changes.resolved.join(', ') || 'None'}</div>
                              </div>
                              <div className="p-2 rounded bg-amber-950/30 border border-amber-900/40 text-amber-300">
                                <strong>Still Unresolved ({detail.changes.unresolved.length}):</strong>
                                <div className="mt-1 text-[10px]">{detail.changes.unresolved.join(', ') || 'None'}</div>
                              </div>
                              <div className="p-2 rounded bg-rose-950/30 border border-rose-900/40 text-rose-300">
                                <strong>New Issues Introduced ({detail.changes.new.length}):</strong>
                                <div className="mt-1 text-[10px]">{detail.changes.new.join(', ') || 'None'}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Extracted Findings with Evidence Grounding */}
                      <div className="space-y-3">
                        <div className="text-xs font-bold text-white uppercase tracking-wider">
                          Extracted Claims & Grounding Evidence ({detail.versions[detail.versions.length - 1].findings.length})
                        </div>

                        <div className="space-y-3">
                          {detail.versions[detail.versions.length - 1].findings.map((f, i) => (
                            <div
                              key={i}
                              className={`p-4 rounded-xl border text-xs space-y-2 ${
                                f.type === 'contradictory'
                                  ? 'bg-rose-950/20 border-rose-800/50'
                                  : f.type === 'verified'
                                  ? 'bg-emerald-950/20 border-emerald-800/50'
                                  : f.type === 'outdated'
                                  ? 'bg-amber-950/20 border-amber-800/50'
                                  : 'bg-slate-950/80 border-slate-800'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold uppercase tracking-wider text-[10px]">
                                  [{f.type}]
                                </span>
                                {f.evidence && (
                                  <span className="text-[10px] font-mono text-cyan-400">
                                    Source: {f.evidence.title} v{f.evidence.version}
                                  </span>
                                )}
                              </div>

                              <div className="font-semibold text-slate-100 text-sm">
                                "{f.claim}"
                              </div>

                              <p className="text-slate-300 leading-relaxed">
                                {f.why}
                              </p>

                              {f.evidence?.passage && (
                                <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800 text-slate-300 italic text-[11px]">
                                  Approved Passage: "{f.evidence.passage}"
                                </div>
                              )}

                              {f.fix && (
                                <div className="p-2.5 rounded bg-cyan-950/40 border border-cyan-800/50 text-cyan-300 text-[11px]">
                                  <strong>Correction:</strong> {f.fix}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Editorial Decision Trail */}
                      {detail.decisions && detail.decisions.length > 0 && (
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                          <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                            <UserCheck className="w-4 h-4 text-cyan-400" />
                            <span>Editorial Review Decisions</span>
                          </div>

                          <div className="space-y-2">
                            {detail.decisions.map((dec, idx) => (
                              <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-200">
                                    {dec.reviewer_name} marked as <strong className="uppercase text-cyan-400">{dec.action}</strong>
                                  </span>
                                  <span className="text-[10px] text-slate-500">
                                    {new Date(dec.created_at).toLocaleString()}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-400">
                                  Judgement: <strong>{dec.genuineness}</strong> (v{dec.version_n})
                                </div>
                                {dec.comment && (
                                  <p className="text-slate-300 italic text-[11px] pt-1">
                                    "{dec.comment}"
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => { setSelectedId(null); setDetail(null); }}
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white"
                  >
                    Close Dossier
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
