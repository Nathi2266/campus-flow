# Future Features

<!-- Product ideas only. Promote into specs when scheduled for delivery. -->
<!-- Source: Engineering Council 2026-07-28 — role-value backlog -->
<!-- Product: CampusFlow (ADMIN | LECTURER | STUDENT) -->

## Shipped (P0–P1) — 2026-07-28

- Real password verification + V3 seed hash (`Admin123!`)
- `/auth/me` GET/PATCH, profile edit, refresh/logout via `tokens`
- Method-level RBAC + list scoping
- Public register = STUDENT only
- Department CRUD + pickers; User admin; Audit viewer
- Student/course edit + search; real report endpoints
- Lecturer own-course update + grade entry + scoped lists
- Student self-enroll/drop, course catalog, grades on dashboard

## P2 — Remaining

- Notifications MVP (enrollment, grade, capacity) — FE shell exists
- Settings persistence for notification prefs
- Report CSV export
- Pagination UX polish on major lists
- Broader audit coverage beyond login events

## Spec hygiene (ongoing)

- Prefer `campusflow-roles.md` / `campusflow-grades.md` over Khonofy staff/admin/superuser docs
