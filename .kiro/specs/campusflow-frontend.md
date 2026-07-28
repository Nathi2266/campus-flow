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
| `/login`, `/register` | Auth | Public |
| `/` | Role dashboard | Authenticated |
| `/students` | Student management | ADMIN, LECTURER |
| `/courses` | Course management | ADMIN, LECTURER |
| `/enrollments` | Enrollment management | ADMIN, LECTURER, STUDENT (own) |
| `/reports` | Reports | ADMIN, LECTURER |
| `/profile` | Profile | Authenticated |
| `/settings` | Settings | Authenticated |
| `/notifications` | Notifications shell | Authenticated |
| `*` | Not found | Public |

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

## Known backend gaps (FE must degrade)

- `GET /auth/me`, refresh, logout stubs
- Several report endpoints stubbed
- No DepartmentController — use numeric department IDs in forms
- Server RBAC not enforced — client role gates are defense-in-depth only

## Related

- Architecture: `campusflow-architecture.md`
- API: controllers + `api-specification.yaml` (prefer code paths)
- Security: `security-implementation.md`
- Design system: `../project/campusflow-design-system.md` (Poppins + layout tokens)
- Council: `.kiro/memory/council-review-campusflow-frontend.md`, `.kiro/memory/council-review-poppins-ui-expand.md`
