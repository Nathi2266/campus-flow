# Engineering Council Review: ADMIN Cycle 2 production backlog

> `.kiro/workflows/engineering-council.md` — approved by user directive to implement after council.

## Proposal

- **Ask / feature:** Notifications (MVP or hide nav), user deactivate/delete, user search, report CSV export, lecturer temp-password/invite, ADMIN-only API security integration tests.
- **Why now:** Highest-impact ADMIN production gaps from prior readiness review.
- **Owning specs:** `campusflow-roles.md`, `campusflow-frontend.md`, `campusflow-data-flows.md`
- **Opened by:** Loop Engineer
- **Verbose:** no

## Specs loaded for council

- `.kiro/specs/campusflow-roles.md`
- `.kiro/specs/campusflow-frontend.md`
- `.kiro/memory/future-features.md`
- `.kiro/memory/admin-e2e-readiness-2026-08-03.md`

## Seat inputs

### Product Manager

- **Stance:** support
- **Business value:** ADMIN provisioning + trust (no dead nav, retire accounts, search, export, staff onboarding).
- **Acceptance intent:** Hide notifications until API; soft-deactivate users (block login); search users; CSV for at least one report; temp password on staff create; security tests prove 403 for non-ADMIN.
- **Conditions / risks:** Defer full notifications domain this cycle.

### Business Analyst

- **Stance:** support-with-conditions
- **Spec gaps / updates needed:** Update roles matrix (user deactivate, staff temp password, CSV); frontend routes (notifications hidden); document `users.active`.
- **Domain rules cited:** Soft-deactivate preferred over hard delete (FK to courses as lecturer).
- **Conditions / risks:** Cannot deactivate self; last ADMIN safety optional for MVP.

### Solution Architect

- **Stance:** support
- **Architectural fit:** Mirror student search + temp password; course activate pattern for users; CSV as `text/csv` response from ReportService; `@WebMvcTest` for authz.
- **Boundaries / sequencing:** Specs → migration V5 → BE → FE → tests.
- **Conditions / risks:** No notifications schema this cycle.

### Frontend Engineer

- **Stance:** support
- **UI impact:** Remove notifications from `AppLayout` nav (route may remain unlinked); UsersPage search + deactivate; temp-password dialog reuse; ReportsPage export button.
- **A11y notes:** Confirm dialogs for deactivate; announce search results.
- **Conditions / risks:** Update E2E that navigates to notifications.

### Backend Engineer

- **Stance:** support
- **API / logic impact:** `GET /users/search`; optional password on create + `temporaryPassword` response; `POST /users/{id}/deactivate|activate`; CSV endpoints; login rejects inactive.
- **Permission enforcement notes:** Keep `@PreAuthorize("hasRole('ADMIN')")` on user admin; reports ADMIN|LECTURER.
- **Conditions / risks:** Audit USER_DEACTIVATE / USER_ACTIVATE.

### Database Engineer

- **Stance:** support
- **Schema / migration implications:** `V5__user_active.sql` — `users.active BOOLEAN NOT NULL DEFAULT true` + index.
- **Data risk:** Low; default true for existing rows.
- **Conditions / risks:** No hard DELETE in V5.

### QA Engineer

- **Stance:** support
- **Testing needs:** E2E admin search/create with temp pwd/deactivate; unit/WebMvc security matrix; CSV content-type check.
- **Regression scope:** Existing 15 E2E; fix notifications nav walk.
- **Conditions / risks:** Seed admin remains active.

### Security Engineer

- **Stance:** support
- **Security concerns:** Inactive users must fail authentication; temp passwords one-time in response only; never return password hash; prevent self-deactivate.
- **Conditions / risks:** Security tests mandatory for ADMIN controllers.

### Performance Engineer

- **Stance:** support-with-conditions
- **Scalability / hotspots:** User search LIKE OK for campus scale; CSV stream for modest report sizes.
- **Conditions / risks:** Paginate search; avoid loading all users for CSV of statistics.

### Optional — Documentation

- Update `future-features.md` shipped section; roles + frontend specs.

## Conflicts

| Topic | Positions | Resolution |
|-------|-----------|------------|
| Notifications MVP vs hide | PM: hide OK; full MVP L | **Hide nav**; keep page unlinked for later |
| Hard delete vs soft deactivate | BA/Sec: soft | **Soft `active` flag only** |
| CSV all reports vs one | Perf: thin slice | **students-per-course + statistics summary CSV** |

## Loop Engineer recommendation

- **Decision:** go
- **Summary:** Ship all six intents this cycle with notifications = hide nav (not full MVP).
- **Spec updates required before code:**
  - [x] roles + frontend + future-features
- **Conditions to satisfy:**
  - [x] V5 migration for `users.active`
  - [x] Cannot deactivate own account
  - [x] E2E + security tests green
- **Recommended workflow:** new-feature implementation loop
- **Implementation pipeline (ordered):**
  1. Specs
  2. V5 + User domain + Auth gate
  3. UserAdmin search / temp password / activate-deactivate APIs
  4. Report CSV
  5. FE: hide nav, UsersPage, ReportsPage
  6. WebMvc security tests + E2E updates
  7. Loop verify + document
- **Approved by:** user — approved

## Next step

- [x] Update specs
- [x] Begin implementation
