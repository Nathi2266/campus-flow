# CampusFlow Notifications (MVP)

In-app inbox for authenticated users. No email/SMS in this MVP.

## Events

| Type | Recipient | When |
|------|-----------|------|
| `GRADE_POSTED` | Student (enrollment’s user) | Grade set/changed (single or bulk) |
| `ENROLLMENT_CREATED` | Course lecturer (if assigned) | Successful enroll |
| `COURSE_FULL` | Acting user (usually student) | Enroll rejected with `COURSE_FULL` |
| `SYSTEM` | Targeted user | ADMIN seed / future broadcasts |

## Rules

1. Users list/read **only their own** notifications.
2. Mark one or all as read; unread count for nav badge.
3. Delivery respects `users.notify_in_app` (default `true`). When false, events are not persisted.
4. List is paginated, newest first.
5. Nav item **Notifications** is shown when the API is available.

## Endpoints

- `GET /api/v1/notifications?page&size`
- `GET /api/v1/notifications/unread-count` → `{ "count": number }`
- `PATCH /api/v1/notifications/{id}/read`
- `POST /api/v1/notifications/read-all`
- `PATCH /api/v1/auth/me/notifications` body `{ "notifyInApp": boolean }`

## Schema

Flyway `V6__notifications.sql`: table `notifications` + column `users.notify_in_app`.

## Related

- Roles: `campusflow-roles.md`
- Frontend: `campusflow-frontend.md`
- Grades: `campusflow-grades.md`
