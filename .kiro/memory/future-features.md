# Future Features

<!-- Product: CampusFlow (ADMIN | LECTURER | STUDENT) -->

## Shipped

### P0–P1 product (2026-07-28)
- Auth, RBAC, departments/users/audit, grades, self-enroll, reports

### Production-readiness Cycle 1–2 (2026-07-29)
- FE 401 → refresh → retry (single-flight)
- JWT secret required (fail-fast; env `JWT_SECRET`); prod disables swagger
- Logout without access token; CORS from env
- Student API own-record scoping for STUDENT
- Unique temporary password on student create (returned once)
- V3 password migration limited to seed emails
- Compose env wiring + `docker/.env.example`
- Global student search; list pagination UI; ErrorBoundary
- Audit on student CRUD, grade updates, user admin
- Project overview points at CampusFlow specs

## Remaining (honest production backlog)

### Still recommended before hard production cutover
- Live Playwright E2E against compose stack
- Login rate limiting / lockout
- Prefer httpOnly cookie sessions long-term (localStorage XSS risk)
- Broader BE integration tests (Auth refresh, Enrollment RBAC)
- Cap/paginate department `findAll` and heavy reports at scale

### P2 product
- Notifications MVP + settings persistence
- Report CSV export
- Full purge of leftover Khonofy timesheet specs/hooks
