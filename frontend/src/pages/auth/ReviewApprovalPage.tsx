import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldAlert,
  UserCheck,
  X,
  FileText
} from 'lucide-react';
import { api, SubmissionItem, SubmissionDetail } from '../../api';

export const ReviewApprovalPage: React.FC = () => {
  const [queue, setQueue] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'revision' | 'all'>('pending');

  // Review Modal state
  const [activeItem, setActiveItem] = useState<SubmissionDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [action, setAction] = useState<'approved' | 'revision' | 'rejected'>('approved');
  const [genuineness, setGenuineness] = useState<'Genuine' | 'Misleading' | 'Cannot determine'>('Genuine');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const data = await api.getSubmissions();
      setQueue(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const openReviewModal = async (id: string) => {
    setLoadingDetail(true);
    setErrorMsg(null);
    setComment('');
    try {
      const detail = await api.getSubmission(id);
      setActiveItem(detail);
      // Default to revision if high risk
      const latestVer = detail.versions[detail.versions.length - 1];
      if (latestVer?.risk?.level === 'High') {
        setAction('revision');
        setGenuineness('Cannot determine');
      } else {
        setAction('approved');
        setGenuineness('Genuine');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to load submission');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;

    const latestVer = activeItem.versions[activeItem.versions.length - 1];
    const isHighRisk = latestVer?.risk?.level === 'High';

    if (action === 'approved' && genuineness === 'Misleading') {
      setErrorMsg("Content judged 'Misleading' can never be approved. It must be rejected or revised.");
      return;
    }

    if (action === 'approved' && isHighRisk && !comment.trim()) {
      setErrorMsg("High-risk publications strictly require a written justification comment before approval.");
      return;
    }

    if (action !== 'approved' && !comment.trim()) {
      setErrorMsg(`A written comment is required when ${action === 'revision' ? 'requesting a revision' : 'rejecting'} content.`);
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      await api.recordDecision(activeItem.id, {
        action,
        genuineness,
        comment: comment.trim()
      });
      setActiveItem(null);
      fetchQueue();
    } catch (err: any) {
      setErrorMsg(err.message || 'Decision recording failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = queue.filter((item) => {
    if (statusFilter === 'all') return true;
    return item.status === statusFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-2.5">
          <CheckSquare className="w-7 h-7 text-cyan-400" />
          <span>Smart Review & Approval Queue</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Prioritised editorial review queue ranked by risk severity, contradiction presence, and submission deadline.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2">
        {(['pending', 'revision', 'all'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
              statusFilter === s
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {s} Submissions
          </button>
        ))}
      </div>

      {/* Prioritised Queue List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading prioritized queue...</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center p-8 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="font-bold text-slate-200">Review queue is clear.</p>
            <p className="text-slate-500">No pending submissions currently require editorial evaluation.</p>
          </div>
        ) : (
          filtered.map((item) => {
            const isHigh = item.risk_level === 'High';
            const isMedium = item.risk_level === 'Medium';

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        isHigh
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : isMedium
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {item.risk_level} Risk • Priority {item.priority}
                    </span>

                    <span className="text-[11px] text-slate-400">
                      By <strong className="text-slate-200">{item.creator_name}</strong>
                    </span>

                    <span className="text-[11px] text-slate-500">
                      • Version v{item.version}
                    </span>

                    {item.deadline && (
                      <span className="text-[10px] text-amber-400 font-mono bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/60">
                        Deadline: {item.deadline}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition">
                    {item.title}
                  </h3>

                  <div className="text-xs text-slate-400 flex items-center space-x-3">
                    <span>{item.unresolved_issues} unverified/flagged issue{item.unresolved_issues !== 1 ? 's' : ''}</span>
                    <span>•</span>
                    <span>Submitted: {new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="sm:shrink-0 flex items-center space-x-3">
                  <button
                    onClick={() => openReviewModal(item.id)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition flex items-center space-x-1.5 shadow"
                  >
                    <span>Evaluate Submission</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Review & Decision Modal */}
      {activeItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  Human-in-the-Loop Review Console
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5">{activeItem.title}</h2>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              {/* Submission Body Text */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-500">
                  Full Submitted Copy
                </div>
                <div className="text-xs text-slate-200 font-mono leading-relaxed whitespace-pre-wrap">
                  {activeItem.versions[activeItem.versions.length - 1]?.body}
                </div>
              </div>

              {/* Findings Summary */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Verification Findings & Evidence Check
                </div>
                <div className="space-y-2">
                  {activeItem.versions[activeItem.versions.length - 1]?.findings.map((f, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg border text-xs space-y-1 ${
                        f.type === 'contradictory'
                          ? 'bg-rose-950/20 border-rose-900/50 text-rose-200'
                          : f.type === 'verified'
                          ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-200'
                          : 'bg-slate-950 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex justify-between font-bold text-[10px] uppercase">
                        <span>[{f.type}]</span>
                        {f.evidence && <span>Source: {f.evidence.title} v{f.evidence.version}</span>}
                      </div>
                      <div className="font-semibold text-slate-100">"{f.claim}"</div>
                      <p className="text-[11px] text-slate-400">{f.why}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decision Action Form */}
              <form onSubmit={handleDecision} className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-white">
                  Record Authorized Editorial Decision
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Factual Genuineness Judgement <span className="text-cyan-400">*</span>
                    </label>
                    <select
                      value={genuineness}
                      onChange={(e) => setGenuineness(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none"
                    >
                      <option value="Genuine">Genuine (Factual & Consistent)</option>
                      <option value="Misleading">Misleading (Contradicts Approved Truth)</option>
                      <option value="Cannot determine">Cannot determine (Needs Evidence)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Action Decision <span className="text-cyan-400">*</span>
                    </label>
                    <select
                      value={action}
                      onChange={(e) => setAction(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none"
                    >
                      <option value="approved">Approve Publication</option>
                      <option value="revision">Request Revision</option>
                      <option value="rejected">Reject Content</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Editorial Justification / Review Comment{' '}
                    <span className="text-slate-500 font-normal">
                      (Mandatory for Rejection, Revision, and High-Risk Approval)
                    </span>
                  </label>
                  <textarea
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Provide written justification for this review decision..."
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-600 outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setActiveItem(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shadow"
                  >
                    {submitting ? 'Recording...' : 'Commit Review Decision'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
