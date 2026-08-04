# Feature recommendation: 2026-08-04 discovery

## Current state (inventory)

### Shipped (from specs + memory + code)

- Auth (register STUDENT, login, refresh, logout, `/me`, theme)
- RBAC ADMIN | LECTURER | STUDENT with method security + service scoping
- Departments, users (search/role filter, soft activate/deactivate, staff temp password)
- Students CRUD, academic courses drawer, stored GPA display
- Courses CRUD + activate/deactivate; lecturer metadata update
- Enrollments create/drop; capacity / COURSE_FULL UX
- Grade entry per enrollment (roster workspace)
- Reports (statistics, students-per-course, graduation-progress, active/inactive) + one CSV export
- Audit log (ADMIN); role dashboards; profile/settings theme
- Prod hygiene: fail-closed secrets outside dev, CI, gitignore, CORS owner, Compose health wait
- E2E: roles flow + full walkthrough; thin BE unit/security tests

### Role coverage gaps

| Role | Gap | Spec citation |
|------|-----|---------------|
| ADMIN | Notifications API + prefs; broader CSV pack; email invite delivery | `campusflow-frontend.md`; `future-features.md` #1,#6; `campusflow-roles.md` |
| LECTURER | Bulk grade entry on roster | `future-features.md` #2; `campusflow-grades.md` |
| STUDENT | GPA truth (auto-recompute); transcript; waitlist when COURSE_FULL | `campusflow-grades.md` (GPA out of scope today); `future-features.md` #3,#4 |
| All | Auth rate limit; httpOnly cookies; seed accounts gated for prod | `technical-debt.md`; `security-implementation.md`; prod council 2026-08-04 |

### Production / quality risks

1. Flyway seed passwords (`Admin123!`) on real DBs
2. Tokens in `localStorage` (XSS session theft)
3. No rate limiting on login/register
4. Public registration open in all profiles
5. Weak JaCoCo floor (10%) / thin BE suite
6. Stored GPA display without recompute → academic UI can lie after grade changes
7. **Code finding:** `AuthService.refresh` does not re-check `user.active` (deactivate may not kill refresh sessions)
8. Notifications route is an empty shell; nav correctly hidden

## Engineer seat assessments

| Seat | Stance | Impact | Notes |
|------|--------|--------|-------|
| Feature Engineer | support | high | Rank prod hardening + lecturer daily UX + honest GPA before new domains |
| Product Manager | support | high | Prefer closing production claim gaps before net-new inbox; Notifications remains highest product shell |
| Business Analyst | support-with-conditions | high | GPA/transcript/waitlist need `campusflow-grades.md` (+ schema specs) before code |
| Solution Architect | support | high | Sequence: auth/session → GPA rules → notifications schema → waitlists/terms |
| Frontend Engineer | support | medium | Roster bulk-grade UI + notifications inbox reuse existing shell; catalogue search when paging hurts |
| Backend Engineer | support | high | Rate limit filter; refresh+active check; GPA recompute service; notification entity later |
| Database Engineer | support-with-conditions | high | Waitlists/terms/notifications need Flyway; seed split before prod DBs |
| QA Engineer | support | high | Expand Auth/Enrollment/JWT tests; E2E for deactivate+refresh and any new MVP |
| Security Engineer | support | high | P0: rate limit, cookies or XSS mitigations, seed gate, refresh respects `active` |
| Performance Engineer | abstain / low | low | Lists fine today; catalogue search when page size grows |
| DevOps / Docker / Preview | support | medium | Seed profile split; optional nginx retry; keep Compose health wait |
| Documentation Engineer | support | medium | Retarget CORS samples in `security-implementation.md`; LICENSE badge |
| Loop Engineer | support | — | After user pick → council → implement → lint/typecheck/build/tests |

## Ranked recommendations (for user decision)

### 1. Production auth hardening pack — impact: high

