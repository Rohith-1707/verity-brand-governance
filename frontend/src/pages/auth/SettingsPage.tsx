import React, { useState, useEffect } from 'react';
import {
  Settings,
  Sliders,
  CheckCircle2,
  Building,
  Users,
  Shield,
  RotateCcw,
  Save,
  AlertTriangle,
  Lock,
  Flame,
  Globe,
  Terminal,
  Copy,
  Check,
  Eye,
  EyeOff,
  Zap,
  Sparkles,
  RefreshCw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Code2
} from 'lucide-react';
import {
  api,
  CMSFirewallResult,
  CMSFirewallPayload,
  WebhookTestResult,
  FirewallLogItem
} from '../../api';
import { useAuth } from '../../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [defaults, setDefaults] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // --- Round 3: CMS Pre-Publish Firewall & Webhook Gateway States ---
  const [channel, setChannel] = useState<'wordpress' | 'webflow' | 'ghost' | 'github_actions'>('wordpress');
  const [postTitle, setPostTitle] = useState('Apex X1 Spring Customer Launch Announcement');
  const [postContent, setPostContent] = useState(
    'Experience the groundbreaking Apex X1. All devices include a 3 year warranty. ' +
    'Our unbeatable chassis is 100% unbreakable! Terms and conditions apply.'
  );
  const [postAuthor, setPostAuthor] = useState('Elena Rostova (Marketing Creator)');
  const [environment, setEnvironment] = useState<'production' | 'staging'>('production');

  const [evaluatingFirewall, setEvaluatingFirewall] = useState(false);
  const [firewallResult, setFirewallResult] = useState<CMSFirewallResult | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  // Webhook Test Dispatcher States
  const [testEndpoint, setTestEndpoint] = useState('https://cms.acme.corp/api/webhooks/pre-publish');
  const [webhookTesting, setWebhookTesting] = useState(false);
  const [webhookTestResult, setWebhookTestResult] = useState<WebhookTestResult | null>(null);
  const [firewallLogs, setFirewallLogs] = useState<FirewallLogItem[]>([]);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await api.getRiskWeights();
        setWeights(res.weights);
        setDefaults(res.defaults);
        const logs = await api.getFirewallLogs();
        setFirewallLogs(logs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleWeightChange = (key: string, val: number) => {
    setWeights((prev) => ({ ...prev, [key]: val }));
  };

  const handleSaveWeights = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    try {
      await api.updateRiskWeights(weights);
      setSuccessMsg('Risk scoring weights successfully updated across the organization.');
    } catch (err: any) {
      alert(err.message || 'Failed to update weights');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setWeights(defaults);
  };

  // --- CMS Pre-Publish Firewall Simulator Handlers ---
  const loadPreset = (preset: 'blocked' | 'passed' | 'cicd') => {
    if (preset === 'blocked') {
      setChannel('wordpress');
      setPostTitle('Apex X1 Spring Launch Brochure');
      setPostContent(
        'Experience the groundbreaking Apex X1. All devices include a 3 year warranty. ' +
        'Our unbeatable chassis is 100% unbreakable! Terms and conditions apply.'
      );
      setPostAuthor('Elena Rostova (Marketing Creator)');
      setEnvironment('production');
    } else if (preset === 'passed') {
      setChannel('webflow');
      setPostTitle('Official Apex X1 Hardware Specifications');
      setPostContent(
        'All Apex X1 hardware products purchased from authorized channels include a 2 year manufacturer warranty. ' +
        'ISO 27001 Certified with 99.9% Cloud Uptime SLA. Terms and conditions apply.'
      );
      setPostAuthor('David Chen (Technical Writer)');
      setEnvironment('production');
    } else {
      setChannel('github_actions');
      setPostTitle('PR #418: Update Q4 Pricing & Feature Bullets');
      setPostContent(
        'Continuous web browsing delivers up to 14 hours on a single charge. ' +
        'Fast charging reaches 50 percent capacity in 30 minutes using the included 65W GaN adapter. ' +
        'Terms and conditions apply.'
      );
      setPostAuthor('CI/CD Bot');
      setEnvironment('staging');
    }
  };

  const handleFirewallCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setEvaluatingFirewall(true);
    try {
      const res = await api.checkCMSFirewall({
        channel,
        title: postTitle,
        content: postContent,
        author: postAuthor,
        environment
      });
      setFirewallResult(res);
      const logs = await api.getFirewallLogs();
      setFirewallLogs(logs);
    } catch (err: any) {
      alert(err.message || 'Firewall evaluation failed');
    } finally {
      setEvaluatingFirewall(false);
    }
  };

  const handleDispatchWebhookTest = async () => {
    setWebhookTesting(true);
    setWebhookTestResult(null);
    try {
      const res = await api.testWebhookDispatch({
        endpoint_url: testEndpoint,
        event: 'post.publish_intercept',
        secret_key: 'vrty_sec_live_99812487ab'
      });
      setWebhookTestResult(res);
    } catch (err: any) {
      alert(err.message || 'Webhook ping failed');
    } finally {
      setWebhookTesting(false);
    }
  };

  const copyToClipboard = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-2.5">
          <Settings className="w-7 h-7 text-cyan-400" />
          <span>Platform Settings & CMS Gateway</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure transparent risk assessment weights, enterprise tenant profile, and bi-directional CMS pre-publish firewalls.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Organization Tenant Profile */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
          <Building className="w-4 h-4" />
          <span>Organization Tenant Profile</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-500 uppercase">Organization Name</div>
            <div className="font-bold text-white text-sm">{user?.org_name || 'Acme Global Technologies'}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-500 uppercase">Tenant Partition ID</div>
            <div className="font-mono font-bold text-cyan-400 text-xs truncate">{user?.org_id}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-500 uppercase">Active Persona</div>
            <div className="font-bold text-emerald-400 capitalize">{user?.role} Access</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ROUND 3 IMPROVEMENT 3: BI-DIRECTIONAL PRE-PUBLISH CMS FIREWALL & WEBHOOK GATEWAY */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-cyan-800/40 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div className="flex items-center space-x-3">
            <span className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Flame className="w-6 h-6 text-cyan-400" />
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white">Pre-Publish CMS Firewall & Webhook Gateway</h2>
                <span className="text-[9px] uppercase px-2 py-0.5 rounded-md bg-cyan-400 text-slate-950 font-black">
                  Round 3
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Headless interceptor: blocks WordPress, Webflow, and CI/CD publishing if Risk Score &gt;= 30 or critical contradictions exist.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase">Gateway Active</span>
          </div>
        </div>

        {/* Gateway Credentials & Webhook Endpoint Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
              <span>Ingestion Webhook URL</span>
              <span className="text-cyan-400 font-mono">POST</span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value="https://verity.acme.corp/api/firewall/check"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-cyan-300 text-xs select-all"
              />
              <button
                type="button"
                onClick={() => copyToClipboard('https://verity.acme.corp/api/firewall/check')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-[10px] text-slate-500">
              Integrate into WordPress hook <code>wp_before_insert_post</code> or Webflow Publish Webhook.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
              <span>HMAC SHA-256 Secret Key</span>
              <span className="text-slate-500 font-mono">Live Key</span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type={showSecret ? 'text' : 'password'}
                readOnly
                value="vrty_sec_live_99812487ab"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-slate-300 text-xs select-all"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-[10px] text-slate-500">
              Validates header <code>X-Verity-Signature-256</code> on incoming webhook requests.
            </div>
          </div>
        </div>

        {/* Interactive CMS Publish Simulator */}
        <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Interactive Pre-Publish Simulator</span>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => loadPreset('blocked')}
                className="px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-800/50 font-semibold transition"
              >
                Preset 1: WordPress (3-Year Warranty Copy → BLOCKED)
              </button>
              <button
                type="button"
                onClick={() => loadPreset('passed')}
                className="px-2.5 py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 border border-emerald-800/50 font-semibold transition"
              >
                Preset 2: Webflow (Grounded Specs → PASSED)
              </button>
              <button
                type="button"
                onClick={() => loadPreset('cicd')}
                className="px-2.5 py-1 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-300 border border-cyan-800/50 font-semibold transition"
              >
                Preset 3: CI/CD Pre-Commit Git Hook
              </button>
            </div>
          </div>

          <form onSubmit={handleFirewallCheck} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Publishing Channel</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="wordpress">WordPress (REST API)</option>
                  <option value="webflow">Webflow (CMS API)</option>
                  <option value="ghost">Ghost CMS</option>
                  <option value="github_actions">GitHub Actions (CI/CD)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Post Title / Slug</label>
                <input
                  type="text"
                  required
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Author Persona</label>
                <input
                  type="text"
                  required
                  value={postAuthor}
                  onChange={(e) => setPostAuthor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                Draft Payload Body (Sent by CMS Webhook)
              </label>
              <textarea
                rows={3}
                required
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={evaluatingFirewall}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-cyan-500/20 transition active:scale-95 disabled:opacity-50"
              >
                {evaluatingFirewall ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Intercepting & Evaluating...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Pre-Publish Check to Gateway</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Real-Time Live Developer Terminal Output */}
          {firewallResult && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-slate-300">HTTP/1.1 Gateway Interception Response</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                  firewallResult.allowed
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-rose-500 text-white animate-pulse'
                }`}>
                  {firewallResult.action} (Risk: {firewallResult.risk_score} pts)
                </span>
              </div>

              <div className="space-y-1.5 leading-relaxed">
                <div>
                  <span className="text-slate-500">Decision: </span>
                  <span className={firewallResult.allowed ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {firewallResult.allowed ? '200 OK - PUBLISH_ALLOWED' : '403 FORBIDDEN - PUBLISH_BLOCKED'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500">Reason: </span>
                  <span className="text-slate-200">{firewallResult.reason}</span>
                </div>

                {firewallResult.publish_token && (
                  <div>
                    <span className="text-slate-500">Cryptographic Publish Token: </span>
                    <span className="text-cyan-400 font-bold select-all">{firewallResult.publish_token}</span>
                  </div>
                )}

                {firewallResult.policy_violations.length > 0 && (
                  <div className="pt-2">
                    <div className="text-rose-400 font-bold mb-1">
                      Policy Violations Intercepted ({firewallResult.policy_violations.length}):
                    </div>
                    {firewallResult.policy_violations.map((v, i) => (
                      <div key={i} className="p-2 rounded bg-rose-950/30 border border-rose-900/40 text-[11px] text-rose-200 mb-1">
                        [{v.severity}] {v.rule}: {v.claim}
                        <div className="text-slate-400 text-[10px] mt-0.5">{v.explanation}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Live Webhook Dispatcher & Audit Trail */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Dispatcher Simulator */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span>Webhook Signature Dispatch Simulator</span>
            </div>
            <div className="space-y-2">
              <label className="block text-[11px] text-slate-400">Target Callback Endpoint</label>
              <input
                type="text"
                value={testEndpoint}
                onChange={(e) => setTestEndpoint(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none"
              />
              <button
                type="button"
                onClick={handleDispatchWebhookTest}
                disabled={webhookTesting}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold text-xs flex items-center justify-center space-x-2 transition"
              >
                {webhookTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Dispatch HMAC Webhook Ping</span>
              </button>
            </div>

            {webhookTestResult && (
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
                <div className="text-emerald-400 font-bold">✓ Delivery Status 200 OK ({webhookTestResult.delivery_latency_ms}ms)</div>
                <div className="text-[10px] text-slate-400 truncate">Signature: {webhookTestResult.signature_sha256}</div>
                <div className="text-[10px] text-slate-500">Interception Mode: PRE_PUBLISH_BLOCKING</div>
              </div>
            )}
          </div>

          {/* Firewall Logs History */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Recent Firewall Interception Logs</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {firewallLogs.length === 0 ? (
                <div className="text-slate-500 text-center py-4">No recent interceptions recorded.</div>
              ) : (
                firewallLogs.map((log) => {
                  const isBlocked = log.action.includes('BLOCKED');
                  return (
                    <div
                      key={log.id}
                      className={`p-2.5 rounded-lg border text-[11px] space-y-0.5 ${
                        isBlocked
                          ? 'bg-rose-950/20 border-rose-900/30 text-rose-200'
                          : 'bg-emerald-950/20 border-emerald-900/30 text-emerald-200'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>{log.action}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {log.created_at.slice(11, 19)} UTC
                        </span>
                      </div>
                      <div className="text-slate-400 text-[10px] truncate">{log.detail}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Configurable Risk Weights */}
      <form onSubmit={handleSaveWeights} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Sliders className="w-4 h-4" />
              <span>Configurable Content Risk Scoring Weights</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Adjust point penalties for each governance factor. Total scores &gt;= 30 or any contradiction classify submissions as High Risk.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Standard Defaults</span>
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading risk configuration...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.keys(weights).map((factor) => {
              const val = weights[factor];
              const def = defaults[factor];
              return (
                <div
                  key={factor}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white capitalize">{factor}</span>
                    <span className="text-[10px] text-slate-500 font-mono">Default: {def}</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min={1}
                      max={50}
                      value={val}
                      onChange={(e) => handleWeightChange(factor, parseInt(e.target.value, 10))}
                      className="flex-1 accent-cyan-400 cursor-pointer"
                    />
                    <span className="font-mono font-bold text-cyan-400 text-sm w-8 text-right">
                      {val}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {factor === 'contradictory' && 'Direct numerical or factual conflict'}
                    {factor === 'outdated' && 'References expired review date or superseded text'}
                    {factor === 'unsupported' && 'Missing approved Knowledge Base evidence'}
                    {factor === 'guideline' && 'Prohibited brand terminology flagged'}
                    {factor === 'required' && 'Missing mandatory statutory disclaimer'}
                    {factor === 'review' && 'Ambiguous or weak semantic match'}
                    {factor === 'ai' && 'Advisory credibility or sensationalism signal'}
                    {factor === 'tone' && 'Advisory channel tone discrepancy'}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs transition flex items-center space-x-2 shadow"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Updating...' : 'Save Scoring Weights'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
