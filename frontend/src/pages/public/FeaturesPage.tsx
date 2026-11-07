import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  GitCompare,
  BrainCircuit,
  Clock,
  Gauge,
  Layers,
  Activity,
  FileCheck2,
  ListOrdered,
  CheckCircle,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

export const FeaturesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 transition-colors duration-200">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-20 flex-1">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/80">
            Comprehensive Platform Features
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mt-4 mb-4 tracking-tight">
            Engineered for Grounded Accuracy
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Explore the 3 original innovations and 6 enhancements designed to protect organizational integrity.
          </p>
        </div>

        {/* Detailed Breakdown of Innovations */}
        <div className="space-y-16">
          {/* Innovation 1 */}
          <div id="evidence" className="p-8 sm:p-10 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Original Innovation 1</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Evidence-Linked Claim Verification
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Accepts multi-format content: raw text, PDF, DOCX, and brand images. Claims are extracted and mapped to approved organizational documentation using semantic RAG.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                  <strong className="text-cyan-400 block mb-1">Traceable Grounding:</strong>
                  Displays source document title, version number, effective date, and exact passage quote.
                </div>
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                  <strong className="text-cyan-400 block mb-1">Explainable Classifications:</strong>
                  Classifies findings as Verified, Contradictory, Unsupported, Outdated, or Needs Review.
                </div>
              </div>
            </div>
            <div className="lg:col-span-5 p-5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-3 font-mono">
              <div className="text-slate-400 font-semibold border-b border-slate-800 pb-2">SAMPLE FINDING TRACE</div>
              <div className="text-emerald-400 font-bold">[VERIFIED] 14 hours battery life</div>
              <div className="text-slate-400 text-[11px]">Source: Apex X1 Technical Specifications v1.4</div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300 italic text-[11px]">
                "The battery delivers up to 14 hours of continuous web browsing on a single charge."
              </div>
              <div className="text-slate-500 text-[10px]">Grounding Confidence: 0.94 • Deterministic Match</div>
            </div>
          </div>

          {/* Innovation 2 */}
          <div id="impact" className="p-8 sm:p-10 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center space-x-2 text-xs font-bold text-teal-400 uppercase tracking-wider">
                <GitCompare className="w-4 h-4" />
                <span>Original Innovation 2</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Cross-Content Change Impact Analysis
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                When an approved specification or policy changes, VERITY scours all registered brochures, web pages, and campaign materials to highlight which assets still carry obsolete information.
              </p>
              <div className="space-y-2 text-xs text-slate-300 pt-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Pinpoints the exact sentence index and text location across all registered assets.</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Provides an interactive resolution queue for authorized reviewers.</span>
                </div>
              </div>
            </div>
            <div className="lg:col-span-5 p-5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-3 font-mono">
              <div className="text-slate-400 font-semibold border-b border-slate-800 pb-2">CHANGE IMPACT EVENT</div>
              <div className="text-rose-400 font-bold">[OBSOLETE TEXT] Warranty 3 Years</div>
              <div className="text-slate-400 text-[11px]">Affected Asset: Spring Campaign Press Release</div>
              <div className="text-slate-400 text-[11px]">Location: Sentence 1 of 3</div>
              <div className="p-2.5 rounded bg-rose-950/20 border border-rose-900/40 text-rose-300 text-[11px]">
                "The new Apex X1 includes a 3 year warranty."
              </div>
              <div className="text-cyan-400 text-[11px]">Status: Open Alert • Awaiting Reviewer Resolution</div>
            </div>
          </div>

          {/* Innovation 3 */}
          <div id="adaptive" className="p-8 sm:p-10 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <BrainCircuit className="w-4 h-4" />
                <span>Original Innovation 3</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Adaptive Governance Intelligence
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Aggregates review feedback across hundreds of editorial cycles. Automatically surfaces recurring failure modes: common prohibited terms, frequently misunderstood features, and tone slip-ups.
              </p>
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-300">
                <strong className="text-emerald-400 block mb-1">Human-Governed Recommendations:</strong>
                Outputs concrete suggestions to administrators to refine company guidelines without silently altering policies.
              </div>
            </div>
            <div className="lg:col-span-5 p-5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-2.5 font-mono">
              <div className="text-slate-400 font-semibold border-b border-slate-800 pb-2">ADAPTIVE INTELLIGENCE LOG</div>
              <div className="text-amber-400 text-[11px]">Frequency: Prohibited term "unbeatable" flagged 3x</div>
              <div className="p-2 rounded bg-slate-900 text-slate-300 text-[11px]">
                Recommendation: Provide authorized replacement terminology in marketing handbook (e.g. "high performance").
              </div>
            </div>
          </div>
        </div>

        {/* Enhancements Grid */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-white text-center mb-10">
            Engineered Enhancements at a Glance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
              <Clock className="w-6 h-6 text-cyan-400" />
              <h4 className="font-bold text-white text-base">Freshness Monitor</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Flags claims referencing documents past their review date or superseded by a newer version. Surfaces date uncertainty when sources lack metadata.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
              <Gauge className="w-6 h-6 text-amber-400" />
              <h4 className="font-bold text-white text-base">Intelligent Risk Scoring</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Calculates explainable risk scores (0-100) using configurable administrator weights. Contradictions force High risk, strictly mandating human sign-off.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
              <Layers className="w-6 h-6 text-teal-400" />
              <h4 className="font-bold text-white text-base">Smart Revision Diff</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Side-by-side word-level diff analysis across versions. Highlights resolved issues, lingering problems, and newly introduced unsupported claims.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
              <Activity className="w-6 h-6 text-emerald-400" />
              <h4 className="font-bold text-white text-base">Brand Health Score</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Executive dashboard index measuring evidence coverage, unresolved high risks, review turnaround rate, and guideline compliance.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
              <FileCheck2 className="w-6 h-6 text-purple-400" />
              <h4 className="font-bold text-white text-base">Context-Aware Rules</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Creators specify audience, platform, purpose, and tone. Tone checks are advisory in context, while mandatory compliance rules are strictly enforced.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
              <ListOrdered className="w-6 h-6 text-cyan-400" />
              <h4 className="font-bold text-white text-base">Smart Review Queue</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Prioritizes reviewer queue by severity, risk score, contradiction presence, and submission deadline with real-time in-app alerts.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-20 text-center">
          <Link
            to="/login"
            className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 transition"
          >
            <span>Launch Live Console</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};
