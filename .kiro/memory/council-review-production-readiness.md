# Engineering Council Review: Production-readiness improvement cycle

> Full-project review. User goal: improve until production ready.  
> Date: 2026-07-29

## Proposal

- **Ask:** Review entire CampusFlow project; prioritize highest-impact improvements; implement → verify → document → repeat.
- **Why now:** P0–P1 product features shipped; remaining gaps are security, session reliability, and deploy hygiene.
- **Owning specs:** `campusflow-roles.md`, `security-implementation.md`, `campusflow-frontend.md`, `devops-deployment.md`
- **Opened by:** Loop Engineer
- **Verbose:** compact seats

## Specs / evidence loaded

- Prior councils: `council-review-implement-p0-p1.md`, `council-review-role-value-features.md`
- Code: `SecurityConfig`, `AuthService`, `StudentService`, `frontend/src/api/client.ts`, `docker/docker-compose.yml`, Flyway V3
- Memory: `future-features.md`

## Seat inputs

### Product Manager
- **Stance:** support
- **Business value:** Production trust > new features. Ship security/session fixes before Notifications/CSV.
- **Acceptance:** Users stay logged in via refresh; students cannot enumerate peers; deploy uses env secrets; seed migrations safe.

### Business Analyst
- **Stance:** support
- **Spec gaps:** Clarify STUDENT student-API access = own record only in `campusflow-roles.md` (already implied; enforce). Temp password / force-change out of scope — generate unique password returned once to ADMIN on create.
- **Conditions:** Update roles matrix if student list visibility changes for LECTURER (roster via enrollments sufficient).

### Solution Architect
- **Stance:** support
- **Sequencing:** (1) JWT/env + logout + FE refresh (2) Student scoping (3) Create-student password (4) V3 safety (5) Prod compose/swagger (6) Pagination/search/error boundary (7) Audit widen + tests
- **Risks:** Spec drift Khonofy docs — document pointer, don’t rewrite all this cycle.

### Frontend Engineer
- **Stance:** support
- **UI impact:** Axios single-flight refresh; ErrorBoundary; list pagination controls; show generated student password once on create toast/modal.
- **A11y:** Pagination labeled; error boundary recoverable CTA.

### Backend Engineer
- **Stance:** support
- **API:** Scope StudentService; logout permitAll; JwtTokenProvider fail-fast; StudentCreateRequest optional password or generated; search global query; audit hooks on mutate.

### Database Engineer
- **Stance:** support-with-conditions
- **Data risk:** V3 must UPDATE only seed emails. No new tables for Cycle 1. ddl-auto validate in compose (already).

### QA Engineer
- **Stance:** support
- **Tests:** Auth refresh unit test; StudentService scoping test; E2E still needs stack — smoke login after compose fix.
- **Regression:** Register STUDENT-only; admin CRUD path.

### Security Engineer
- **Stance:** support — **P0 must land before “production ready” claim**
- **Concerns:** IDOR on students; JWT default; logout with expired access; swagger in prod; shared ChangeMe123!; V3 password blast radius.

### Performance Engineer
- **Stance:** support-with-conditions
- **Hotspots:** Cap page size; fix search findAll fallback; pagination UI.

### DevOps / Documentation
- **Stance:** support
- **Ops:** Compose prod profile + JWT_SECRET; disable swagger in prod yml; document seed password restriction in seed-data.md.
- **Docs:** Council record + update future-features; pointer in project-overview that CampusFlow owns this repo.

## Conflicts

| Topic | Resolution |
|-------|------------|
| Notifications this cycle? | **Defer P2** — not a production blocker |
| LECTURER see all students? | **Keep list for LECTURER** (teaching need); STUDENT own-only |
| Generated password UX | Return once in create response `temporaryPassword` field (ADMIN only) |

## Prioritized backlog

### Cycle 1 — P0 (this implementation)
1. FE 401 → refresh → retry
2. JWT secret env / fail-fast; remove insecure default in prod path
3. Student API scoping (STUDENT own-only)
4. Unique temp password on student create (no ChangeMe123!)
5. V3 migration constrain to seed emails
6. Logout without access token; disable swagger in prod; compose JWT + prod profile notes

### Cycle 2 — P1 (same Loop if time)
7. Global student search fix
8. Pagination UI on major lists
9. React error boundary
10. Audit on key mutations
11. Auth/security unit tests

### Cycle 3 — P2 later
Notifications, CSV, rate limiting, httpOnly cookies, full Khonofy doc purge

## Loop recommendation

- **Decision:** go
- **Approved by:** user (goal = improve until production ready)
- **Workflow:** implement Cycle 1 → verify → Cycle 2 → verify → document
- **Production-ready bar this Loop:** P0 complete + FE/BE compile/test green; remaining P1/P2 tracked honestly

## Next step

- [x] Council
- [x] Implement Cycle 1–2
- [x] Loop gates (FE typecheck/test; BE compile + StudentServiceTest)
- [x] Memory / spec updates
- [ ] Optional: Playwright against compose; rate limiting; cookie sessions (tracked in future-features)

## Loop verification (2026-07-29)

| Gate | Result |
|------|--------|
| FE typecheck / unit tests | Pass |
| BE `mvn compile` + `StudentServiceTest` | Pass |
| Context test uses `@ActiveProfiles("test")` | Fixed |
| Prod swagger disabled / JWT required | Done |
| Remaining production items | Documented in `future-features.md` |
