"""Automated verification suite for Round 3 Hackathon Deliverables:
1. Multimodal Visual Bounding-Box Flyer OCR & Inspection
2. Automated Cross-Asset Policy Reconciliation Wizard
3. Bi-Directional Pre-Publish CMS Firewall & Webhook Gateway
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app import engine as E
from app.visual import detect_flyer_text_boxes, SAMPLE_FLYER_BLOCKS


client = TestClient(app)


def get_auth_token(role="admin"):
    resp = client.post("/api/auth/demo", json={"role": role})
    assert resp.status_code == 200
    return resp.json()["access_token"]


def test_flyer_ocr_spatial_evaluation():
    """Test multimodal bounding box evaluation against Knowledge Base facts."""
    current_docs = [
        {
            "title": "Hardware Warranty Policy v2.4",
            "version": "2.4",
            "text": "All Apex hardware products purchased from authorized channels include a 2 year manufacturer warranty.",
            "effective": "2026-01-01",
            "review": "2027-01-01"
        },
        {
            "title": "Security & SLA Standards",
            "version": "1.2",
            "text": "ISO 27001 Certified with 99.9% Cloud Uptime SLA for enterprise tier customers.",
            "effective": "2026-01-01",
            "review": "2027-01-01"
        }
    ]
    superseded_docs = [
        {
            "title": "Hardware Warranty Policy v1.0",
            "version": "1.0",
            "text": "All hardware products include 3 year unlimited warranty coverage.",
            "effective": "2023-01-01",
            "review": "2024-01-01"
        }
    ]
    banned = [{"kind": "banned", "value": "100% unbreakable", "reason": "unverifiable absolute claim"}]
    required = [{"kind": "required", "value": "Terms and conditions apply", "platform": "Any"}]

    sample_blocks = [
        {
            "id": "box-1",
            "text": "ACME APEX X1 ENTERPRISE LAUNCH",
            "x": 10.0, "y": 8.0, "width": 80.0, "height": 11.0
        },
        {
            "id": "box-2",
            "text": "All Apex X1 Devices Include 3-Year Unlimited Coverage",
            "x": 10.0, "y": 25.0, "width": 80.0, "height": 14.0
        },
        {
            "id": "box-3",
            "text": "Ranked #1 Enterprise AI Hardware Worldwide",
            "x": 10.0, "y": 44.0, "width": 80.0, "height": 13.0
        },
        {
            "id": "box-4",
            "text": "ISO 27001 Certified with 99.9% Cloud Uptime SLA",
            "x": 10.0, "y": 63.0, "width": 80.0, "height": 13.0
        }
    ]

    result = E.evaluate_flyer_blocks(sample_blocks, current_docs, superseded_docs, banned, required)

    assert len(result["boxes"]) == 4
    boxes = {b["id"]: b for b in result["boxes"]}

    # Box 2 should flag contradictory claim (3-year vs current 2-year warranty)
    assert boxes["box-2"]["status"] in ("contradictory", "outdated")
    assert boxes["box-2"]["risk_level"] in ("High", "Medium")
    assert boxes["box-2"]["evidence"] is not None

    # Box 3 should flag unsupported claim (#1 ranking with no citation)
    assert boxes["box-3"]["status"] == "unsupported"

    # Box 4 should be verified by Security & SLA Standards
    assert boxes["box-4"]["status"] == "verified"
    assert boxes["box-4"]["risk_level"] == "Low"

    # Summary sanity
    summary = result["summary"]
    assert summary["total_claims"] == 4
    assert summary["verified"] >= 1
    assert summary["overall_risk"] in ("High", "Medium")


def test_flyer_opencv_detection():
    """Test OpenCV bounding box text detection with normalized coordinates."""
    boxes = detect_flyer_text_boxes(None, "sample.png")
    assert len(boxes) >= 4
    for b in boxes:
        assert 0.0 <= b["x"] <= 100.0
        assert 0.0 <= b["y"] <= 100.0
        assert b["width"] > 0
        assert b["height"] > 0
        assert len(b["text"]) > 3


def test_flyer_ocr_api_endpoint():
    """Test /api/visual/flyer-ocr endpoint via API client."""
    token = get_auth_token("admin")
    resp = client.post("/api/visual/flyer-ocr", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert "boxes" in data
    assert "summary" in data
    assert len(data["boxes"]) >= 4


def test_reconciliation_patch_generation():
    """Test automated cross-asset policy reconciliation patch generation."""
    impacts = [
        {
            "id": "imp-101",
            "submission_id": "sub-1",
            "document_id": "doc-1",
            "content_title": "Spring Campaign Flyer",
            "document_title": "Warranty Policy v2.4",
            "old_text": "All devices include 3 year warranty.",
            "sentence": "All devices include 3 year warranty."
        }
    ]
    current_docs = [
        {
            "title": "Warranty Policy v2.4",
            "version": "2.4",
            "text": "All devices include 2 year warranty.",
        }
    ]
    patches = E.generate_reconciliation_patches(impacts, current_docs)
    assert len(patches) == 1
    p = patches[0]
    assert p["impact_id"] == "imp-101"
    assert "2" in p["new_text"]
    assert any(op["op"] == "removed" and "3" in op["text"] for op in p["diff"])
    assert any(op["op"] == "added" and "2" in op["text"] for op in p["diff"])


def test_reconciliation_api_endpoints():
    """Test /api/impacts/reconciliation-plan and /api/impacts/reconcile-batch."""
    token = get_auth_token("admin")
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch reconciliation plan
    plan_resp = client.get("/api/impacts/reconciliation-plan", headers=headers)
    assert plan_resp.status_code == 200
    plan = plan_resp.json()
    assert "patches" in plan
    assert "impact_count" in plan

    # Apply batch reconciliation
    batch_resp = client.post("/api/impacts/reconcile-batch", json={"patch_ids": [], "dry_run": False}, headers=headers)
    assert batch_resp.status_code == 200
    assert batch_resp.json()["ok"] is True


def test_cms_firewall_pre_publish_blocking():
    """Test CMS pre-publish firewall blocks non-compliant publishing attempts."""
    token = get_auth_token("creator")
    headers = {"Authorization": f"Bearer {token}"}

    # High-risk payload with contradictory claim
    bad_payload = {
        "channel": "wordpress",
        "title": "Unauthorized Spring Campaign",
        "content": "Experience the groundbreaking Apex X1. All devices include a 3 year warranty. Our chassis is 100% unbreakable!",
        "author": "Marketing Team",
        "environment": "production"
    }

    resp = client.post("/api/firewall/check", json=bad_payload, headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["allowed"] is False
    assert data["action"] == "BLOCKED"
    assert data["risk_score"] >= 30
    assert data["publish_token"] is None
    assert len(data["policy_violations"]) >= 1


def test_cms_firewall_pre_publish_passing():
    """Test CMS pre-publish firewall approves compliant publishing payloads with valid token."""
    token = get_auth_token("creator")
    headers = {"Authorization": f"Bearer {token}"}

    good_payload = {
        "channel": "webflow",
        "title": "Official Product Specifications",
        "content": "All Apex hardware products include a 2 year manufacturer warranty. Terms and conditions apply.",
        "author": "PR Lead",
        "environment": "production"
    }

    resp = client.post("/api/firewall/check", json=good_payload, headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["allowed"] is True
    assert data["action"] == "PASSED"
    assert data["risk_score"] < 30
    assert data["publish_token"] is not None
    assert data["publish_token"].startswith("vrty-pub-")


def test_cms_firewall_webhook_dispatch_and_audit():
    """Test webhook simulator dispatch and audit log records."""
    token = get_auth_token("admin")
    headers = {"Authorization": f"Bearer {token}"}

    # Test webhook dispatcher
    hook_payload = {
        "endpoint_url": "https://cms.acme.corp/api/webhooks/pre-publish",
        "event": "post.publish_intercept",
        "secret_key": "vrty_sec_live_998124"
    }
    hook_resp = client.post("/api/firewall/test-webhook", json=hook_payload, headers=headers)
    assert hook_resp.status_code == 200
    hook_data = hook_resp.json()
    assert hook_data["ok"] is True
    assert "signature_sha256" in hook_data
    assert hook_data["delivery_latency_ms"] > 0

    # Test firewall audit logs
    logs_resp = client.get("/api/firewall/logs", headers=headers)
    assert logs_resp.status_code == 200
    assert isinstance(logs_resp.json(), list)
