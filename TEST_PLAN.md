# MicroSpark Test Suite — Unit, Validation, and Security Cases

> Scope: FastAPI backend (MongoDB via Motor), React frontend (RegistrationSpace, DonationHub, PaymentCube, TimelineGarden, AudioRecorder). Endpoints observed in the codebase and UI calls:
>
> - `POST /api/register`
> - `POST /api/init-charities`
> - `GET  /api/charities`
> - `GET  /api/donations?limit=N`
> - `POST /api/donations`
> - `POST /api/payment/generate-upi`
> - `POST /api/payment/verify`
> - `POST /api/audio-message`

**Test Categories**
1. Unit tests (pure functions & small units)
2. Validation tests (payload & form validation, boundary/value analysis)
3. Security tests (OWASP ASVS-aligned negative cases for API + uploads + Mongo)

---

## 1) Unit Test Cases (Backend helpers & deterministic units)

### U1. Ripple property mapping
- **ID:** U1
- **Component:** `calculate_ripple_properties(amount)`
- **Preconditions:** Function available.
- **Steps & Data:**
  1. amount = 0.99 → expect size = 1 (min clamp), color = low-tier color.
  2. amount = 10 → size ≈ 1, color low-tier.
  3. amount = 50 → boundary: verify color tier transition.
  4. amount = 99.99 → high end of second tier color.
  5. amount = 100 → boundary to next tier.
  6. amount = 499.99 → boundary before premium tier.
  7. amount = 500 → premium tier color.
  8. amount = 999999 → size clamp = 10 (max clamp).
- **Expected:** Size ∈ [1,10], deterministic color per tier; monotonic size wrt amount; exact color hex values per band.

### U2. UPI link/QR payload builder
- **ID:** U2
- **Component:** Payment link generator used by `POST /api/payment/generate-upi`
- **Steps & Data:**
  1. donation_id = UUIDv4, amount = 49.5 → UPI string contains `pa=`, `pn=`, `am=49.5` (two decimals normalized), `tn=` donation ref.
  2. upi_id override provided (e.g., `mitha@ybl`) → replaces default payee.
  3. Unicode donor/charity names → URL-encoded in UPI string.
  4. Very long `tn` → truncated to spec-safe length.
- **Expected:** Valid UPI URI; stable hashing of `payment_id`; rejects negative/zero amounts.

### U3. Donation status lifecycle
- **ID:** U3
- **Component:** Donation entity transitions
- **Steps:** Create donation → `status="pending"`. After verify webhook/API → `completed` and `payment_timestamp` set (UTC ISO); failure path sets `failed` and reason.
- **Expected:** Only allowed transitions (`pending→completed/failed`), idempotent verify (second verify no double credit).

### U4. Avatar/initials helper
- **ID:** U4
- **Component:** Initials derive from name; color hash → HEX.
- **Data:** `"Mitha M K" → "MMK"`; single-word names, names with emojis, non-Latin scripts.
- **Expected:** Non-empty initials; colors always `#[0-9A-Fa-f]{6}`.

---

## 2) Validation Test Cases (API payloads & UI forms)

### V1. Registration payload validation
- **Endpoint:** `POST /api/register`
- **Happy-path:** `{ name: "Mitha M K", email: "mitha@example.com", city: "Bengaluru" }`
- **Edge/Negative:**
  - Empty name → 422
  - Email missing `@` / IDN email → normalize/punycode or 422
  - Extra unexpected fields (e.g., `role: "admin"`) → ignored (Pydantic `extra="ignore"`) or 422 if forbidden
  - Leading/trailing spaces normalized
- **Expected:** JSON schema enforced; idempotent registration for same email creates/returns same user (or 409).

### V2. Charity bootstrap/init
- **Endpoint:** `POST /api/init-charities`
- **Cases:** Calling twice is idempotent; verifies at least N demo charities created with distinct `visual_type` in {tree,butterfly,books}.

### V3. List charities
- **Endpoint:** `GET /api/charities`
- **Filters:** None in UI; enforce max page size default (e.g., 50).
- **Expected:** Sorted by `created` desc; fields do not expose internal keys (no `_id`, no secrets).

### V4. Create donation
- **Endpoint:** `POST /api/donations`
- **Happy:** `{ user_id, charity_id, amount: 75.50 }`
- **Boundaries:** 9.99 (reject), 10 (min), 100000 (max configurable), non-integer cents, non-numeric string `"50"` → 422.
- **Expected:** Returns ripple properties `size/color`; `status="pending"`; server timestamps in UTC.

### V5. Fetch donations (activity feed)
- **Endpoint:** `GET /api/donations?limit=50`
- **Cases:** limit > 100 → clamp to 100; negative limit → 400; default limit 20.
- **Expected:** Each donation masks sensitive fields (no payment tokens), includes `ripple_color`, `ripple_size`.

### V6. Generate UPI payment
- **Endpoint:** `POST /api/payment/generate-upi`
- **Data:** donation exists and pending; amount matches donation.
- **Negatives:** donation not found → 404; status not pending → 409; amount mismatch → 409; invalid upi_id → 422.
- **Expected:** Response contains `upi_link`, `qr_data` (base64 PNG), `payment_id` (uuid/nonce).

