/**
 * VERITY API Client
 * Connects to the FastAPI backend with token injection and error handling.
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

// Token helper
export const getToken = (): string | null => localStorage.getItem('verity_token');
export const setToken = (t: string) => localStorage.setItem('verity_token', t);
export const removeToken = () => localStorage.removeItem('verity_token');

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
  const resp = await fetch(url, { ...options, headers });
  
  if (!resp.ok) {
    let errMessage = `HTTP ${resp.status} ${resp.statusText}`;
    try {
      const errJson = await resp.json();
      errMessage = errJson.detail || errJson.message || errMessage;
    } catch {}
    throw new Error(errMessage);
  }
  
  return resp.json();
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

  // Settings & Risk Weights
  getRiskWeights: () => request<{ weights: Record<string, number>; defaults: Record<string, number> }>('/settings/weights'),
  updateRiskWeights: (weights: Record<string, number>) => 
    request<{ ok: boolean; weights: Record<string, number> }>('/settings/weights', { method: 'POST', body: JSON.stringify(weights) }),

  // Notifications & Audit Logs
  getNotifications: () => request<NotificationItem[]>('/notifications'),
  getAuditLogs: () => request<AuditLogItem[]>('/audit'),

  // Visual Media Check
  inspectVisualAsset: (formData: FormData) => 
    request<any>('/visual/inspect', { method: 'POST', body: formData }),
};
