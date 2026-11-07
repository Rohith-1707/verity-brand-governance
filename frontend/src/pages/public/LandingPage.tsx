import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  GitCompare,
  BrainCircuit,
  Clock,
  Gauge,
  Layers,
  ArrowRight,
  Lock,
  Sparkles,
  FileText,
  TrendingUp,
  FileCheck2,
  Users,
  EyeOff
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 sm:pt-28 sm:pb-32 px-4 sm:px-8 max-w-7xl mx-auto text-center overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[200px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-800/80 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-8 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Evidence-Driven Intelligent Brand Governance</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight max-w-5xl mx-auto leading-[1.1] mb-6">
          Make Every Publication <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
            Trustworthy.
          </span>
        </h1>

        <p className="text-lg sm:text-xl font-medium text-cyan-300/90 max-w-2xl mx-auto mb-4 tracking-tight">
          Every Claim Needs Evidence. Every Publication Needs Accountability.
        </p>

        <p className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
          Verify claims, detect outdated information and maintain brand consistency through evidence-driven AI governance.
          Ground content directly into authoritative organizational facts with human review decisions.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] transition-all flex items-center justify-center space-x-2 text-sm"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/features"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-slate-200 transition-all flex items-center justify-center space-x-2 text-sm"
          >
            <span>Explore Platform</span>
          </Link>
        </div>

        {/* Hero Preview Card */}
        <div className="mt-16 sm:mt-20 max-w-5xl mx-auto p-2 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/60 border border-slate-800 shadow-2xl backdrop-blur-xl">
          <div className="rounded-xl bg-slate-950/90 p-6 sm:p-8 text-left border border-slate-800/60">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Live Verification Inspection
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  High Risk Flagged
                </span>
              </div>
              <div className="text-xs font-mono text-cyan-400">
                Calculated Risk Score: 30 / 100
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Submitted Publication Claim
                </div>
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-sm leading-relaxed text-slate-200">
                  <span className="bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/40 font-medium">
                    "All Apex devices include a 3 year warranty."
                  </span>
                  <p className="mt-2 text-xs text-slate-400">
                    Context: Instagram Marketing Campaign • Target: Consumer Electronics
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Traceable Approved Evidence
                </div>
                <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/50 text-sm leading-relaxed text-slate-200">
                  <div className="text-xs font-semibold text-cyan-400 mb-1 flex items-center space-x-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Standard Product Warranty Policy v2.0 (Approved)</span>
                  </div>
                  <p className="text-xs text-slate-300 italic">
                    "All Apex X1 hardware products purchased from authorized retailers include a 2 year limited manufacturer warranty."
                  </p>
                  <div className="mt-3 text-[11px] text-rose-400 font-medium bg-rose-950/40 p-2 rounded border border-rose-900/50">
                    Contradiction Detected: The submitted figure (3) differs from approved source (2).
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Three Original Core Innovations */}
      <section className="py-20 bg-slate-900/60 border-y border-slate-800 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
              Architectural Foundations
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
              Three Original Core Innovations
            </h3>
            <p className="text-sm sm:text-base text-slate-400">
              The foundational pillars built to eliminate unsupported claims, outdated specs, and brand discrepancies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Innovation A */}
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800/90 shadow-xl hover:border-cyan-500/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h4 className="text-xl font-bold text-white mb-3">
                  Evidence-Linked Claim Verification
                </h4>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  Extracts claims from text, PDF, DOCX, and images. Retrieves approved organisational documents, classifies findings as verified, contradictory, unsupported, or outdated.
                </p>
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-cyan-300 font-mono">
                  Never invents evidence. Every classification displays source document, version, and exact passage.
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>Deterministic Grounding</span>
                <CheckCircle className="w-4 h-4 text-cyan-400" />
              </div>
            </div>

            {/* Innovation B */}
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800/90 shadow-xl hover:border-teal-500/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <GitCompare className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h4 className="text-xl font-bold text-white mb-3">
                  Cross-Content Change Impact Analysis
                </h4>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  When an approved policy changes (e.g. warranty: 3 years → 2 years), automatically maps which registered brochures, posters, and assets contain the obsolete phrasing.
                </p>
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-teal-300 font-mono">
                  Flags affected text and sentence location so reviewers can resolve downstream inconsistencies.
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>Registered Asset Mapping</span>
                <CheckCircle className="w-4 h-4 text-teal-400" />
              </div>
            </div>

            {/* Innovation C */}
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800/90 shadow-xl hover:border-emerald-500/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BrainCircuit className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h4 className="text-xl font-bold text-white mb-3">
                  Adaptive Governance Intelligence
                </h4>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  Analyzes authorized review decisions over time to detect recurring patterns: repeatedly rejected claims, misunderstood terms, and unclear instructions.
                </p>
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-emerald-300 font-mono">
                  Recommends guideline clarifications to administrators without automatically changing rules.
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>Human-in-the-Loop Feedback</span>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Six Enhancements Highlights */}
      <section className="py-24 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-2">
            Advanced Capabilities
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
            Six Governance Enhancements
          </h3>
          <p className="text-sm sm:text-base text-slate-400">
            Robust enhancements engineered for transparent operational decision-making.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
            <Clock className="w-7 h-7 text-cyan-400 mb-4" />
            <h4 className="text-base font-bold text-white mb-2">Evidence Freshness Monitor</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tracks document versions, approval dates, effective dates, and review dates. Warns when claims cite expired sources or superseded text.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
            <Gauge className="w-7 h-7 text-amber-400 mb-4" />
            <h4 className="text-base font-bold text-white mb-2">Explainable Risk Scoring</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transparent, weighted scoring (Low, Medium, High). Every report breaks down point contributions. High-risk content strictly mandates human approval.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
            <Layers className="w-7 h-7 text-teal-400 mb-4" />
            <h4 className="text-base font-bold text-white mb-2">Smart Content Difference Tracking</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Word-level diff comparisons across revisions with real-time tracking of resolved issues, unresolved issues, and newly introduced unsupported claims.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
            <TrendingUp className="w-7 h-7 text-emerald-400 mb-4" />
            <h4 className="text-base font-bold text-white mb-2">Brand Health Score</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Organization-level 0–100 governance index calculated from evidence coverage, unresolved risk, freshness adherence, and review velocity.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
            <FileText className="w-7 h-7 text-purple-400 mb-4" />
            <h4 className="text-base font-bold text-white mb-2">Context-Aware Brand Checking</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Considers audience, purpose, and platform. Tone is evaluated in context, while mandatory compliance rules remain strictly non-negotiable.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
            <Users className="w-7 h-7 text-cyan-400 mb-4" />
            <h4 className="text-base font-bold text-white mb-2">Smart Review Prioritisation</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dynamic review queue ranked by risk severity, contradictions, deadline proximity, and age with in-app notification routing.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Responsible AI Section */}
      <section className="py-20 bg-slate-900/40 border-t border-slate-800 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 p-8 sm:p-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-4">
              <Lock className="w-4 h-4" />
              <span>Responsible AI Architecture</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              AI Assists. Humans Decide. Truth Grounded in Real Evidence.
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              VERITY adheres to strict governance principles:
            </p>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-400">
              <li className="flex items-start space-x-2.5">
                <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                <span><strong className="text-slate-200">No Invented Evidence:</strong> An AI explanation is never treated as fact. Claims require verifiable organizational documentation.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                <span><strong className="text-slate-200">Advisory Credibility Screening:</strong> AI detects sensation, urgency, or lack of attribution without declaring truth.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                <span><strong className="text-slate-200">Human Accountability:</strong> High-risk assets require mandatory written justifications from authorized reviewers.</span>
              </li>
            </ul>

            <div className="mt-8 flex items-center space-x-4">
              <Link
                to="/about"
                className="text-xs sm:text-sm font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1.5"
              >
                <span>Read our Governance Charter</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center px-4 sm:px-8 max-w-4xl mx-auto">
        <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
          Ready to Governance-Proof Your Publications?
        </h3>
        <p className="text-sm sm:text-base text-slate-400 mb-8 max-w-xl mx-auto">
          Experience evidence-linked verification, automated change impact alerts, and explainable brand governance right in your browser.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow-xl shadow-cyan-500/20 hover:scale-105 transition"
        >
          <span>Launch Verification Demo</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      <Footer />
    </div>
  );
};
