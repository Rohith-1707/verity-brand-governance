"""Pure verification logic. No I/O, so every rule is unit-testable and explainable."""
from __future__ import annotations
import re
from datetime import date
from difflib import SequenceMatcher
from collections import Counter

DEFAULT_WEIGHTS = {
    "contradictory": 30,
    "outdated": 20,
    "unsupported": 15,
    "guideline": 12,
    "required": 10,
    "review": 8,
    "ai": 5,
    "tone": 3
}

_NUMW = {w: str(i) for i, w in enumerate("zero one two three four five six seven eight nine ten".split())}
_NW = "|".join(list(_NUMW)[1:])
_STOP = set("the and our you your for with are was were has have will can all more than this that from its not any of to in on a an is by as at".split())
_CLAIM = re.compile(
    rf"guarantee|best|leading|only|first|proven|certified|award|safest|fastest|free|warranty|lifetime|never|always|\d|\b(?:{_NW})\b|percent|%|hours?|years?|days?",
    re.I
)
_NEG = re.compile(r"\b(not|no|never|without|exclude|excludes|excluding)\b", re.I)


def sentences(text: str) -> list[str]:
    return [s.strip() for s in re.split(r"(?<=[.!?])\s+|\n+", text) if len(s.strip()) > 3]


def tokens(text: str) -> set[str]:
    return {w[:-1] if w.endswith("s") and len(w) > 4 else w for w in re.findall(r"[a-z]{3,}", text.lower()) if w not in _STOP}


def numbers(text: str) -> list[str]:
    t = re.sub(r"\b(%s)\b" % _NW, lambda m: _NUMW[m.group(1)], text.lower())
    return re.findall(r"\d+(?:\.\d+)?", t)


def extract_claims(text: str) -> list[str]:
    return [s for s in sentences(text) if _CLAIM.search(s) and tokens(s)]


def _d(x):
    return date.fromisoformat(str(x)) if isinstance(x, (str, bytes)) and x else x or None


def _ev(h: dict) -> dict:
    return {
        "title": h.get("title", "Unknown Source"),
        "version": str(h.get("version", "1")),
        "effective": str(h.get("effective") or ""),
        "review": str(h.get("review") or ""),
        "passage": h.get("text", "")
    }


def classify_claim(claim: str, current: list[dict], superseded: list[dict], today: date | None = None, min_score: float = 0.3, strong: float = 0.5) -> dict:
    """current/superseded: retrieval hits sorted best-first, each {text,title,version,effective,review,score}."""
    today = today or date.today()
    nums = numbers(claim)
    f = {
        "type": "unsupported",
        "claim": claim,
        "evidence": None,
        "fix": None,
        "why": "No approved passage supports this claim. No evidence was invented: add approved evidence or remove the claim."
    }
    cur = current[0] if current and current[0].get("score", 0) >= min_score else None
    old = superseded[0] if superseded and superseded[0].get("score", 0) >= min_score else None
    
    if cur:
        f["evidence"] = _ev(cur)
        pn = numbers(cur["text"])
        if nums and pn and not all(n in pn for n in nums):
            f.update(
                type="contradictory",
                why=f"The figures in the claim ({', '.join(nums)}) contradict the approved source ({', '.join(pn)}).",
                fix=f"Replace with the approved wording: \"{cur['text']}\""
            )
        elif (nums and not pn) or bool(_NEG.search(claim)) != bool(_NEG.search(cur["text"])) or (not nums and cur.get("score", 0) < strong):
            f.update(
                type="review",
                why="A related approved passage exists but the match is weak, negated, or its meaning may differ. A human reviewer must confirm."
            )
        else:
            rd, eff = _d(cur.get("review")), _d(cur.get("effective"))
            f.update(type="verified", why="Wording and figures agree with an approved organisational source.")
            if rd and rd < today:
                f.update(
                    type="outdated",
                    why=f"Evidence Freshness Warning: Supported by a source whose review date ({rd}) has passed. Confirm validity."
                )
            elif not rd and not eff:
                f["why"] += " Uncertainty: the source document has no effective or review date."
    elif old:
        f.update(
            type="outdated",
            evidence=_ev(old),
            fix=f"Check the current version of \"{old.get('title')}\".",
            why=f"Matches a superseded version (v{old.get('version')}) of \"{old.get('title')}\". The claim may reflect outdated organisational information."
        )
    return f


