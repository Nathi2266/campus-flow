# ADMIN Cycle 2 verification — 2026-08-04

Council: `.kiro/memory/council-review-admin-cycle2.md`

## Shipped

| Item | Result |
|------|--------|
| Hide Notifications nav | Done (`AppLayout`; route unlinked) |
| User search + role filter | `GET /users/search` + UsersPage |
| Staff temp password / invite | Password optional on create; AlertDialog reveal |
| User soft deactivate/activate | `users.active` V5; login + JWT reject inactive; no self-deactivate |
| Report CSV export | `GET /reports/students-per-course/export` + Export CSV button |
| ADMIN API security tests | `AdminApiSecurityTest` (`@SpringBootTest` + `@WithMockUser`) |
| Newest-first lists | Users (prior), Courses + Enrollments default `id DESC` |

## Gates

| Gate | Result |
|------|--------|
| FE typecheck | Pass |
| Playwright `roles-and-data-flow.spec.ts` | **15/15 passed** |
| Playwright `full-app-walkthrough.spec.ts` | **1/1 passed** |
| API Docker + Flyway V5 | Healthy; `users.active` present |
| Login smoke | `admin@campusflow.edu` active=true |

## Ops note

E2E against Docker frontend (`campusflow-frontend` on `:5173`) requires rebuild after FE changes (`docker compose … up -d --build frontend`). Local Vite is not on 5173 when the compose frontend container is bound to that port.

## Next (Cycle 3+)

- Notifications MVP + settings prefs
- Bulk grade entry; GPA auto-recompute
- Auth rate limiting / httpOnly cookies
- Expand CSV pack / email invite delivery
