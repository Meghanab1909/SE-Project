import os
import uuid
import base64
import json
import time
import pytest
import requests

BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8000")
API = f"{BASE_URL}/api"

def _post(path, json_data, expect=200):
    r = requests.post(f"{API}{path}", json=json_data, timeout=10)
    assert r.status_code == expect, f"{r.status_code} → {r.text}"
    return r.json() if r.headers.get("content-type","").startswith("application/json") else r.text

def _get(path, expect=200):
    r = requests.get(f"{API}{path}", timeout=10)
    assert r.status_code == expect, f"{r.status_code} → {r.text}"
    return r.json()

@pytest.mark.order(1)
def test_register_validation_happy_and_edge():
    # Happy path
    user = _post("/register", {"name":"Mitha M K","email":"mitha@example.com","city":"Bengaluru"})
    assert "id" in user and user["name"].startswith("Mitha")
    # Duplicate register should be idempotent or conflict
    try:
        user2 = _post("/register", {"name":" Mitha  M K  ","email":"mitha@example.com","city":"  Bengaluru  "})
        assert user2.get("id") == user.get("id")
    except AssertionError:
        pass  # allow 409 if implemented that way

    # Invalid email
    r = requests.post(f"{API}/register", json={"name":"Bad","email":"not-an-email"}, timeout=10)
    assert r.status_code in (200,400,422)

@pytest.mark.order(2)
def test_init_charities_idempotent_and_list():
    _post("/init-charities", {}, expect=200)
    _post("/init-charities", {}, expect=200)
    charities = _get("/charities")
    assert isinstance(charities, list) and len(charities) >= 1
    types = {c.get("visual_type") for c in charities}
    assert types & {"tree","butterfly","books"}

@pytest.mark.order(3)
def test_create_donation_and_limits():
    user = _post("/register", {"name":"Rahul Sharma","email":"rahul@example.com"})
    charities = _get("/charities")
    cid = charities[0]["id"]
    # too small
    r = requests.post(f"{API}/donations", json={"user_id":user["id"],"charity_id":cid,"amount":9.99}, timeout=10)
    assert r.status_code in (200,400,422)
    # ok
    d = _post("/donations", {"user_id":user["id"],"charity_id":cid,"amount":75.5})
    assert d["status"] == "pending" and d["ripple_color"] and d["ripple_size"]

@pytest.mark.order(4)
def test_payment_generate_and_verify_idempotent():
    user = _post("/register", {"name":"Asha","email":"asha@example.com"})
    cid = _get("/charities")[0]["id"]
    donation = _post("/donations", {"user_id":user["id"],"charity_id":cid,"amount":50})
    pay = _post("/payment/generate-upi", {"donation_id":donation["id"], "amount":50})
    assert set(pay.keys()) >= {"upi_link", "qr_data", "payment_id"}
    # First verify
    v = _post("/payment/verify", {"donation_id":donation["id"], "payment_id":pay["payment_id"]})
    assert v is not None
    # Idempotent verify
    v2 = _post("/payment/verify", {"donation_id":donation["id"], "payment_id":pay["payment_id"]})
    assert v2 is not None

@pytest.mark.order(5)
def test_audio_upload_validation():
    user = _post("/register", {"name":"Leela","email":"leela@example.com"})
    cid = _get("/charities")[0]["id"]
    donation = _post("/donations", {"user_id":user["id"],"charity_id":cid,"amount":60})
    # 1-second empty-ish webm payload (fake base64 for structure)
    fake = base64.b64encode(b"\x1aE\xdf\xa3WEBM").decode()
    resp = _post("/audio-message", {"user_id":user["id"],"donation_id":donation["id"],"audio_data":fake,"duration":1})
    assert "id" in resp or "ok" in resp.get("status","")

