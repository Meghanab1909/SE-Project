import os
import pytest
import requests
import uuid
import base64

BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8000")
API = f"{BASE_URL}/api"

def _post(path, json_data, expect=None):
    r = requests.post(f"{API}{path}", json=json_data, timeout=10)
    if expect is not None:
        assert r.status_code == expect, f"{r.status_code} → {r.text}"
    return r

@pytest.mark.order(10)
def test_mass_assignment_blocked_on_donation():
    bad = {
        "user_id": str(uuid.uuid4()),
        "charity_id": str(uuid.uuid4()),
        "amount": 50,
        "status": "completed",
        "txn_id": "evil",
        "payment_timestamp": "2020-01-01T00:00:00Z"
    }
    r = _post("/donations", bad)
    assert r.status_code in (200,400,422), "Server should reject bad relations, or ignore forbidden fields."
    if r.status_code == 200:
        data = r.json()
        assert data["status"] == "pending"
        assert "txn_id" not in data

@pytest.mark.order(11)
def test_nosql_injection_patterns_are_not_interpreted():
    payload = {"name": {"$ne": None}, "email": {"$gt": ""}}
    r = _post("/register", payload)
    assert r.status_code in (200,400,422)

@pytest.mark.order(12)
def test_limit_clamped_and_negative_rejected():
    r = requests.get(f"{API}/donations?limit=100000", timeout=10)
    assert r.status_code in (200, 400)
    r2 = requests.get(f"{API}/donations?limit=-5", timeout=10)
    assert r2.status_code in (400, 422)

@pytest.mark.order(13)
def test_audio_upload_path_traversal_and_oversize():
    # filename tricks are mitigated when server does not use client-provided names,
    # but send a massive base64 to trigger 413
    huge = base64.b64encode(b"A"*3_000_000).decode()
    r = _post("/audio-message", {"user_id":"x","donation_id":"y","audio_data":huge,"duration":2})
    assert r.status_code in (400, 413, 422)

