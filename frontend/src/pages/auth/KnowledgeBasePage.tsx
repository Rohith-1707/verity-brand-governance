import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  Clock,
  Archive,
  FileText,
  Upload,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { api, DocumentItem } from '../../api';

export const KnowledgeBasePage: React.FC = () => {
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'superseded'>('approved');
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);

  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);
      try {
        const data = await api.getDocuments();
        setDocs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  const filtered = docs.filter((d) => {
    const matchSearch =
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.category.toLowerCase().includes(search.toLowerCase()) ||
      d.preview.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-2.5">
            <BookOpen className="w-7 h-7 text-cyan-400" />
            <span>Authoritative Knowledge Base</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Approved organisational policies, engineering specifications, and statutory documentation.
          </p>
        </div>

        <Link
          to="/app/documents"
          className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shadow"
        >
          <Upload className="w-4 h-4" />
          <span>Upload or Replace Document</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents by title, category, or content excerpt..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-400 text-xs text-slate-100 placeholder-slate-500 outline-none transition"
          />
        </div>

        <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {(['approved', 'superseded', 'all'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                statusFilter === s
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Document Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading Knowledge Base documents...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400 space-y-3">
          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="font-semibold text-slate-300">No documents match your query.</p>
          <p className="max-w-md mx-auto text-slate-500">
            Ensure approved policies have been uploaded or switch status filter to inspect superseded revisions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((doc) => {
            const isApproved = doc.status === 'approved';
            const isSuperseded = doc.status === 'superseded';
            const hasReviewPassed = doc.review_date && new Date(doc.review_date) < new Date();

            return (
              <div
                key={doc.version_id}
                onClick={() => setSelectedDoc(doc)}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition flex flex-col justify-between group space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider bg-cyan-950/60 px-2.5 py-0.5 rounded border border-cyan-800/60">
                      {doc.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        isApproved
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isSuperseded
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {doc.status} v{doc.version}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition mb-2">
                    {doc.title}
                  </h3>

                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed italic bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    "{doc.preview}..."
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <span title="Effective Date">
                      Effective: {doc.effective_date ? new Date(doc.effective_date).toLocaleDateString() : 'Unspecified'}
                    </span>
                    <span>•</span>
                    <span
                      className={hasReviewPassed ? 'text-amber-400 font-semibold' : ''}
                      title="Review Date"
                    >
                      Review: {doc.review_date ? new Date(doc.review_date).toLocaleDateString() : 'No expiry'}
                    </span>
                  </div>

                  <div className="text-slate-500 font-mono text-[10px]">
                    {doc.characters?.toLocaleString()} chars
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Document Full View Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                  {selectedDoc.category} • v{selectedDoc.version}
                </span>
                <h2 className="text-lg font-bold text-white mt-0.5">{selectedDoc.title}</h2>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center space-x-4 text-xs text-slate-400 py-1">
              <span>Status: <strong className="text-white capitalize">{selectedDoc.status}</strong></span>
              <span>•</span>
              <span>Effective: <strong className="text-white">{selectedDoc.effective_date || 'N/A'}</strong></span>
              <span>•</span>
              <span>Review Date: <strong className="text-white">{selectedDoc.review_date || 'N/A'}</strong></span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">
              {selectedDoc.preview}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white"
              >
                Close Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
