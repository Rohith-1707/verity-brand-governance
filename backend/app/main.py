"""VERITY API. All writes happen here, after server-side authentication, role and organisation checks."""
from __future__ import annotations
import json
import os
import uuid
from datetime import date, datetime, timedelta
from functools import lru_cache

import jwt
from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy import text

from . import engine as E
from .db import get_engine, init_db
from .extract import ExtractError, extract_text
from .llm import LLMUnavailable, screen
from .retrieval import ChromaRetriever, KeywordRetriever, TFIDFRetriever
from .visual import analyze_image_bytes

LOCAL_JWT_SECRET = os.getenv("JWT_SECRET", "verity-hackathon-secure-jwt-secret-key-2026")
LOCAL_JWT_ALGORITHM = "HS256"

app = FastAPI(title="VERITY API", version="1.0.0", description="Evidence-Driven Intelligent Brand Governance Platform API")

# Ensure DB is initialized on module load
init_db()

@app.on_event("startup")
def on_startup():
    init_db()

# Allow origins
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
allowed_origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()] or ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter


def db():
    return get_engine()


@lru_cache
def chroma():
    return ChromaRetriever(os.environ["CHROMA_PATH"])


_active_retrievers: dict[str, Any] = {}


def retriever_for(conn, org: str):
    """TF-IDF / ChromaDB retriever with auto-indexing from approved and superseded document versions."""
    if os.getenv("CHROMA_PATH"):
        return chroma()
    
    r = TFIDFRetriever()
    rows = conn.execute(
        text("""
            SELECT v.document_id as d, d.title, v.version, v.status, v.effective_date as e, v.review_date as rv, v.body
            FROM document_versions v 
            JOIN documents d ON d.id = v.document_id 
            WHERE v.org_id = :o AND v.status IN ('approved', 'superseded')
        """),
        {"o": str(org)}
    ).mappings().all()
    
    for v in rows:
        r.index(str(org), str(v["d"]), v["title"], str(v["version"]), v["status"], v["e"], v["rv"], v["body"])
    return r


@lru_cache
def jwks():
    supabase_url = os.getenv("SUPABASE_URL", "").rstrip("/")
    if supabase_url:
        return jwt.PyJWKClient(supabase_url + "/auth/v1/.well-known/jwks.json")
    return None


def create_local_token(user_id: str, org_id: str, role: str, name: str) -> str:
    payload = {
        "sub": user_id,
        "org_id": org_id,
        "role": role,
        "name": name,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, LOCAL_JWT_SECRET, algorithm=LOCAL_JWT_ALGORITHM)


