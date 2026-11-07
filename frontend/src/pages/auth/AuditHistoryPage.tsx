import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Download,
  Filter,
  ShieldCheck,
  User,
  Clock,
  FileSpreadsheet
} from 'lucide-react';
import { api, AuditLogItem } from '../../api';

export const AuditHistoryPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verity-audit-trail-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const exportCSV = () => {
    const headers = ['Timestamp', 'Actor Name', 'Actor Role', 'Action', 'Detail'];
    const rows = logs.map((l) => [
      l.created_at,
      l.actor_name || 'System',
      l.actor_role || 'System',
      `"${l.action.replace(/"/g, '""')}"`,
      `"${l.detail.replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verity-audit-trail-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const filtered = logs.filter((l) => {
    const s = search.toLowerCase();
    return (
      l.action.toLowerCase().includes(s) ||
      l.detail.toLowerCase().includes(s) ||
      (l.actor_name && l.actor_name.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-2.5">
            <History className="w-7 h-7 text-cyan-400" />
            <span>Immutable Governance Audit Trail</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete, tamper-evident log of all document updates, editorial approvals, and guideline modifications.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center space-x-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={exportJSON}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center space-x-1.5 font-bold transition shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter audit trail by action, actor, or event detail..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-400 text-xs text-white placeholder-slate-500 outline-none transition"
        />
      </div>

      {/* Audit Trail Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading audit records...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">No audit records match your query.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3">Actor</th>
                  <th className="py-3 px-3">Action Event</th>
                  <th className="py-3 px-3">Event Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-sans font-semibold text-slate-200">
                        {log.actor_name || 'System Daemon'}
                      </div>
                      {log.actor_role && (
                        <span className="text-[10px] text-cyan-400 capitalize">
                          {log.actor_role}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-300 font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-300">
                      {log.detail}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
