import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  Sparkles,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  Cpu,
  FileText,
  Info
} from 'lucide-react';
import { api, Finding, RiskAssessment } from '../../api';

export const ContentVerificationPage: React.FC = () => {
  const navigate = useNavigate();

  // Form states
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [platform, setPlatform] = useState('Website');
  const [audience, setAudience] = useState('Consumer Market');
  const [purpose, setPurpose] = useState('Promotional Campaign');
  const [tone, setTone] = useState('Professional');
  const [category, setCategory] = useState('Product Announcement');
  const [deadline, setDeadline] = useState('');
  const [skipAi, setSkipAi] = useState(false);

  // File upload state for extracting draft text directly from file
  const [extractingFile, setExtractingFile] = useState(false);

  // Verification state
  const [verifying, setVerifying] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<{
    id: string;
    version: number;
    risk: RiskAssessment;
    findings: Finding[];
    ai: any;
  } | null>(null);

  const pipelineSteps = [
    "Validating document format and inputs...",
    "Extracting factual and promotional assertions...",
    "Retrieving approved Knowledge Base passages...",
    "Comparing semantic figures against evidence...",
    "Evaluating evidence freshness and dates...",
    "Checking mandatory brand guidelines...",
    "Calculating explainable risk score...",
    "Synthesizing verification report..."
  ];

  // Quick preset sample content to test easily!
  const loadSample = (sampleType: 'contradictory' | 'verified' | 'mixed') => {
    if (sampleType === 'contradictory') {
      setTitle("Apex X1 Spring Launch Brochure");
      setText(
        "Experience the groundbreaking Apex X1. All devices include a 3 year warranty. " +
        "The battery delivers up to 20 hours of continuous browsing. " +
        "Our unbeatable chassis is 100% unbreakable! Terms and conditions apply."
      );
      setPlatform("Instagram");
      setTone("Playful");
    } else if (sampleType === 'verified') {
      setTitle("Apex X1 Official Product Overview");
      setText(
        "All Apex X1 hardware products purchased from authorized retailers include a 2 year limited manufacturer warranty. " +
        "The battery delivers up to 14 hours of continuous web browsing on a single charge. " +
        "The chassis weighs 1.28 kg. Terms and conditions apply."
      );
      setPlatform("Website");
      setTone("Formal");
    } else {
      setTitle("Apex X1 Fast-Charge Customer Announcement");
      setText(
        "Fast charging reaches 50 percent capacity in 30 minutes using the included 65W GaN adapter. " +
        "Free lifetime repairs on all hardware! Terms and conditions apply."
      );
      setPlatform("Customer Email");
      setTone("Professional");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExtractingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      // If it is an image, inspect it
      if (file.type.startsWith('image/')) {
        const visual = await api.inspectVisualAsset(formData);
        setText(
          `[Visual Brand Asset: ${file.name} | Resolution: ${visual.width}x${visual.height}px | Aspect Ratio: ${visual.aspect_ratio}]\n` +
          `Sharpness Score: ${visual.sharpness} • Contrast: ${visual.contrast}\n` +
          (visual.warnings?.length ? `Visual Quality Flags: ${visual.warnings.join('; ')}` : 'Visual quality passed benchmark.')
        );
      } else {
        // Read text locally for instant preview
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          if (content) setText(content);
        };
        reader.readAsText(file);
      }
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
    } catch (err: any) {
      setErrorMsg(err.message || 'File processing failed.');
    } finally {
      setExtractingFile(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !text) {
      setErrorMsg('Please specify a title and content body to verify.');
      return;
    }

    setVerifying(true);
    setErrorMsg(null);
    setResult(null);

    // Simulate pipeline step animation
    let step = 0;
    const interval = setInterval(() => {
      step = (step + 1) % pipelineSteps.length;
      setPipelineStep(step);
    }, 400);

    try {
      const res = await api.submitContent({
        title,
        text,
        context: { platform, audience, purpose, tone, category },
        deadline: deadline || null,
        skip_ai: skipAi
      });
      clearInterval(interval);
      setResult(res);
    } catch (err: any) {
      clearInterval(interval);
      setErrorMsg(err.message || 'Verification pipeline encountered an error.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-2.5">
          <FileCheck2 className="w-7 h-7 text-cyan-400" />
          <span>Evidence-Linked Content Verification</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Submit draft copy, press releases, or brand assets to verify factual claims against approved truth.
        </p>
      </div>

      {/* Preset Buttons for Quick Demo Testing */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-cyan-400 font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Quick Demo Sample Payloads:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => loadSample('contradictory')}
            className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 font-semibold transition"
          >
            Load Contradictory & Banned Sample (High Risk)
          </button>
          <button
            type="button"
            onClick={() => loadSample('verified')}
            className="px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 font-semibold transition"
          >
            Load 100% Grounded Sample (Low Risk)
          </button>
          <button
            type="button"
            onClick={() => loadSample('mixed')}
            className="px-3 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-800/60 font-semibold transition"
          >
            Load Unsupported Claim Sample (Medium Risk)
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Verification Blocked</div>
            <div>{errorMsg}</div>
          </div>
        </div>
      )}

      {/* Main Submission Form */}
      <form onSubmit={handleVerify} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Content Inputs */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Publication Title <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Apex X1 Launch Campaign - Press Release"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-white placeholder-slate-600 outline-none transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">
                Content Text for Verification <span className="text-cyan-400">*</span>
              </label>
              <label className="text-[11px] font-semibold text-cyan-400 hover:underline cursor-pointer flex items-center space-x-1">
                <Upload className="w-3 h-3" />
                <span>Upload Draft File (.txt, .docx, image)</span>
                <input
                  type="file"
                  accept=".txt,.docx,.png,.jpg,.jpeg,.webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            <textarea
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste promotional copy, marketing text, or product specs here..."
              required
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs text-white font-mono placeholder-slate-600 outline-none transition leading-relaxed"
            />
            <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
              <span>{text.length.toLocaleString()} / 20,000 characters</span>
              <span>All numerical and factual assertions are cross-referenced with approved sources</span>
            </div>
          </div>

          <div className="pt-2 flex items-center space-x-3">
            <input
              type="checkbox"
              id="skipAi"
              checked={skipAi}
              onChange={(e) => setSkipAi(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="skipAi" className="text-xs text-slate-300 cursor-pointer select-none">
              Skip external AI screening (execute purely deterministic evidence & rule verification)
            </label>
          </div>
        </div>

        {/* Right Column: Context Settings */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 pb-2 border-b border-slate-800 flex items-center space-x-1.5">
            <Scale className="w-4 h-4" />
            <span>Context-Aware Parameters</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Target Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none"
            >
              <option>Website</option>
              <option>Instagram</option>
              <option>Press Release</option>
              <option>Customer Email</option>
              <option>Print & Packaging</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Target Audience</label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g. Enterprise Decision Makers"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Communication Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none"
            >
              <option>Professional</option>
              <option>Formal</option>
              <option>Playful</option>
              <option>Casual</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Publication Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={verifying}
              className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 text-xs transition shadow-lg shadow-cyan-500/20 hover:scale-[1.02] flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Cpu className="w-4 h-4" />
              <span>{verifying ? 'Executing Pipeline...' : 'Run Verification Pipeline'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Verification Pipeline Progress Indicator */}
      {verifying && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-cyan-500/40 space-y-3 animate-pulse">
          <div className="flex items-center justify-between text-xs font-bold text-cyan-400">
            <span>Executing 12-Step Governance Pipeline</span>
            <span>Step {pipelineStep + 1} of {pipelineSteps.length}</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-cyan-400 to-teal-400 h-2 transition-all duration-300"
              style={{ width: `${((pipelineStep + 1) / pipelineSteps.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-300 font-mono">
            {pipelineSteps[pipelineStep]}
          </p>
        </div>
      )}

      {/* Immediate Report Feedback */}
      {result && (
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Verification Result Generated
              </span>
              <h2 className="text-xl font-bold text-white mt-1">{title}</h2>
            </div>

            <div className="flex items-center space-x-3">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                  result.risk.level === 'High'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : result.risk.level === 'Medium'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {result.risk.level} Risk • {result.risk.score} Points
              </span>

              <button
                onClick={() => navigate(`/app/reports`)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition flex items-center space-x-1.5"
              >
                <span>View All Reports</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Risk Explanation */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="font-bold text-slate-200">Risk Assessment Explanation:</div>
            <p className="leading-relaxed">{result.risk.why}</p>
          </div>

          {/* Extracted Findings Cards */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Extracted Claims & Governance Findings ({result.findings.length})
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {result.findings.map((f, i) => {
                const isContradictory = f.type === 'contradictory';
                const isVerified = f.type === 'verified';
                const isUnsupported = f.type === 'unsupported';
                const isOutdated = f.type === 'outdated';

                return (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border text-xs space-y-2.5 transition ${
                      isContradictory
                        ? 'bg-rose-950/20 border-rose-800/40 text-rose-200'
                        : isVerified
                        ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                        : isOutdated
                        ? 'bg-amber-950/20 border-amber-800/40 text-amber-200'
                        : isUnsupported
                        ? 'bg-slate-950/60 border-slate-800 text-slate-300'
                        : 'bg-purple-950/20 border-purple-800/40 text-purple-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold uppercase tracking-wider text-[10px]">
                        [{f.type}]
                      </span>
                      {f.evidence && (
                        <span className="text-[10px] font-mono text-cyan-400">
                          Source: {f.evidence.title} v{f.evidence.version}
                        </span>
                      )}
                    </div>

                    <div className="font-semibold text-slate-100 text-sm">
                      "{f.claim}"
                    </div>

                    <p className="text-slate-300 leading-relaxed">
                      {f.why}
                    </p>

                    {f.evidence?.passage && (
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 italic text-[11px]">
                        Approved Excerpt: "{f.evidence.passage}"
                      </div>
                    )}

                    {f.fix && (
                      <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/50 text-cyan-300 text-[11px] font-medium">
                        Suggested Correction: {f.fix}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