### V7. Verify payment
- **Endpoint:** `POST /api/payment/verify`
- **Happy:** valid `payment_id`, bank-verified; donation updated to completed; user hope points increment.
- **Idempotency:** repeated verify returns 200 with no double update.
- **Negatives:** forged `payment_id`, donation mismatch, stale timestamp → 400/409.
- **Expected:** Atomic update (compare-and-set) on `{id,status=pending}`.

### V8. Audio message upload
- **Endpoint:** `POST /api/audio-message`
- **Data:** base64 webm under 2MB; duration ≤ 60s.
- **Negatives:** oversized (>2MB) → 413; invalid base64 → 422; MIME sniffing mismatch; duration > limit → 400.
- **Expected:** Stored with content hash, returns URL/id, strips dangerous metadata (no EXIF/GPS) even if audio format supported.

### V9. CORS/Origin validation
- **Scenario:** Browser from unknown `Origin` tries to call API.
- **Expected:** Only allowed origins from `.env` CORS list; preflight `OPTIONS` includes correct headers; reject wildcard `*` with credentials.

### V10. Frontend form validation (humanised)
- **Story:** *Asha from Kochi, on 3G mobile, donates ₹10 after typos.*
- **Cases:** debounce on amount input; prevents submission while `amount < 10`; shows friendly error; retains selected charity; supports paste of value like `" 50 "` with trim.

---

## 3) Security Test Cases (API & storage)

Aligning to OWASP ASVS 4.0 and API Security Top 10.

### S1. NoSQL injection via Mongo query operators
- **Endpoints:** any filterable ones (e.g., `/api/donations?user_id=`)
- **Payloads:** `{ "$ne": null }`, `{ "$gt": "" }`, wrapped as JSON strings in fields; arrays for expected scalars.
- **Expected:** Parameters treated as strings; no operator expansion; server uses typed models; rejects JSON bodies where not expected.

### S2. Mass assignment
- **Endpoint:** `POST /api/donations`
- **Payload:** Includes forbidden fields: `status="completed"`, `txn_id="abc"`, `payment_timestamp="..."`.
- **Expected:** Extra fields ignored (`extra="ignore"`); server never trusts client to set server-managed fields.

### S3. ID enumeration / access control
- **Scenario:** Attacker guesses `donation_id` UUID and tries `/api/payment/verify`.
- **Expected:** Verify requires server-known `payment_id` binding; mismatches rejected; no verbose error leaking which id exists.

### S4. Rate limiting / replay
- **Endpoints:** `/api/payment/generate-upi`, `/api/payment/verify`
- **Test:** Burst 30 requests for same donation; verify only first succeeds, others 409/429; `payment_id` is single-use nonce.

### S5. File upload hardening (audio)
- **Tests:** Polyglot files, double extensions `voice.webm.exe`, excessive duration, malformed chunks; ensure server checks size, content-type, Magic bytes.
- **Expected:** Rejection with 4xx; no processing by external shells; storage path is randomized; no path traversal in filenames.

### S6. CORS/CSRF
- **Test:** Cross-site script POSTing form to API; check if API requires same-origin for state-changing ops or uses CSRF tokens when cookies are used (if cookies ever enabled).
- **Expected:** Since API is tokenless public, require `Sec-Fetch-*` and Origin checks; no cookie-based auth by default; otherwise enforce CSRF.

### S7. Secrets and error handling
- **Test:** Trigger server errors; logs must not leak `.env` values or stack traces in responses; production `DEBUG=False` equivalent.
- **Expected:** 500 returns generic message; details only in server logs.

### S8. Input size & DoS
- **Test:** Oversized JSON bodies (5–20MB); deeply nested JSON; huge `audio_data` base64; large `limit` param.
- **Expected:** Request size limit; `limit` clamped; timeouts set on httpx outbound; Mongo queries bounded by indexes and timeouts.

### S9. Content Security (frontend)
- **Test:** Ensure QR text and charity names are escaped in React; attempt XSS via charity name like `<img src onerror=alert(1)>`.
- **Expected:** React auto-escapes; no `dangerouslySetInnerHTML` used for untrusted content.

---

## Traceability Matrix (subset)

| Req | Area | Test IDs |
|-----|------|----------|
| Donations ≥ ₹10 | Validation | V4, U1 |
| UPI link generation | Unit/Validation | U2, V6 |
| Payment completion idempotency | Unit/Security | U3, V7, S4 |
| Audio upload ≤ 60s, ≤ 2MB | Validation/Security | V8, S5 |
| CORS restricted | Security | V9, S6 |

---

## How to Run (PyTest skeletons)

- Unit tests that don't require a live DB can run directly: `pytest -q tests/test_unit_*.py`
- API tests are provided in a way that **can** run against a live backend at `BASE_URL` (env). If you wire `server.app` (FastAPI instance) later, flip the fixture to `TestClient`.

