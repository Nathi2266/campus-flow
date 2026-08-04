# CampusFlow Data Flows

Canonical operational flows for CampusFlow. Roles: `campusflow-roles.md`.

## Primary campus rhythm

```
ADMIN provisions departments, users, students, courses
        ↓
ADMIN/LECTURER enrolls students (or STUDENT self-enrolls)
        ↓
LECTURER opens course roster → grades / drops
        ↓
STUDENT views academic record (courses, grades, stored GPA)
        ↓
ADMIN/LECTURER reviews reports (lecturer = own courses)
```

## Role data scopes

| Flow | ADMIN | LECTURER | STUDENT |
|------|-------|----------|---------|
| Course roster | Any course | Own courses (`lecturer_id = self`) | Denied |
| Enrollment list filters | All | Own courses | Own enrollments |
| Student academic courses | Any student | Any student (read) | Own only |
| Reports statistics / lists | Org-wide (+ optional dept filter) | Own courses only | Denied |
| Capacity view | All courses | Own courses | Catalog (active) |

## Endpoints that close the graph

| Link | Endpoint |
|------|----------|
| Course → roster | `GET /api/v1/enrollments/course/{courseId}` |
| Student → courses | `GET /api/v1/students/{id}/courses` |
| Grade write | `PATCH /api/v1/enrollments/{id}/grade` |
| Reports | `GET /api/v1/reports/*` (scoped per role) |

## Capacity rules

- Enroll fails with `COURSE_FULL` when active enrollments ≥ `maxCapacity`.
- UI should surface fill ratio and near-full (≥80%) / full (100%) states.
- Max active enrollments per student remains 5.

## GPA

- `Student.gpa` is **display-only** in this cycle (no automatic recalculation on grade change).
- Recompute rules belong in a future update to `campusflow-grades.md`.

## Related

- Frontend routes: `campusflow-frontend.md`
- Grades: `campusflow-grades.md`
