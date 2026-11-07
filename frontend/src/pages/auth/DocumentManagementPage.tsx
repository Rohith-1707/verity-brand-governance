import React, { useState, useEffect } from 'react';
import {
  FolderSync,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Archive,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import { api, DocumentItem } from '../../api';

export const DocumentManagementPage: React.FC = () => {
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Legal & Compliance');
  const [version, setVersion] = useState('2.0');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [reviewDate, setReviewDate] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const data = await api.getDocuments();
      setDocs(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !file) {
      setErrorMsg('Please specify a title and select a document file (PDF, DOCX, TXT).');
      return;
    }

    setUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('version', version);
    if (effectiveDate) formData.append('effective_date', effectiveDate);
    if (reviewDate) formData.append('review_date', reviewDate);
    formData.append('file', file);

    try {
      const res = await api.uploadDocument(formData);
      setSuccessMsg(
        `Document "${res.title}" v${res.version} processed successfully (${res.characters.toLocaleString()} characters). ${
          res.impacts_found > 0
            ? `${res.impacts_found} change impact alert(s) generated for downstream assets.`
            : 'No downstream impact alerts triggered.'
        }`
      );
      // Reset form
      setTitle('');
      setVersion('1.0');
      setFile(null);
      fetchDocs();
    } catch (err: any) {
      setErrorMsg(err.message || 'Document upload and text extraction failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleArchive = async (docId: string, docTitle: string) => {
    if (!window.confirm(`Are you sure you want to archive "${docTitle}"?`)) return;
    try {
      await api.archiveDocument(docId);
      fetchDocs();
    } catch (err: any) {
      alert(err.message || 'Failed to archive document');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-2.5">
          <FolderSync className="w-7 h-7 text-cyan-400" />
          <span>Document Lifecycle & Version Management</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Upload authoritative policies, replace superseded documents, and control freshness review dates.
        </p>
      </div>

      {/* Upload & Replacement Form */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
        <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
          <Upload className="w-4 h-4" />
          <span>Upload New Approved Document or Version Replacement</span>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleUpload} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Document Title <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Standard Product Warranty Policy"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-white placeholder-slate-600 outline-none transition"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Note: Entering an existing title supersedes the previous version and triggers Change Impact Analysis.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Document Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-white outline-none transition"
            >
              <option>Legal & Compliance</option>
              <option>Product Engineering</option>
              <option>Brand Identity</option>
              <option>Financial & Pricing</option>
              <option>Human Resources</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Version Number</label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="e.g. 2.0"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-white outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Effective Date</label>
            <input
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-white outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Review / Expiry Date</label>
            <input
              type="date"
              value={reviewDate}
              onChange={(e) => setReviewDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-white outline-none transition"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Select Source File (.pdf, .docx, .txt, .png, .jpg) <span className="text-cyan-400">*</span>
            </label>
            <div className="p-4 rounded-xl border-2 border-dashed border-slate-800 hover:border-cyan-500/50 bg-slate-950/60 transition text-center cursor-pointer">
              <input
                type="file"
                accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-500 file:text-slate-950 hover:file:bg-cyan-400 cursor-pointer"
              />
              <span className="text-[11px] text-slate-500 block mt-2">
                Supported formats: PDF (native PyMuPDF extraction), DOCX (tables & paragraphs), TXT, and Brand Images (OpenCV visual checks). Max 10 MB.
              </span>
            </div>
          </div>

          <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-2.5 rounded-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs transition flex items-center space-x-2 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{uploading ? 'Extracting & Indexing...' : 'Upload & Re-index Knowledge Base'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Existing Registered Versions Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white">Registered Document Archive & Versions</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3">Title & Category</th>
                <th className="py-3 px-3">Version</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Effective Date</th>
                <th className="py-3 px-3">Review Date</th>
                <th className="py-3 px-3">Uploaded</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {docs.map((d) => (
                <tr key={d.version_id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 font-semibold text-slate-200">
                    <div>{d.title}</div>
                    <div className="text-[10px] text-cyan-400 font-normal">{d.category}</div>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-300">v{d.version}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        d.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : d.status === 'superseded'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400">{d.effective_date || 'None'}</td>
                  <td className="py-3 px-3 text-slate-400">{d.review_date || 'None'}</td>
                  <td className="py-3 px-3 text-slate-500 text-[11px]">
                    {new Date(d.uploaded_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {d.status !== 'archived' && (
                      <button
                        onClick={() => handleArchive(d.doc_id, d.title)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition"
                        title="Archive Document"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
