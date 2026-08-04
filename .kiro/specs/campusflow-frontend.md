# CampusFlow Frontend

## Stack

React 19, TypeScript, Vite, Chakra UI, React Router, TanStack Query, React Hook Form, Zod, Axios, Framer Motion, React Icons.

## Typography & visual system

- Typeface: **Poppins** (heading + body) per `.kiro/project/campusflow-design-system.md`
- Theme entry: `frontend/src/theme/index.ts`; font load: `frontend/index.html`
- Expanded shell: wider main canvas, multi-section surfaces on profile/settings/notifications/reports

## Base URL

- Dev: Vite proxy `/api` → `http://localhost:8080`
- API prefix: `/api/v1` (matches Spring controllers; not OpenAPI server path without `v1`)

## Roles

`ADMIN` | `LECTURER` | `STUDENT` (JWT claim `role`)

## Routes

| Path | Page | Roles |
|------|------|-------|
| `/` | Marketing landing (redirect → `/dashboard` if signed in) | Public |
| `/features` | Product features (explore) | Public |
| `/roles` | Role guide ADMIN / LECTURER / STUDENT | Public |
| `/about` | About CampusFlow | Public |
| `/login`, `/register` | Auth (register = STUDENT only) | Public |
| `/dashboard` | Role dashboard | Authenticated |
| `/students` | Student management + academic record drawer; ADMIN dept filter | ADMIN, LECTURER |
| `/courses` | Course catalogue + roster drawer (ADMIN/LECTURER); ADMIN dept/active filters; capacity badges | Authenticated |
| `/enrollments` | Enrollments + grade entry; status/course filters; COURSE_FULL toast | Authenticated |
| `/departments` | Department CRUD | ADMIN |
| `/users` | User administration | ADMIN |
| `/reports` | Reports (ADMIN dept filter; LECTURER own-course scope note) | ADMIN, LECTURER |
| `/audit` | Audit log viewer | ADMIN |
| `/profile` | Profile edit (GET/PATCH `/auth/me`) | Authenticated |
| `/settings` | Settings (dark mode toggle; persists `preferredTheme`) | Authenticated |
| `/notifications` | Notifications shell (P2; **nav hidden** until API) | Authenticated (unlinked) |
| `*` | Not found | Public |

## Theme preference

- Chakra color mode applies app-wide via semantic tokens (`app-bg`, `app-surface`, `app-border`, …) in `frontend/src/theme/index.ts`
- Settings → Dark mode calls `PATCH /api/v1/auth/me/theme` with `{ preferredTheme: "light" | "dark" }`
- DB: `users.preferred_theme` (Flyway `V4__user_preferred_theme.sql`); returned on login / `GET /auth/me`
- `ThemePreferenceSync` restores the saved theme into Chakra on session load so logout/login keeps the preference

## ADMIN Cycle 2 surfaces

- `/users`: search (name/email), role filter, soft activate/deactivate, optional password on create with one-time temp-password dialog
- `/reports`: Export CSV for students-per-course (`GET /reports/students-per-course/export`)
- Notifications nav item removed from `AppLayout` until a notifications API exists

## Demo credentials policy

- Login UI must **not** embed demo emails/passwords or fill buttons (production anti-pattern).
- Local/E2E seed accounts live in Flyway (`V2`/`V3`) and are documented in `README.md` + `frontend/e2e/helpers/auth.ts` only.
- Role dashboards and reports consume live APIs only — no fabricated KPI arrays in the UI.

## Landing (public `/`)

- Brand-first hero: **CampusFlow**, one headline, one supporting line, full-bleed visual
- **Auth CTA rule:** exactly **two** buttons on the landing page — **Sign in** and **Create account** (hero only). No duplicate auth buttons in nav, closing band, or footer.
- Explore navigation uses **text links** (not buttons): Features, Roles, About
- Below fold: richer product story (how it works, roles preview, capabilities, explore teasers) from `project-overview.md` — no unshipped feature claims
- Authenticated visitors to `/` redirect to `/dashboard`
- Logout returns to `/`

## Public explore

| Path | Purpose |
|------|---------|
| `/features` | Deep dive on catalogue, enrollments, grades, reports/audit |
| `/roles` | What each role can do |
| `/about` | Product purpose and design principles |

Shared chrome: `MarketingLayout` (logo, explore links, footer). Auth entry remains `/login` and `/register` (linked from the landing’s two buttons).

## Structure

```
frontend/src/
  app/          # providers, router
  layouts/      # AppShell, AuthLayout
  pages/        # route pages
  features/     # auth, students, courses, enrollments, reports, dashboards
  components/   # shared UI
  hooks/
  services/     # axios wrappers
  api/          # typed endpoints
  theme/        # Chakra theme
  utils/
  types/
  assets/
```

## Dashboard composition (`/dashboard`)

Role-specific home. Summary KPIs and lightweight graphics; deep analytics remain on `/reports`.

| Role | Data sources | UI |
|------|----------------|-----|
| ADMIN | `GET /reports/statistics`, students-per-course, graduation-progress, inactive-courses; `listStudents`; `listAuditLogs` | KPI tiles, active/graduation meters, top-course bars, recent students + audit, quick links |
| LECTURER | Scoped `listCourses`, `listEnrollments`, report stats (own courses) | KPI tiles (courses, seats, near-full), capacity bars, course cards + roster, recent enrollments, quick links |
| STUDENT | `getStudent` (GPA), `listEnrollments`, active `listCourses` teaser | KPI tiles (GPA, active/completed/graded), status breakdown, enrollment cards, catalogue teaser, quick links |

Charts use Chakra/SVG meters (no separate chart library required). Empty/error/loading states required.

## Cycle 1 role-expansion features

- **Course roster:** ADMIN/LECTURER open roster drawer from Courses (and lecturer dashboard) via `GET /enrollments/course/{id}`; grade/drop with query invalidation
- **List filters:** Enrollments (`status`, staff `courseId`); Courses ADMIN (`departmentId`, `active`); Students ADMIN (`departmentId`)
- **Academic record:** Students “View record” drawer (`GET /students/{id}/courses` + stored GPA); student dashboard GPA; Profile compact academic summary for STUDENT
- **Capacity UX:** `fillRatio` / Full · Near full (≥80%) · Open badges; enroll create surfaces COURSE_FULL clearly
- **Reports:** ADMIN department Select wired into report query keys; LECTURER note “Showing metrics for your courses”

## State

- Session: access/refresh tokens + user (auth store); clear on logout
- Server: TanStack Query
- Forms: React Hook Form + Zod

## Related

- Architecture: `campusflow-architecture.md`
- API: controllers + `api-specification.yaml` (prefer code paths)
- Security: `security-implementation.md`
- Design system: `../project/campusflow-design-system.md` (Poppins + layout tokens)
- Council: `.kiro/memory/council-review-campusflow-frontend.md`, `.kiro/memory/council-review-poppins-ui-expand.md`, `.kiro/memory/council-review-landing-ui.md`, `.kiro/memory/council-review-landing-cta-explore.md`
