# CampusFlow frontend — backend contract notes

Validated against `src/main/java/com/campusflow/web/api/*` (2026-07-28).

## Usable by UI

| Area | Endpoints | Notes |
|------|-----------|-------|
| Auth | POST `/api/v1/auth/register`, `/login` | Login currently skips password verify (BE debt) |
| Students | CRUD `/api/v1/students` | Soft delete |
| Courses | CRUD + activate/deactivate | |
| Enrollments | POST create, DELETE drop, GET by id/student/course | List GET `/enrollments` may be stubbed |
| Reports | GET `/reports/statistics` | Partial placeholders |

## Missing / stubbed (FE degrades)

- GET `/auth/me`, refresh, logout
- DepartmentController (OpenAPI only)
- Several report list endpoints return empty
- Notifications / settings persistence
- Method-level RBAC (`@PreAuthorize`)

## FE client

- Axios baseURL `/api/v1`
- Bearer access token from Zustand persist
- Role gates are client-side only until BE enforces