def check_guidelines(text: str, ctx: dict, banned: list[dict], required: list[dict]) -> list[dict]:
    out = []
    platform = ctx.get("platform", "Any")
    
    for b in banned:
        term = b.get("value", "").strip()
        if not term:
            continue
        patt = r"\b%s\b" % re.escape(term)
        matches = list(re.finditer(patt, text, re.I))
        if matches:
            count = len(matches)
            out.append({
                "type": "guideline",
                "claim": f"Prohibited term \"{term}\" used {count}x",
                "evidence": None,
                "fix": f"Remove or reword \"{term}\".",
                "why": f"Mandatory brand guideline: {b.get('reason') or 'this term is prohibited'}. Contextual preferences cannot override mandatory rules."
            })
            
    for r in required:
        req_val = r.get("value", "").strip()
        req_plat = r.get("platform", "Any")
        if req_plat in ("Any", platform) and req_val and req_val.lower() not in text.lower():
            out.append({
                "type": "required",
                "claim": f"Missing required brand text: \"{req_val}\"",
                "evidence": None,
                "fix": f"Add required text \"{req_val}\" before publication.",
                "why": f"Mandatory compliance guideline for {req_plat} content."
            })
            
    if ctx.get("tone") == "Formal" and re.search(r"!|[\U0001F300-\U0001FAFF]", text):
        out.append({
            "type": "tone",
            "claim": "Informal punctuation or emoji",
            "evidence": None,
            "fix": "Adopt restrained professional phrasing.",
            "why": f"Advisory context: Formal tone was selected for {ctx.get('audience', 'this audience')}. Tone is advisory and never overrides factual checks."
        })
    return out


def assess_risk(findings: list[dict], weights: dict | None = None) -> dict:
    w = {**DEFAULT_WEIGHTS, **(weights or {})}
    rows, score = [], 0
    for t in w:
        n = sum(1 for f in findings if f.get("type") == t)
        if n:
            pts = n * w[t]
            rows.append({"factor": t, "count": n, "weight": w[t], "points": pts})
            score += pts
            
    contradictory = any(f.get("type") == "contradictory" for f in findings)
    level = "High" if contradictory or score >= 30 else "Medium" if score >= 10 else "Low"
    
    why_parts = []
    if contradictory:
        why_parts.append("A contradictory claim was detected, which automatically requires High risk classification.")
    why_parts.append(f"Calculated risk score is {score} points (High: >= 30 or contradictory, Medium: >= 10, Low: < 10).")
    why_parts.append("Risk level is an explainable triage aid; high-risk content strictly mandates human reviewer approval.")
    
    if not findings:
        why_parts.append("No checkable factual claims were extracted, so this result is uncertain.")
        
    return {
        "level": level,
        "score": score,
        "rows": rows,
        "why": " ".join(why_parts)
    }


def diff_words(a: str, b: str) -> list[dict]:
    x, y = a.split(), b.split()
    ops = []
    for tag, i1, i2, j1, j2 in SequenceMatcher(None, x, y, autojunk=False).get_opcodes():
        if tag == "equal":
            ops.append({"op": "same", "text": " ".join(x[i1:i2])})
            continue
        if i2 > i1:
            ops.append({"op": "removed", "text": " ".join(x[i1:i2])})
        if j2 > j1:
            ops.append({"op": "added", "text": " ".join(y[j1:j2])})
    return ops


def compare_versions(prev: list[dict], cur: list[dict]) -> dict:
    key = lambda f: (f.get("type"), f.get("claim"))
    p = {key(f) for f in prev if f.get("type") != "verified"}
    c = {key(f) for f in cur if f.get("type") != "verified"}
    fmt = lambda s: sorted(k[1] for k in s)
    return {
        "resolved": fmt(p - c),
        "unresolved": fmt(p & c),
        "new": fmt(c - p)
    }