- **Type:** improve existing
- **Roles:** All (especially public surfaces)
- **Why now:** Blocks any honest “production ready” claim; deferred on every prod council
- **Effort:** M
- **Risk:** medium (cookie migration touches FE auth store)
- **Includes:**
  - Auth rate limiting (login/register)
  - Block refresh when `user.active = false`
  - Gate/disable Flyway seed reliance for prod profiles
  - Prefer httpOnly cookie for refresh (or phased: refresh-active check + rate limit first)
- **Specs to update:** `security-implementation.md`, `devops-deployment.md`, `technical-debt.md`
- **Depends on:** none
- **Suggested acceptance intent:** Unauthenticated brute-force limited; deactivated users cannot refresh; prod checklist has no demo seed dependency

### 2. GPA auto-recompute + student transcript — impact: high

- **Type:** improve existing + new view
- **Roles:** STUDENT (trust); LECTURER/ADMIN (read)
- **Why now:** UI already shows stored GPA; grades change without updating truth
- **Effort:** M–L
- **Risk:** medium (algorithm must be specified)
- **Specs to update:** `campusflow-grades.md` (remove “out of scope”), `campusflow-data-flows.md`, frontend routes
- **Depends on:** BA acceptance of GPA algorithm
- **Suggested acceptance intent:** After grade write, student GPA matches algorithm; student can open transcript of completed courses

### 3. Bulk grade entry on course roster — impact: high

- **Type:** improve existing
- **Roles:** LECTURER, ADMIN
- **Why now:** Highest daily lecturer friction; API already has per-enrollment grade PATCH
- **Effort:** S–M
- **Risk:** low
- **Specs to update:** `campusflow-frontend.md`, optionally batch API in `backend-java.md`
- **Depends on:** none (can ship FE batch of existing PATCH; optional batch endpoint later)
- **Suggested acceptance intent:** Lecturer saves multiple grades from roster in one action with audit

### 4. Notifications MVP + settings prefs — impact: medium–high

- **Type:** new (shell exists)
- **Roles:** All
- **Why now:** Only major empty product shell; nav already prepared to re-enable
- **Effort:** L
- **Risk:** medium (new schema + delivery model)
- **Specs to update:** new CampusFlow notifications spec (not legacy timesheet `notifications.md`), roles, frontend
- **Depends on:** product events list (grade posted, enrollment, COURSE_FULL, etc.)
- **Suggested acceptance intent:** In-app inbox for key events; settings toggle delivery prefs; nav restored

### 5. Expand report CSV pack + course catalogue search — impact: medium

- **Type:** improve existing
- **Roles:** ADMIN, LECTURER; STUDENT catalogue
- **Why now:** Completes analytics/export story; search needed as data grows
- **Effort:** S–M
- **Risk:** low
- **Specs to update:** `campusflow-frontend.md`, reports section of backend specs
- **Depends on:** none

### 6. Waitlists + academic term/year — impact: medium (strategic)

- **Type:** new
- **Roles:** STUDENT, ADMIN, LECTURER
- **Why now:** Capacity UX already surfaces COURSE_FULL; natural next academic model
- **Effort:** L
- **Risk:** high (schema + enrollment state machine)
- **Specs to update:** `database-schema.md`, `campusflow-data-flows.md`, roles
- **Depends on:** BA enrollment lifecycle rules

## Recommended top pick

**#1 Production auth hardening pack** (rate limit + refresh respects `active` + prod seed gate; cookies as phase 1b if scope allows).

Rationale: Feature Engineer + Security + DevOps + prior councils agree production readiness is blocked here; known-bugs empty so this is the highest-leverage “until production ready” path. Closest product runners-up: **#3 bulk grades** (fast lecturer value) or **#2 GPA** (after BA spec).

## Explicitly deferred / out of scope this cycle

- Recharts / heavy chart libs (dashboards already decided)
- Re-enabling notifications nav without API
- Legacy Khonofy timesheet features
- Claiming production-ready without auth/seed conditions cleared

## User decision (fill after response)

- [ ] Approved: _______________
- [ ] Deferred: _______________
- [ ] Rejected: _______________

## Next handoff (only after approval)

- Product Manager → acceptance into specs
- Engineering Council → `.kiro/workflows/engineering-council.md`
- Loop Engineer → implementation pipeline
