# Engineering Council Review: Role-value feature backlog (CampusFlow)

> Filled during `.kiro/workflows/engineering-council.md`. **No code changes** until Loop recommendation is approved.
> Codebase scan date: 2026-07-28.

## Proposal

- **Ask / feature:** Scan CampusFlow and produce a valuable feature backlog for every product role (ADMIN, LECTURER, STUDENT), grounded in what exists vs gaps.
- **Why now:** Core SMS CRUD and role dashboards ship; next investment should maximize role value, not greenfield invention.
- **Owning specs (known):** `.kiro/specs/campusflow-frontend.md`, `campusflow-architecture.md`, `security-implementation.md`, `database-schema.md`, `backend-java.md`, `api-specification.yaml`, `seed-data.md`
- **Opened by:** Loop Engineer
- **Verbose:** yes (council seats below)

## Specs loaded for council

- `.kiro/specs/campusflow-frontend.md`
- `.kiro/specs/campusflow-architecture.md`
- `.kiro/specs/security-implementation.md`
- `.kiro/specs/database-schema.md`
- `.kiro/specs/backend-java.md`
- `.kiro/specs/seed-data.md`
- `.kiro/specs/api-specification.yaml`
- `.kiro/specs/performance-optimization.md`
- Controllers: `src/main/java/com/campusflow/web/api/*`
- FE pages: `frontend/src/pages/*`, router, AppLayout
- Prior councils: `council-review-campusflow-frontend.md`
- **Out of scope / drift:** Khonofy timesheet specs (`roles-permissions.md`, `personas.md`, `project-overview.md`, `timesheets.md`, etc.) — do not use for CampusFlow role value

## Seat inputs

### Product Manager

- **Stance:** support
- **Business value:** CampusFlow’s weekly value loop is admin/lecturer manage students & courses → enroll → report → student sees own progress. Highest ROI is closing role-authentic journeys (scoped data, grading, self-enroll, real reports) after security/auth foundations.
- **Acceptance intent:** A prioritized backlog per role that (1) cites existing entities/APIs, (2) closes documented stubs, (3) can feed sprint planning without inventing unrelated domains.
- **Conditions / risks:** Product overview/personas still describe Khonofy staff/admin — PM must author CampusFlow personas before large feature sprints. Open ADMIN self-registration is a product risk once passwords are real.

### Business Analyst

- **Stance:** support-with-conditions
- **Spec gaps / updates needed:**
  - Author CampusFlow personas + role capability matrix (replace or supersede Khonofy `personas.md` / `roles-permissions.md` for this repo, or add `campusflow-roles.md` and point indexes).
  - Resolve STUDENT self-enroll: matrix allows `POST /enrollments`; FE hides create — pick one rule.
  - Resolve LECTURER “manage courses”: matrix blocks POST/PUT/DELETE courses for lecturer, but narrative says “Manage courses” — clarify own-course update vs admin-only create.
  - Grade lifecycle rules (who sets grade, status COMPLETED/FAILED, GPA recalculation) are not in a domain spec.
- **Domain rules cited:** Enrollment uniqueness, capacity, max 5 active enrollments (service layer); soft-delete student → INACTIVE; course activate/deactivate; security matrix in `security-implementation.md`.
- **Conditions / risks:** Do not implement grading or self-enroll until owning rules are written.

### Solution Architect

- **Stance:** support
- **Architectural fit:** Aligns with `campusflow-architecture.md` — department soft tenancy, JWT RBAC, Spring services, React role shells. Sequence: Auth+RBAC → Departments API → role scoping → Reports depth → Grading → Notifications → Audit.
- **Boundaries / sequencing:**
  1. Backend auth + `@PreAuthorize` + list scoping (no FE-only trust)
  2. `DepartmentController` + pickers
  3. Lecturer/student query filters
  4. ReportService real queries
  5. Grade PATCH + optional notifications/audit
- **Conditions / risks:** Dual product docs confuse agents; keep CampusFlow specs authoritative. Tokens/audit_logs tables exist without JPA — wire before claiming session/audit features.

### Frontend Engineer

- **Stance:** support
- **UI impact (routes/components/roles):** Existing shells: dashboards, Students, Courses, Enrollments, Reports, Profile, Settings, Notifications. Gaps: edit forms, search UI, department/lecturer pickers, student self-enroll CTA, grade entry, report charts, profile edit after `/me`.
- **A11y notes:** Preserve labels/focus on new forms; report charts need text alternatives; notifications need live regions when wired.
- **Conditions / risks:** Align CRUD visibility with matrix once BA clarifies lecturer permissions; avoid building notifications beyond empty state until API exists.

