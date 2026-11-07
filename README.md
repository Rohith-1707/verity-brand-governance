# VERITY – Evidence-Driven Intelligent Brand Governance Platform

> **Tagline:** Every Claim Needs Evidence. Every Publication Needs Accountability.  
> **Hero Headline:** Make Every Publication Trustworthy.

VERITY solves the enterprise crisis of factual inaccuracy, unsupported promotional claims, outdated product specifications, and fragmented brand guidelines. It establishes an intelligent, deterministic verification layer between submitted content and public distribution.

---

## 🌟 The Three Original Core Innovations

1. **Evidence-Linked Claim Verification**
   - Ingests text, PDF, DOCX, and brand images.
   - Deterministically extracts factual and promotional claims.
   - Retrieves relevant approved organizational information via TF-IDF semantic embeddings and vector distance.
   - Compares the claim's semantic meaning and numerical figures with supporting evidence.
   - Classifies findings as **Verified**, **Unsupported**, **Contradictory**, **Potentially Outdated**, or **Requiring Human Review**.
   - Displays exact source document title, version, effective date, review date, and passage quote.
   - Proposes approved substitute wording.
   - **Never invents evidence**: AI explanations are advisory; only approved organizational sources constitute factual evidence.

2. **Cross-Content Change Impact Analysis**
   - When an approved organizational fact changes (e.g. standard warranty reduced from 3 years to 2 years), VERITY scans all registered downstream brochures, web pages, and campaign materials.
   - Pinpoints the affected text, sentence index, and exact document location.
   - Provides an interactive resolution queue for authorized reviewers to resolve downstream inconsistencies.

3. **Adaptive Governance Intelligence**
   - Aggregates review feedback across hundreds of editorial cycles.
   - Detects recurring friction points: repeatedly rejected claims, misunderstood product terminology, common tone discrepancies, and repeated guideline violations.
   - Recommends concrete guideline clarifications to authorized administrators.
   - **Strict human governance**: Official brand guidelines are *never automatically modified*.

---

## 🚀 The Six New Enhancements

1. **Evidence Freshness Monitor**
   - Tracks document versions, approval dates, effective dates, and review/expiry dates.
   - Issues warnings when claims cite expired sources or superseded text.
   - Explicitly displays uncertainty when source dates are unrecorded.

2. **Intelligent Content Risk Scoring**
   - Transparent, weighted risk assessment based on contradictory claims (30 pts), outdated evidence (20 pts), unsupported assertions (15 pts), guideline violations (12 pts), missing required text (10 pts), review uncertainty (8 pts), AI credibility signals (5 pts), and tone discrepancies (3 pts).
   - Classifies content into **Low**, **Medium**, or **High** risk with full explainability.
   - High-risk content strictly mandates human reviewer approval.

3. **Smart Content Difference Tracking**
   - Word-level diff comparisons across revisions (`added`, `removed`, `unchanged`).
   - Automatically tracks resolved earlier issues, lingering unresolved problems, and newly introduced unsupported claims.

4. **Brand Health Score**
   - Executive 0–100 governance index based on:
     * Claims with supporting evidence (35 pts)
     * Unresolved high-risk issues (20 pts)
     * Asset freshness and impact control (15 pts)
     * Review completion velocity (20 pts)
     * Guideline adherence (10 pts)
   - Fully transparent formula and data period; informative empty state when data is sparse.

5. **Context-Aware Brand Checking**
   - Interprets guidelines against creator-specified audience, purpose, category, tone, and platform (Website, Instagram, Press Release, Customer Email).
   - Tone is evaluated in context; mandatory compliance rules remain non-negotiable.

6. **Smart Review Prioritisation**
   - Review queue prioritised by risk level, contradictions, open issues, age, and publication deadline.
   - In-app notification alerts keep reviewers and creators synchronized.

---

## 🧭 Complete Website & Route Structure

### Public Pages
1. **Home / Landing Page (`/`)**: SaaS hero ("Make Every Publication Trustworthy."), innovation highlights, live interactive verification preview, workflow overview, responsible AI commitment.
2. **Features Page (`/features`)**: Deep-dive into each innovation and enhancement with technical diagrams.
3. **How It Works Page (`/how-it-works`)**: Visual 12-step verification pipeline walkthrough.
4. **About VERITY (`/about`)**: Mission, governance philosophy, data isolation, and ethical charter.
5. **Login Page (`/login`)**: Email/password authentication plus **1-click Quick Demo Switcher** (Sarah Chen as Admin, Elena Rostova as Reviewer, Marcus Vance as Creator).
6. **Registration Page (`/register`)**: Self-service organization and team member onboarding.

