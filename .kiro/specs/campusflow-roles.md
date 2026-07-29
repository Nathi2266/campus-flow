# CampusFlow Roles and Permissions

Roles: `ADMIN` | `LECTURER` | `STUDENT` (JWT claim `role`, authority `ROLE_*`).

> Authoritative for CampusFlow. Khonofy `roles-permissions.md` (staff/admin/superuser) does **not** apply to this product.

## Personas (summary)

| Role | Focus |
|------|--------|
| ADMIN | Org setup: departments, users, students, courses, enrollments, reports, audit |
| LECTURER | Own courses: roster, capacity, grade entry; read students/reports in scope |
| STUDENT | Browse courses, self-enroll/drop, view own grades and profile |

## Registration

- Public `POST /auth/register` creates **STUDENT only**. Role in body is ignored or rejected if not STUDENT.
- ADMIN and LECTURER accounts are provisioned by an ADMIN via user administration APIs.

## Capability matrix

| Capability | ADMIN | LECTURER | STUDENT |
|------------|:-----:|:--------:|:-------:|
| Password login / refresh / logout / me | Yes | Yes | Yes |
| Patch own profile (name, phone) | Yes | Yes | Yes |
| Department CRUD | Yes | — | — |
| User list / create / role+dept assign | Yes | — | — |
| Students list | Yes | Yes (read) | Own record only |
| Students get by id | Yes | Yes (read) | Own record only |
| Students create / update / delete | Yes | — | — |
| Student create returns one-time temp password | Yes | — | — |
| Courses list | Yes | Yes (prefer own) | Yes (active catalog) |
| Courses create / activate / deactivate / delete | Yes | — | — |
| Courses update (metadata) | Yes | Own courses only | — |
| Enrollments list | Yes (all) | Yes (own courses) | Own only |
| Enrollments create | Yes | Yes | Own student only |
| Enrollments drop | Yes | Yes | Own only |
| Grade update | Yes | Own courses | — |
| Reports | Yes | Yes | — |
| Audit log view | Yes | — | — |

## API scoping rules

- **ADMIN:** no department filter required; may filter by query params.
- **LECTURER:** course lists default to `lecturerId = self`; enrollment mutations/grades only when enrollment’s course belongs to self; student write denied.
- **STUDENT:** enrollment list/create/drop only for linked `Student.user_id = self`; course list may return active courses for catalog.
- Never rely on client-only role gates; enforce with `@PreAuthorize` + service checks.

## Related

- Grades: `campusflow-grades.md`
- Security matrix detail: `security-implementation.md`
- Frontend routes: `campusflow-frontend.md`
