import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Award, HeartHandshake, Eye, CheckCircle2, ArrowRight } from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20 flex-1">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/80">
            About The VERITY Platform
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mt-4 mb-4 tracking-tight">
            Accountability in Every Publication
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            VERITY was built to solve the modern enterprise crisis of unverified promotional assertions, outdated specs, and brand guideline fragmentation.
          </p>
        </div>

        {/* Mission Card */}
        <div className="p-8 sm:p-10 rounded-2xl bg-gradient-to-r from-slate-900 to-cyan-950/30 border border-slate-800 mb-12 space-y-4">
          <h2 className="text-2xl font-bold text-white">Our Mission</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Modern marketing and product organizations move at breakneck velocity, publishing across social media, partner portals, press releases, and websites. Factual errors, outdated warranties, and non-compliant claims damage brand reputation and create legal liability.
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">
            VERITY provides an intelligent, evidence-grounded verification layer between draft content and public distribution. By ensuring every claim is traced directly to an approved organizational document, we restore public trust in brand communications.
          </p>
        </div>

        {/* Core Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <Eye className="w-6 h-6 text-cyan-400" />
            <h3 className="font-bold text-white text-base">Evidence Traceability</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We never fabricate supporting text. If an organizational policy does not exist to back up a claim, the claim is clearly flagged as Unsupported.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <HeartHandshake className="w-6 h-6 text-teal-400" />
            <h3 className="font-bold text-white text-base">Human Accountability</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI serves as an assistant, never the final judge. Content flagged as High risk cannot be published without a written justification from an authorized human reviewer.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <Lock className="w-6 h-6 text-emerald-400" />
            <h3 className="font-bold text-white text-base">Data Isolation & Security</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every organization operates within an isolated tenant partition with strict server-side permission checks, row-level security, and immutable audit logs.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <Award className="w-6 h-6 text-purple-400" />
            <h3 className="font-bold text-white text-base">Adaptive Learning</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Recurring mistakes become actionable suggestions to clarify guidelines, turning editorial review friction into continuous governance improvement.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg transition"
          >
            <span>Explore the Platform</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};