### Backend Engineer

- **Stance:** support-with-conditions
- **API / logic impact:** Fix `AuthService.login` password verify; implement `/auth/me`, refresh via `tokens`, logout revoke; add `@EnableMethodSecurity` + `@PreAuthorize` per matrix; DepartmentController; scope list endpoints; implement stub report GETs; grade update endpoint; optional Notification/Audit APIs later.
- **Permission enforcement notes:** Today any authenticated user can hit all CRUD — highest severity gap vs `security-implementation.md`.
- **Conditions / risks:** Seed BCrypt placeholders + skipped password check mask auth bugs until fixed together.

### Database Engineer

- **Stance:** support
- **Schema / migration implications:** Core tables sufficient for most backlog. New work likely: Token entity mapping (table exists), AuditLog entity (table exists), Notification table (new migration) if MVP proceeds. Grade already on enrollments.
- **Data risk:** Student number random generation collision; department-scoped queries need indexes already partly present.
- **Conditions / risks:** No schema invent for grades; notifications need Flyway + spec before code.

### QA Engineer

- **Stance:** support-with-conditions
- **Testing needs (from specs):** Role matrix matrix tests (positive/negative per endpoint); auth password fail; refresh rotation; department picker E2E; lecturer sees only own courses; student sees only own enrollments; enrollment capacity/max-5; report endpoints non-empty with seed data.
- **Regression scope:** Stabilize `roles-and-data-flow` E2E (`.kiro/memory/e2e-failure-report.md`) before expanding features.
- **Conditions / risks:** E2E currently weak while login skips password verify — fix auth then re-baseline seeds.

### Security Engineer

- **Stance:** support-with-conditions
- **Security concerns:** No method security; open role selection on register including ADMIN; login without password verification; refresh returns fake user; client-only RBAC; PII on student lists without server scope.
- **Conditions / risks:** **Must** land auth verify + server RBAC + restrict register-to-STUDENT (or admin-provisioned roles) before feature expansion that increases surface area. Constitution: never hardcode divergent permissions outside specs.

### Performance Engineer

- **Stance:** support-with-conditions
- **Scalability / hotspots:** Unscoped `findAll` on students/courses/enrollments will hurt as data grows; report list stubs hide N+1 risk until implemented; lecturer dashboard loading all active courses is wasteful.
- **Conditions / risks:** Department/lecturer filters + pagination on list endpoints when scoping lands; cache statistics carefully after real metrics.

### Optional seats

#### Documentation Engineer

- **Stance:** support-with-conditions
- **Findings:** Promote backlog into `.kiro/memory/future-features.md` (replace Khonofy leftovers). Recommend PM/BA update product overview/personas for CampusFlow. Keep this council as durable decision record.
- **Conditions:** Spec index should point agents at CampusFlow docs first.

## Conflicts

| Topic | Positions | Resolution |
|-------|-----------|------------|
| STUDENT self-enroll | Spec matrix allows POST; FE hides create | **Needs PM/BA decision** before coding — recommend enable scoped self-enroll (matches STUDENT persona value) |
| LECTURER course mutate | Narrative “manage courses” vs matrix deny POST/PUT/DELETE | **Needs PM/BA** — recommend ADMIN creates courses; LECTURER can update own course metadata + grades; no delete |
| Build features vs fix auth first | PM wants role value; Security wants auth/RBAC first | **Loop:** foundations first (P0), then role features (P1+) |
| Spec drift Khonofy vs CampusFlow | BA/Docs want cleanup; not blocking this backlog doc | Spec hygiene sprint parallel or before next feature council |

## Valuable features by role (council deliverable)

### Foundation (all roles benefit) — P0

| ID | Feature | Value | Grounding |
|----|---------|-------|-----------|
| F1 | Real password verification + seed hashes | Trustworthy login | `AuthService`, `security-implementation.md` |
| F2 | `GET/PATCH /auth/me` + profile edit | Identity/settings usable | Stub `/me`; ProfilePage blocked |
| F3 | Refresh token store/rotate + logout revoke | Secure sessions | `tokens` table unused |
| F4 | Method-level RBAC + department/owner scoping | Correct role boundaries | Matrix in `security-implementation.md`; none in controllers |
| F5 | Restrict public register to STUDENT (admin provisions staff) | Stop privilege self-escalation | RegisterPage role select; Security seat |

