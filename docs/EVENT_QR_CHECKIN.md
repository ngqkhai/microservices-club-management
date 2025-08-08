## Event QR Ticketing & Check‑in (Planned)

Status: Planned. This feature is not implemented yet. This document outlines the intended design and will be used as a reference when we implement it later.

### Goals
- Issue QR “tickets” to registered attendees
- Scan and verify tickets on-site to mark attendance
- Prevent fraud/replay; keep the flow fast and reliable

### Workflow Overview
1) Join: user POST `/api/events/:id/join` → Registration.status = `registered`
2) Ticket (on demand): user GET `/api/events/:id/ticket` → return short‑lived signed token (QR)
3) Check‑in (staff): manager POST `/api/events/:id/check-in` with `{ qr_token }` → verify and set Registration.status = `attended`
4) Leave: user DELETE `/api/events/:id/leave` → status = `cancelled`, invalidate any prior tokens

### Backend Endpoints (to add)
- GET `/api/events/:id/ticket` (user)
  - Requires active registration; returns `{ qr_token, expires_at }`
  - Issues short‑lived JWT (e.g., 60–120s TTL) with claims:
    - `typ: "event_ticket"`, `evt` (eventId), `reg` (registrationId), `uid` (userId), `iat`, `exp`, `jti`
  - Persist `last_jti` (+ optional `last_token_exp`) on the registration

- POST `/api/events/:id/check-in` (manager/organizer)
  - Body: `{ qr_token }`
  - Verifies signature and expiration; ensures:
    - Registration exists and is currently `registered`
    - `jti` matches latest stored `last_jti`
    - Not already `attended`
  - Marks `status = attended`, sets `check_in_at`, `check_in_by`

- Optional:
  - POST `/api/events/:id/registrations/:regId/ticket/revoke`
  - GET `/api/events/:id/registrations/:regId/ticket` (manager re-issue)

### Data Model (registration) – to extend
- `status`: `registered` | `attended` | `cancelled`
- `registered_at`, `check_in_at`, `check_in_by`
- `last_jti`, `last_token_exp` (anti‑replay)

### Security Notes
- RS256 JWT; private key held only by event-service
- Very short TTL; rotate tokens (new `jti` on each issuance)
- Rate‑limit GET `/ticket` per user/event (e.g., 1 per 15–30s)
- Enforce roles on `/check-in`; log who scanned and when

### Frontend (to build)
- Event detail (registered user): “Vé/QR” modal
  - Fetch `/ticket`; render QR; auto-refresh token periodically
- Manager check‑in page: `/clubs/[club_id]/manage/events/[event_id]/check-in`
  - Camera scanning (e.g., `@zxing/browser`), torch toggle, feedback UI
  - POST `/check-in` with `qr_token`; show attendee info & status
  - Fallback manual code input

### Kong Routes (to add)
- GET `/api/events/[a-fA-F0-9]{24}/ticket` → event-service (JWT + api-gateway-secret)
- POST `/api/events/[a-fA-F0-9]{24}/check-in` → event-service (JWT + api-gateway-secret)

### Join/Leave Edge Cases
- Leaving invalidates prior tokens (clear `last_jti/last_token_exp`)
- Re‑join re‑enables issuance; next `/ticket` gets a fresh `jti`

### Implementation Phases
1) Backend: endpoints, JWT signing/verification, data fields, Kong routes
2) Frontend: QR modal + scanner page
3) Observability: logs/metrics, rate‑limits, tests

This document is a placeholder note. We’ll implement the above in subsequent tasks.


