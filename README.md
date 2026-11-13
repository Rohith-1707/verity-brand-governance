# VERITY – Evidence-Driven Intelligent Brand Governance Platform

> **Tagline:** Every Claim Needs Evidence. Every Publication Needs Accountability.  
> **Hero Headline:** Make Every Publication Trustworthy.  
> **Live Deployed Product:** [https://rohith-1707.github.io/verity-brand-governance/](https://rohith-1707.github.io/verity-brand-governance/)  
> **Source-Code Repository:** [https://github.com/Rohith-1707/verity-brand-governance.git](https://github.com/Rohith-1707/verity-brand-governance.git)  
> **Documentation PDF:** [VERITY_Hackathon_Final_Documentation.pdf](./VERITY_Hackathon_Final_Documentation.pdf)

VERITY solves the enterprise crisis of factual inaccuracy, unsupported promotional claims, outdated product specifications, and fragmented brand guidelines. It establishes an intelligent, deterministic verification layer between submitted content and public distribution.

---

## 🏆 Round 3 Delivered Improvements (Exact Commitments)

In Round 2, our team committed to three major, deep product enhancements. In Round 3, we delivered exactly these three features—fully implemented, end-to-end tested, and demonstrable in the live platform:

### 1. Multimodal Visual Bounding-Box Flyer OCR & Inspection
- **What it is:** Ingests marketing flyers, social banners, and brochures; runs spatial OCR contour segmentation (OpenCV & PyMuPDF); extracts text blocks with normalized coordinates `{ x, y, width, height }`; and evaluates factual claims against approved Knowledge Base sources.
- **What it changes for the user:** Renders an interactive canvas overlay with **red glowing bounding boxes** around contradictory claims (e.g. Acme 3-Year Warranty violating active Policy v2.4), **amber boxes** for unsupported assertions, and **green boxes** for verified claims. Clicking any bounding box spotlights verbatim evidence, confidence scores, and 1-click safe copy patches.

### 2. Automated Cross-Asset Policy Reconciliation Wizard
- **What it is:** Transforms passive change impact alerts into an active remediation wizard. When an authoritative document changes (e.g. Acme Warranty Policy v2.4 replacing v1.0), the wizard scans all registered collateral and generates unified before/after patch diffs.
- **What it changes for the user:** Users inspect token-level sequence matcher diffs showing superseded text in red strikethrough and new compliant text in green highlight. Provides a 1-click **"Batch Propagate Patches to All Collateral"** button that reconciles all assets simultaneously, resolves alerts, and logs an immutable audit record.

### 3. Bi-Directional Pre-Publish CMS Firewall & Webhook Gateway
- **What it is:** Headless pre-publish gateway (`POST /api/firewall/check`) for WordPress, Webflow, Ghost, and CI/CD pipelines. Evaluates incoming draft payloads against active brand policies and blocks publication if Risk Score >= 30 or critical contradictions exist.
- **What it changes for the user:** Features an interactive developer simulator in Settings with live webhook dispatching, HMAC SHA-256 signature verification, and real-time terminal output displaying Pass/Block verdicts, violation breakdowns, and cryptographic publish tokens (`vrty-pub-...`).

---

## 🌟 The Three Original Core Innovations

1. **Evidence-Linked Claim Verification**
   - Ingests text, PDF, DOCX, and brand images.
   - Deterministically extracts factual and promotional claims.
   - Retrieves relevant approved organizational information via TF-IDF semantic embeddings and cosine distance.
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

## 🚀 The Six Platform Enhancements

1. **Evidence Freshness Monitor:** Tracks document versions, approval dates, effective dates, and review/expiry dates. Warns when claims cite expired sources or superseded text.
2. **Intelligent Content Risk Scoring:** Transparent, weighted risk assessment based on configurable factor weights. Classifies content into **Low**, **Medium**, or **High** risk with full explainability.
3. **Smart Content Difference Tracking:** Word-level diff comparisons across revisions (`added`, `removed`, `unchanged`).
4. **Brand Health Score:** Executive 0–100 governance index measuring evidence coverage, unresolved high risks, review turnaround rate, and guideline compliance.
5. **Context-Aware Brand Checking:** Interprets guidelines against creator-specified audience, purpose, category, tone, and platform.
6. **Smart Review Prioritisation:** Review queue prioritised by risk level, contradictions, open issues, age, and publication deadline.

---

## 🧭 Complete Website & Route Structure (18 Views)

### Public Pages (6 Views)
1. **Home / Landing Page (`/`)**: Hero interactive architecture, live governance metrics, and persona flows.
2. **Features Page (`/features`)**: Deep-dive into all original innovations, enhancements, and Round 3 additions.
3. **How It Works Page (`/how-it-works`)**: Visual 12-step verification pipeline walkthrough.
4. **About VERITY (`/about`)**: Mission, governance philosophy, data isolation, and ethical charter.
5. **Login Page (`/login`)**: Email/password authentication plus **1-click Quick Demo Switcher** (Rohith as Admin, Marcus as Reviewer, Elena as Creator).
6. **Registration Page (`/register`)**: Self-service organization and team member onboarding.

### Authenticated Application Pages (12 Views under `/app`)
1. **Main Dashboard (`/app/dashboard`)**: Live metrics, verified claims count, pending reviews, open change impact alerts, brand health index widget, and recent audit activity.
2. **Knowledge Base (`/app/knowledge-base`)**: Authoritative organizational documents, category filters, active/superseded tabs, passage search.
3. **Document Management (`/app/documents`)**: Upload PDF, DOCX, TXT, or Image files, assign effective/review dates, automatic superseded versioning, and archiving.
4. **Content Verification (`/app/verify`)**: Dual-mode verification: **Text Editorial Mode** and **Multimodal Visual Flyer OCR & Bounding Box Inspector**.
5. **Verification Reports (`/app/reports`)**: Complete filterable submission dossier with claim cards, explainable risk factor breakdown table, word-level revision diffs, and reviewer comments.
6. **Change Impact Analysis (`/app/impact`)**: Impact alerts matrix and **Policy Reconciliation Wizard** with unified patch diffs and 1-click batch propagation.
7. **Brand Guidelines (`/app/guidelines`)**: Manage prohibited brand terms, mandatory disclaimers, and platform rules.
8. **Review & Approval Queue (`/app/review`)**: Prioritised review queue; reviewer modal recording factual genuineness, decisions, and mandatory written justifications.
9. **Governance Intelligence (`/app/governance`)**: Trend analysis of recurring rejected claims and friction points with actionable policy recommendations for administrators.
10. **Brand Health Score (`/app/brand-health`)**: 0–100 brand health dashboard with transparent component breakdown, mathematical formula, and measurement period.
11. **Audit History (`/app/audit`)**: Tamper-evident, immutable audit trail of all actions with actor, timestamp, action type, and export to CSV or JSON.
12. **User & Organization Settings (`/app/settings`)**: Organization tenant profile, configurable risk scoring weights, and **Pre-Publish CMS Firewall & Webhook Gateway Simulator**.

---

## 🏗️ Technical Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React, React Router DOM (HashRouter for static hosting safety), Vite.
- **Backend**: Python 3.11+, FastAPI, Uvicorn, SlowAPI rate limiter, Pydantic v2.
- **Database**: Dual-engine SQL architecture: local SQLite (`verity.db`) with complete demo seed data and PostgreSQL migration readiness.
- **Document & Multimodal Vision**: PyMuPDF (PDF parsing), python-docx (DOCX parsing), OpenCV (morphological contour segmentation, spatial bounding box detection, blur/contrast screening).
- **Retrieval Engine**: Scikit-learn TF-IDF n-gram vectorizer with cosine similarity, plus Keyword and ChromaDB fallback options.
- **CMS Firewall Gateway**: HMAC SHA-256 signature verification, pre-publish blocking threshold, cryptographic publish tokens.
- **Offline Mock Fallback Engine**: Built-in mock engine in `frontend/src/api.ts` that automatically activates on static hosting (e.g. GitHub Pages) if the FastAPI backend is offline, guaranteeing 100% demo uptime with zero hanging states or console crashes.

---

## ⚡ Quick Start (Clone & Run Instructions)

### 1. Clone the Repository
```bash
git clone https://github.com/Rohith-1707/verity-brand-governance.git
cd verity-brand-governance
```

### 2. Backend Setup (FastAPI)
```bash
cd backend
python -m venv .venv

# On Windows:
.\.venv\Scripts\activate
# On Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt

# Run FastAPI Server (starts on http://127.0.0.1:8000)
uvicorn app.main:app --reload --port 8000
```
*Note: The SQLite database initializes automatically with complete demo seed data.*

### 3. Frontend Setup (React + Vite)
In a new terminal:
```bash
cd frontend
npm install
npm run dev
# Opens on http://localhost:5173 with proxy to backend port 8000
```

### 4. Build Production Bundle
```bash
cd frontend
npm run build
```
Once built, FastAPI serves the production frontend directly from `http://127.0.0.1:8000/`.

---

## 🧪 Automated Test Suite (29 / 29 Passing Tests)

Run the automated pytest suite:
```bash
cd backend
$env:PYTHONPATH="."
pytest tests
```

Output:
```
============================= test session starts =============================
platform win32 -- Python 3.15.2, pytest-9.2.0, pluggy-1.7.0
collected 29 items

backend/tests/test_engine.py .............                               [ 44%]
backend/tests/test_extract_and_api.py ....                               [ 58%]
backend/tests/test_new_features.py ....                                  [ 72%]
backend/tests/test_round3_features.py ........                           [100%]
======================= 29 passed in 3.36s ====================================
```

Coverage:
- **13 Engine Tests**: Claim extraction, evidence comparison, risk scoring, diff opcodes, impact mapping.
- **4 Extraction & Security Tests**: PDF extraction, DOCX parsing, token verification, route protection.
- **4 Governance Tests**: Role switching, prioritized queue triage, brand health formula, visual OpenCV blur.
- **8 Round 3 Delivered Features Tests**: Multimodal flyer OCR, spatial box evaluation, patch diffs, batch apply, CMS firewall pre-publish gate, webhook dispatch.

---

## 🛡️ Responsible AI Charter

- **AI is Advisory:** AI credibility screening flags urgency, sensationalism, or missing attribution. It **never declares truth or falsity**.
- **Evidence Must Be Grounded:** Every verified claim is anchored to an approved organizational document with exact version and date traceability.
- **Human Review Accountability:** Misleading content cannot be approved. High-risk content strictly mandates a written reviewer justification.
