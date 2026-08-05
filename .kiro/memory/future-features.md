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

### Brand logo + favicon (2026-08-04)
- `public/campus_logo.png` as favicon and in-app logo via `BrandLogo`
- Applied on AppLayout (ADMIN/LECTURER/STUDENT), AuthLayout, MarketingLayout
- Council: `council-review-campus-logo.md`

### White brand mark (2026-08-04)
- Logo mark converted to white-on-transparent; favicon white mark on brand-dark tile
- Light shells (role AppLayout + sticky marketing): white mark on brand badge
- Council: `council-review-white-logo.md`

### Landing hero photo (2026-08-04)
- Replaced abstract SVG hero with `public/campus_landing.png` (campus scene)
- Council: `council-review-landing-hero-image.md`

### Global motion + logo loader (2026-08-04)
- Page transitions on marketing / auth / Admin·Lecturer·Student shells
- Centered global loader with theme logos + rotate/pause cycle; hover polish
- Council: `council-review-global-motion-loader.md`

### OSS packaging — MIT + README (2026-08-05)

- Root MIT `LICENSE` (copyright Nkosinathi Radebe / Nathi2266 / Nathiradebe20@gmail.com)
- GitHub-ready README: what / features / screenshots / install / run / tech / license / contact
- Badges → `Nathi2266/campus-flow` + MIT; expanded screenshot gallery (marketing + ADMIN/LECTURER/STUDENT)
- Council: `council-review-mit-license-readme-prod-2026-08-05.md`

## Next highest impact (post Cycle 3)

> Cycle 3 shipped 2026-08-04 — see `.kiro/memory/cycle3-bulk-csv-notifications-2026-08-04.md`.

1. **Production auth hardening (remaining)** — httpOnly cookies; Flyway seed profile-split  
   - ~~rate limiting~~ shipped; ~~refresh respects `users.active`~~ shipped; ~~prod registration default off~~ shipped
2. **GPA auto-recompute + transcript** — requires `campusflow-grades.md` update first
3. Waitlists + academic term/year (schema) — deferred until academic truth solid
4. Expand report CSV pack further / user email invite delivery
5. ~~Bulk grade entry on roster~~ shipped Cycle 3
6. ~~Notifications MVP + settings prefs~~ shipped Cycle 3
7. ~~Course catalogue search + extra CSV exports~~ shipped Cycle 3
8. ~~Avoid nginx 502 during API cold start~~ (Compose FE waits on healthy app; optional nginx retry still useful)

### Also shipped Cycle 3 (2026-08-04)
- Bulk grades API + roster Save all
- Notifications Flyway V6 + inbox + nav + `notifyInApp`
- CSV: students-per-course, active-courses, graduation-progress
- Course `search` filter
- Council: `council-review-cycle3-bulk-csv-notifications-2026-08-04.md`

### Also shipped with Cycle 2 verify (2026-08-04)
- `AccessDeniedException` → HTTP **403** (was incorrectly 500)
- Courses/enrollments default list sort `id DESC` (newest first)

### Production readiness hygiene loop (2026-08-04)
- Root `.gitignore`; untrack `target/` + Playwright report; FE ignore `.env`/coverage
- Fail-closed JWT/DB defaults outside `dev`; single CORS owner (`SecurityConfig`); safer error `path`
- Repositories under `com/campusflow/repository/`; Compose FE waits on healthy API
- CI workflow; JaCoCo package floor 10%; AEOS stack docs/DoD/devops grounded
- Council: `.kiro/memory/council-review-production-readiness-2026-08-04.md`

### Full-system E2E re-verify + durable recordings (2026-08-04 PM)
- **16/16** Playwright green; archive `frontend/e2e-artifacts/runs/20260804-142950/`
- Hero: `frontend/e2e-artifacts/campusflow-full-app-walkthrough.webm`
- Preserve-on-failure wrapper; hero size guard; role eyebrow assertions
- Council: `council-review-full-system-e2e-2026-08-04-pm.md`

### Secrets hygiene / .gitignore (2026-08-05)
- Expanded root + frontend ignore: `.env`, certs, Azure local, `/creds`, credential JSON
- Untracked committed `creds` dump (`git rm --cached`); file may remain local only
- CI job `secrets` → `scripts/verify-no-secrets.mjs`
- Council: `council-review-secrets-gitignore-2026-08-05.md`

### Live Chrome walkthrough @ 0.5× (2026-08-05)
- `npm run test:e2e:live` — one Chrome window, real-user pace, all roles
- Hero + `campusflow-full-app-walkthrough-0.5x.webm` via ffmpeg-static
- Council: `council-review-live-walkthrough-0.5x-2026-08-05.md`

### Public repo read-only for others (2026-08-05)
- GitHub Actions disabled; ruleset blocks branch create/push/delete (admin bypass)
- Others: view / clone / fork only — `council-review-github-readonly-public-2026-08-05.md`

### No mock data by default (2026-08-05)
- Demo campus removed from default Flyway; optional `CAMPUSFLOW_SEED_DEMO` + bootstrap ADMIN
- Council: `council-review-no-mock-data-2026-08-05.md`


## Spec hygiene

- Prefer `campusflow-roles.md`, `campusflow-data-flows.md`, `campusflow-grades.md`
- Ignore Khonofy timesheet leftovers for product decisions
