# CampusFlow Grades

## Rules

1. Only **ADMIN** or the **LECTURER assigned to the enrollment’s course** may set or change `Enrollment.grade`.
2. Grade is a short string (max 5 chars), e.g. `A`, `B+`, `75`, `P` — validated as non-blank when provided.
3. When a grade is set, enrollment `status` may be updated to `COMPLETED` or `FAILED` in the same request; if omitted, status stays unchanged unless explicitly set.
4. STUDENT may read their own grades; they cannot write grades.
5. GPA recalculation is **out of scope** for this sprint (existing `Student.gpa` remains as stored; no auto-recompute).

## Endpoint

- `PATCH /api/v1/enrollments/{id}/grade` body: `{ "grade": string, "status"?: "COMPLETED"|"FAILED"|"ACTIVE"|"DROPPED" }`

## Related

- Roles: `campusflow-roles.md`
- Enrollment entity: `database-schema.md`
