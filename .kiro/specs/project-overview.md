# Project Overview

## Active product (this repository)

**CampusFlow** is a campus student-management system (SMS) with roles `ADMIN` | `LECTURER` | `STUDENT`.

Authoritative CampusFlow specs:

- Roles: `campusflow-roles.md`
- Grades: `campusflow-grades.md`
- Frontend: `campusflow-frontend.md`
- Architecture: `campusflow-architecture.md`
- Security: `security-implementation.md`
- Schema: `database-schema.md`

> Legacy Khonofy timesheet docs (`timesheets.md`, `roles-permissions.md` with staff/admin/superuser, etc.) remain in the tree for historical AEOS templates but **do not** govern this codebase.

## Purpose

CampusFlow supports:

1. Admins manage departments, users, students, and courses.
2. Lecturers update own courses, view rosters, and enter grades.
3. Students browse the course catalog, self-enroll/drop, and view grades.
4. Leadership reviews reports and audit logs.

## Organizational boundary

Department is the soft tenancy boundary. Admins have org-wide access; lecturers are scoped to assigned courses; students see their own records.

## Core entities

| Entity | Role |
|--------|------|
| User | Account, role, department |
| Department | Org boundary |
| Student | Student profile linked 1:1 to User |
| Course | Taught course with capacity and lecturer |
| Enrollment | Student–course link with status and grade |
| Token | Refresh token persistence |
| AuditLog | Security / admin action history |

## Related

- Personas / capabilities: `campusflow-roles.md`
- Deployment: `devops-deployment.md`, `docker/docker-compose.yml`, `docker/.env.example`
