# Engineering Council Review: Full-app E2E + production-ready loop

> Fill during `.kiro/workflows/engineering-council.md`. **No code changes** until Loop recommendation is approved.  
> Date: 2026-07-29

## Proposal

- **Ask / feature:** Test entire CampusFlow app (all roles, all features) with Playwright; fix breaks until green; prioritize highest-impact improvements; implement → verify → document → repeat until production ready.
- **Why now:** P0–P1 product surfaces shipped; prior production-readiness council Cycle 1–2 mostly **not landed in code**; E2E smoke exists but stack/security gaps block a honest “production ready” claim.
- **Owning specs:** `campusflow-roles.md`, `campusflow-grades.md`, `campusflow-frontend.md`, `security-implementation.md`, `testing-strategy.md`, `devops-deployment.md`
- **Opened by:** Loop Engineer
- **Verbose:** compact seats (all engineers)

## Specs loaded for council

- `.kiro/specs/campusflow-roles.md`
- `.kiro/specs/campusflow-grades.md`
- `.kiro/specs/security-implementation.md`
- `.kiro/specs/testing-strategy.md`
- `.kiro/specs/campusflow-frontend.md`
- `.kiro/constitution/definition-of-done.md`, `security-principles.md`, `testing-principles.md`
- Prior: `.kiro/memory/council-review-production-readiness.md`, `future-features.md`, `e2e-failure-report.md`
- Evidence: FE router/client/pages; BE SecurityConfig/Auth/Student/Enrollment; Playwright `roles-and-data-flow.spec.ts`; `docker/docker-compose.yml`

## Seat inputs

### Product Manager

- **Stance:** support
- **Business value:** Trust and role correctness beat new features. Cannot claim production ready while STUDENT can enumerate peers or share passwords.
- **Acceptance intent:** (1) Playwright green for all three roles + core data flow + register; (2) P0 security closed; (3) remaining P1/P2 documented honestly in `future-features.md`.
- **Conditions / risks:** Do not expand Notifications/CSV this loop.

### Business Analyst

- **Stance:** support
- **Spec gaps / updates needed:** Enforce existing matrix — STUDENT students own-only; STUDENT grades own-only (`campusflow-roles.md`, `campusflow-grades.md`). No new product rules required for Cycle 1.
- **Domain rules cited:** Register STUDENT-only; temp password returned once to ADMIN on student create; LECTURER keeps student list read.
- **Conditions / risks:** If lecturer enrollment-by-student stays campus-wide, document as intentional or tighten to own-course (prefer tighten — P1).

### Solution Architect

- **Stance:** support
- **Architectural fit:** Aligns with campusflow architecture; keep FE UX gates + BE `@PreAuthorize` + service scoping.
- **Boundaries / sequencing:**
  1. P0 security/session (JWT, student IDOR, enrollment course IDOR, temp password, V3, logout, swagger)
  2. P1 search + audit + unit tests
  3. Expand Playwright + run against live stack
  4. Docs/memory honesty
- **Conditions / risks:** Compose currently `dev` profile — E2E uses local stack; prod claim needs prod profile + secrets path documented.

### Frontend Engineer

- **Stance:** support
- **UI impact:** Refresh interceptor + ErrorBoundary + pagination largely done. Wire `temporaryPassword` modal (already expected). Expand E2E for grades, self-enroll/drop, profile patch, forbidden nav, IDOR smoke via API.
- **A11y notes:** Keep dialog labels for temp password; recoverable error boundary CTA.
- **Conditions / risks:** E2E needs API `:8090` + FE `:5173` (or compose). Fix README port drift (`8080` vs `8090`).

### Backend Engineer

- **Stance:** support
- **API / logic impact:** Scope `StudentService`; scope `listCourseEnrollments` for STUDENT; generate unique temp password + response field; logout `permitAll` (refresh body); JWT fail-fast; fix search repository; disable swagger in prod yml.
- **Permission enforcement notes:** Never rely on FE hide of `/students` for STUDENT.
- **Conditions / risks:** Enrollment course-by-id IDOR is P0 alongside student list.

### Database Engineer

- **Stance:** support-with-conditions
- **Schema / migration implications:** Constrain V3 to seed emails only (UPDATE … WHERE email IN (...)). Prefer new V4 if V3 already applied in shared DBs; for greenfield/dev re-seed, fixing V3 is OK if documented.
- **Data risk:** Unconstrained V3 resets **all** passwords — critical.
- **Conditions / risks:** No new tables this cycle unless Token/Audit already present (they are).

### QA Engineer

- **Stance:** support
- **Testing needs:** Playwright: health, ADMIN/LECTURER/STUDENT nav, admin CRUD flow, register, lecturer grade entry, student self-enroll/drop, profile edit, API IDOR negative (student cannot list all students), logout.
- **Regression scope:** Seed logins `Admin123!`; serial suite; loop until green (`test:e2e:loop` if present).
- **Conditions / risks:** Prior `e2e-failure-report.md` PASS is historical — re-run required after P0.

