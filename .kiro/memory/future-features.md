# Future Features

<!-- Product ideas only. Promote into specs when scheduled for delivery. -->
<!-- Source: Engineering Council 2026-07-28/29 — role-value + E2E production loop -->
<!-- Product: CampusFlow (ADMIN | LECTURER | STUDENT) -->

## Shipped (P0–P1) — 2026-07-29

- Real password verification + V3 seed hash (`Admin123!`) constrained to seed emails
- `/auth/me` GET/PATCH, profile edit, refresh/logout via `tokens`; logout permitAll
- Method-level RBAC + list scoping; STUDENT student API own-only; course roster denied to STUDENT
- Unique temp password on admin student create (returned once)
- JWT secret via env / profile; fail-fast when missing in prod; swagger off in prod
- Public register = STUDENT only
- Department CRUD + pickers; User admin; Audit viewer
- Student/course edit + global search; real report endpoints
- Lecturer own-course update + grade entry + scoped lists
- Student self-enroll/drop, course catalog, grades on dashboard
- FE 401 refresh retry, ErrorBoundary, list pagination
- Playwright all-roles suite green (10/10)

## Highest-impact improvements still open

### P1 — next Loop

1. **Broader audit coverage** — mutate events beyond login (student/course/enrollment/grade)
2. **Password policy enforcement** — complexity on register / admin create (spec vs `@NotBlank`)
3. **Reports least-privilege for LECTURER** — own-course / department scope vs campus-wide
4. **Departments pagination** — other lists already paginated
5. **Forbidden → HTTP 403** — map `ValidationException` FORBIDDEN codes to 403 (not 400)
6. **BE unit/integration security tests in CI** — StudentService scoping + JWT fail-fast already unit-tested locally; wire into pipeline
7. **Flyway repair note** — if V3 checksum changed on existing volumes, document `down -v` or repair

### P2 — later

- Notifications MVP (enrollment, grade, capacity) — FE shell exists
- Settings persistence for notification prefs
- Report CSV export
- httpOnly cookie session (replace localStorage tokens)
- Rate limiting on auth endpoints
- Refresh JWT `jti` + reuse detection
- Redis cache only when Redis is provisioned (now `cache.type: simple`)

## Spec hygiene (ongoing)

- Prefer `campusflow-roles.md` / `campusflow-grades.md` over Khonofy staff/admin/superuser docs
- Align `security-implementation.md` snippets with current `SecurityConfig` (logout permitAll, springdoc prod off)
