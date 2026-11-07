"""Automated tests for VERITY's core innovations and new enhancements."""
from datetime import date
import io
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app import engine as E
from app.visual import analyze_image_bytes
import numpy as np
import cv2


@pytest.fixture
def client():
    return TestClient(app)


def test_demo_auth_flow(client):
    """Test demo login for all 3 roles: admin, creator, reviewer."""
    for role in ("admin", "creator", "reviewer"):
        resp = client.post("/api/auth/demo", json={"role": role})
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["user"]["role"] == role
        
        # Test /api/me with returned bearer token
        token = data["access_token"]
        me_resp = client.get("/api/me", headers={"Authorization": f"Bearer {token}"})
        assert me_resp.status_code == 200
        assert me_resp.json()["role"] == role


def test_submission_and_review_workflow(client):
    """Test creator content submission -> risk assessment -> reviewer approval."""
    # 1. Login as creator
    creator_tok = client.post("/api/auth/demo", json={"role": "creator"}).json()["access_token"]
    headers = {"Authorization": f"Bearer {creator_tok}"}
    
    # 2. Submit content with contradictory warranty (3 years instead of approved 2 years) and missing disclaimer
    sub_payload = {
        "title": "Spring Campaign Press Release",
        "text": "The new Apex X1 includes a 3 year warranty. It features the fastest processing in its class! Terms and conditions apply.",
        "context": {"platform": "Website", "audience": "General Public", "tone": "Professional"},
        "skip_ai": True
    }
    sub_resp = client.post("/api/submissions", json=sub_payload, headers=headers)
    assert sub_resp.status_code == 200
    sub_data = sub_resp.json()
    sid = sub_data["id"]
    assert sub_data["risk"]["level"] == "High"  # Contradictory claim forces High risk
    
    # Check contradictory finding
    has_contradictory = any(f["type"] == "contradictory" for f in sub_data["findings"])
    assert has_contradictory
    
    # 3. Login as reviewer
    rev_tok = client.post("/api/auth/demo", json={"role": "reviewer"}).json()["access_token"]
    rev_headers = {"Authorization": f"Bearer {rev_tok}"}
    
    # 4. Reviewer tries to approve High risk content without comment (must fail with 422)
    bad_dec = client.post(f"/api/submissions/{sid}/decision", json={
        "action": "approved",
        "genuineness": "Genuine",
        "comment": ""
    }, headers=rev_headers)
    assert bad_dec.status_code == 422
    
    # 5. Reviewer requests revision
    rev_dec = client.post(f"/api/submissions/{sid}/decision", json={
        "action": "revision",
        "genuineness": "Cannot determine",
        "comment": "Please correct the warranty to 2 years as per current Apex X1 policy."
    }, headers=rev_headers)
    assert rev_dec.status_code == 200
    assert rev_dec.json()["status"] == "revision"
    
    # 6. Creator revises content with correct 2 year warranty
    rev_payload = {
        "text": "The new Apex X1 includes a 2 year warranty. It features the fastest processing in its class! Terms and conditions apply.",
        "skip_ai": True
    }
    revise_resp = client.post(f"/api/submissions/{sid}/revise", json=rev_payload, headers=headers)
    assert revise_resp.status_code == 200
    revised_data = revise_resp.json()
    assert revised_data["version"] == 2
    assert "diff" in revised_data
    # Previously contradictory claim should be resolved
    assert any("3" in op["text"] and op["op"] == "removed" for op in revised_data["diff"])


def test_brand_health_and_governance_intelligence(client):
    admin_tok = client.post("/api/auth/demo", json={"role": "admin"}).json()["access_token"]
    headers = {"Authorization": f"Bearer {admin_tok}"}
    
    # Check Brand Health endpoint
    bh_resp = client.get("/api/brand-health", headers=headers)
    assert bh_resp.status_code == 200
    bh_data = bh_resp.json()
    assert "score" in bh_data
    assert "components" in bh_data
    assert len(bh_data["components"]) == 5
    
    # Check Governance Intelligence endpoint
    gov_resp = client.get("/api/governance-intelligence", headers=headers)
    assert gov_resp.status_code == 200
    gov_data = gov_resp.json()
    assert "recommendations" in gov_data
    assert "summary" in gov_data


def test_visual_asset_inspection(client):
    """Test visual brand asset quality check with OpenCV."""
    admin_tok = client.post("/api/auth/demo", json={"role": "admin"}).json()["access_token"]
    headers = {"Authorization": f"Bearer {admin_tok}"}
    
    # Create synthetic test image (800x600 high contrast sharp image)
    img = np.zeros((600, 800, 3), dtype=np.uint8)
    cv2.putText(img, "VERITY BRAND GOVERNANCE", (50, 300), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 255, 200), 3)
    _, buf = cv2.imencode(".png", img)
    img_bytes = buf.tobytes()
    
    # Direct analysis test
    analysis = analyze_image_bytes(img_bytes, "banner.png")
    assert analysis["valid"] is True
    assert analysis["width"] == 800
    assert analysis["height"] == 600
    assert analysis["aspect_ratio"] == 1.33
    
    # API inspection test
    resp = client.post(
        "/api/visual/inspect",
        files={"file": ("banner.png", img_bytes, "image/png")},
        headers=headers
    )
    assert resp.status_code == 200
    res_data = resp.json()
    assert res_data["valid"] is True
    assert res_data["width"] == 800
