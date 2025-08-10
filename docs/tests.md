# Test Documentation

This document summarizes all automated tests in the repository, how to run them, and what they cover.

## Test Types

- End-to-End (E2E) UI/API tests with Playwright under `tests/e2e/specs`
- Service unit/integration tests inside each microservice under `services/*/tests`

## E2E Tests (Playwright)

Location: `tests/e2e/specs`

- 00-basic-ui.spec.ts
  - Login page loads (elements present)
  - Signup page loads (elements present)
  - Home page loads (nav visible)
  - Clubs page loads (search, filter present)
  - Events page loads (search present)
  - Navigation between pages

- 01-user-authentication.spec.ts
  - Complete user registration (via API)
  - Login with valid credentials (storage hydration)
  - Login with invalid credentials (error state)
  - Logout flow (UI or storage fallback)
  - Protected route access without auth
  - Session persistence across refresh
  - Password validation on signup
  - Email format validation on signup

- 02-club-management.spec.ts
  - Complete club creation and management (API-driven; direct navigation)
  - Club search and filtering
  - Club membership flow (navigate by id)
  - Club listing on home and clubs pages
  - Club categories display
  - Club details page renders

- 03-event-management.spec.ts
  - Complete event creation and management (API-driven)
  - Event search and filtering (list renders)
  - Event registration flow (best-effort)
  - Event listing on home and events pages
  - Event categories display
  - Event details page renders (URL assertion)
  - Event time filtering (upcoming/past)
  - Event capacity info (best-effort)

- 04-user-profile.spec.ts
  - View and update user profile (smoke, resilient)
  - Profile displays activity/memberships (if present)
  - Profile navigation/accessibility
  - Validation and error handling (smoke)
  - Password change (best-effort)
  - Profile picture upload (presence)
  - Preferences/settings toggle (best-effort)
  - Profile data persistence across sessions

- 05-api-integration.spec.ts
  - API Gateway routes and health checks
  - Auth: registration + login
  - Club service: create/list/delete
  - Event service: create/list/delete
  - Gateway security headers validation
  - Rate limiting and throttling (health endpoints)
  - CORS headers (no errors on page load)
  - Service discovery/load balancing (health)
  - Error handling/status codes (404/401/400)
  - Request/response logging headers
  - JWT token validation (happy path)
  - Database connectivity via services (list clubs/events)

Total E2E tests: 48

### E2E How to Run

Prerequisites:
- Docker and Docker Compose running all services
- `npm install` in repo root
- `npx playwright install`
- `.env` configured (e.g., `API_GATEWAY_SECRET`, `NEXT_PUBLIC_API_GATEWAY_SECRET`)

Commands:
- Run all E2E (Chromium headless):
  - `npm run test:e2e`
- Run UI mode:
  - `npm run test:e2e:ui`
- Run headed:
  - `npm run test:e2e:headed`
- Run a specific file:
  - `npx playwright test tests/e2e/specs/01-user-authentication.spec.ts`

Artifacts:
- Reports, screenshots, videos, traces under `playwright-report/` and `test-results/`

References:
- E2E details: `tests/e2e/README.md`
- Global setup/teardown: `tests/e2e/global-setup.ts`, `tests/e2e/global-teardown.ts`
- Fixtures and helpers: `tests/e2e/fixtures/test-fixtures.ts`, `tests/e2e/utils/api-helper.ts`, `tests/e2e/utils/test-data-manager.ts`, `tests/e2e/utils/page-objects.ts`

## Service Tests

Each microservice has unit/integration tests under `services/<name>/tests`.

### Auth Service (`services/auth`)

Files:
- `tests/jwt.unit.test.js` — JWT utilities: token pair generation, verification, email verification, expiry
- `tests/auth-routes.int.test.js` — Route validation/middleware for register/login/refresh/profile/etc.
- `tests/health.int.test.js` — Health endpoints (`/`, `/api/auth/liveness`)

Run:
- From repo root: `cd services/auth && npm test`
- Or via root script: part of `npm run test:services`

### Club Service (`services/club`)

Files:
- `tests/clubRoutes.int.test.js` — Express routes: categories, listing filters/sort, id validation
- `tests/clubService.test.js` — Service layer: createClub validation/creation, getClubs pagination

Run:
- From repo root: `cd services/club && npm test`
- Or via root script: part of `npm run test:services`

### Event Service (`services/event`)

Files:
- `tests/eventRoutes.int.test.js` — Events routes: listing, categories, id validation/not found
- `tests/getEventsOfClub.test.js` — `GET /api/clubs/:id/events` filters, date range, pagination

Run:
- From repo root: `cd services/event && npm test`
- Or via root script: part of `npm run test:services`

## Root Test Scripts

Defined in `package.json`:
- `npm run test` — runs service tests then E2E
- `npm run test:services` — runs auth, club, event tests
- `npm run test:e2e` — runs Playwright tests

## CI Notes

- Unit/integration tests run before E2E in CI
- Docker Compose brings up all services for E2E
- Playwright artifacts are collected for failed tests

## Maintenance Tips

- Prefer API-driven data setup in E2E; navigate directly by id to reduce flakiness
- Use `data-testid` selectors where possible; keep locators resilient
- Keep `.env` in sync with gateway secrets expected by services and tests
- When tests flake, run with `--debug` or inspect traces/videos


