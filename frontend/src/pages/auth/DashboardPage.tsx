import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck2,
  CheckCircle,
  AlertTriangle,
  Clock,
  ShieldAlert,
  GitCompare,
  TrendingUp,
  Activity,
  ArrowRight,
  Upload,
  BookOpen,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { api, DashboardMetrics, BrandHealthData } from '../../api';
import { useAuth } from '../../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [health, setHealth] = useState<BrandHealthData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [dash, bh] = await Promise.all([
        api.getDashboardStats(),
        api.getBrandHealth()
      ]);
      setData(dash);
      setHealth(bh);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [user]);

  const m = data?.metrics || {
    submitted_content: 0,
    pending_reviews: 0,
    approved_assets: 0,
    active_documents: 0,
    verified_claims: 0,
    unsupported_claims: 0,
    contradictory_claims: 0,
    high_risk_submissions: 0,
    open_impact_alerts: 0,
    evidence_coverage_percent: 0,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-2.5">
            <span>Operational Governance Console</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time fact verification, change impact tracking, and review accountability.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchDashboard}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/app/verify"
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow-md hover:scale-[1.02] transition"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Verify New Publication</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Verified Claims */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Verified Claims</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {m.verified_claims}
          </div>
          <div className="text-[11px] text-emerald-400 font-medium">
            {m.evidence_coverage_percent}% evidence coverage
          </div>
        </div>

        {/* High Risk Submissions */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>High Risk Submissions</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400">
            {m.high_risk_submissions}
          </div>
          <div className="text-[11px] text-slate-400">
            Mandates human review
          </div>
        </div>

        {/* Pending Reviews */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Pending Review Queue</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400">
            {m.pending_reviews}
          </div>
          <div className="text-[11px] text-slate-400">
            {m.approved_assets} assets approved
          </div>
        </div>

        {/* Change Impact Alerts */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Change Impact Alerts</span>
            <GitCompare className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-cyan-400">
            {m.open_impact_alerts}
          </div>
          <div className="text-[11px] text-slate-400">
            Potentially outdated assets
          </div>
        </div>
      </div>

      {/* Brand Health & Quick Action Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Brand Health Widget */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">Brand Health Index</h2>
              </div>
              <Link
                to="/app/brand-health"
                className="text-xs font-semibold text-cyan-400 hover:underline flex items-center space-x-1"
              >
                <span>Full Breakdown</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {health && health.score !== null ? (
              <div className="space-y-4">
                <div className="flex items-baseline space-x-3">
                  <span className="text-4xl sm:text-5xl font-black text-white">
                    {health.score}
                  </span>
                  <span className="text-slate-400 text-sm font-semibold">/ 100</span>
                  <span
                    className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      health.score >= 80
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : health.score >= 60
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {health.status || 'Active'}
                  </span>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(5, health.score))}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  {health.components?.slice(0, 3).map((c, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                      <div className="text-[10px] text-slate-400 truncate">{c.name}</div>
                      <div className="text-sm font-bold text-slate-200 mt-0.5">
                        {c.points} <span className="text-[10px] text-slate-500">/ {c.max} pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500 space-y-2">
                <p>Not enough data. Submit content to calculate an explainable brand health score.</p>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span>Period: {health?.period || 'Operational History'}</span>
            <span className="text-cyan-400">Active Governance Protocol</span>
          </div>
        </div>

        {/* Quick Shortcuts */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white mb-2">Shortcuts & Modules</h2>

          <div className="grid grid-cols-1 gap-2.5 text-xs font-semibold">
            <Link
              to="/app/verify"
              className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center justify-between transition group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-400 flex items-center justify-center">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-slate-200 group-hover:text-cyan-400 transition">Verify Publication</div>
                  <div className="text-[10px] text-slate-400 font-normal">Check draft claims against Knowledge Base</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition" />
            </Link>

            <Link
              to="/app/documents"
              className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center justify-between transition group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-purple-950 text-purple-400 flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-slate-200 group-hover:text-purple-400 transition">Upload Approved Policy</div>
                  <div className="text-[10px] text-slate-400 font-normal">Add PDF, DOCX or TXT source of truth</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition" />
            </Link>

            <Link
              to="/app/review"
              className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center justify-between transition group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-amber-950 text-amber-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-slate-200 group-hover:text-amber-400 transition">Inspect Review Queue</div>
                  <div className="text-[10px] text-slate-400 font-normal">Prioritized human decision workflow</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition" />
            </Link>

            <Link
              to="/app/impact"
              className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center justify-between transition group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-rose-950 text-rose-400 flex items-center justify-center">
                  <GitCompare className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-slate-200 group-hover:text-rose-400 transition">Change Impact Monitor</div>
                  <div className="text-[10px] text-slate-400 font-normal">Resolve outdated content alerts</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity Stream */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Recent Governance Activities</h2>
          <Link to="/app/audit" className="text-xs font-semibold text-cyan-400 hover:underline">
            View Immutable Audit Trail
          </Link>
        </div>

        <div className="divide-y divide-slate-800/80">
          {data?.recent_activities && data.recent_activities.length > 0 ? (
            data.recent_activities.map((a, i) => (
              <div key={i} className="py-3 flex items-start justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-200">{a.action}</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">{a.detail}</div>
                </div>
                <div className="text-slate-500 text-[10px] whitespace-nowrap ml-4">
                  {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-xs text-slate-500">
              No recent audit records found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
