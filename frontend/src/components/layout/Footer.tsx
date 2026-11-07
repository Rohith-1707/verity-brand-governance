import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, CheckCircle2, FileText, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/80 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-6 py-12 sm:py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-1 space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-slate-950" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">VERITY</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Evidence-Driven Intelligent Brand Governance Platform. Every claim needs evidence. Every publication needs accountability.
          </p>
          <div className="flex items-center space-x-2 text-xs text-cyan-400 font-medium pt-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>Deterministic RAG & Evidence Grounding</span>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">Core Innovations</h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link to="/features#evidence" className="hover:text-cyan-400 transition">Evidence-Linked Verification</Link></li>
            <li><Link to="/features#impact" className="hover:text-cyan-400 transition">Change Impact Analysis</Link></li>
            <li><Link to="/features#adaptive" className="hover:text-cyan-400 transition">Adaptive Governance Intelligence</Link></li>
            <li><Link to="/features#freshness" className="hover:text-cyan-400 transition">Evidence Freshness Monitor</Link></li>
            <li><Link to="/features#risk" className="hover:text-cyan-400 transition">Explainable Risk Scoring</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">Governance Pipeline</h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link to="/how-it-works" className="hover:text-cyan-400 transition">12-Step Verification Pipeline</Link></li>
            <li><Link to="/how-it-works" className="hover:text-cyan-400 transition">Human-in-the-Loop Review Queue</Link></li>
            <li><Link to="/how-it-works" className="hover:text-cyan-400 transition">Smart Word-Level Diff Tracking</Link></li>
            <li><Link to="/how-it-works" className="hover:text-cyan-400 transition">Brand Health Calculation</Link></li>
            <li><Link to="/how-it-works" className="hover:text-cyan-400 transition">Immutable Audit Trail</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">Responsible AI</h4>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            VERITY strictly prohibits invented evidence. AI screening is advisory; factual truth requires approved organizational grounding and human reviewer accountability.
          </p>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500">
            <Lock className="w-3.5 h-3.5 text-teal-400" />
            <span>Organization-level data isolation</span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-900 px-6 py-6 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
        <div>
          © 2026 VERITY Platform. Designed for Enterprise Brand Safety & Compliance.
        </div>
        <div className="flex items-center space-x-6 mt-3 sm:mt-0">
          <span>FastAPI</span>
          <span>•</span>
          <span>PostgreSQL / SQLite</span>
          <span>•</span>
          <span>PyMuPDF & OpenCV</span>
          <span>•</span>
          <span>React & Tailwind</span>
        </div>
      </div>
    </footer>
  );
};
