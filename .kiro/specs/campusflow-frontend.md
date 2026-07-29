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
| `/login`, `/register` | Auth (register = STUDENT only) | Public |
| `/` | Role dashboard | Authenticated |
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
- Council: `.kiro/memory/council-review-campusflow-frontend.md`, `.kiro/memory/council-review-poppins-ui-expand.md`