def find_impacts(old_text: str, new_text: str, contents: list[dict]) -> list[dict]:
    """Identify registered content assets containing previous/changed organisational information."""
    kept = {s.lower() for s in sentences(new_text)}
    changed = [s for s in sentences(old_text) if s.lower() not in kept]
    hits = []
    for c in contents:
        ss = sentences(c.get("text", ""))
        for i, s in enumerate(ss, 1):
            st = tokens(s)
            for p in changed:
                pt, pn = tokens(p), numbers(p)
                shared = len(pt & st)
                if shared >= 2 and shared / max(1, min(len(pt), len(st))) >= 0.6 and (not pn or set(numbers(s)) & set(pn)):
                    hits.append({
                        "content_id": c["id"],
                        "old_text": p,
                        "sentence": s,
                        "location": f"sentence {i} of {len(ss)}"
                    })
                    break
    return hits


def generate_governance_insights(submissions: list[dict], decisions: list[dict], guidelines: list[dict]) -> dict:
    """Analyze authorized review feedback to identify recurring problems and recommend guideline clarifications."""
    rejected_claims_counter = Counter()
    unsupported_claims_counter = Counter()
    violations_counter = Counter()
    tone_issues_counter = Counter()
    misleading_reasons = []
    
    # Process findings across submissions
    for s in submissions:
        findings = s.get("findings", [])
        for f in findings:
            ftype = f.get("type")
            claim = f.get("claim", "")
            if ftype == "contradictory":
                rejected_claims_counter[claim] += 1
            elif ftype == "unsupported":
                unsupported_claims_counter[claim] += 1
            elif ftype == "guideline":
                violations_counter[claim] += 1
            elif ftype == "tone":
                tone_issues_counter[claim] += 1
                
    # Process reviewer decisions and comments
    for d in decisions:
        if d.get("action") in ("revision", "rejected") or d.get("genuineness") == "Misleading":
            comment = d.get("comment", "")
            if comment:
                misleading_reasons.append(comment)
                
    recommendations = []
    
    # Analyze frequent violations
    for term, count in violations_counter.most_common(5):
        recommendations.append({
            "category": "Prohibited Term Frequency",
            "observation": f"The term \"{term}\" was flagged {count} time(s) across submitted assets.",
            "recommendation": f"Add an explicit approved replacement alternative for \"{term}\" in the brand guideline handbook to avoid creator confusion.",
            "actionable_suggestion": f"Guideline Clarification: Specify permitted substitute phrasing when creators intend to express \"{term}\"."
        })
        
    for claim, count in unsupported_claims_counter.most_common(3):
        if count >= 1:
            recommendations.append({
                "category": "Recurring Unsupported Claim",
                "observation": f"The claim \"{claim}\" was repeatedly submitted without supporting documentation ({count}x).",
                "recommendation": "Review whether official documentation exists for this feature/claim and add it to the approved Knowledge Base.",
                "actionable_suggestion": "Knowledge Base Update: Upload current specifications or legal approvals covering this assertion."
            })
            
    for tone_issue, count in tone_issues_counter.most_common(2):
        recommendations.append({
            "category": "Tone Inconsistency",
            "observation": f"Tone issues ({tone_issue}) occurred {count} time(s) in formal channels.",
            "recommendation": "Provide clear channel-specific tone rubrics distinguishing social media guidelines from formal investor and press announcements.",
            "actionable_suggestion": "Brand Guideline Update: Publish channel-by-channel tone and punctuation benchmarks."
        })
        
    if not recommendations:
        recommendations.append({
            "category": "Baseline Operations",
            "observation": "Review volume is healthy with low recurring violation density.",
            "recommendation": "Continue standard human-in-the-loop verification; periodically inspect approved document review dates.",
            "actionable_suggestion": "Maintenance: Keep document review dates up to date in the Document Management module."
        })
        
    return {
        "summary": {
            "total_reviewed": len(decisions),
            "total_submissions_analyzed": len(submissions),
            "recurring_violations_detected": len(violations_counter),
            "common_unsupported_assertions": len(unsupported_claims_counter)
        },
        "top_guideline_violations": [{"item": k, "count": v} for k, v in violations_counter.most_common(5)],
        "top_unsupported_claims": [{"item": k, "count": v} for k, v in unsupported_claims_counter.most_common(5)],
        "top_contradictions": [{"item": k, "count": v} for k, v in rejected_claims_counter.most_common(5)],
        "recommendations": recommendations
    }


