# Cycle 3 delivery — bulk grades, CSV/search, notifications (2026-08-04)

## Shipped

1. **Bulk grade entry** — `PATCH /api/v1/enrollments/grades/bulk` + roster inline edits + Save all
2. **CSV pack** — students-per-course, active-courses, graduation-progress exports
3. **Course catalogue search** — `search` on code/name
4. **Notifications MVP** — Flyway V6, inbox API, nav restored, settings `notifyInApp`
5. Event hooks: `GRADE_POSTED`, `ENROLLMENT_CREATED`, `COURSE_FULL`

## Deferred

- Waitlists + academic term/year
- Auth rate limiting / httpOnly cookies / prod seed gate (still highest production claim gap)

## Verification

- FE: lint, typecheck, build — pass
- BE: Docker image `mvn package -DskipTests` — pass (local host Maven/JDK lombok issue unrelated)
- Council: `.kiro/memory/council-review-cycle3-bulk-csv-notifications-2026-08-04.md`
- Specs: `campusflow-grades.md`, `campusflow-notifications.md`, `campusflow-frontend.md`, `campusflow-roles.md`, `database-schema.md`

## Follow-ups

- E2E against live stack after app recreate (nav-notifications visible; CSV buttons; course search; roster save-all)
- Expand BE automated tests for bulk + notification IDOR
- Next Feature Engineer pass: production auth hardening still top for “production ready”