### Authenticated Application Pages (under `/app`)
1. **Main Dashboard (`/app/dashboard`)**: Live metrics, verified claims count, pending reviews, open change impact alerts, brand health index widget, and recent audit activity.
2. **Knowledge Base (`/app/knowledge-base`)**: Authoritative organizational documents, category filters, active/superseded tabs, passage search.
3. **Document Management (`/app/documents`)**: Upload PDF, DOCX, TXT, or Image files, assign effective/review dates, automatic superseded versioning, and archiving.
4. **Content Verification (`/app/verify`)**: Submission form with context parameters (audience, tone, platform, deadline), file upload, real-time 12-step pipeline progress, instant findings preview.
5. **Verification Reports (`/app/reports`)**: Complete filterable submission dossier with claim cards, explainable risk factor breakdown table, word-level revision diffs, and reviewer comments.
6. **Change Impact Analysis (`/app/impact`)**: Cross-content monitor identifying affected assets when policies change, sentence locations, and resolve actions.
7. **Brand Guidelines (`/app/guidelines`)**: Manage prohibited brand terms, mandatory disclaimers, and platform rules.
8. **Review & Approval Queue (`/app/review`)**: Prioritised review queue; reviewer modal recording factual genuineness (`Genuine`, `Misleading`, `Cannot determine`), decisions (`Approve`, `Request Revision`, `Reject`), and mandatory written justifications.
9. **Governance Intelligence (`/app/governance`)**: Trend analysis of recurring rejected claims and friction points with actionable policy recommendations for administrators.
10. **Brand Health Score (`/app/brand-health`)**: 0–100 brand health dashboard with transparent component breakdown, mathematical formula, and measurement period.
11. **Audit History (`/app/audit`)**: Tamper-evident, immutable audit trail of all actions with actor, timestamp, action type, and export to CSV or JSON.
12. **User & Organization Settings (`/app/settings`)**: Organization tenant profile and configurable risk scoring weights.

---

## 🏗️ Technical Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React, React Router DOM, Vite.
- **Backend**: Python 3.11+, FastAPI, Uvicorn, SlowAPI rate limiter, Pydantic v2.
- **Database**: PostgreSQL (via psycopg) & SQLite fallback with automatic schema initialization and demo seeds.
- **Document Processing**: PyMuPDF (native PDF layout text extraction), python-docx (DOCX paragraph & table extraction).
- **Visual Media Analysis**: OpenCV (image resolution, Laplacian blur detection, contrast checks).
- **Retrieval Engine**: TF-IDF n-gram vectorizer with cosine similarity via scikit-learn, plus optional persistent ChromaDB.
- **Authentication**: Dual support for Local JWT sessions (zero setup) and Supabase Auth with JWKS/HS256 tokens.

---

## ⚡ Quick Start (Local Development)

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Backend Setup
```bash
cd backend
python -m venv .venv
# Windows:
.\.venv\Scripts\activate
# Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# Run FastAPI Server (starts on http://127.0.0.1:8000)
uvicorn app.main:app --reload --port 8000
```
*Note: If `DATABASE_URL` is omitted, VERITY automatically initializes a local SQLite database (`verity.db`) with complete demo seed data!*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Opens on http://localhost:5173 with API proxying to port 8000
```

### 4. Build Fullstack Production Bundle
```bash
cd frontend
npm run build
```
Once built, the FastAPI backend automatically serves the production React SPA directly at `http://127.0.0.1:8000/`.

---

## 🧪 Automated Test Suite

Run the comprehensive pytest suite covering pure verification rules, document extractors, token authentication, API endpoints, risk scoring, diff comparison, change impact analysis, and OpenCV visual asset inspection:

```bash
cd backend
pytest
```

Output:
```
============================= test session starts =============================
collected 21 items

backend/tests/test_engine.py .............                               [ 61%]
backend/tests/test_extract_and_api.py ....                               [ 80%]
backend/tests/test_new_features.py ....                                  [100%]
======================= 21 passed in 3.31s ====================================
```

---

## 🚢 Production Deployment

### Option A: Render (Single Service / Docker)
1. Fork or push the repository to GitHub.
2. Create a new Web Service on Render and link the repository.
3. Render automatically reads `render.yaml` or `Dockerfile`:
   - Build Command: `cd frontend && npm install && npm run build && cd ../backend && pip install -r requirements.txt`
   - Start Command: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Set `DATABASE_URL` to your PostgreSQL database (e.g. Supabase connection string) and `JWT_SECRET`.

### Option B: Separate Frontend (Vercel) & Backend (Render/Fly.io)
1. Deploy `backend` to Render or Fly.io.
2. In `frontend`, set `VITE_API_URL` to your production backend URL (e.g. `https://verity-api.onrender.com/api`).
3. Deploy `frontend` to Vercel using `vercel.json`.

---

## 🛡️ Responsible AI Charter

- **AI is Advisory:** AI credibility screening flags urgency, sensationalism, or missing attribution. It **never declares truth or falsity**.
- **Evidence Must Be Grounded:** Every verified claim is anchored to an approved organizational document with exact version and date traceability.
- **Human Review Accountability:** Misleading content cannot be approved. High-risk content strictly mandates a written reviewer justification.