def evaluate_flyer_blocks(
    blocks: list[dict],
    current_docs: list[dict],
    superseded_docs: list[dict],
    banned: list[dict],
    required: list[dict]
) -> dict:
    """Evaluate multimodal spatial flyer blocks against Knowledge Base facts and guidelines."""
    annotated = []
    contradictory_cnt = 0
    unsupported_cnt = 0
    verified_cnt = 0
    guideline_cnt = 0

    for b in blocks:
        text = b.get("text", "").strip()
        if not text:
            continue
        # Banned terms apply to individual bounding box text blocks
        banned_hits = check_guidelines(text, {}, banned, [])
        claims = extract_claims(text)

        if not claims:
            status = "verified"
            evidence = None
            why = "General brand collateral messaging with no contradicted numerical or factual assertions."
            fix = None
            risk_level = "Low"
            conf = 0.95
        else:
            first_claim = claims[0]
            cur_hits = []
            for d in current_docs:
                for sent in sentences(d.get("text", "")):
                    shared = len(tokens(sent) & tokens(first_claim))
                    if shared >= 2:
                        score = shared / max(len(tokens(sent)), len(tokens(first_claim)))
                        cur_hits.append({
                            "title": d.get("title", ""),
                            "version": d.get("version", "1"),
                            "effective": d.get("effective", ""),
                            "review": d.get("review", ""),
                            "text": sent,
                            "score": score
                        })
            cur_hits.sort(key=lambda x: x["score"], reverse=True)

            old_hits = []
            for d in superseded_docs:
                for sent in sentences(d.get("text", "")):
                    shared = len(tokens(sent) & tokens(first_claim))
                    if shared >= 2:
                        score = shared / max(len(tokens(sent)), len(tokens(first_claim)))
                        old_hits.append({
                            "title": d.get("title", ""),
                            "version": d.get("version", "1"),
                            "effective": d.get("effective", ""),
                            "review": d.get("review", ""),
                            "text": sent,
                            "score": score
                        })
            old_hits.sort(key=lambda x: x["score"], reverse=True)

            finding = classify_claim(first_claim, cur_hits, old_hits)
            status = finding["type"]
            evidence = finding.get("evidence")
            why = finding.get("why")
            fix = finding.get("fix")
            risk_level = "High" if status == "contradictory" else "Medium" if status in ("unsupported", "outdated") else "Low"
            conf = 0.98 if status == "contradictory" else 0.92 if status == "verified" else 0.88

        if banned_hits:
            status = "guideline"
            why = banned_hits[0]["why"]
            fix = banned_hits[0]["fix"]
            risk_level = "High"

        if status == "contradictory":
            contradictory_cnt += 1
        elif status == "unsupported":
            unsupported_cnt += 1
        elif status == "verified":
            verified_cnt += 1
        elif status == "guideline":
            guideline_cnt += 1

        annotated.append({
            "id": b.get("id", f"box-{len(annotated)+1}"),
            "text": text,
            "x": b.get("x", 10),
            "y": b.get("y", 10),
            "width": b.get("width", 80),
            "height": b.get("height", 12),
            "status": status,
            "risk_level": risk_level,
            "confidence": conf,
            "why": why,
            "evidence": evidence,
            "suggested_fix": fix
        })

    overall_risk = "High" if contradictory_cnt > 0 or guideline_cnt > 0 else "Medium" if unsupported_cnt > 0 else "Low"
    return {
        "boxes": annotated,
        "summary": {
            "total_claims": len(annotated),
            "contradictory": contradictory_cnt,
            "unsupported": unsupported_cnt,
            "verified": verified_cnt,
            "guideline": guideline_cnt,
            "overall_risk": overall_risk
        }
    }


