import React from 'react';
import { Link } from 'react-router-dom';
import {
  Upload,
  FileCheck,
  Search,
  Sparkles,
  ShieldAlert,
  GitBranch,
  Scale,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  Database,
  Cpu
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      num: 1,
      title: "Content Submission",
      desc: "Creator submits text or uploads PDF, DOCX, or brand image assets alongside publication context: target platform, audience, category, communication tone, and deadline.",
      icon: Upload
    },
    {
      num: 2,
      title: "Input & File Validation",
      desc: "System validates file types, enforces 10 MB and 20,000-character limits, verifies document structure, and checks image resolution and sharpness using OpenCV.",
      icon: FileCheck
    },
    {
      num: 3,
      title: "Document Text Extraction",
      desc: "PyMuPDF processes PDF layouts, python-docx extracts paragraph and tabular data, and raw text is normalized for semantic analysis.",
      icon: Cpu
    },
    {
      num: 4,
      title: "Claim Extraction",
      desc: "High-precision regex heuristics extract factual and promotional statements: numerical assertions, warranty durations, superlatives, and product metrics.",
      icon: Search
    },
    {
      num: 5,
      title: "Context Identification",
      desc: "Interprets creator context (e.g. Instagram ad vs Formal investor communication). Context contextualizes tone benchmarks without bypassing mandatory rules.",
      icon: Sparkles
    },
    {
      num: 6,
      title: "Evidence Retrieval",
      desc: "Retrieves passages from approved and superseded organizational sources using TF-IDF n-gram vector matching and semantic cosine distance.",
      icon: Database
    },
    {
      num: 7,
      title: "Semantic & Numerical Comparison",
      desc: "Compares claim meaning and figures against retrieved approved passages. Categorizes as Verified, Contradictory, Unsupported, or requiring Review.",
      icon: Scale
    },
    {
      num: 8,
      title: "Version & Freshness Check",
      desc: "Checks source effective dates and review dates. Issues clear freshness warnings if a claim cites an expired policy or superseded document version.",
      icon: GitBranch
    },
    {
      num: 9,
      title: "Rule-Based Guideline Check",
      desc: "Verifies mandatory compliance rules: checks for prohibited brand terminology, required statutory disclaimers, and platform-specific disclosures.",
      icon: ShieldAlert
    },
    {
      num: 10,
      title: "Transparent Risk Assessment",
      desc: "Calculates an explainable risk score from weighted factors. Classifies content into Low, Medium, or High risk. Contradictions automatically trigger High risk.",
      icon: Scale
    },
    {
      num: 11,
      title: "Explainable Report Generation",
      desc: "Constructs an interactive verification dossier: traceable evidence passages, difference diff against prior versions, and actionable correction suggestions.",
      icon: FileCheck
    },
    {
      num: 12,
      title: "Human Review & Accountability",
      desc: "Submission enters the prioritised review queue. Authorized human reviewer inspects evidence, records a genuineness judgement, and provides written justification.",
      icon: UserCheck
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-20 flex-1">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/80">
            End-to-End Governance Architecture
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mt-4 mb-4 tracking-tight">
            How VERITY Works
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            The 12-step verification pipeline connecting creator submissions to authoritative evidence, explainable risk assessment, and human reviewer accountability.
          </p>
        </div>

        {/* 12-Step Visual Pipeline */}
        <div className="space-y-6 relative before:absolute before:inset-0 before:left-8 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-teal-500 before:to-emerald-500 hidden sm:block">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="relative flex items-start space-x-6 group">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border-2 border-cyan-500/40 text-cyan-400 flex items-center justify-center font-bold text-lg shrink-0 shadow-lg shadow-cyan-500/10 group-hover:scale-105 group-hover:border-cyan-400 transition-all z-10 bg-slate-950">
                  <Icon className="w-6 h-6 stroke-[2]" />
                </div>
                <div className="flex-1 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                      Step {step.num}
                    </span>
                    <span className="text-slate-600">•</span>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile View */}
        <div className="sm:hidden space-y-4">
          {steps.map((step) => (
            <div key={step.num} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-cyan-400 uppercase">Step {step.num}</div>
              <h3 className="font-bold text-white text-base">{step.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            to="/login"
            className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow-lg transition hover:scale-105"
          >
            <span>Test the Verification Engine</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};