### Security Engineer

- **Stance:** support — **block production-ready claim until P0 closed**
- **Security concerns:** Student IDOR; enrollment roster/grade leak; JWT default secret; ChangeMe123!; V3 blast radius; swagger in prod; logout auth requirement; localStorage tokens (P2 accepted).
- **Conditions / risks:** Unit/integration tests for student scoping + JWT fail-fast preferred.

### Performance Engineer

- **Stance:** support-with-conditions
- **Scalability / hotspots:** Cap page size; fix search `findAll` fallback (also security amplifier); departments pagination optional P2.
- **Conditions / risks:** E2E page sizes of 100 OK for smoke only.

### Optional seats

#### DevOps / Preview

- **Stance:** support
- **Ops:** Inject `JWT_SECRET` in compose; document prod profile; ensure Redis optional or add service if cache hard-requires Redis for boot.
- **Conditions:** Preview health = API actuator + FE load before Playwright.

#### Documentation

- **Stance:** support
- **Docs:** Update `future-features.md`, council memory, seed-data note on V3 scope, README ports; security-implementation drift note optional this cycle.

## Conflicts

| Topic | Positions | Resolution |
|-------|-----------|------------|
| Notifications / CSV this loop? | PM defer vs “all features” | **Defer P2** — test shell pages only; do not implement API |
| Fix V3 in place vs V4 | DB risk if already applied | **Prefer V4 constrain** if V3 may have run; else patch V3 for fresh deploys + document |
| LECTURER any-student enrollments | Least privilege vs teaching convenience | **P1:** scope to own courses; not blocking E2E smoke |
| Production-ready bar | Absolute vs pragmatic | **P0 security + green E2E + compile/test gates** = bar this Loop; P1/P2 tracked |

## Prioritized backlog (this Loop)

### Cycle A — P0 (must ship before re-test claim)

1. Student API own-only scoping (list/get/search)
2. Enrollment `listCourseEnrollments` deny STUDENT peer roster/grades
3. JWT secret from env + fail-fast (no insecure prod default)
4. Unique temp password on student create + response field
5. Constrain seed password migration (V3 fix and/or V4)
6. Logout permitAll (refresh body); swagger off in prod; compose JWT_SECRET
7. Fix global student search (no findAll fallback)

### Cycle B — P1 (same Loop if time)

8. Expand Playwright: grade entry, self-enroll/drop, IDOR negative, profile
9. Auth/scoping unit tests
10. Audit on key mutations (if quick)
11. README / seed-data / future-features honesty

### Cycle C — P2 later

Notifications API, CSV export, httpOnly cookies, rate limiting, lecturer enrollment-by-student tighten, full Khonofy doc purge

## Loop Engineer recommendation

- **Decision:** go-with-conditions
- **Summary:** Prior production-readiness council was correct but **implementation incomplete**. This Loop closes P0 security, expands Playwright, runs stack + E2E until green, documents remaining debt. User ask includes implement — treat as **approved**.
- **Spec updates required before code:**
  - [x] None blocking — enforce existing `campusflow-roles.md` / `campusflow-grades.md`
- **Conditions to satisfy:**
  - [ ] Cycle A complete
  - [ ] FE lint/typecheck/build + BE tests relevant green
  - [ ] Playwright all-roles suite green against live stack
  - [ ] Memory: council + future-features + e2e report updated
- **Recommended workflow:** `.kiro/workflows/bug-fix.md` / implementation loop (security fixes + E2E), then Loop verification
- **Implementation pipeline (ordered):**
  1. Backend Engineer — P0 API/security/migrations
  2. Database Engineer — V3/V4 password constraint
  3. Frontend Engineer — temp password UX verify + E2E expansion
  4. DevOps — compose JWT_SECRET / prod swagger notes
  5. QA — run Playwright loop; fail → fix → re-run
  6. Security — spot-check IDOR + JWT
  7. Documentation — memory/specs pointers
  8. Loop — DoD gates
- **DoD extras / test focus:** Role matrix + Playwright + student IDOR negative
- **Approved by:** user (explicit implement/verify/repeat until production ready) — **approved**

## Next step

- [x] Council
- [x] Begin implementation (Cycle A → B)
- [x] Loop gates + Playwright until green (10/10)
- [x] Document remaining improvements (`future-features.md`)

## Loop verification (2026-07-29 close)

- FE: typecheck / lint / unit / build green
- Playwright: 10/10 pass against API `:8090` + Vite `:5173`
- P0 security: student scoping, roster IDOR, temp password, V3 constrain, JWT config, logout permitAll, swagger prod off, cache→simple
- Remaining: see `future-features.md` P1/P2
