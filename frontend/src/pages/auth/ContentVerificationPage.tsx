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
  Info,
  Eye,
  Crosshair,
  Copy,
  Check,
  Download,
  RefreshCw,
  Image as ImageIcon,
  Zap,
  ShieldAlert
} from 'lucide-react';
import { api, Finding, RiskAssessment, FlyerOCRResult, FlyerBox } from '../../api';

export const ContentVerificationPage: React.FC = () => {
  const navigate = useNavigate();

  // Mode state: Standard Text Editorial vs Round 3 Multimodal Visual Flyer OCR
  const [activeMode, setActiveMode] = useState<'text' | 'flyer'>('text');

  // Form states (Text Mode)
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

  // Verification state (Text Mode)
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

  // --- Round 3: Multimodal Flyer OCR States ---
  const [flyerLoading, setFlyerLoading] = useState(false);
  const [flyerData, setFlyerData] = useState<FlyerOCRResult | null>(null);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>('box-2');
  const [copiedPatch, setCopiedPatch] = useState(false);

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
      if (file.type.startsWith('image/')) {
        const visual = await api.inspectVisualAsset(formData);
        setText(
          `[Visual Brand Asset: ${file.name} | Resolution: ${visual.width}x${visual.height}px | Aspect Ratio: ${visual.aspect_ratio}]\n` +
          `Sharpness Score: ${visual.sharpness} • Contrast: ${visual.contrast}\n` +
          (visual.warnings?.length ? `Visual Quality Flags: ${visual.warnings.join('; ')}` : 'Visual quality passed benchmark.')
        );
      } else {
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

  // --- Round 3: Flyer OCR Handlers ---
  const handleLoadSampleFlyer = async () => {
    setFlyerLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.inspectFlyerOCR();
      setFlyerData(res);
      // Select the contradictory warranty box by default
      const contra = res.boxes.find(b => b.status === 'contradictory');
      setSelectedBoxId(contra ? contra.id : res.boxes[0]?.id || null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to inspect flyer OCR.');
    } finally {
      setFlyerLoading(false);
    }
  };

  const handleFlyerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFlyerLoading(true);
    setErrorMsg(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.inspectFlyerOCR(formData);
      setFlyerData(res);
      setSelectedBoxId(res.boxes[0]?.id || null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Flyer OCR inspection failed.');
    } finally {
      setFlyerLoading(false);
    }
  };

  const selectedBox: FlyerBox | undefined = flyerData?.boxes.find(b => b.id === selectedBoxId);

  const copyPatchToClipboard = (fixText: string) => {
    navigator.clipboard.writeText(fixText);
    setCopiedPatch(true);
    setTimeout(() => setCopiedPatch(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-2.5">
            <FileCheck2 className="w-7 h-7 text-cyan-400" />
            <span>Evidence-Linked Content Verification</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Multimodal brand governance: verify editorial drafts, social campaigns, and visual marketing flyers against ground truth.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setActiveMode('text')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeMode === 'text'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Text Editorial Mode</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveMode('flyer');
              if (!flyerData) handleLoadSampleFlyer();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeMode === 'flyer'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Visual Flyer OCR</span>
            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-md bg-cyan-400 text-slate-950 font-black">
              R3
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ROUND 3 IMPROVEMENT 1: MULTIMODAL VISUAL FLYER OCR & BOUNDING BOX INSPECTION */}
      {/* ========================================================================= */}
      {activeMode === 'flyer' ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Action Bar for Visual Flyer Mode */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2.5">
              <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Crosshair className="w-4 h-4" />
              </span>
              <div>
                <div className="font-bold text-white text-sm">Multimodal Spatial OCR & Evidence Grounding</div>
                <div className="text-[11px] text-slate-400">
                  Detects text blocks in marketing flyers, draws spatial bounding boxes, and tags contradictions directly on the canvas.
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleLoadSampleFlyer}
                disabled={flyerLoading}
                className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center space-x-2 shadow-lg shadow-cyan-500/20 transition active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Sample Flyer (Acme Apex X1)</span>
              </button>

              <label className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold cursor-pointer flex items-center space-x-2 transition">
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>Upload Flyer Image</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFlyerImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {flyerLoading ? (
            <div className="p-16 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <div className="text-sm font-bold text-white">Extracting Spatial OCR & Comparing Knowledge Base...</div>
              <div className="text-xs text-slate-400">Running OpenCV contour segmentation and semantic vector verification.</div>
            </div>
          ) : flyerData ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Visual Flyer Canvas Stage */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span className="font-bold uppercase tracking-wider text-[11px] text-cyan-400 flex items-center space-x-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Interactive Flyer Canvas ({flyerData.filename})</span>
                  </span>
                  <span>Click any box to inspect evidence</span>
                </div>

                {/* Simulated High-Res Marketing Flyer Graphic with SVG Bounding Box Overlays */}
                <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 p-6 flex flex-col justify-between select-none">
                  {/* Subtle Grid & Brand Texture */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Render the Spatial Bounding Boxes on top of the flyer canvas */}
                  {flyerData.boxes.map((b) => {
                    const isSelected = b.id === selectedBoxId;
                    const isContradiction = b.status === 'contradictory';
                    const isUnsupported = b.status === 'unsupported';
                    const isVerified = b.status === 'verified';
                    const isGuideline = b.status === 'guideline';

                    let borderColor = 'border-emerald-500/80 bg-emerald-500/10 text-emerald-200';
                    let badgeColor = 'bg-emerald-500 text-slate-950';
                    let badgeLabel = 'VERIFIED CLAIM';

                    if (isContradiction) {
                      borderColor = 'border-rose-500 bg-rose-500/20 text-rose-100 shadow-[0_0_20px_rgba(244,63,94,0.45)] animate-pulse';
                      badgeColor = 'bg-rose-500 text-white font-black';
                      badgeLabel = 'CRITICAL CONTRADICTION';
                    } else if (isUnsupported) {
                      borderColor = 'border-amber-500 bg-amber-500/20 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.35)]';
                      badgeColor = 'bg-amber-500 text-slate-950 font-black';
                      badgeLabel = 'UNSUPPORTED CLAIM';
                    } else if (isGuideline) {
                      borderColor = 'border-purple-500 bg-purple-500/20 text-purple-100 shadow-[0_0_15px_rgba(168,85,247,0.35)]';
                      badgeColor = 'bg-purple-500 text-white font-black';
                      badgeLabel = 'BANNED TERM';
                    }

                    return (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBoxId(b.id)}
                        style={{
                          position: 'absolute',
                          left: `${b.x}%`,
                          top: `${b.y}%`,
                          width: `${b.width}%`,
                          height: `${b.height}%`
                        }}
                        className={`rounded-xl border-2 transition-all duration-150 p-2.5 flex flex-col justify-between cursor-pointer group ${borderColor} ${
                          isSelected ? 'ring-4 ring-cyan-400 scale-[1.01] z-30' : 'hover:scale-[1.005] z-10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-black tracking-wider ${badgeColor}`}>
                            {badgeLabel}
                          </span>
                          <span className="text-[10px] font-mono opacity-80">
                            {(b.confidence * 100).toFixed(0)}% OCR
                          </span>
                        </div>

                        <div className="font-bold text-xs sm:text-sm tracking-tight truncate drop-shadow">
                          {b.text}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Summary Bar */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-slate-950">
                    <div className="text-[10px] uppercase text-slate-500">Total Assertions</div>
                    <div className="font-bold text-white text-base">{flyerData.summary.total_claims}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-rose-950/30 border border-rose-800/40">
                    <div className="text-[10px] uppercase text-rose-400">Contradictions</div>
                    <div className="font-bold text-rose-300 text-base">{flyerData.summary.contradictory}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-800/40">
                    <div className="text-[10px] uppercase text-amber-400">Unsupported</div>
                    <div className="font-bold text-amber-300 text-base">{flyerData.summary.unsupported}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-800/40">
                    <div className="text-[10px] uppercase text-emerald-400">Verified</div>
                    <div className="font-bold text-emerald-300 text-base">{flyerData.summary.verified}</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Claim Inspector & Evidence Grounding Drawer */}
              <div className="lg:col-span-5 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                  Claim Inspector & Knowledge Base Citation
                </div>

                {selectedBox ? (
                  <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
                    {/* Header of selected claim */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center space-x-2">
                        <span className={`w-3 h-3 rounded-full ${
                          selectedBox.status === 'contradictory'
                            ? 'bg-rose-500 animate-ping'
                            : selectedBox.status === 'unsupported'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`} />
                        <span className="font-bold text-white text-sm uppercase">
                          {selectedBox.status} Assertion
                        </span>
                      </div>
                      <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-black ${
                        selectedBox.risk_level === 'High'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : selectedBox.risk_level === 'Medium'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {selectedBox.risk_level} Risk
                      </span>
                    </div>

                    {/* Verbatim Extracted Text */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between">
                        <span>Verbatim OCR Extraction:</span>
                        <span className="font-mono text-cyan-400">Confidence: {(selectedBox.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-semibold text-slate-100">
                        "{selectedBox.text}"
                      </div>
                    </div>

                    {/* Policy Evaluation Explanation */}
                    <div className="space-y-1">
                      <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                        Governance Finding:
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {selectedBox.why}
                      </p>
                    </div>

                    {/* Authoritative Evidence Citation */}
                    {selectedBox.evidence ? (
                      <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/50 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-cyan-300 flex items-center space-x-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Approved Ground Truth Source:</span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            v{selectedBox.evidence.version}
                          </span>
                        </div>
                        <div className="font-semibold text-white">
                          {selectedBox.evidence.title}
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-slate-300 italic text-[11px]">
                          "{selectedBox.evidence.passage}"
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Effective Date: {selectedBox.evidence.effective || '2026-01-01'} • Review Date: {selectedBox.evidence.review || '2027-01-01'}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>No approved documentation in the Knowledge Base supports this assertion.</span>
                      </div>
                    )}

                    {/* Suggested Safe Copy Remediation */}
                    {selectedBox.suggested_fix && (
                      <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-2 text-xs">
                        <div className="font-bold text-emerald-400 flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Recommended Compliant Copy Patch:</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-emerald-200 font-semibold text-xs">
                          "{selectedBox.suggested_fix}"
                        </div>
                        <button
                          type="button"
                          onClick={() => copyPatchToClipboard(selectedBox.suggested_fix!)}
                          className="w-full py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-500/30 flex items-center justify-center space-x-2 transition"
                        >
                          {copiedPatch ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedPatch ? 'Copied to Clipboard!' : 'Copy Recommended Patch'}</span>
                        </button>
                      </div>
                    )}

                    {/* Export Action */}
                    <button
                      type="button"
                      onClick={() => alert(`Exporting Annotated Audit Report for ${flyerData.filename}...`)}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Export Spatial Audit Certificate (PDF)</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
                    Click any bounding box on the flyer stage to view grounding evidence.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-16 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <ImageIcon className="w-10 h-10 text-cyan-400 mx-auto" />
              <div className="text-base font-bold text-white">No Flyer Loaded</div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Click "Load Sample Flyer" above to test the Acme Apex X1 marketing banner with contradictory warranty claims, or upload your own visual asset.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* STANDARD TEXT EDITORIAL VERIFICATION MODE */
        /* ========================================================================= */
        <div className="space-y-6">
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
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Apex X1 Spring Marketing Campaign Brochure"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Draft Content Body <span className="text-cyan-400">*</span>
                  </label>
                  <label className="text-[11px] text-cyan-400 hover:text-cyan-300 cursor-pointer flex items-center space-x-1 font-semibold">
                    <Upload className="w-3 h-3" />
                    <span>Import text from file</span>
                    <input
                      type="file"
                      accept=".txt,.pdf,.docx,image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <textarea
                  required
                  rows={8}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste marketing copy, press release, or promotional claims to verify against the approved Knowledge Base..."
                  className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 leading-relaxed font-mono"
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>Characters: {text.length}</span>
                  {extractingFile && <span className="text-cyan-400">Processing file...</span>}
                </div>
              </div>
            </div>

            {/* Right Column: Context Metadata & Submit Button */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl text-xs">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
                  <Scale className="w-4 h-4" />
                  <span>Channel & Tone Context</span>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Target Publishing Platform</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option>Website</option>
                    <option>Instagram</option>
                    <option>LinkedIn</option>
                    <option>Customer Email</option>
                    <option>Press Release</option>
                    <option>Partner Deck</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Desired Editorial Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option>Professional</option>
                    <option>Formal</option>
                    <option>Casual</option>
                    <option>Playful</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Editorial Review Deadline</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={skipAi}
                      onChange={(e) => setSkipAi(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0"
                    />
                    <span className="text-[11px] text-slate-400">
                      Elect Fast Path (Skip advisory LLM tone screening)
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={verifying}
                  className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition shadow-lg shadow-cyan-500/20 active:scale-95 disabled:opacity-50"
                >
                  {verifying ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>{pipelineSteps[pipelineStep]}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Run Verification Engine</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Verification Results Display */}
          {result && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                    Verification Complete • v{result.version}
                  </span>
                  <h2 className="text-xl font-bold text-white mt-0.5">{title}</h2>
                </div>

                <div className="flex items-center space-x-3">
                  <div className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 ${
                    result.risk.level === 'High'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      : result.risk.level === 'Medium'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {result.risk.level === 'High' ? (
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                    <span>{result.risk.level} Risk ({result.risk.score} pts)</span>
                  </div>

                  <button
                    onClick={() => navigate(`/app/reports`)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition"
                  >
                    <span>View In Reports</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Explainable Risk Breakdown */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
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
      )}
    </div>
  );
};
