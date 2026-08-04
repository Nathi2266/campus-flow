# Engineering Council Review: Role expansion & data-flow flexibility

> Date: 2026-07-30. User goal: expand roles, data flows, system flexibility; implement until production-ready.

## Proposal

- **Ask:** Highest-impact features that expand ADMIN / LECTURER / STUDENT value and close data-flow gaps.
- **Why now:** Core CRUD + security shipped; daily campus ops still missing roster, filters, academic record, report scope.
- **Owning specs:** `campusflow-roles.md`, `campusflow-grades.md`, `campusflow-frontend.md`, `campusflow-data-flows.md` (new)
- **Opened by:** Loop Engineer
- **Approved by:** user (implement goal)

## Seat summary

| Seat | Stance | Key finding |
|------|--------|-------------|
| PM | support | Maximize role daily value over new domains (no waitlists/terms this cycle) |
| BA | support | Document data flows; GPA display only (no auto-recompute yet) |
| Architect | support | Cycle 1 = wire existing APIs + report scoping; no Flyway |
| FE | support | Roster drawer/page, filters, capacity badges, academic panel |
| BE | support | Lecturer report scope; audit on enrollment/course/student mutates |
| DB | abstain | No schema this cycle |
| QA | support | Role smoke: lecturer roster grade; student academic; admin filters |
| Security | support-with-conditions | Report scoping for LECTURER is a must; FORBIDDEN→403 if touched |
| Perf | support | Cap filter result sizes; keep page size ≤100 |
| DevOps/Docs | support | Document flows; update future-features |

## Conflicts

| Topic | Resolution |
|-------|------------|
| GPA recompute now? | **Defer** — display stored GPA; recompute is Cycle 2 |
| Notifications this cycle? | **Defer P2** |
| Waitlists / academic term | **Defer** — greenfield |

## Cycle 1 backlog (ordered)

1. Course roster workspace (use `GET /enrollments/course/{id}`)
2. Enrollment/course/student list filters
3. Student academic detail (`GET /students/{id}/courses` + GPA display)
4. Capacity pressure UX (badges, fill %, enroll errors)
5. Lecturer-scoped reports + admin dept filter
6. Broader mutate audit (enrollment create/drop, course activate/create/delete, student already partially covered)

## Loop recommendation

- **Decision:** go
- **Pipeline:** Specs → FE+BE → verify → document
- **Out of scope:** notifications, CSV, waitlists, terms, bulk grade API

## Next step

- [x] Council
- [x] Specs (`campusflow-data-flows.md`, roles matrix)
- [x] Implementation (Cycle 1)
- [x] Loop verification

## Loop verification (2026-07-30)

| Gate | Result |
|------|--------|
| FE typecheck / lint / build / unit tests | Pass |
| BE compile + StudentServiceTest | Pass |
| Cycle 2 deferred | Bulk grades, GPA recompute, notifications, CSV, waitlists |
