# Engineering Council Review: Cycle 3 — bulk grades, CSV/search, notifications

> Fill during `.kiro/workflows/engineering-council.md`. **No code changes** until Loop recommendation is approved.

## Proposal

- **Ask / feature:** Ship (1) bulk grade entry on roster, (2) more report CSV + course catalogue search, (3) Notifications MVP + nav restore. Waitlists/term deferred.
- **Why now:** User-approved Feature Engineer recommendations; highest lecturer/admin daily value after prod-hygiene wave.
- **Owning specs (known):** `campusflow-grades.md`, `campusflow-frontend.md`, `campusflow-roles.md`, `database-schema.md`, new `campusflow-notifications.md`, `backend-java.md`
- **Opened by:** Loop Engineer
- **Verbose:** yes

## Specs loaded for council

- `.kiro/specs/campusflow-grades.md`
- `.kiro/specs/campusflow-frontend.md`
- `.kiro/specs/campusflow-roles.md`
- `.kiro/specs/database-schema.md`
- `.kiro/memory/feature-recommendation-2026-08-04.md`
- `.kiro/constitution/definition-of-done.md`

## Seat inputs

### Feature Engineer

- **Stance:** support
- **Findings:** Matches ranked backlog items 3–5; waitlists correctly deferred
- **Conditions:** Sequence bulk → CSV/search → notifications

### Product Manager

- **Stance:** support
- **Business value:** Lecturer grading speed; ADMIN export/search scale; in-app inbox closes empty shell
- **Acceptance intent:** Roster save-all grades; ≥2 CSV exports; course text search; notifications list/read/mark with nav
- **Conditions / risks:** Notification event set must stay small (MVP)

### Business Analyst

- **Stance:** support-with-conditions
- **Spec gaps / updates needed:** Bulk grades endpoint/rules; notifications domain spec; frontend route/nav; roles matrix rows
- **Domain rules cited:** Grade write still ADMIN|assigned LECTURER (`campusflow-grades.md`)
- **Conditions / risks:** Specs before code for notifications + bulk contract

### Solution Architect

- **Stance:** support
- **Architectural fit:** Bulk = batch of existing grade rules; CSV clone pattern; notifications new table + REST under `/api/v1/notifications`
- **Boundaries / sequencing:** Bulk + search/CSV first (no schema / small schema); notifications Flyway V6
- **Conditions / risks:** Cap bulk batch size; no email delivery in MVP (in-app only)

### Frontend Engineer

- **Stance:** support
- **UI impact:** `CourseRosterDrawer` inline + Save all; `CoursesPage` search; `ReportsPage` extra exports; `NotificationsPage` live list; `AppLayout` nav
- **A11y notes:** Label search; announce save results; unread indicators with text not color-only
- **Conditions / risks:** Update E2E that assert `nav-notifications` count 0

### Backend Engineer

- **Stance:** support
- **API / logic impact:** `PATCH .../grades/bulk` or course-scoped batch; course `search` query; more `/export`; notifications CRUD-lite
- **Permission enforcement notes:** Same as single grade; notifications own-user only; ADMIN may broadcast system events
- **Conditions / risks:** Fix course enrollments page/size while touching roster

### Database Engineer

- **Stance:** support-with-conditions
- **Schema / migration implications:** V6 `notifications` (+ optional `users.notify_in_app`); no waitlist tables
- **Data risk:** low if indexes on `user_id`, `read_at`
- **Conditions / risks:** Flyway only; no Prisma

### QA Engineer

- **Stance:** support
- **Testing needs:** Unit/security for bulk + notifications scoping; E2E grade save-all, CSV download, course search, notifications nav+read
- **Regression scope:** existing grade PATCH, reports, courses list, deactivate
- **Conditions / risks:** Seed events for E2E or create via API in test

### Security Engineer

- **Stance:** support-with-conditions
- **Security concerns:** Bulk must re-check lecturer ownership per enrollment; notifications IDOR (own only); no mass cross-tenant broadcast without ADMIN
- **Conditions / risks:** Validate batch size; sanitize CSV

### Performance Engineer

- **Stance:** support-with-conditions
- **Scalability / hotspots:** Bulk ≤100; course search indexed ILIKE on code/name; notification list paged
- **Conditions / risks:** Avoid N+1 audit writes if possible (acceptable for MVP)

### Optional seats

- **Documentation:** Update frontend/roles/grades/notifications specs + future-features
- **DevOps:** No new env vars for MVP (in-app only)

## Conflicts

| Topic | Positions | Resolution |
|-------|-----------|------------|
| Bulk FE-only vs batch API | FE loop of PATCH vs real bulk | Prefer batch API for atomic UX + fewer round-trips; same auth rules |
| Notification events | Broad vs narrow | MVP: GRADE_POSTED, ENROLLMENT_CREATED, COURSE_FULL, SYSTEM |
| Waitlists | User listed but “defer” | Defer — out of this council |

## Loop Engineer recommendation

- **Decision:** go-with-conditions
- **Summary:** Implement Cycle 3 in three slices; waitlists deferred; user approval already given for feature set.
- **Spec updates required before code:**
  - [x] `campusflow-grades.md` — bulk endpoint
  - [x] `campusflow-notifications.md` — new
  - [x] `campusflow-frontend.md` / `campusflow-roles.md` / `database-schema.md`
- **Conditions to satisfy:**
  - [x] Bulk max 100; per-item auth
  - [x] Notifications in-app only; own-user read
  - [x] Update E2E for nav-notifications
  - [x] Waitlists not in scope
- **Recommended workflow:** implement → verify DoD → document memory
- **Implementation pipeline (ordered):**
  1. BA/Docs — specs
  2. Backend + DB — bulk grades, course search, CSV exports, notifications schema/API
  3. Frontend — roster, courses search, reports, notifications + nav
  4. QA — unit + E2E updates
  5. Loop — lint/typecheck/build/tests
- **DoD extras / test focus:** bulk auth, notification IDOR, CSV buttons, course search
- **Approved by:** user (this message) — approved

## Next step

- [x] Update specs (BA/PM) if required
- [x] Begin implementation workflow
- [ ] Stop (no-go / defer)
