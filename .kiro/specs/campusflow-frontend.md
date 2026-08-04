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
| `/students` | Student management (ADMIN write; LECTURER read) | ADMIN, LECTURER |
| `/courses` | Course catalogue (ADMIN full; LECTURER edit own; STUDENT active read-only) | Authenticated |
| `/enrollments` | Enrollments + grade entry (STUDENT self-enroll/drop) | Authenticated |
| `/departments` | Department CRUD | ADMIN |
| `/users` | User administration | ADMIN |
| `/reports` | Reports | ADMIN, LECTURER |
| `/audit` | Audit log viewer | ADMIN |
| `/profile` | Profile edit (GET/PATCH `/auth/me`) | Authenticated |
| `/settings` | Settings | Authenticated |
| `/notifications` | Notifications shell (P2 API deferred) | Authenticated |
| `*` | Not found | Public |

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
