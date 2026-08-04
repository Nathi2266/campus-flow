# Future Features

<!-- Product: CampusFlow (ADMIN | LECTURER | STUDENT) -->

## Shipped

### Foundations + production hygiene (through 2026-07-29)
- Auth, RBAC, departments/users/audit, grades, self-enroll, reports, JWT/env, FE refresh, E2E suite

### Role expansion Cycle 1 (2026-07-30)
- Course roster workspace (grade/drop inline)
- Enrollment/course/student list filters
- Student academic record drawer + GPA display + profile summary
- Capacity badges / near-full / COURSE_FULL toasts
- Lecturer-scoped reports + ADMIN department filter
- Mutate audit: enrollment create/drop, course create/activate/deactivate, grades, students, users
- Spec: `campusflow-data-flows.md`

### Role dashboards enrichment (2026-08-03)
- Admin / Lecturer / Student `/dashboard` KPIs, meters/bars, recent activity, quick links
- Shared Chakra/SVG chart primitives (no recharts)
- Specs: `campusflow-frontend.md` dashboard composition; `dashboards.md` legacy pointer
- Council: `council-review-role-dashboards.md`

### UI hygiene (2026-08-03)
- Removed fake settings/notification toggles; semantic `app-text` / `app-muted` for light + dark
- Consistent sidebar: bold labels, brand-green active state, centered CampusFlow title (no CF mark)

### Mock cleanup + ADMIN readiness (2026-08-03)
- Removed login demo-account fillers (ADMIN/LECTURER/STUDENT) from `LoginPage` — seed creds only in README + E2E helpers
- ADMIN reports statistics honor `departmentId` (aligned with other report endpoints)
- Expanded ADMIN Playwright coverage: departments, users, course activate/deactivate, reports filter, settings theme, audit, notifications shell
- Council: `.kiro/memory/council-review-mock-cleanup-admin-e2e.md`

### ADMIN Cycle 2 (2026-08-03)
- Notifications nav **hidden** (page route kept unlinked; full MVP deferred)
- User search + role filter; soft activate/deactivate (`users.active` V5); block login when inactive
- Staff create generates temp password when password omitted (invite flow)
- Report CSV export: students-per-course
- ADMIN API security `@WebMvcTest` matrix (`AdminApiSecurityTest`)
- Council: `.kiro/memory/council-review-admin-cycle2.md`

## Next highest impact (Cycle 3+)

1. Notifications MVP + settings prefs
2. Bulk grade entry on roster
3. GPA auto-recompute + transcript view (`campusflow-grades.md` update)
4. Waitlists + academic term/year (schema)
5. FORBIDDEN → HTTP 403 mapping; auth rate limiting; httpOnly cookies
6. Expand report CSV pack / user email invite delivery
7. Course catalogue search (lists grow past first page — E2E already works around via API)
8. Avoid nginx 502 during API cold start (FE should wait on app healthy / retry proxy)

## Spec hygiene

- Prefer `campusflow-roles.md`, `campusflow-data-flows.md`, `campusflow-grades.md`
- Ignore Khonofy timesheet leftovers for product decisions
