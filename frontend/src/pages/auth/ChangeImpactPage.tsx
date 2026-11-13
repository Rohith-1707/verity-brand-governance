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
  Check,
  Wand2,
  Layers,
  Sparkles,
  RefreshCw,
  Sliders,
  ShieldCheck,
  CheckCheck
} from 'lucide-react';
import { api, ImpactAlert, ReconciliationPlan, ReconciliationPatch } from '../../api';

export const ChangeImpactPage: React.FC = () => {
  // Tabs: Impact Alerts Matrix vs Round 3 Policy Reconciliation Wizard
  const [activeTab, setActiveTab] = useState<'alerts' | 'wizard'>('wizard');

  const [impacts, setImpacts] = useState<ImpactAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'open' | 'resolved' | 'all'>('open');
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  // --- Round 3: Policy Reconciliation Wizard States ---
  const [plan, setPlan] = useState<ReconciliationPlan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [selectedPatches, setSelectedPatches] = useState<string[]>([]);
  const [batchApplying, setBatchApplying] = useState(false);
  const [reconcileSuccess, setReconcileSuccess] = useState<{
    count: number;
    timestamp: string;
  } | null>(null);

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

  const fetchReconciliationPlan = async () => {
    setLoadingPlan(true);
    try {
      const data = await api.getReconciliationPlan();
      setPlan(data);
      setSelectedPatches(data.patches.map(p => p.impact_id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPlan(false);
    }
  };

  useEffect(() => {
    fetchImpacts();
    fetchReconciliationPlan();
  }, []);

  const handleResolve = async (id: string) => {
    setResolvingId(id);
    try {
      await api.resolveImpact(id);
      fetchImpacts();
      fetchReconciliationPlan();
    } catch (err: any) {
      alert(err.message || 'Failed to resolve impact alert');
    } finally {
      setResolvingId(null);
    }
  };

  const togglePatchSelection = (id: string) => {
    setSelectedPatches(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAllPatches = () => {
    if (!plan) return;
    if (selectedPatches.length === plan.patches.length) {
      setSelectedPatches([]);
    } else {
      setSelectedPatches(plan.patches.map(p => p.impact_id));
    }
  };

  const handleBatchReconcile = async () => {
    setBatchApplying(true);
    setReconcileSuccess(null);
    try {
      const res = await api.applyBatchReconciliation(selectedPatches);
      setReconcileSuccess({
        count: res.reconciled_count,
        timestamp: res.timestamp
      });
      // Refresh impacts and plan
      await fetchImpacts();
      await fetchReconciliationPlan();
    } catch (err: any) {
      alert(err.message || 'Failed to apply batch reconciliation');
    } finally {
      setBatchApplying(false);
    }
  };

  const filtered = impacts.filter((i) => {
    if (filter === 'all') return true;
    return i.status === filter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-2.5">
            <GitCompare className="w-7 h-7 text-cyan-400" />
            <span>Cross-Content Change Impact Analysis</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Detect and remediate outdated collateral when authoritative organisational policies or technical specifications are superseded.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('wizard')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'wizard'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            <span>Policy Reconciliation Wizard</span>
            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-md bg-cyan-400 text-slate-950 font-black">
              R3
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('alerts')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'alerts'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Impact Alerts Matrix</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ROUND 3 IMPROVEMENT 2: AUTOMATED CROSS-ASSET POLICY RECONCILIATION WIZARD */}
      {/* ========================================================================= */}
      {activeTab === 'wizard' ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Information & Summary Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-800/50 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <span className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Wand2 className="w-6 h-6" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-white">Cross-Asset Policy Remediation Wizard</h2>
                  <p className="text-xs text-slate-300">
                    Superseded fact detected: <strong>Hardware Warranty Policy v2.4</strong> replaced v1.0 (Warranty duration reduced from 3 years to 2 years).
                  </p>
                </div>
              </div>

              {/* Action Button */}
              {plan && plan.patches.length > 0 && (
                <button
                  type="button"
                  onClick={handleBatchReconcile}
                  disabled={batchApplying || selectedPatches.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-cyan-500/25 transition active:scale-95 disabled:opacity-50"
                >
                  {batchApplying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Propagating Patches...</span>
                    </>
                  ) : (
                    <>
                      <CheckCheck className="w-4 h-4" />
                      <span>Batch Propagate ({selectedPatches.length}) Patches</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                <div className="text-[10px] uppercase text-slate-500 font-semibold">Impacted Collateral Assets</div>
                <div className="text-lg font-black text-cyan-400 mt-0.5">
                  {plan ? plan.patches.length : 0} Assets Out of Sync
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                <div className="text-[10px] uppercase text-slate-500 font-semibold">Authoritative Standard</div>
                <div className="text-lg font-black text-white mt-0.5">
                  Warranty Policy v2.4 (2-Yr Standard)
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                <div className="text-[10px] uppercase text-slate-500 font-semibold">Remediation Delta</div>
                <div className="text-lg font-black text-emerald-400 mt-0.5">
                  High Risk → 100% Compliant
                </div>
              </div>
            </div>
          </div>

          {reconcileSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Batch Propagation Successful!</strong> Applied authoritative Policy v2.4 patches across {reconcileSuccess.count} collateral assets.
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 opacity-80">
                Audit Receipt: {reconcileSuccess.timestamp.slice(11, 19)} UTC
              </span>
            </div>
          )}

          {/* Unified Patch Diff Viewer */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs px-1">
              <div className="font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                <span>Unified Cross-Asset Patch Diff Viewer</span>
                <span className="text-cyan-400">({plan ? plan.patches.length : 0} items)</span>
              </div>

              {plan && plan.patches.length > 0 && (
                <button
                  type="button"
                  onClick={selectAllPatches}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
                >
                  <span>{selectedPatches.length === plan.patches.length ? 'Deselect All' : 'Select All'}</span>
                </button>
              )}
            </div>

            {loadingPlan ? (
              <div className="py-20 text-center text-xs text-slate-400 space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cyan-400" />
                <div>Computing semantic token diffs across registered collateral...</div>
              </div>
            ) : !plan || plan.patches.length === 0 ? (
              <div className="py-16 text-center p-8 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="font-bold text-slate-200">All registered collateral is 100% reconciled!</p>
                <p className="text-slate-500">Every brochure, FAQ, and sales deck is grounded in current authoritative policies.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {plan.patches.map((patch) => {
                  const isChecked = selectedPatches.includes(patch.impact_id);

                  return (
                    <div
                      key={patch.impact_id}
                      className={`p-5 rounded-2xl border transition shadow-lg ${
                        isChecked
                          ? 'bg-slate-900 border-cyan-800/60 ring-1 ring-cyan-500/20'
                          : 'bg-slate-900/60 border-slate-800 opacity-75'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePatchSelection(patch.impact_id)}
                            className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0 w-4 h-4 cursor-pointer"
                          />
                          <div>
                            <div className="font-bold text-white text-sm flex items-center space-x-2">
                              <span>{patch.asset_title}</span>
                              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                                {patch.asset_type}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              Policy Document: <span className="text-cyan-400 font-semibold">{patch.document_title}</span> • v{patch.document_version}
                            </div>
                          </div>
                        </div>

                        <span className="text-[10px] uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold shrink-0">
                          {patch.risk_delta}
                        </span>
                      </div>

                      {/* Before / After Unified Diff Box */}
                      <div className="mt-4 space-y-3 font-mono text-xs">
                        {/* Outdated Text (Red Removal) */}
                        <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/40 text-rose-300 space-y-1">
                          <div className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
                            - Superseded Outdated Copy (Policy v1.0):
                          </div>
                          <div className="line-through opacity-85 leading-relaxed">
                            "{patch.old_text}"
                          </div>
                        </div>

                        {/* Proposed Compliant Patch (Green Addition) */}
                        <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-emerald-300 space-y-1">
                          <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center space-x-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>+ Proposed Authoritative Patch (Policy v2.4):</span>
                          </div>
                          <div className="font-semibold leading-relaxed">
                            "{patch.new_text}"
                          </div>
                        </div>

                        {/* Token Level Sequence Matcher Diff */}
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] flex flex-wrap gap-1 items-center">
                          <span className="text-slate-500 text-[10px] uppercase mr-1">Diff Breakdown:</span>
                          {patch.diff.map((op, idx) => (
                            <span
                              key={idx}
                              className={`px-1.5 py-0.5 rounded text-[11px] ${
                                op.op === 'removed'
                                  ? 'bg-rose-900/40 text-rose-300 line-through'
                                  : op.op === 'added'
                                  ? 'bg-emerald-900/40 text-emerald-300 font-bold'
                                  : 'text-slate-300'
                              }`}
                            >
                              {op.text}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* IMPACT ALERTS MATRIX VIEW */
        /* ========================================================================= */
        <div className="space-y-4">
          {/* Information Banner */}
          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/50 text-xs text-slate-300 flex items-start space-x-3">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Deterministic Asset Grounding:</strong> Change impact tracking evaluates registered brochures, press releases, and publications. When an authoritative document is superseded, affected collateral assets are flagged with exact sentence locations for human review.
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
              <div className="space-y-3">
                {filtered.map((item) => {
                  const isOpen = item.status === 'open';
                  const isResolving = resolvingId === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`p-5 rounded-2xl border transition ${
                        isOpen
                          ? 'bg-slate-900 border-amber-800/40 shadow-lg'
                          : 'bg-slate-900/60 border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isOpen ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
                              }`}
                            />
                            <span className="font-bold text-white text-sm">
                              {item.content_title || 'Registered Asset'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              ({item.location})
                            </span>
                          </div>
                          <div className="text-xs text-slate-400">
                            Affected by: <span className="text-cyan-400 font-semibold">{item.document_title || 'Updated Policy'}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              isOpen
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {item.status}
                          </span>

                          {isOpen && (
                            <button
                              onClick={() => handleResolve(item.id)}
                              disabled={isResolving}
                              className="px-3 py-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1 transition active:scale-95 disabled:opacity-50"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{isResolving ? 'Resolving...' : 'Mark Reconciled'}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-xs">
                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                          <div className="text-[10px] uppercase font-bold text-slate-500">
                            Current Content Text:
                          </div>
                          <div className="text-slate-300 font-medium">"{item.sentence}"</div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                          <div className="text-[10px] uppercase font-bold text-rose-400">
                            Superseded / Changed Fact:
                          </div>
                          <div className="text-rose-300 font-medium">"{item.old_text}"</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
