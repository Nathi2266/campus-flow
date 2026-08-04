# Engineering Council Review: Mock-data cleanup + ADMIN production readiness

> Filled during `.kiro/workflows/engineering-council.md`. Implementation follows user directive to implement after council.

## Proposal

- **Ask / feature:** Remove mock/demo UI data for ADMIN → LECTURER → STUDENT; run full ADMIN feature verification; recommend add/reduce improvements; implement highest-impact items until production-ready.
- **Why now:** Production readiness — role UIs must show only API/DB-backed data; ADMIN capabilities need deeper E2E proof.
- **Owning specs (known):** `.kiro/specs/campusflow-roles.md`, `campusflow-frontend.md`, `campusflow-data-flows.md`, `.kiro/memory/future-features.md`
- **Opened by:** Loop Engineer
- **Verbose:** no (user did not set AEOS_VERBOSE)

## Specs loaded for council

- `.kiro/specs/campusflow-roles.md`
- `.kiro/specs/campusflow-frontend.md`
- `.kiro/specs/campusflow-data-flows.md`
- `.kiro/memory/future-features.md`
- `.kiro/constitution/definition-of-done.md` (via Loop skill knowledge)

## Seat inputs

### Product Manager

- **Stance:** support
- **Business value:** Trust — operators must not see fake credentials or pretend UI; ADMIN is the provisioning spine of CampusFlow.
- **Acceptance intent:** No plaintext demo passwords in login UI; role dashboards remain API-backed; ADMIN can exercise core CRUD paths under E2E; deferred shells stay honest (no fake toggles).
- **Conditions / risks:** Keep Flyway seed for local/E2E; document credentials in README only. Do not delete seed data as “mock.”

### Business Analyst

- **Stance:** support-with-conditions
- **Spec gaps / updates needed:** Document that demo login fillers are not part of product UX; note ADMIN E2E coverage expectations in frontend spec.
- **Domain rules cited:** `campusflow-roles.md` capability matrix; notifications remain P2 per `future-features.md`.
- **Conditions / risks:** Distinguish DB seed (legitimate) vs UI mock (remove).

### Solution Architect

- **Stance:** support
- **Architectural fit:** FE consumes APIs; seed via Flyway only. Optional `VITE_SHOW_DEMO_LOGINS` gate if local DX needed — prefer remove + README.
- **Boundaries / sequencing:** (1) remove login demo UI (2) expand ADMIN E2E (3) fix reports dept/stats consistency (4) document reduce/add backlog.
- **Conditions / risks:** Do not invent notifications API in this cycle.

### Frontend Engineer

- **Stance:** support
- **UI impact (routes/components/roles):** Remove `DEMO_ACCOUNTS` panel from `LoginPage.tsx` (all roles). Settings/Notifications already honest. Dashboards API-backed. Optional: hide `/notifications` nav until API (reduce clutter) — PM call.
- **A11y notes:** Removing demo buttons reduces accidental credential exposure; keep login form labels intact.
- **Conditions / risks:** E2E must use helper credentials, not login-page fill buttons.

### Backend Engineer

- **Stance:** support
- **API / logic impact:** No runtime mock services found. Optional: wire `departmentId` into `getStatistics` for ADMIN report filter consistency.
- **Permission enforcement notes:** ADMIN endpoints already `@PreAuthorize`; deepen negative tests later.
- **Conditions / risks:** Seed passwords stay in DB migrations for local/E2E.

### Database Engineer

- **Stance:** abstain (no schema change required for mock removal)
- **Schema / migration implications:** None for UI mock cleanup. V2/V3 seed remains.
- **Data risk:** Removing seed would empty demos — **do not remove seed** in this cycle.
- **Conditions / risks:** n/a

### QA Engineer

- **Stance:** support
- **Testing needs (from specs):** Expand ADMIN E2E beyond nav walk: departments create, users create, course activate/deactivate or edit, enrollments filter, audit row visibility, settings theme, reports stats.
- **Regression scope:** Existing role nav + data-flow tests; student IDOR; lecturer grade path.
- **Conditions / risks:** Serial Playwright; requires healthy API + seeded DB.

### Security Engineer

- **Stance:** support
- **Security concerns:** Plaintext passwords on login page are a production anti-pattern — **must remove**. Seed passwords in README for local only is acceptable.
- **Conditions / risks:** Ensure production builds never ship demo fillers (remove, don’t rely on forgetfulness).

### Performance Engineer

- **Stance:** abstain
- **Scalability / hotspots:** No mock-data performance issue. ADMIN reports/dashboard already hit multiple endpoints — out of scope for this cycle.
- **Conditions / risks:** n/a

### Optional seats

#### Documentation Engineer

- **Stance:** support
- **Findings:** Update `future-features.md` (demo fillers were claimed removed but still present); note ADMIN E2E expansion in memory; keep README seed credentials.

#### DevOps / Preview

- **Stance:** support-with-conditions
- **Findings:** E2E needs compose stack (API 8090 + UI 5173) or playwright webServer config. Verify before claiming green.

## Conflicts

| Topic | Positions | Resolution |
|-------|-----------|------------|
| Hide Notifications nav vs keep honest shell | FE: optional hide; PM: honest shell OK | **Keep route + honest empty state**; do not fake inbox. Reduce later if UX clutter. |
| Delete Flyway seed as “mock” | User “remove mock” vs BA/DB: seed ≠ mock | **Keep seed**; remove UI demo fillers only. |
| Gate demo logins via env | Architect optional gate vs Security hard remove | **Hard remove** from LoginPage; credentials only in README + e2e helpers. |

## Loop Engineer recommendation

- **Decision:** go-with-conditions
- **Summary:** Role dashboards are already live-data. Highest-impact gap is login demo credential UI (Admin/Lecturer/Student fillers). Next: deepen ADMIN E2E coverage and document admin add/reduce recommendations from test results. Optionally align reports statistics with department filter.
- **Spec updates required before code:**
  - [x] Note theme + settings honesty already in `campusflow-frontend.md`
  - [ ] Add short “Demo credentials” note: UI must not embed passwords; local seed documented in README
- **Conditions to satisfy:**
  - [x] Do not delete Flyway V2/V3 seed
  - [x] E2E continues via `helpers/auth.ts` credentials
  - [ ] ADMIN E2E expanded and executed
- **Recommended workflow:** bug-fix / production readiness loop (implement → verify → document)
- **Implementation pipeline (ordered):**
  1. Frontend: remove LoginPage demo panel (all three roles)
  2. Specs/docs: frontend + future-features + council memory
  3. QA: expand ADMIN Playwright suite
  4. Backend (if quick): department-scoped statistics for ADMIN reports
  5. Loop: run FE typecheck + Playwright + BE tests; document findings
- **DoD extras / test focus:** ADMIN departments, users, course lifecycle, audit, settings; regression other roles
- **Approved by:** user directive (“Implement, verify, document, and repeat”) — **approved**

## Next step

- [x] Update specs (BA/PM) if required
- [x] Begin implementation workflow
- [x] Verified: E2E 15/15, FE typecheck, BE unit tests (see `admin-e2e-readiness-2026-08-03.md`)
- [ ] Stop (no-go / defer)