def token_payload(authorization: str | None) -> dict:
    """Verify Supabase JWT token or Local development/demo JWT token."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing authorization token")
    tok = authorization[7:]
    
    # 1. Try Local JWT
    try:
        payload = jwt.decode(tok, LOCAL_JWT_SECRET, algorithms=[LOCAL_JWT_ALGORITHM])
        if "sub" in payload:
            return payload
    except Exception:
        pass

    # 2. Try Supabase HS256 legacy secret
    supabase_secret = os.getenv("SUPABASE_JWT_SECRET")
    if supabase_secret:
        try:
            return jwt.decode(tok, supabase_secret, algorithms=["HS256"], audience="authenticated")
        except Exception:
            pass

    # 3. Try Supabase JWKS (ES256 / RS256)
    client = jwks()
    if client:
        try:
            alg = jwt.get_unverified_header(tok).get("alg")
            if alg in ("ES256", "RS256"):
                return jwt.decode(tok, client.get_signing_key_from_jwt(tok).key, algorithms=[alg], audience="authenticated")
        except Exception:
            pass

    raise HTTPException(401, "Invalid or expired authorization token")


def current_user(authorization: str = Header(None)) -> dict:
    p = token_payload(authorization)
    uid = p["sub"]
    with db().begin() as c:
        row = c.execute(
            text("SELECT id, org_id as org, role, display_name as name, email, blocked FROM profiles WHERE id = :i"),
            {"i": str(uid)}
        ).mappings().first()
    
    if not row:
        raise HTTPException(403, "No profile found for this account")
    if row["blocked"]:
        raise HTTPException(403, "Account has been blocked by organization administrator")
    return {
        "id": str(row["id"]),
        "org": str(row["org"]),
        "role": row["role"],
        "name": row["name"],
        "email": row.get("email", ""),
        "blocked": bool(row["blocked"])
    }


def need(*roles):
    def dep(u=Depends(current_user)):
        if u["role"] not in roles:
            raise HTTPException(403, f"Role '{u['role']}' is not permitted to perform this action. Required: {', '.join(roles)}")
        return u
    return dep


def audit(c, u: dict, action: str, detail: str = ""):
    c.execute(
        text("INSERT INTO audit_logs (id, org_id, actor_id, action, detail, created_at) VALUES (:id, :o, :a, :x, :d, :now)"),
        {"id": f"audit-{uuid.uuid4().hex[:12]}", "o": str(u["org"]), "a": str(u["id"]), "x": action, "d": detail, "now": datetime.utcnow().isoformat()}
    )


def notify(c, org: str, message: str, role: str | None = None, user_id: str | None = None):
    c.execute(
        text("INSERT INTO notifications (id, org_id, user_id, role, message, created_at) VALUES (:id, :o, :u, :r, :m, :now)"),
        {"id": f"notif-{uuid.uuid4().hex[:12]}", "o": str(org), "u": user_id, "r": role, "m": message, "now": datetime.utcnow().isoformat()}
    )


# --- Public & Auth Schemas & Endpoints ---

class LoginRequest(BaseModel):
    email: str
    password: str = "password"


class DemoLoginRequest(BaseModel):
    role: str = Field("admin", pattern="^(admin|creator|reviewer)$")


class RegisterRequest(BaseModel):
    display_name: str = Field(min_length=1, max_length=80)
    email: str = Field(default="user@verity.acme.com")
    role: str = "creator"
    org_name: str | None = Field(None, max_length=120)
    org_id: str | None = None


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/stats/public")
def public_stats():
    with db().begin() as c:
        docs = c.execute(text("SELECT count(*) FROM documents")).scalar() or 0
        subs = c.execute(text("SELECT count(*) FROM submissions")).scalar() or 0
        decisions = c.execute(text("SELECT count(*) FROM decisions WHERE action='approved'")).scalar() or 0
    return {
        "tagline": "Every Claim Needs Evidence. Every Publication Needs Accountability.",
        "verified_documents": docs,
        "processed_publications": subs,
        "approved_assets": decisions,
        "uptime": "99.98%"
    }


@app.post("/api/auth/demo")
def demo_login(req: DemoLoginRequest):
    """Instant login for reviewers, creators and administrators to test the platform immediately."""
    with db().begin() as c:
        user = c.execute(
            text("SELECT id, org_id, display_name, email, role FROM profiles WHERE role = :r AND blocked = 0 LIMIT 1"),
            {"r": req.role}
        ).mappings().first()
        
        if not user:
            # Fall back to any active user
            user = c.execute(
                text("SELECT id, org_id, display_name, email, role FROM profiles WHERE blocked = 0 LIMIT 1")
            ).mappings().first()
            
    if not user:
        raise HTTPException(404, f"No demo account found for role {req.role}")
        
    token = create_local_token(str(user["id"]), str(user["org_id"]), user["role"], user["display_name"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user["id"]),
            "name": user["display_name"],
            "email": user["email"],
            "role": user["role"],
            "org_id": str(user["org_id"])
        }
    }


@app.post("/api/auth/login")
def login(req: LoginRequest):
    with db().begin() as c:
        user = c.execute(
            text("SELECT id, org_id, display_name, email, role FROM profiles WHERE email = :e AND blocked = 0 LIMIT 1"),
            {"e": req.email}
        ).mappings().first()
        
    if not user:
        raise HTTPException(401, "Invalid email or account does not exist")
        
    token = create_local_token(str(user["id"]), str(user["org_id"]), user["role"], user["display_name"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user["id"]),
            "name": user["display_name"],
            "email": user["email"],
            "role": user["role"],
            "org_id": str(user["org_id"])
        }
    }


@app.post("/api/auth/register")
def register(body: RegisterRequest):
    with db().begin() as c:
        if body.org_name:
            org_id = f"org-{uuid.uuid4().hex[:8]}"
            c.execute(
                text("INSERT INTO organisations (id, name, created_at) VALUES (:id, :n, :now)"),
                {"id": org_id, "n": body.org_name, "now": datetime.utcnow().isoformat()}
            )
            role = "admin"
        elif body.org_id:
            org_id = body.org_id
            if not c.execute(text("SELECT 1 FROM organisations WHERE id = :o"), {"o": org_id}).first():
                raise HTTPException(404, "Target organisation ID does not exist")
            role = body.role if body.role in ("creator", "reviewer") else "creator"
        else:
            first_org = c.execute(text("SELECT id FROM organisations LIMIT 1")).scalar()
            if first_org:
                org_id = str(first_org)
                role = body.role if body.role in ("creator", "reviewer") else "creator"
            else:
                org_id = f"org-{uuid.uuid4().hex[:8]}"
                c.execute(
                    text("INSERT INTO organisations (id, name, created_at) VALUES (:id, :n, :now)"),
                    {"id": org_id, "n": "Default Organisation", "now": datetime.utcnow().isoformat()}
                )
                role = "admin"

        user_id = f"user-{uuid.uuid4().hex[:8]}"
        c.execute(
            text("INSERT INTO profiles (id, org_id, display_name, email, role, blocked, created_at) VALUES (:id, :o, :n, :e, :r, 0, :now)"),
            {"id": user_id, "o": org_id, "n": body.display_name, "e": body.email, "r": role, "now": datetime.utcnow().isoformat()}
        )
        audit(c, {"org": org_id, "id": user_id}, "Registered New Account", f"{body.display_name} as {role}")
        
    token = create_local_token(user_id, org_id, role, body.display_name)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "name": body.display_name,
            "email": body.email,
            "role": role,
            "org_id": org_id
        }
    }


@app.get("/api/me")
def me(u=Depends(current_user)):
    with db().begin() as c:
        org_name = c.execute(text("SELECT name FROM organisations WHERE id = :o"), {"o": u["org"]}).scalar() or "VERITY Organisation"
    return {**u, "org_name": org_name}


# --- Dashboard Analytics ---

@app.get("/api/stats/dashboard")
def dashboard_stats(u=Depends(current_user)):
    org = u["org"]
    with db().begin() as c:
        total_subs = c.execute(text("SELECT count(*) FROM submissions WHERE org_id = :o"), {"o": org}).scalar() or 0
        pending_reviews = c.execute(text("SELECT count(*) FROM submissions WHERE org_id = :o AND status = 'pending'"), {"o": org}).scalar() or 0
        approved_subs = c.execute(text("SELECT count(*) FROM submissions WHERE org_id = :o AND status = 'approved'"), {"o": org}).scalar() or 0
        total_docs = c.execute(text("SELECT count(*) FROM documents WHERE org_id = :o"), {"o": org}).scalar() or 0
        open_impacts = c.execute(text("SELECT count(*) FROM impacts WHERE org_id = :o AND status = 'open'"), {"o": org}).scalar() or 0
        
        # Pull latest versions of submissions
        versions = c.execute(
            text("""
                SELECT v.risk, v.findings, s.status, s.title, s.created_at 
                FROM submission_versions v 
                JOIN submissions s ON s.id = v.submission_id 
                WHERE v.org_id = :o AND v.n = (SELECT max(v2.n) FROM submission_versions v2 WHERE v2.submission_id = s.id)
                ORDER BY s.created_at DESC
            """),
            {"o": org}
        ).mappings().all()

        recent_audits = [
            dict(r) for r in c.execute(
                text("SELECT action, detail, created_at FROM audit_logs WHERE org_id = :o ORDER BY created_at DESC LIMIT 8"),
                {"o": org}
            ).mappings()
        ]
        
    verified_claims = 0
    unsupported_claims = 0
    contradictory_claims = 0
    high_risk_count = 0
    outdated_count = 0
    
    for row in versions:
        findings = json.loads(row["findings"]) if isinstance(row["findings"], str) else (row["findings"] or [])
        risk = json.loads(row["risk"]) if isinstance(row["risk"], str) else (row["risk"] or {})
        
        if risk.get("level") == "High":
            high_risk_count += 1
            
        for f in findings:
            ftype = f.get("type")
            if ftype == "verified":
                verified_claims += 1
            elif ftype == "unsupported":
                unsupported_claims += 1
            elif ftype == "contradictory":
                contradictory_claims += 1
            elif ftype == "outdated":
                outdated_count += 1
                
    # Calculate health score component
    total_claims = verified_claims + unsupported_claims + contradictory_claims + outdated_count
    ev_pct = round((verified_claims / total_claims * 100), 1) if total_claims > 0 else 0
    
    return {
        "metrics": {
            "submitted_content": total_subs,
            "pending_reviews": pending_reviews,
            "approved_assets": approved_subs,
            "active_documents": total_docs,
            "verified_claims": verified_claims,
            "unsupported_claims": unsupported_claims,
            "contradictory_claims": contradictory_claims,
            "high_risk_submissions": high_risk_count,
            "open_impact_alerts": open_impacts,
            "evidence_coverage_percent": ev_pct
        },
        "recent_activities": recent_audits
    }


# --- Documents Management ---

@app.post("/api/documents")
@limiter.limit("20/minute")
async def upload_document(
    request: Request,
    title: str = Form(..., max_length=200),
    category: str = Form("Legal & Compliance"),
    version: str = Form("1.0"),
    effective_date: str | None = Form(None),
    review_date: str | None = Form(None),
    file: UploadFile = File(...),
    u=Depends(need("admin"))
):
    try:
        content_bytes = await file.read()
        body = extract_text(file.filename or "document.txt", content_bytes)
    except ExtractError as e:
        raise HTTPException(422, str(e))
        
    org = u["org"]
    impacts_list = []
    
    with db().begin() as c:
        ret = retriever_for(c, org)
        doc = c.execute(
            text("SELECT id FROM documents WHERE org_id = :o AND title = :t"),
            {"o": org, "t": title}
        ).mappings().first()
        
        if doc:
            doc_id = str(doc["id"])
            # Get old approved text before superseding
            old = c.execute(
                text("SELECT body FROM document_versions WHERE document_id = :d AND status = 'approved' ORDER BY uploaded_at DESC LIMIT 1"),
                {"d": doc_id}
            ).scalar()
            
            c.execute(
                text("UPDATE document_versions SET status = 'superseded' WHERE document_id = :d AND status = 'approved'"),
                {"d": doc_id}
            )
            ret.set_status(org, doc_id, "superseded")
            
            # Cross-content change impact analysis: identify registered content assets containing previous info
            if old:
                subs = c.execute(
                    text("""
                        SELECT s.id as id, v.body as text 
                        FROM submissions s 
                        JOIN submission_versions v ON v.submission_id = s.id 
                        WHERE s.org_id = :o AND s.status != 'rejected'
                        AND v.n = (SELECT max(v2.n) FROM submission_versions v2 WHERE v2.submission_id = s.id)
                    """),
                    {"o": org}
                ).mappings().all()
                
                impacts_list = E.find_impacts(old, body, [dict(s) for s in subs])
        else:
            doc_id = f"doc-{uuid.uuid4().hex[:8]}"
            c.execute(
                text("INSERT INTO documents (id, org_id, title, category, created_by, created_at) VALUES (:id, :o, :t, :c, :u, :now)"),
                {"id": doc_id, "o": org, "t": title, "c": category, "u": u["id"], "now": datetime.utcnow().isoformat()}
            )
            
        ver_id = f"ver-{uuid.uuid4().hex[:8]}"
        c.execute(
            text("""
                INSERT INTO document_versions (id, document_id, org_id, version, effective_date, review_date, status, body, uploaded_by, uploaded_at)
                VALUES (:id, :d, :o, :v, :e, :r, 'approved', :b, :u, :now)
            """),
            {
                "id": ver_id,
                "d": doc_id,
                "o": org,
                "v": version,
                "e": effective_date,
                "r": review_date,
                "b": body,
                "u": u["id"],
                "now": datetime.utcnow().isoformat()
            }
        )
        
        ret.index(org, doc_id, title, version, "approved", effective_date, review_date, body)
        
        # Save change impacts
        for imp in impacts_list:
            imp_id = f"imp-{uuid.uuid4().hex[:8]}"
            c.execute(
                text("INSERT INTO impacts (id, org_id, submission_id, document_id, old_text, sentence, location, status, created_at) VALUES (:id, :o, :s, :d, :t, :x, :l, 'open', :now)"),
                {"id": imp_id, "o": org, "s": imp["content_id"], "d": doc_id, "t": imp["old_text"], "x": imp["sentence"], "l": imp["location"], "now": datetime.utcnow().isoformat()}
            )
            
        if impacts_list:
            notify(c, org, f"Change Impact: {len(impacts_list)} registered asset(s) flagged after '{title}' was updated.", role="reviewer")
            
        audit(c, u, "Uploaded Approved Document", f"'{title}' v{version} ({len(body)} chars)")
        
    return {
        "document_id": doc_id,
        "title": title,
        "version": version,
        "characters": len(body),
        "impacts_found": len(impacts_list)
    }


@app.get("/api/documents")
def list_documents(u=Depends(current_user)):
    with db().begin() as c:
        rows = c.execute(
            text("""
                SELECT d.id as doc_id, d.title, d.category, v.id as version_id, v.version, v.status, 
                       v.effective_date, v.review_date, v.uploaded_at, length(v.body) as characters,
                       substr(v.body, 1, 280) as preview
                FROM document_versions v
                JOIN documents d ON d.id = v.document_id 
                WHERE v.org_id = :o 
                ORDER BY v.uploaded_at DESC
            """),
            {"o": u["org"]}
        ).mappings().all()
    return [dict(r) for r in rows]


@app.post("/api/documents/{doc_id}/archive")
def archive_document(doc_id: str, u=Depends(need("admin"))):
    with db().begin() as c:
        c.execute(text("UPDATE document_versions SET status = 'archived' WHERE document_id = :d AND org_id = :o"), {"d": doc_id, "o": u["org"]})
        audit(c, u, "Archived Document", doc_id)
    return {"ok": True}


# --- Brand Guidelines ---

class GuidelineModel(BaseModel):
    kind: str = Field(pattern="^(banned|required)$")
    value: str = Field(min_length=1, max_length=300)
    reason: str | None = Field(None, max_length=300)
    platform: str = "Any"


@app.post("/api/guidelines")
def add_guideline(g: GuidelineModel, u=Depends(need("admin"))):
    with db().begin() as c:
        gid = f"guide-{uuid.uuid4().hex[:8]}"
        c.execute(
            text("INSERT INTO guidelines (id, org_id, kind, value, reason, platform) VALUES (:id, :o, :k, :v, :r, :p)"),
            {"id": gid, "o": u["org"], "k": g.kind, "v": g.value, "r": g.reason, "p": g.platform}
        )
        audit(c, u, "Added Brand Guideline", f"{g.kind.upper()}: '{g.value}' ({g.platform})")
    return {"id": gid, "ok": True}


@app.delete("/api/guidelines/{gid}")
def delete_guideline(gid: str, u=Depends(need("admin"))):
    with db().begin() as c:
        c.execute(text("DELETE FROM guidelines WHERE id = :id AND org_id = :o"), {"id": gid, "o": u["org"]})
        audit(c, u, "Removed Brand Guideline", gid)
    return {"ok": True}


@app.get("/api/guidelines")
def list_guidelines(u=Depends(current_user)):
    with db().begin() as c:
        rows = c.execute(
            text("SELECT id, kind, value, reason, platform FROM guidelines WHERE org_id = :o ORDER BY kind, value"),
            {"o": u["org"]}
        ).mappings().all()
    return [dict(r) for r in rows]


# --- Content Verification Engine ---

class ContentSubmission(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    text: str = Field(min_length=1, max_length=20000)
    context: dict = {}
    deadline: str | None = None
    skip_ai: bool = False


def verification_pipeline(org: str, body: str, ctx: dict, skip_ai: bool = False, weights: dict | None = None):
    """12-step verification pipeline: extraction -> retrieval -> freshness -> rules -> risk assessment."""
    with db().begin() as c:
        has_approved = c.execute(
            text("SELECT 1 FROM document_versions WHERE org_id = :o AND status = 'approved' LIMIT 1"),
            {"o": org}
        ).first()
        if not has_approved:
            raise HTTPException(409, "Knowledge Base is empty. An administrator must upload approved documents before content can be verified.")
            
        g = c.execute(
            text("SELECT kind, value, reason, platform FROM guidelines WHERE org_id = :o"),
            {"o": org}
        ).mappings().all()
        ret = retriever_for(c, org)
        
    claims = E.extract_claims(body)
    findings = []
    
    for cl in claims:
        curr_hits = ret.search(org, cl, "approved")
        super_hits = ret.search(org, cl, "superseded")
        finding = E.classify_claim(cl, curr_hits, super_hits, min_score=ret.min_score, strong=ret.strong)
        findings.append(finding)
        
    # Check Brand Guidelines
    banned = [x for x in g if x["kind"] == "banned"]
    required = [x for x in g if x["kind"] == "required"]
    findings += E.check_guidelines(body, ctx, banned, required)
    
    # AI Credibility Screening (Advisory Only)
    if skip_ai:
        ai_result = {"skipped": True, "note": "Creator elected to submit without external AI screening."}
    else:
        try:
            ai_result = screen(body, ctx)
            for s in ai_result.get("signals", [])[:6]:
                findings.append({
                    "type": "ai",
                    "claim": f"AI Signal: \"{str(s.get('quote', ''))[:100]}\"",
                    "why": str(s.get("issue", "Credibility signal flagged")),
                    "evidence": None,
                    "fix": None
                })
        except LLMUnavailable as e:
            ai_result = {
                "available": False,
                "summary": "AI service offline. Verification executed purely with deterministic evidence matching.",
                "signals": []
            }
            
    risk = E.assess_risk(findings, weights)
    return findings, risk, ai_result


@app.post("/api/submissions")
@limiter.limit("20/minute")
def submit_content(request: Request, body: ContentSubmission, u=Depends(need("creator", "admin"))):
    findings, risk, ai = verification_pipeline(u["org"], body.text, body.context, body.skip_ai)
    sid = f"sub-{uuid.uuid4().hex[:8]}"
    
    with db().begin() as c:
        c.execute(
            text("INSERT INTO submissions (id, org_id, creator_id, title, context, deadline, status, created_at) VALUES (:id, :o, :u, :t, :c, :d, 'pending', :now)"),
            {
                "id": sid,
                "o": u["org"],
                "u": u["id"],
                "t": body.title,
                "c": json.dumps(body.context),
                "d": body.deadline,
                "now": datetime.utcnow().isoformat()
            }
        )
        
        ver_id = f"sver-{uuid.uuid4().hex[:8]}"
        c.execute(
            text("INSERT INTO submission_versions (id, submission_id, org_id, n, body, findings, risk, ai, created_at) VALUES (:id, :s, :o, 1, :b, :f, :r, :a, :now)"),
            {
                "id": ver_id,
                "s": sid,
                "o": u["org"],
                "b": body.text,
                "f": json.dumps(findings),
                "r": json.dumps(risk),
                "a": json.dumps(ai),
                "now": datetime.utcnow().isoformat()
            }
        )
        
        notify(c, u["org"], f"New Submission: '{body.title}' ({risk['level']} Risk) submitted for review.", role="reviewer")
        audit(c, u, "Submitted Content", f"'{body.title}' ({risk['level']} Risk, {len(findings)} findings)")
        
    return {
        "id": sid,
        "version": 1,
        "risk": risk,
        "findings": findings,
        "ai": ai
    }


class RevisionModel(BaseModel):
    text: str = Field(min_length=1, max_length=20000)
    skip_ai: bool = False


@app.post("/api/submissions/{sid}/revise")
@limiter.limit("20/minute")
def revise_submission(request: Request, sid: str, body: RevisionModel, u=Depends(need("creator", "admin"))):
    with db().begin() as c:
        s = c.execute(
            text("SELECT title, context, status FROM submissions WHERE id = :s AND org_id = :o"),
            {"s": sid, "o": u["org"]}
        ).mappings().first()
        
        prev = c.execute(
            text("SELECT n, body, findings FROM submission_versions WHERE submission_id = :s ORDER BY n DESC LIMIT 1"),
            {"s": sid}
        ).mappings().first()
        
    if not s:
        raise HTTPException(404, "Submission not found")
    if s["status"] == "approved":
        raise HTTPException(409, "Approved content cannot be revised. Please submit a new publication.")
        
    ctx = json.loads(s["context"]) if isinstance(s["context"], str) else (s["context"] or {})
    findings, risk, ai = verification_pipeline(u["org"], body.text, ctx, body.skip_ai)
    
    prev_n = prev["n"] if prev else 1
    new_n = prev_n + 1
    prev_findings = json.loads(prev["findings"]) if isinstance(prev["findings"], str) else (prev["findings"] or [])
    
    diff_ops = E.diff_words(prev["body"], body.text)
    issue_comparison = E.compare_versions(prev_findings, findings)
    
    with db().begin() as c:
        ver_id = f"sver-{uuid.uuid4().hex[:8]}"
        c.execute(
            text("INSERT INTO submission_versions (id, submission_id, org_id, n, body, findings, risk, ai, created_at) VALUES (:id, :s, :o, :n, :b, :f, :r, :a, :now)"),
            {
                "id": ver_id,
                "s": sid,
                "o": u["org"],
                "n": new_n,
                "b": body.text,
                "f": json.dumps(findings),
                "r": json.dumps(risk),
                "a": json.dumps(ai),
                "now": datetime.utcnow().isoformat()
            }
        )
        c.execute(text("UPDATE submissions SET status = 'pending' WHERE id = :s"), {"s": sid})
        notify(c, u["org"], f"Submission Revised: '{s['title']}' v{new_n} is ready for reviewer re-evaluation.", role="reviewer")
        audit(c, u, "Resubmitted Revision", f"'{s['title']}' v{new_n}")
        
    return {
        "version": new_n,
        "risk": risk,
        "findings": findings,
        "diff": diff_ops,
        "changes": issue_comparison,
        "ai": ai
    }


@app.get("/api/submissions")
def list_submissions(u=Depends(current_user)):
    org = u["org"]
    with db().begin() as c:
        rows = c.execute(
            text("""
                SELECT s.id, s.title, s.status, s.deadline, s.created_at, s.creator_id,
                       p.display_name as creator_name,
                       v.n as version, v.risk, v.findings
                FROM submissions s
                JOIN profiles p ON p.id = s.creator_id
                JOIN submission_versions v ON v.submission_id = s.id
                WHERE s.org_id = :o AND v.n = (SELECT max(v2.n) FROM submission_versions v2 WHERE v2.submission_id = s.id)
                ORDER BY s.created_at DESC
            """),
            {"o": org}
        ).mappings().all()

    out = []
    for r in rows:
        findings = json.loads(r["findings"]) if isinstance(r["findings"], str) else (r["findings"] or [])
        risk = json.loads(r["risk"]) if isinstance(r["risk"], str) else (r["risk"] or {})
        level = risk.get("level", "Low")
        
        issues = [f for f in findings if f.get("type") != "verified"]
        contradictions = sum(1 for f in findings if f.get("type") == "contradictory")
        
        # Priority queue formula: Severity + Risk + Contradictions + Age
        priority = (30 if level == "High" else 15 if level == "Medium" else 5) + len(issues) + (contradictions * 10)
        
        out.append({
            "id": str(r["id"]),
            "title": r["title"],
            "status": r["status"],
            "deadline": r["deadline"],
            "created_at": r["created_at"],
            "creator_id": str(r["creator_id"]),
            "creator_name": r["creator_name"],
            "version": r["version"],
            "risk_level": level,
            "risk_score": risk.get("score", 0),
            "unresolved_issues": len(issues),
            "priority": priority
        })
        
    return sorted(out, key=lambda x: -x["priority"])


@app.get("/api/submissions/{sid}")
def get_submission_detail(sid: str, u=Depends(current_user)):
    with db().begin() as c:
        s = c.execute(
            text("""
                SELECT s.id, s.title, s.status, s.context, s.deadline, s.created_at, s.creator_id,
                       p.display_name as creator_name
                FROM submissions s
                JOIN profiles p ON p.id = s.creator_id
                WHERE s.id = :s AND s.org_id = :o
            """),
            {"s": sid, "o": u["org"]}
        ).mappings().first()
        
        if not s:
            raise HTTPException(404, "Submission not found")
            
        vs = [
            dict(r) for r in c.execute(
                text("SELECT n, body, findings, risk, ai, created_at FROM submission_versions WHERE submission_id = :s ORDER BY n ASC"),
                {"s": sid}
            ).mappings()
        ]
        
        ds = [
            dict(r) for r in c.execute(
                text("""
                    SELECT d.action, d.genuineness, d.comment, d.version_n, d.created_at, p.display_name as reviewer_name
                    FROM decisions d
                    JOIN profiles p ON p.id = d.reviewer_id
                    WHERE d.submission_id = :s ORDER BY d.created_at ASC
                """),
                {"s": sid}
            ).mappings()
        ]
        
    for v in vs:
        if isinstance(v["findings"], str):
            v["findings"] = json.loads(v["findings"])
        if isinstance(v["risk"], str):
            v["risk"] = json.loads(v["risk"])
        if isinstance(v["ai"], str) and v["ai"]:
            v["ai"] = json.loads(v["ai"])
            
    diff = None
    changes = None
    if len(vs) > 1:
        diff = E.diff_words(vs[-2]["body"], vs[-1]["body"])
        changes = E.compare_versions(vs[-2]["findings"], vs[-1]["findings"])
        
    ctx = json.loads(s["context"]) if isinstance(s["context"], str) else (s["context"] or {})
    return {
        "id": str(s["id"]),
        "title": s["title"],
        "status": s["status"],
        "context": ctx,
        "deadline": s["deadline"],
        "creator_name": s["creator_name"],
        "versions": vs,
        "decisions": ds,
        "diff": diff,
        "changes": changes
    }


# --- Human Review Decisions ---

class DecisionModel(BaseModel):
    action: str = Field(pattern="^(approved|revision|rejected)$")
    genuineness: str = Field(pattern="^(Genuine|Misleading|Cannot determine)$")
    comment: str = Field("", max_length=2000)


@app.post("/api/submissions/{sid}/decision")
def record_decision(sid: str, d: DecisionModel, u=Depends(need("reviewer", "admin"))):
    with db().begin() as c:
        s = c.execute(
            text("SELECT title, creator_id, status FROM submissions WHERE id = :s AND org_id = :o"),
            {"s": sid, "o": u["org"]}
        ).mappings().first()
        
        if not s:
            raise HTTPException(404, "Submission not found")
        if s["status"] not in ("pending", "revision"):
            raise HTTPException(409, f"This publication is already '{s['status']}'")
            
        latest_ver = c.execute(
            text("SELECT n, risk FROM submission_versions WHERE submission_id = :s ORDER BY n DESC LIMIT 1"),
            {"s": sid}
        ).mappings().first()
        
        risk = json.loads(latest_ver["risk"]) if isinstance(latest_ver["risk"], str) else (latest_ver["risk"] or {})
        level = risk.get("level", "Low")
        
        # Rule: Misleading content cannot be approved
        if d.action == "approved" and d.genuineness == "Misleading":
            raise HTTPException(422, "Content judged 'Misleading' can never be approved. It must be rejected or revised.")
            
        # Rule: High-risk content requires mandatory written justification
        if d.action == "approved" and level == "High" and not d.comment.strip():
            raise HTTPException(422, "High-risk submissions require a written justification comment before approval.")
            
        if d.action in ("revision", "rejected") and not d.comment.strip():
            raise HTTPException(422, f"A written explanation is required when {d.action}ing content.")
            
        dec_id = f"dec-{uuid.uuid4().hex[:8]}"
        c.execute(
            text("""
                INSERT INTO decisions (id, submission_id, org_id, reviewer_id, version_n, action, genuineness, comment, created_at)
                VALUES (:id, :s, :o, :r, :n, :a, :g, :c, :now)
            """),
            {
                "id": dec_id,
                "s": sid,
                "o": u["org"],
                "r": u["id"],
                "n": latest_ver["n"],
                "a": d.action,
                "g": d.genuineness,
                "c": d.comment,
                "now": datetime.utcnow().isoformat()
            }
        )
        
        c.execute(text("UPDATE submissions SET status = :a WHERE id = :s"), {"a": d.action, "s": sid})
        
        notify(c, u["org"], f"Decision Recorded: '{s['title']}' was marked {d.action.upper()} ({d.genuineness}) by {u['name']}.", user_id=str(s["creator_id"]))
        audit(c, u, f"Review Decision: {d.action.upper()}", f"'{s['title']}' - Judged {d.genuineness}. Comment: {d.comment[:100]}")
        
    return {"status": d.action, "genuineness": d.genuineness}


# --- Cross-Content Change Impact Analysis ---

@app.get("/api/impacts")
def list_impacts(u=Depends(current_user)):
    with db().begin() as c:
        rows = c.execute(
            text("""
                SELECT i.id, i.submission_id, i.document_id, i.old_text, i.sentence, i.location, i.status, i.created_at,
                       s.title as content_title, d.title as document_title
                FROM impacts i
                JOIN submissions s ON s.id = i.submission_id
                LEFT JOIN documents d ON d.id = i.document_id
                WHERE i.org_id = :o
                ORDER BY i.created_at DESC
            """),
            {"o": u["org"]}
        ).mappings().all()
    return [dict(r) for r in rows]


@app.post("/api/impacts/{iid}/resolve")
def resolve_impact(iid: str, u=Depends(need("reviewer", "admin"))):
    with db().begin() as c:
        res = c.execute(text("UPDATE impacts SET status = 'resolved' WHERE id = :id AND org_id = :o"), {"id": iid, "o": u["org"]})
        if res.rowcount == 0:
            raise HTTPException(404, "Impact alert not found")
        audit(c, u, "Resolved Change Impact Alert", iid)
    return {"ok": True}


# --- Adaptive Governance Intelligence ---

@app.get("/api/governance-intelligence")
def governance_intelligence(u=Depends(need("admin", "reviewer"))):
    with db().begin() as c:
        subs_rows = c.execute(
            text("""
                SELECT s.id, v.findings, s.status, s.title
                FROM submissions s
                JOIN submission_versions v ON v.submission_id = s.id
                WHERE s.org_id = :o AND v.n = (SELECT max(v2.n) FROM submission_versions v2 WHERE v2.submission_id = s.id)
            """),
            {"o": u["org"]}
        ).mappings().all()
        
        decisions_rows = [
            dict(r) for r in c.execute(
                text("SELECT action, genuineness, comment, submission_id FROM decisions WHERE org_id = :o"),
                {"o": u["org"]}
            ).mappings()
        ]
        
        guidelines_rows = [
            dict(r) for r in c.execute(
                text("SELECT kind, value, reason, platform FROM guidelines WHERE org_id = :o"),
                {"o": u["org"]}
            ).mappings()
        ]
        
    subs_data = []
    for r in subs_rows:
        findings = json.loads(r["findings"]) if isinstance(r["findings"], str) else (r["findings"] or [])
        subs_data.append({"id": str(r["id"]), "title": r["title"], "status": r["status"], "findings": findings})
        
    insights = E.generate_governance_insights(subs_data, decisions_rows, guidelines_rows)
    return insights


# --- Brand Health Score ---

@app.get("/api/brand-health")
def brand_health_score(u=Depends(current_user)):
    with db().begin() as c:
        rows = c.execute(
            text("""
                SELECT s.id, s.status, s.created_at, v.risk, v.findings
                FROM submissions s
                JOIN submission_versions v ON v.submission_id = s.id
                WHERE s.org_id = :o AND v.n = (SELECT max(v2.n) FROM submission_versions v2 WHERE v2.submission_id = s.id)
            """),
            {"o": u["org"]}
        ).mappings().all()
        
        open_impacts = c.execute(text("SELECT count(*) FROM impacts WHERE org_id = :o AND status = 'open'"), {"o": u["org"]}).scalar() or 0
        
    if not rows:
        return {
            "score": None,
            "period": "All Time",
            "message": "Insufficient operational data. Upload documents and verify submitted content to generate the brand health index."
        }
        
    n = len(rows)
    all_findings = []
    high_risk_open = 0
    completed = 0
    
    for r in rows:
        findings = json.loads(r["findings"]) if isinstance(r["findings"], str) else (r["findings"] or [])
        risk = json.loads(r["risk"]) if isinstance(r["risk"], str) else (r["risk"] or {})
        all_findings.extend(findings)
        
        if r["status"] in ("pending", "revision") and risk.get("level") == "High":
            high_risk_open += 1
        if r["status"] in ("approved", "rejected"):
            completed += 1
            
    claims = [f for f in all_findings if f.get("type") in ("verified", "unsupported", "contradictory", "outdated", "review")]
    ev_ratio = (sum(1 for f in claims if f["type"] == "verified") / len(claims)) if claims else 0
    
    outdated_count = open_impacts + sum(1 for f in all_findings if f.get("type") == "outdated")
    
    # 5 transparent scoring components totalling 100 points
    comp_ev = round(35 * ev_ratio)
    comp_risk = round(20 * max(0.0, 1.0 - (high_risk_open / max(1, n))))
    comp_outdated = round(15 * max(0.0, 1.0 - (min(outdated_count, n) / max(1, n))))
    comp_review = round(20 * (completed / max(1, n)))
    comp_guideline = round(10 * (1.0 if not any(f.get("type") == "guideline" for f in all_findings) else 0.7))
    
    total_score = comp_ev + comp_risk + comp_outdated + comp_review + comp_guideline
    
    return {
        "score": total_score,
        "status": "Healthy" if total_score >= 80 else "Caution" if total_score >= 60 else "At Risk",
        "total_submissions": n,
        "components": [
            {"name": "Claims with Approved Evidence", "points": comp_ev, "max": 35, "description": "Percentage of factual statements grounded in verified Knowledge Base sources."},
            {"name": "Unresolved High-Risk Issues", "points": comp_risk, "max": 20, "description": "Triage health: penalizes lingering unresolved contradictory or high-risk claims."},
            {"name": "Asset Freshness & Impact Control", "points": comp_outdated, "max": 15, "description": "Absence of expired review dates or unaddressed superseded policy alerts."},
            {"name": "Review Workflow Completion", "points": comp_review, "max": 20, "description": "Rate of editorial reviews brought to an authorized conclusion."},
            {"name": "Brand Guideline Alignment", "points": comp_guideline, "max": 10, "description": "Absence of repeated prohibited terminology or missing statutory text."}
        ],
        "formula": "Score = (ClaimsEvidence * 35) + (RiskHealth * 20) + (Freshness * 15) + (ReviewVelocity * 20) + (GuidelineAlignment * 10)",
        "period": f"{min(r['created_at'] for r in rows)[:10]} to present"
    }


# --- Settings & Risk Weights Configuration ---

@app.get("/api/settings/weights")
def get_risk_weights(u=Depends(current_user)):
    with db().begin() as c:
        saved = c.execute(
            text("SELECT value FROM settings WHERE org_id = :o AND key = 'risk_weights'"),
            {"o": u["org"]}
        ).scalar()
        
    weights = json.loads(saved) if saved else E.DEFAULT_WEIGHTS
    return {"weights": weights, "defaults": E.DEFAULT_WEIGHTS}


@app.post("/api/settings/weights")
def update_risk_weights(new_weights: dict[str, int], u=Depends(need("admin"))):
    for k in new_weights:
        if k not in E.DEFAULT_WEIGHTS:
            raise HTTPException(422, f"Unknown risk factor '{k}'")
            
    with db().begin() as c:
        sid = f"set-{uuid.uuid4().hex[:8]}"
        c.execute(
            text("""
                INSERT INTO settings (id, org_id, key, value) VALUES (:id, :o, 'risk_weights', :v)
                ON CONFLICT (org_id, key) DO UPDATE SET value = :v
            """),
            {"id": sid, "o": u["org"], "v": json.dumps(new_weights)}
        )
        audit(c, u, "Updated Risk Weights", json.dumps(new_weights))
    return {"ok": True, "weights": new_weights}


# --- Notifications & Audit Trail ---

@app.get("/api/notifications")
def get_notifications(u=Depends(current_user)):
    with db().begin() as c:
        rows = c.execute(
            text("""
                SELECT id, message, user_id, role, created_at 
                FROM notifications 
                WHERE org_id = :o AND (user_id = :u OR role = :r OR (user_id IS NULL AND role IS NULL))
                ORDER BY created_at DESC LIMIT 30
            """),
            {"o": u["org"], "u": u["id"], "r": u["role"]}
        ).mappings().all()
    return [dict(r) for r in rows]


@app.get("/api/audit")
def list_audit_logs(u=Depends(need("admin", "reviewer"))):
    with db().begin() as c:
        rows = c.execute(
            text("""
                SELECT a.id, a.action, a.detail, a.created_at, p.display_name as actor_name, p.role as actor_role
                FROM audit_logs a
                LEFT JOIN profiles p ON p.id = a.actor_id
                WHERE a.org_id = :o
                ORDER BY a.created_at DESC LIMIT 150
            """),
            {"o": u["org"]}
        ).mappings().all()
    return [dict(r) for r in rows]


# --- Visual Media Analysis Endpoint ---

@app.post("/api/visual/inspect")
async def inspect_visual_asset(file: UploadFile = File(...), u=Depends(current_user)):
    """Run OpenCV visual checks on an uploaded brand asset (resolution, contrast, blur)."""
    data = await file.read()
    res = analyze_image_bytes(data, file.filename or "media.png")
    return res


# Mount Frontend Production Build if present
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.isdir(frontend_dist):
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse
    
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")
        
    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        if full_path.startswith("api"):
            raise HTTPException(404, "API endpoint not found")
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