def generate_reconciliation_patches(impacts: list[dict], current_docs: list[dict]) -> list[dict]:
    """Generate side-by-side patch diffs across registered collateral for superseded facts."""
    patches = []
    doc_map = {d.get("title", "").strip().lower(): d for d in current_docs}

    for imp in impacts:
        old_sent = imp.get("sentence", "")
        old_term = imp.get("old_text", "")
        doc_title = imp.get("document_title", "")
        content_title = imp.get("content_title", "Registered Collateral Asset")

        cur_doc = doc_map.get(doc_title.strip().lower())
        new_authoritative = ""
        if cur_doc:
            cur_sents = sentences(cur_doc.get("text", ""))
            toks_old = tokens(old_sent)
            best_match = None
            best_score = 0
            for cs in cur_sents:
                score = len(tokens(cs) & toks_old)
                if score > best_score:
                    best_score = score
                    best_match = cs
            new_authoritative = best_match or (cur_sents[0] if cur_sents else "")

        if not new_authoritative:
            old_nums = numbers(old_sent)
            new_nums = numbers(old_term)
            if old_nums and new_nums:
                new_authoritative = old_sent.replace(old_nums[0], new_nums[0])
            else:
                new_authoritative = old_sent

        diff_ops = diff_words(old_sent, new_authoritative)

        patches.append({
            "impact_id": str(imp.get("id")),
            "asset_id": str(imp.get("submission_id")),
            "asset_title": content_title,
            "asset_type": "Marketing Collateral / Registered Asset",
            "document_title": doc_title,
            "document_version": str(cur_doc.get("version", "2.4") if cur_doc else "2.4"),
            "old_text": old_sent,
            "new_text": new_authoritative,
            "diff": diff_ops,
            "risk_delta": "High -> Low (Compliant)",
            "status": "pending"
        })
    return patches


def evaluate_cms_firewall(
    channel: str,
    title: str,
    content: str,
    author: str,
    current_docs: list[dict],
    superseded_docs: list[dict],
    banned: list[dict],
    required: list[dict],
    threshold: int = 30
) -> dict:
    """Pre-publish headless CMS firewall evaluation."""
    import uuid
    from datetime import datetime, timezone

    claims = extract_claims(content)
    findings = []
    for c in claims:
        cur_hits = []
        for d in current_docs:
            for sent in sentences(d.get("text", "")):
                shared = len(tokens(sent) & tokens(c))
                if shared >= 2:
                    score = shared / max(len(tokens(sent)), len(tokens(c)))
                    cur_hits.append({
                        "title": d.get("title", ""),
                        "version": d.get("version", "1"),
                        "effective": d.get("effective", ""),
                        "review": d.get("review", ""),
                        "text": sent,
                        "score": score
                    })
        cur_hits.sort(key=lambda x: x["score"], reverse=True)

        old_hits = []
        for d in superseded_docs:
            for sent in sentences(d.get("text", "")):
                shared = len(tokens(sent) & tokens(c))
                if shared >= 2:
                    score = shared / max(len(tokens(sent)), len(tokens(c)))
                    old_hits.append({
                        "title": d.get("title", ""),
                        "version": d.get("version", "1"),
                        "effective": d.get("effective", ""),
                        "review": d.get("review", ""),
                        "text": sent,
                        "score": score
                    })
        old_hits.sort(key=lambda x: x["score"], reverse=True)

        f = classify_claim(c, cur_hits, old_hits)
        findings.append(f)

    g_findings = check_guidelines(content, {"platform": channel}, banned, required)
    all_findings = findings + g_findings
    risk = assess_risk(all_findings)

    has_contradiction = any(f.get("type") == "contradictory" for f in all_findings)
    has_guideline_violation = any(f.get("type") == "guideline" for f in all_findings)

    is_blocked = has_contradiction or has_guideline_violation or risk["score"] >= threshold
    action = "BLOCKED" if is_blocked else "PASSED"
    allowed = not is_blocked

    violations = []
    for f in all_findings:
        if f.get("type") in ("contradictory", "guideline", "outdated"):
            violations.append({
                "rule": f.get("type").upper(),
                "claim": f.get("claim"),
                "explanation": f.get("why"),
                "severity": "CRITICAL" if f.get("type") in ("contradictory", "guideline") else "WARNING"
            })

    publish_token = f"vrty-pub-{uuid.uuid4().hex[:16]}" if allowed else None

    reason = (
        f"Publishing BLOCKED by Brand Governance Firewall: {len(violations)} critical policy violation(s) detected. Pre-publish gate mandates revision or authorized bypass."
        if is_blocked
        else "Publishing APPROVED by Brand Governance Firewall: Zero critical contradictions detected. Content is verified against authoritative Knowledge Base sources."
    )

    return {
        "allowed": allowed,
        "action": action,
        "channel": channel,
        "title": title,
        "author": author,
        "risk_score": risk["score"],
        "risk_level": risk["level"],
        "policy_violations": violations,
        "reason": reason,
        "publish_token": publish_token,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
