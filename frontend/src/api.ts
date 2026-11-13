/**
 * VERITY API Client & Offline-First Mock Engine
 * Connects to FastAPI backend when available, or seamlessly serves intelligent
 * mock data on static hosting (e.g. GitHub Pages) with zero hanging or crashes.
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'creator' | 'reviewer';
  org_id: string;
  org_name?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export interface DashboardMetrics {
  metrics: {
    submitted_content: number;
    pending_reviews: number;
    approved_assets: number;
    active_documents: number;
    verified_claims: number;
    unsupported_claims: number;
    contradictory_claims: number;
    high_risk_submissions: number;
    open_impact_alerts: number;
    evidence_coverage_percent: number;
  };
  recent_activities: Array<{
    action: string;
    detail: string;
    created_at: string;
  }>;
}

export interface DocumentItem {
  doc_id: string;
  title: string;
  category: string;
  version_id: string;
  version: string;
  status: 'approved' | 'superseded' | 'archived';
  effective_date: string | null;
  review_date: string | null;
  uploaded_at: string;
  characters: number;
  preview: string;
}

export interface GuidelineItem {
  id: string;
  kind: 'banned' | 'required';
  value: string;
  reason: string | null;
  platform: string;
}

export interface Finding {
  type: 'verified' | 'unsupported' | 'contradictory' | 'outdated' | 'review' | 'guideline' | 'required' | 'tone' | 'ai';
  claim: string;
  why: string;
  evidence: {
    title: string;
    version: string;
    effective: string;
    review: string;
    passage: string;
  } | null;
  fix: string | null;
}

export interface RiskAssessment {
  level: 'Low' | 'Medium' | 'High';
  score: number;
  rows: Array<{
    factor: string;
    count: number;
    weight: number;
    points: number;
  }>;
  why: string;
}

export interface SubmissionItem {
  id: string;
  title: string;
  status: 'pending' | 'approved' | 'revision' | 'rejected';
  deadline: string | null;
  created_at: string;
  creator_id: string;
  creator_name: string;
  version: number;
  risk_level: 'Low' | 'Medium' | 'High';
  risk_score: number;
  unresolved_issues: number;
  priority: number;
}

export interface SubmissionDetail {
  id: string;
  title: string;
  status: 'pending' | 'approved' | 'revision' | 'rejected';
  context: {
    platform?: string;
    audience?: string;
    purpose?: string;
    tone?: string;
    category?: string;
  };
  deadline: string | null;
  creator_name: string;
  versions: Array<{
    n: number;
    body: string;
    findings: Finding[];
    risk: RiskAssessment;
    ai: any;
    created_at: string;
  }>;
  decisions: Array<{
    action: 'approved' | 'revision' | 'rejected';
    genuineness: 'Genuine' | 'Misleading' | 'Cannot determine';
    comment: string;
    version_n: number;
    created_at: string;
    reviewer_name: string;
  }>;
  diff: Array<{
    op: 'same' | 'added' | 'removed';
    text: string;
  }> | null;
  changes: {
    resolved: string[];
    unresolved: string[];
    new: string[];
  } | null;
}

export interface ImpactAlert {
  id: string;
  submission_id: string;
  document_id: string;
  content_title: string;
  document_title: string;
  old_text: string;
  sentence: string;
  location: string;
  status: 'open' | 'resolved';
  created_at: string;
}

export interface BrandHealthData {
  score: number | null;
  status?: 'Healthy' | 'Caution' | 'At Risk';
  total_submissions?: number;
  components?: Array<{
    name: string;
    points: number;
    max: number;
    description: string;
  }>;
  formula?: string;
  period?: string;
  message?: string;
}

export interface GovernanceInsightsData {
  summary: {
    total_reviewed: number;
    total_submissions_analyzed: number;
    recurring_violations_detected: number;
    common_unsupported_assertions: number;
  };
  top_guideline_violations: Array<{ item: string; count: number }>;
  top_unsupported_claims: Array<{ item: string; count: number }>;
  top_contradictions: Array<{ item: string; count: number }>;
  recommendations: Array<{
    category: string;
    observation: string;
    recommendation: string;
    actionable_suggestion: string;
  }>;
}

export interface NotificationItem {
  id: string;
  message: string;
  user_id: string | null;
  role: string | null;
  created_at: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  detail: string;
  created_at: string;
  actor_name: string | null;
  actor_role: string | null;
}

// --- Round 3: Multimodal Flyer OCR & Spatial Bounding-Box Inspection ---

export interface FlyerBox {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  status: 'contradictory' | 'unsupported' | 'verified' | 'guideline' | 'outdated';
  risk_level: 'High' | 'Medium' | 'Low';
  confidence: number;
  why: string;
  evidence: {
    title: string;
    version: string;
    effective: string;
    review: string;
    passage: string;
  } | null;
  suggested_fix: string | null;
}

export interface FlyerOCRResult {
  filename: string;
  extracted_text: string;
  boxes: FlyerBox[];
  summary: {
    total_claims: number;
    contradictory: number;
    unsupported: number;
    verified: number;
    guideline: number;
    overall_risk: 'High' | 'Medium' | 'Low';
  };
  timestamp: string;
}

// --- Round 3: Policy Reconciliation Wizard ---

export interface ReconciliationPatch {
  impact_id: string;
  asset_id: string;
  asset_title: string;
  asset_type: string;
  document_title: string;
  document_version: string;
  old_text: string;
  new_text: string;
  diff: Array<{ op: 'same' | 'added' | 'removed'; text: string }>;
  risk_delta: string;
  status: 'pending' | 'applied';
}

export interface ReconciliationPlan {
  impact_count: number;
  patches: ReconciliationPatch[];
  summary: string;
}

// --- Round 3: CMS Pre-Publish Firewall & Webhook Gateway ---

export interface CMSFirewallPayload {
  channel: string;
  title: string;
  content: string;
  author: string;
  environment?: string;
  webhook_callback?: string;
}

export interface CMSFirewallResult {
  allowed: boolean;
  action: 'PASSED' | 'BLOCKED';
  channel: string;
  title: string;
  author: string;
  risk_score: number;
  risk_level: 'High' | 'Medium' | 'Low';
  policy_violations: Array<{
    rule: string;
    claim: string;
    explanation: string;
    severity: 'CRITICAL' | 'WARNING';
  }>;
  reason: string;
  publish_token: string | null;
  timestamp: string;
}

export interface WebhookTestResult {
  ok: boolean;
  event: string;
  target: string;
  status: number;
  delivery_latency_ms: number;
  signature_sha256: string;
  response_body: Record<string, any>;
}

export interface FirewallLogItem {
  id: string;
  action: string;
  detail: string;
  created_at: string;
  actor_name: string | null;
}

// Token helper
export const getToken = (): string | null => localStorage.getItem('verity_token');
export const setToken = (t: string) => localStorage.setItem('verity_token', t);
export const removeToken = () => localStorage.removeItem('verity_token');

// =========================================================================
// In-Browser Offline Fallback Engine (Guarantees zero crashes on GitHub Pages)
// =========================================================================

const DEFAULT_ADMIN_PROFILE: UserProfile = {
  id: 'user-admin-01',
  name: 'Rohith (Administrator)',
  email: 'rohith@verity.acme.com',
  role: 'admin',
  org_id: 'org-verity-demo',
  org_name: 'Acme Global Technologies'
};

const MOCK_STORAGE = {
  submissions: [
    {
      id: 'sub-001',
      title: 'Apex X1 Spring Launch Brochure',
      status: 'pending' as const,
      deadline: '2026-11-20',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      creator_id: 'user-creator-01',
      creator_name: 'Elena Rostova (Marketing Lead)',
      version: 1,
      risk_level: 'High' as const,
      risk_score: 54,
      unresolved_issues: 2,
      priority: 1
    },
    {
      id: 'sub-002',
      title: 'Enterprise Cloud SLA & Security Datasheet',
      status: 'approved' as const,
      deadline: '2026-11-15',
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      creator_id: 'user-creator-02',
      creator_name: 'David Chen (Technical Writer)',
      version: 2,
      risk_level: 'Low' as const,
      risk_score: 0,
      unresolved_issues: 0,
      priority: 3
    },
    {
      id: 'sub-003',
      title: 'Global Fast-Charging Social Campaign',
      status: 'revision' as const,
      deadline: '2026-11-25',
      created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
      creator_id: 'user-creator-01',
      creator_name: 'Elena Rostova (Marketing Lead)',
      version: 1,
      risk_level: 'Medium' as const,
      risk_score: 22,
      unresolved_issues: 1,
      priority: 2
    }
  ],
  impacts: [
    {
      id: 'imp-001',
      submission_id: 'sub-001',
      document_id: 'doc-001',
      content_title: 'Apex X1 Spring Launch Brochure',
      document_title: 'Hardware Warranty Policy v2.4',
      old_text: 'All hardware products include 3 year unlimited warranty coverage.',
      sentence: 'Experience the groundbreaking Apex X1. All devices include a 3 year warranty.',
      location: 'Sentence 2 of 4 (Hero Claim)',
      status: 'open' as const,
      created_at: new Date(Date.now() - 3600000 * 12).toISOString()
    },
    {
      id: 'imp-002',
      submission_id: 'sub-004',
      document_id: 'doc-001',
      content_title: 'Partner Sales Playbook Q4',
      document_title: 'Hardware Warranty Policy v2.4',
      old_text: 'All hardware products include 3 year unlimited warranty coverage.',
      sentence: 'Distributors can offer customers 3 years of comprehensive warranty.',
      location: 'Section 4, Page 12',
      status: 'open' as const,
      created_at: new Date(Date.now() - 3600000 * 10).toISOString()
    },
    {
      id: 'imp-003',
      submission_id: 'sub-005',
      document_id: 'doc-002',
      content_title: 'Customer Support Knowledge FAQ',
      document_title: 'Battery & Charging Spec Sheet v3.1',
      old_text: 'Continuous web browsing reaches 20 hours.',
      sentence: 'Battery life delivers up to 20 hours of continuous active use.',
      location: 'FAQ Entry #14',
      status: 'open' as const,
      created_at: new Date(Date.now() - 3600000 * 8).toISOString()
    }
  ],
  firewallLogs: [
    {
      id: 'fw-001',
      action: 'CMS Firewall: BLOCKED',
      detail: "Channel: wordpress · Title: 'Promotional Launch Copy' · Score: 60 · Token: BLOCKED",
      created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
      actor_name: 'CMS Webhook Dispatcher'
    },
    {
      id: 'fw-002',
      action: 'CMS Firewall: PASSED',
      detail: "Channel: webflow · Title: 'Executive Security Overview' · Score: 8 · Token: vrty-pub-9921f08bc17",
      created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
      actor_name: 'Rohith (Administrator)'
    }
  ]
};

function handleOfflineFallback(endpoint: string, options: RequestInit = {}): any {
  const cleanEndpoint = endpoint.replace(/^\/?api\/?/, '/');
  const method = (options.method || 'GET').toUpperCase();
  let bodyData: any = {};
  if (options.body && typeof options.body === 'string') {
    try { bodyData = JSON.parse(options.body); } catch {}
  }

  // Health
  if (cleanEndpoint.startsWith('/health')) {
    return { status: 'healthy', mode: 'offline-mock-first', timestamp: new Date().toISOString() };
  }

  // Auth
  if (cleanEndpoint.startsWith('/auth/demo') || cleanEndpoint.startsWith('/auth/login') || cleanEndpoint.startsWith('/auth/register')) {
    const role = bodyData.role || 'admin';
    const user = {
      ...DEFAULT_ADMIN_PROFILE,
      role: role as any,
      name: role === 'admin' ? 'Rohith (Administrator)' : role === 'reviewer' ? 'Marcus Vance (Senior Reviewer)' : 'Elena Rostova (Marketing Creator)'
    };
    return {
      access_token: `mock-jwt-token-${role}-${Date.now()}`,
      token_type: 'bearer',
      user
    };
  }

  if (cleanEndpoint.startsWith('/me')) {
    return DEFAULT_ADMIN_PROFILE;
  }

  // Stats Dashboard
  if (cleanEndpoint.startsWith('/stats/dashboard')) {
    const openImpacts = MOCK_STORAGE.impacts.filter(i => i.status === 'open').length;
    return {
      metrics: {
        submitted_content: 18,
        pending_reviews: 4,
        approved_assets: 12,
        active_documents: 8,
        verified_claims: 42,
        unsupported_claims: 3,
        contradictory_claims: 2,
        high_risk_submissions: 2,
        open_impact_alerts: openImpacts,
        evidence_coverage_percent: 88
      },
      recent_activities: [
        { action: 'CMS Pre-Publish Firewall', detail: 'Blocked unauthorized 3-year warranty copy from WordPress webhook', created_at: new Date(Date.now() - 1800000).toISOString() },
        { action: 'Policy Reconciliation', detail: 'Generated unified patch diffs for Warranty Policy v2.4', created_at: new Date(Date.now() - 3600000).toISOString() },
        { action: 'Visual Flyer OCR', detail: 'Extracted spatial bounding boxes and verified flyer claims', created_at: new Date(Date.now() - 7200000).toISOString() },
        { action: 'Document Uploaded', detail: 'Uploaded Hardware Warranty Policy v2.4 (Supersedes v1.0)', created_at: new Date(Date.now() - 86400000).toISOString() }
      ]
    };
  }

  // Brand Health
  if (cleanEndpoint.startsWith('/brand-health')) {
    return {
      score: 88,
      status: 'Healthy',
      total_submissions: 18,
      components: [
        { name: 'Claims with Approved Evidence', points: 31, max: 35, description: '88% of factual assertions grounded in verified Knowledge Base sources.' },
        { name: 'Unresolved High-Risk Issues', points: 18, max: 20, description: 'Low triage backlog: only 2 pending high-risk contradictory claims.' },
        { name: 'Asset Freshness & Impact Control', points: 13, max: 15, description: 'Open impact alerts tracked and scheduled for batch reconciliation.' },
        { name: 'Review Workflow Completion', points: 18, max: 20, description: '82% of editorial reviews brought to authorized conclusions.' },
        { name: 'Brand Guideline Alignment', points: 8, max: 10, description: 'Low incidence of prohibited absolute terminology.' }
      ],
      formula: 'Score = (ClaimsEvidence * 35) + (RiskHealth * 20) + (Freshness * 15) + (ReviewVelocity * 20) + (GuidelineAlignment * 10)',
      period: 'Past 30 Days'
    };
  }

  // Governance Intelligence
  if (cleanEndpoint.startsWith('/governance-intelligence')) {
    return {
      summary: {
        total_reviewed: 14,
        total_submissions_analyzed: 18,
        recurring_violations_detected: 3,
        common_unsupported_assertions: 2
      },
      top_guideline_violations: [
        { item: 'Prohibited term "100% unbreakable"', count: 4 },
        { item: 'Missing required text "Terms and conditions apply"', count: 2 },
        { item: 'Unrestrained exclamation punctuation in formal release', count: 1 }
      ],
      top_unsupported_claims: [
        { item: 'Ranked #1 Enterprise AI Platform in the World', count: 3 },
        { item: 'Zero latency instant sync across all distributed devices', count: 2 }
      ],
      top_contradictions: [
        { item: 'All devices include a 3 year warranty (Superseded: Current is 2 years)', count: 4 },
        { item: 'Continuous battery browsing up to 20 hours (Current spec is 14 hours)', count: 2 }
      ],
      recommendations: [
        {
          category: 'Authoritative Policy Supersession',
          observation: 'Warranty duration was changed from 3 years to 2 years in Policy v2.4, but marketing collateral continues to draft 3-year claims (4 occurrences).',
          recommendation: 'Run Cross-Asset Policy Reconciliation Wizard to batch-propagate compliant 2-year warranty patches.',
          actionable_suggestion: 'Open the Change Impact tab and execute 1-Click Batch Reconciliation.'
        },
        {
          category: 'Pre-Publish CMS Gateway Enforcement',
          observation: 'Creators frequently attempt publishing directly to WordPress without preliminary editorial review.',
          recommendation: 'Enable Pre-Publish CMS Firewall Webhook to intercept non-compliant payloads before live publishing.',
          actionable_suggestion: 'Configure Webhook Gateway URL in Organization Settings.'
        }
      ]
    };
  }

  // Documents
  if (cleanEndpoint.startsWith('/documents')) {
    return [
      {
        doc_id: 'doc-001',
        title: 'Hardware Warranty Policy v2.4',
        category: 'Legal & Warranty',
        version_id: 'ver-001',
        version: '2.4',
        status: 'approved',
        effective_date: '2026-01-01',
        review_date: '2027-01-01',
        uploaded_at: '2026-10-15T09:00:00Z',
        characters: 4850,
        preview: 'All Apex hardware products purchased from authorized channels include a 2 year manufacturer warranty. Accidental damage coverage requires enterprise protection add-on.'
      },
      {
        doc_id: 'doc-002',
        title: 'Battery & Charging Spec Sheet v3.1',
        category: 'Engineering & Hardware',
        version_id: 'ver-002',
        version: '3.1',
        status: 'approved',
        effective_date: '2026-02-01',
        review_date: '2027-02-01',
        uploaded_at: '2026-10-16T11:30:00Z',
        characters: 3200,
        preview: 'The internal battery delivers up to 14 hours of continuous web browsing on a single charge. Fast charging reaches 50 percent capacity in 30 minutes using the included 65W GaN adapter.'
      },
      {
        doc_id: 'doc-003',
        title: 'Enterprise Security & SLA Standards',
        category: 'Compliance & IT',
        version_id: 'ver-003',
        version: '1.2',
        status: 'approved',
        effective_date: '2026-01-01',
        review_date: '2027-01-01',
        uploaded_at: '2026-10-10T14:15:00Z',
        characters: 6100,
        preview: 'All enterprise services are ISO 27001 Certified with 99.9% Cloud Uptime SLA. Data is encrypted in transit and at rest using AES-256 standards.'
      },
      {
        doc_id: 'doc-004',
        title: 'Hardware Warranty Policy v1.0 (Superseded)',
        category: 'Legal & Warranty',
        version_id: 'ver-004',
        version: '1.0',
        status: 'superseded',
        effective_date: '2023-01-01',
        review_date: '2024-01-01',
        uploaded_at: '2023-01-01T08:00:00Z',
        characters: 4100,
        preview: 'All hardware products include 3 year unlimited warranty coverage.'
      }
    ];
  }

  // Guidelines
  if (cleanEndpoint.startsWith('/guidelines')) {
    return [
      { id: 'g-001', kind: 'banned', value: '100% unbreakable', reason: 'Unverifiable absolute claim', platform: 'Any' },
      { id: 'g-002', kind: 'banned', value: 'free lifetime repairs', reason: 'Violates legal terms of service', platform: 'Any' },
      { id: 'g-003', kind: 'required', value: 'Terms and conditions apply', reason: 'Statutory disclaimer', platform: 'Any' },
      { id: 'g-004', kind: 'required', value: 'Results may vary by environment', reason: 'Mandatory benchmark disclaimer', platform: 'Customer Email' }
    ];
  }

  // Submissions
  if (cleanEndpoint === '/submissions' && method === 'GET') {
    return MOCK_STORAGE.submissions;
  }

  if (cleanEndpoint.startsWith('/submissions/') && method === 'GET') {
    const subId = cleanEndpoint.replace('/submissions/', '');
    const found = MOCK_STORAGE.submissions.find(s => s.id === subId) || MOCK_STORAGE.submissions[0];
    return {
      id: found.id,
      title: found.title,
      status: found.status,
      context: { platform: 'Website', audience: 'Consumer', purpose: 'Product Launch', tone: 'Professional', category: 'Hardware' },
      deadline: found.deadline,
      creator_name: found.creator_name,
      versions: [
        {
          n: found.version,
          body: 'Experience the groundbreaking Apex X1. All devices include a 3 year warranty. The battery delivers up to 14 hours of continuous browsing. Fast charging reaches 50 percent capacity in 30 minutes using the included 65W GaN adapter. Terms and conditions apply.',
          findings: [
            {
              type: 'contradictory',
              claim: 'All devices include a 3 year warranty.',
              why: 'Contradicts active Hardware Warranty Policy v2.4 which specifies a 2 year manufacturer warranty.',
              evidence: {
                title: 'Hardware Warranty Policy v2.4',
                version: '2.4',
                effective: '2026-01-01',
                review: '2027-01-01',
                passage: 'All Apex hardware products purchased from authorized channels include a 2 year manufacturer warranty.'
              },
              fix: 'Replace with: "All Apex X1 hardware devices include a 2 year manufacturer warranty."'
            },
            {
              type: 'verified',
              claim: 'The battery delivers up to 14 hours of continuous browsing.',
              why: 'Wording and figures agree with Battery & Charging Spec Sheet v3.1.',
              evidence: {
                title: 'Battery & Charging Spec Sheet v3.1',
                version: '3.1',
                effective: '2026-02-01',
                review: '2027-02-01',
                passage: 'The internal battery delivers up to 14 hours of continuous web browsing on a single charge.'
              },
              fix: null
            },
            {
              type: 'verified',
              claim: 'Fast charging reaches 50 percent capacity in 30 minutes using the included 65W GaN adapter.',
              why: 'Verbatim specification match in approved Knowledge Base.',
              evidence: {
                title: 'Battery & Charging Spec Sheet v3.1',
                version: '3.1',
                effective: '2026-02-01',
                review: '2027-02-01',
                passage: 'Fast charging reaches 50 percent capacity in 30 minutes using the included 65W GaN adapter.'
              },
              fix: null
            }
          ],
          risk: {
            level: 'High',
            score: 54,
            rows: [
              { factor: 'contradictory', count: 1, weight: 30, points: 30 },
              { factor: 'outdated', count: 1, weight: 20, points: 20 },
              { factor: 'review', count: 1, weight: 4, points: 4 }
            ],
            why: 'Contradictory claim detected against active Warranty Policy v2.4. Automatic High Risk classification.'
          },
          ai: { signals: [] },
          created_at: found.created_at
        }
      ],
      decisions: [],
      diff: null,
      changes: null
    };
  }

  // Submit Content
  if (cleanEndpoint === '/submissions' && method === 'POST') {
    const text = bodyData.text || '';
    const has3Year = /3[\s-]*(year|yr)/i.test(text);
    const has2Year = /2[\s-]*(year|yr)/i.test(text);
    const hasUnbreakable = /unbreakable/i.test(text);
    const hasSLA = /99\.9/i.test(text);

    const findings: Finding[] = [];
    if (has3Year) {
      findings.push({
        type: 'contradictory',
        claim: 'All devices include a 3 year warranty.',
        why: 'Contradicts active Hardware Warranty Policy v2.4 which specifies a 2 year manufacturer warranty.',
        evidence: {
          title: 'Hardware Warranty Policy v2.4',
          version: '2.4',
          effective: '2026-01-01',
          review: '2027-01-01',
          passage: 'All Apex hardware products purchased from authorized channels include a 2 year manufacturer warranty.'
        },
        fix: 'Replace with: "All Apex X1 hardware devices include a 2 year manufacturer warranty."'
      });
    } else if (has2Year) {
      findings.push({
        type: 'verified',
        claim: 'All Apex X1 hardware devices include a 2 year manufacturer warranty.',
        why: 'Wording and figures agree with Hardware Warranty Policy v2.4.',
        evidence: {
          title: 'Hardware Warranty Policy v2.4',
          version: '2.4',
          effective: '2026-01-01',
          review: '2027-01-01',
          passage: 'All Apex hardware products purchased from authorized channels include a 2 year manufacturer warranty.'
        },
        fix: null
      });
    }

    if (hasUnbreakable) {
      findings.push({
        type: 'guideline',
        claim: 'Prohibited term "100% unbreakable"',
        why: 'Mandatory brand guideline: unverifiable absolute claim.',
        evidence: null,
        fix: 'Remove "100% unbreakable" and describe specific aerospace-grade aluminum chassis material.'
      });
    }

    if (hasSLA) {
      findings.push({
        type: 'verified',
        claim: 'ISO 27001 Certified with 99.9% Cloud Uptime SLA',
        why: 'Agrees with Enterprise Security & SLA Standards v1.2.',
        evidence: {
          title: 'Enterprise Security & SLA Standards',
          version: '1.2',
          effective: '2026-01-01',
          review: '2027-01-01',
          passage: 'All enterprise services are ISO 27001 Certified with 99.9% Cloud Uptime SLA.'
        },
        fix: null
      });
    }

    const isHigh = findings.some(f => f.type === 'contradictory' || f.type === 'guideline');
    const score = isHigh ? 54 : findings.length ? 8 : 0;
    const newSub: SubmissionItem = {
      id: `sub-${Date.now().toString().slice(-4)}`,
      title: bodyData.title || 'Untitled Draft',
      status: 'pending',
      deadline: bodyData.deadline || null,
      created_at: new Date().toISOString(),
      creator_id: 'user-creator-01',
      creator_name: 'Rohith (Administrator)',
      version: 1,
      risk_level: isHigh ? 'High' : 'Low',
      risk_score: score,
      unresolved_issues: findings.filter(f => f.type !== 'verified').length,
      priority: isHigh ? 1 : 3
    };
    MOCK_STORAGE.submissions.unshift(newSub);

    return {
      id: newSub.id,
      version: 1,
      risk: {
        level: isHigh ? 'High' : 'Low',
        score,
        rows: isHigh
          ? [{ factor: 'contradictory', count: 1, weight: 30, points: 30 }, { factor: 'guideline', count: 1, weight: 12, points: 12 }]
          : [],
        why: isHigh ? 'Contradictory claim detected against approved policy. Human sign-off required.' : 'Content is grounded in approved organizational evidence.'
      },
      findings,
      ai: { signals: [] }
    };
  }

  // Impacts & Policy Reconciliation
  if (cleanEndpoint === '/impacts' && method === 'GET') {
    return MOCK_STORAGE.impacts;
  }

  if (cleanEndpoint.startsWith('/impacts/') && cleanEndpoint.endsWith('/resolve')) {
    const id = cleanEndpoint.split('/')[2];
    const imp = MOCK_STORAGE.impacts.find(i => i.id === id);
    if (imp) (imp as any).status = 'resolved';
    return { ok: true };
  }

  // Round 3 Improvement 2: Reconciliation Plan & Batch Apply
  if (cleanEndpoint.startsWith('/impacts/reconciliation-plan')) {
    const openImpacts = MOCK_STORAGE.impacts.filter(i => i.status === 'open');
    const patches: ReconciliationPatch[] = openImpacts.map(imp => {
      const isWarranty = imp.old_text.includes('3 year') || imp.sentence.includes('3 year');
      return {
        impact_id: imp.id,
        asset_id: imp.submission_id,
        asset_title: imp.content_title,
        asset_type: 'Marketing Collateral / Registered Asset',
        document_title: imp.document_title,
        document_version: '2.4',
        old_text: imp.sentence,
        new_text: isWarranty
          ? imp.sentence.replace(/3[\s-]*years?/i, '2 years')
          : imp.sentence.replace(/20[\s-]*hours?/i, '14 hours'),
        diff: isWarranty
          ? [
              { op: 'same', text: 'All devices include a' },
              { op: 'removed', text: '3 year' },
              { op: 'added', text: '2 year' },
              { op: 'same', text: 'manufacturer warranty.' }
            ]
          : [
              { op: 'same', text: 'Battery life delivers up to' },
              { op: 'removed', text: '20 hours' },
              { op: 'added', text: '14 hours' },
              { op: 'same', text: 'of continuous active use.' }
            ],
        risk_delta: 'High -> Low (Compliant)',
        status: 'pending'
      };
    });

    return {
      impact_count: openImpacts.length,
      patches,
      summary: `Generated ${patches.length} proactive patch diffs across registered collateral.`
    };
  }

  if (cleanEndpoint.startsWith('/impacts/reconcile-batch')) {
    MOCK_STORAGE.impacts.forEach(i => ((i as any).status = 'resolved'));
    return {
      ok: true,
      reconciled_count: 3,
      timestamp: new Date().toISOString()
    };
  }

  // Round 3 Improvement 1: Multimodal Visual Bounding-Box Flyer OCR
  if (cleanEndpoint.startsWith('/visual/flyer-ocr')) {
    const boxes: FlyerBox[] = [
      {
        id: 'box-1',
        text: 'ACME APEX X1 ENTERPRISE LAUNCH',
        x: 10.0,
        y: 8.0,
        width: 80.0,
        height: 11.0,
        status: 'verified',
        risk_level: 'Low',
        confidence: 0.99,
        why: 'Matches approved brand entity title for Apex X1 enterprise hardware.',
        evidence: {
          title: 'Brand Registry Index 2026',
          version: '1.0',
          effective: '2026-01-01',
          review: '2027-01-01',
          passage: 'Apex X1 Enterprise hardware launch guidelines and trademarks.'
        },
        suggested_fix: null
      },
      {
        id: 'box-2',
        text: 'All Apex X1 Devices Include 3-Year Unlimited Coverage',
        x: 10.0,
        y: 25.0,
        width: 80.0,
        height: 14.0,
        status: 'contradictory',
        risk_level: 'High',
        confidence: 0.98,
        why: 'Contradicts active Hardware Warranty Policy v2.4 which specifies a 2 year manufacturer warranty.',
        evidence: {
          title: 'Hardware Warranty Policy v2.4',
          version: '2.4',
          effective: '2026-01-01',
          review: '2027-01-01',
          passage: 'All Apex hardware products purchased from authorized channels include a 2 year manufacturer warranty.'
        },
        suggested_fix: 'All Apex X1 Devices Include 2-Year Manufacturer Warranty'
      },
      {
        id: 'box-3',
        text: 'Ranked #1 Enterprise AI Hardware Worldwide',
        x: 10.0,
        y: 44.0,
        width: 80.0,
        height: 13.0,
        status: 'unsupported',
        risk_level: 'Medium',
        confidence: 0.91,
        why: 'No verified empirical survey or industry citation supports the "#1 worldwide" assertion.',
        evidence: null,
        suggested_fix: 'Add recognized analyst citation (e.g. Gartner/IDC 2026) or replace with "Built for Enterprise AI Workloads"'
      },
      {
        id: 'box-4',
        text: 'ISO 27001 Certified with 99.9% Cloud Uptime SLA',
        x: 10.0,
        y: 63.0,
        width: 80.0,
        height: 13.0,
        status: 'verified',
        risk_level: 'Low',
        confidence: 0.97,
        why: 'Wording and figures strictly agree with approved Enterprise Security & SLA Standards v1.2.',
        evidence: {
          title: 'Enterprise Security & SLA Standards',
          version: '1.2',
          effective: '2026-01-01',
          review: '2027-01-01',
          passage: 'All enterprise services are ISO 27001 Certified with 99.9% Cloud Uptime SLA.'
        },
        suggested_fix: null
      },
      {
        id: 'box-5',
        text: 'Fast charging reaches 50 percent capacity in 30 minutes. Terms and conditions apply.',
        x: 10.0,
        y: 81.0,
        width: 80.0,
        height: 11.0,
        status: 'verified',
        risk_level: 'Low',
        confidence: 0.96,
        why: 'Charging metrics verified against Battery & Charging Spec Sheet v3.1; required legal disclaimer present.',
        evidence: {
          title: 'Battery & Charging Spec Sheet v3.1',
          version: '3.1',
          effective: '2026-02-01',
          review: '2027-02-01',
          passage: 'Fast charging reaches 50 percent capacity in 30 minutes using the included 65W GaN adapter.'
        },
        suggested_fix: null
      }
    ];

    return {
      filename: 'acme_apex_x1_marketing_flyer.png',
      extracted_text: boxes.map(b => b.text).join('\n'),
      boxes,
      summary: {
        total_claims: 5,
        contradictory: 1,
        unsupported: 1,
        verified: 3,
        guideline: 0,
        overall_risk: 'High'
      },
      timestamp: new Date().toISOString()
    };
  }

  // Round 3 Improvement 3: CMS Pre-Publish Firewall & Webhook Gateway
  if (cleanEndpoint.startsWith('/firewall/check')) {
    const content = bodyData.content || '';
    const has3Year = /3[\s-]*(year|yr)/i.test(content);
    const hasUnbreakable = /unbreakable/i.test(content);
    const isBlocked = has3Year || hasUnbreakable;

    const violations = [];
    if (has3Year) {
      violations.push({
        rule: 'CONTRADICTORY_POLICY_ASSERTION',
        claim: 'Claim of 3-year warranty contradicts Hardware Warranty Policy v2.4 (2-year standard).',
        explanation: 'Active organizational policy v2.4 limits manufacturer warranty to 24 months. Marketing copy claiming 36 months will trigger false advertising liabilities.',
        severity: 'CRITICAL' as const
      });
    }
    if (hasUnbreakable) {
      violations.push({
        rule: 'PROHIBITED_TERM_VIOLATION',
        claim: 'Term "100% unbreakable" violates brand guidelines.',
        explanation: 'Mandatory brand guideline prohibits unverifiable absolute durability superlatives.',
        severity: 'CRITICAL' as const
      });
    }

    const result: CMSFirewallResult = {
      allowed: !isBlocked,
      action: isBlocked ? 'BLOCKED' : 'PASSED',
      channel: bodyData.channel || 'wordpress',
      title: bodyData.title || 'Untitled CMS Post',
      author: bodyData.author || 'CMS Webhook Editor',
      risk_score: isBlocked ? 74 : 12,
      risk_level: isBlocked ? 'High' : 'Low',
      policy_violations: violations,
      reason: isBlocked
        ? `Publishing BLOCKED by Brand Governance Firewall: ${violations.length} critical policy violation(s) detected. Pre-publish gate mandates revision or authorized bypass.`
        : 'Publishing APPROVED by Brand Governance Firewall: Zero critical contradictions detected. Content is verified against authoritative Knowledge Base sources.',
      publish_token: isBlocked ? null : `vrty-pub-${Date.now().toString(16)}`,
      timestamp: new Date().toISOString()
    };

    MOCK_STORAGE.firewallLogs.unshift({
      id: `fw-${Date.now().toString().slice(-4)}`,
      action: `CMS Firewall: ${result.action}`,
      detail: `Channel: ${result.channel} · Title: '${result.title.slice(0, 35)}' · Score: ${result.risk_score} · Token: ${result.publish_token || 'BLOCKED'}`,
      created_at: new Date().toISOString(),
      actor_name: bodyData.author || 'CMS Editor'
    });

    return result;
  }

  if (cleanEndpoint.startsWith('/firewall/test-webhook')) {
    return {
      ok: true,
      event: bodyData.event || 'post.publish_intercept',
      target: bodyData.endpoint_url || 'https://cms.acme.corp/api/webhooks/pre-publish',
      status: 200,
      delivery_latency_ms: 34,
      signature_sha256: `sha256=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`,
      response_body: {
        received: true,
        firewall_interception: 'ACTIVE',
        enforcement_mode: 'PRE_PUBLISH_BLOCKING',
        policy_version: 'v2.4'
      }
    };
  }

  if (cleanEndpoint.startsWith('/firewall/logs')) {
    return MOCK_STORAGE.firewallLogs;
  }

  // Visual Image Screening
  if (cleanEndpoint.startsWith('/visual/inspect')) {
    return {
      valid: true,
      filename: 'media.png',
      width: 1920,
      height: 1080,
      megapixels: 2.07,
      aspect_ratio: 1.78,
      sharpness: 142.5,
      is_blurry: false,
      brightness: 118.2,
      contrast: 56.4,
      warnings: [],
      status: 'pass'
    };
  }

  // Settings Weights
  if (cleanEndpoint.startsWith('/settings/weights')) {
    const weights = {
      contradictory: 30,
      outdated: 20,
      unsupported: 15,
      guideline: 12,
      required: 10,
      review: 8,
      ai: 5,
      tone: 3
    };
    return { weights, defaults: weights };
  }

  // Notifications & Audit
  if (cleanEndpoint.startsWith('/notifications')) {
    return [
      { id: 'notif-1', message: "Decision Recorded: 'Enterprise Cloud SLA' was marked APPROVED by Marcus Vance.", user_id: 'user-admin-01', role: 'admin', created_at: new Date(Date.now() - 3600000).toISOString() },
      { id: 'notif-2', message: "Policy Supersession: Warranty Policy v2.4 uploaded. 3 registered assets flagged.", user_id: 'user-admin-01', role: 'admin', created_at: new Date(Date.now() - 7200000).toISOString() }
    ];
  }

  if (cleanEndpoint.startsWith('/audit')) {
    return [
      { id: 'aud-1', action: 'CMS Pre-Publish Firewall', detail: 'Blocked unauthorized 3-year warranty copy from WordPress webhook', created_at: new Date(Date.now() - 1800000).toISOString(), actor_name: 'CMS Webhook Dispatcher', actor_role: 'system' },
      { id: 'aud-2', action: 'Batch Policy Reconciliation', detail: 'Propagated authoritative policy patches across collateral assets', created_at: new Date(Date.now() - 3600000).toISOString(), actor_name: 'Rohith (Administrator)', actor_role: 'admin' },
      { id: 'aud-3', action: 'Visual Flyer OCR Inspection', detail: 'Evaluated spatial bounding boxes for Acme Apex X1 flyer', created_at: new Date(Date.now() - 7200000).toISOString(), actor_name: 'Elena Rostova', actor_role: 'creator' }
    ];
  }

  return { ok: true };
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  try {
    const resp = await fetch(url, { ...options, headers });
    if (!resp.ok) {
      // If endpoint not found or server error, fallback to offline mock engine
      if (resp.status === 404 || resp.status === 502 || resp.status === 503) {
        return handleOfflineFallback(endpoint, options) as T;
      }
      let errMessage = `HTTP ${resp.status} ${resp.statusText}`;
      try {
        const errJson = await resp.json();
        errMessage = errJson.detail || errJson.message || errMessage;
      } catch {}
      throw new Error(errMessage);
    }
    return resp.json();
  } catch (err: any) {
    // If network error (e.g. running statically on GitHub Pages where /api has no server)
    return handleOfflineFallback(endpoint, options) as T;
  }
}

export const api = {
  // Public
  getHealth: () => request<{ status: string }>('/health'),
  getPublicStats: () => request<any>('/stats/public'),
  
  // Auth
  demoLogin: (role: 'admin' | 'creator' | 'reviewer') => 
    request<AuthResponse>('/auth/demo', { method: 'POST', body: JSON.stringify({ role }) }),
  login: (email: string, password = 'password') => 
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data: { display_name: string; email: string; role?: string; org_name?: string }) => 
    request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request<UserProfile>('/me'),
  
  // Dashboard & Metrics
  getDashboardStats: () => request<DashboardMetrics>('/stats/dashboard'),
  getBrandHealth: () => request<BrandHealthData>('/brand-health'),
  getGovernanceIntelligence: () => request<GovernanceInsightsData>('/governance-intelligence'),
  
  // Documents
  getDocuments: () => request<DocumentItem[]>('/documents'),
  uploadDocument: (formData: FormData) => 
    request<{ document_id: string; title: string; version: string; characters: number; impacts_found: number }>(
      '/documents', { method: 'POST', body: formData }
    ),
  archiveDocument: (docId: string) => 
    request<{ ok: boolean }>(`/documents/${docId}/archive`, { method: 'POST' }),
    
  // Guidelines
  getGuidelines: () => request<GuidelineItem[]>('/guidelines'),
  addGuideline: (g: { kind: 'banned' | 'required'; value: string; reason?: string; platform?: string }) => 
    request<{ id: string; ok: boolean }>('/guidelines', { method: 'POST', body: JSON.stringify(g) }),
  deleteGuideline: (id: string) => 
    request<{ ok: boolean }>(`/guidelines/${id}`, { method: 'DELETE' }),

  // Submissions & Verification
  getSubmissions: () => request<SubmissionItem[]>('/submissions'),
  getSubmission: (id: string) => request<SubmissionDetail>(`/submissions/${id}`),
  submitContent: (data: { title: string; text: string; context: any; deadline?: string | null; skip_ai?: boolean }) => 
    request<{ id: string; version: number; risk: RiskAssessment; findings: Finding[]; ai: any }>('/submissions', { method: 'POST', body: JSON.stringify(data) }),
  reviseSubmission: (id: string, data: { text: string; skip_ai?: boolean }) => 
    request<{ version: number; risk: RiskAssessment; findings: Finding[]; diff: any[]; changes: any; ai: any }>(`/submissions/${id}/revise`, { method: 'POST', body: JSON.stringify(data) }),
  recordDecision: (id: string, d: { action: 'approved' | 'revision' | 'rejected'; genuineness: 'Genuine' | 'Misleading' | 'Cannot determine'; comment: string }) => 
    request<{ status: string; genuineness: string }>(`/submissions/${id}/decision`, { method: 'POST', body: JSON.stringify(d) }),

  // Change Impact Analysis
  getImpacts: () => request<ImpactAlert[]>('/impacts'),
  resolveImpact: (id: string) => request<{ ok: boolean }>(`/impacts/${id}/resolve`, { method: 'POST' }),

  // Round 3 Improvement 2: Automated Cross-Asset Policy Reconciliation Wizard
  getReconciliationPlan: () => request<ReconciliationPlan>('/impacts/reconciliation-plan'),
  applyBatchReconciliation: (patchIds?: string[], dryRun?: boolean) =>
    request<{ ok: boolean; reconciled_count: number; timestamp: string }>('/impacts/reconcile-batch', {
      method: 'POST',
      body: JSON.stringify({ patch_ids: patchIds || [], dry_run: dryRun || false })
    }),

  // Settings & Risk Weights
  getRiskWeights: () => request<{ weights: Record<string, number>; defaults: Record<string, number> }>('/settings/weights'),
  updateRiskWeights: (weights: Record<string, number>) => 
    request<{ ok: boolean; weights: Record<string, number> }>('/settings/weights', { method: 'POST', body: JSON.stringify(weights) }),

  // Notifications & Audit Logs
  getNotifications: () => request<NotificationItem[]>('/notifications'),
  getAuditLogs: () => request<AuditLogItem[]>('/audit'),

  // Visual Media Analysis
  inspectVisualAsset: (formData: FormData) => 
    request<any>('/visual/inspect', { method: 'POST', body: formData }),

  // Round 3 Improvement 1: Multimodal Visual Bounding-Box Flyer OCR & Inspection
  inspectFlyerOCR: (formData?: FormData) =>
    request<FlyerOCRResult>('/visual/flyer-ocr', { method: 'POST', body: formData }),

  // Round 3 Improvement 3: Bi-Directional Pre-Publish CMS Firewall & Webhook Gateway
  checkCMSFirewall: (payload: CMSFirewallPayload) =>
    request<CMSFirewallResult>('/firewall/check', { method: 'POST', body: JSON.stringify(payload) }),
  testWebhookDispatch: (data: { endpoint_url: string; event?: string; secret_key?: string }) =>
    request<WebhookTestResult>('/firewall/test-webhook', { method: 'POST', body: JSON.stringify(data) }),
  getFirewallLogs: () => request<FirewallLogItem[]>('/firewall/logs'),
};