### ADMIN — P1

| ID | Feature | Value |
|----|---------|-------|
| A1 | Department CRUD UI + API | Org structure manageable; kill raw `departmentId` |
| A2 | User administration (list, assign role/dept, deactivate) | Operate the campus without open ADMIN register |
| A3 | Student/course **edit** + search/filter UI | Complete CRUD already half-built in API |
| A4 | Real reports (students-per-course, active/inactive, true stats) | Leadership decisions from live data |
| A5 | Audit log viewer | Accountability (table exists) |
| A6 | Soft-delete / academic status workflows clarity | Lifecycle beyond create/delete |

### LECTURER — P1

| ID | Feature | Value |
|----|---------|-------|
| L1 | Dashboard/lists scoped to assigned courses (`lecturerId`) | Personal teaching view, not org dump |
| L2 | Grade entry (PATCH enrollment grade + status) | Core teaching outcome; column already exists |
| L3 | Roster view per course (students enrolled) | Day-to-day class management |
| L4 | Capacity / enrollment pressure on own courses | Plan seats without admin reports |
| L5 | Align FE permissions (read students; no global student delete) | Match security matrix |

### STUDENT — P1

| ID | Feature | Value |
|----|---------|-------|
| S1 | Enrollments list scoped to self | Privacy + correct dashboard |
| S2 | Self-enroll / drop (if BA confirms) | Autonomy matching matrix |
| S3 | Browse active courses catalog (read-only) | Discover what to enroll in |
| S4 | Grades & enrollment status on dashboard | Academic progress visibility |
| S5 | Profile self-service (name/phone) after `/me` | Account ownership |

### Cross-role enhancements — P2

| ID | Feature | Value |
|----|---------|-------|
| X1 | Notifications MVP (enrollment, grade, capacity) | FE shell ready; closes empty nav |
| X2 | Settings persistence (email prefs once notifications exist) | Settings toggles today disabled |
| X3 | Student courses sub-resource (`GET /students/{id}/courses`) | Stub → useful detail panels |
| X4 | Pagination + search everywhere | Scale + findability |
| X5 | Export reports (CSV) | Admin/lecturer offline analysis |

## Loop Engineer recommendation

- **Decision:** go-with-conditions
- **Summary:** Objective completed as an Engineering Council deliverable: codebase-grounded, role-partitioned feature backlog. Do **not** start greenfield modules. Approve sprint order: **P0 foundations → ADMIN/LECTURER/STUDENT P1 → P2**. Resolve the two product conflicts (self-enroll; lecturer mutate) in specs before those items leave backlog.
- **Spec updates required before code:**
  - [ ] CampusFlow personas + capability matrix (PM/BA) — supersede or isolate Khonofy role docs
  - [ ] Decision on STUDENT self-enroll vs admin-only enroll
  - [ ] Decision on LECTURER course update vs create/delete
  - [ ] Grade lifecycle rules (owning domain spec)
  - [ ] Promote backlog into `future-features.md` (done with this council)
- **Conditions to satisfy:**
  - [ ] No implementation until user/PM approves this recommendation
  - [ ] P0 auth + RBAC before expanding P1 surface area
  - [ ] Stabilize E2E data-flow after auth fix
- **Recommended workflow:** After approval → `.kiro/workflows/sprint-planning.md` then per-item `.kiro/workflows/engineering-council.md` (or waive if trivial) → `.kiro/workflows/new-feature.md`
- **Implementation pipeline (ordered):**
  1. PM/BA — CampusFlow personas, role matrix, conflict resolutions
  2. Security + Backend — F1–F5
  3. Database + Backend — A1 DepartmentController; Token/Audit entities as needed
  4. Backend + Frontend — L1–L5, S1–S5, A2–A4
  5. QA — matrix + E2E regression
  6. Optional P2 — X1–X5
- **DoD extras / test focus:** Method-security negative tests; scoped list assertions; seed login with real BCrypt; report endpoints return seed-backed data
- **Approved by:** (user / PM) — pending

## Next step

- [x] Council seats + feature backlog recorded
- [x] Update `.kiro/memory/future-features.md`
- [ ] User/PM approve recommendation
- [ ] Spec updates (BA/PM)
- [ ] Sprint planning for P0
- [ ] Stop coding until approved (council hard rule)
