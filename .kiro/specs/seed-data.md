# CampusFlow Seed & Bootstrap Data

## Policy (default)

**No mock or canned campus data is loaded by default.**

A fresh clone + empty database starts with:

1. Schema only (Flyway `classpath:db/migration`)
2. Optional **first ADMIN** via bootstrap env vars (when `users` is empty)
3. All departments, students, courses, enrollments created by operators through the API/UI

Frontend pages load data from the API only — there are no hardcoded student/course lists in the UI.

## Bootstrap first ADMIN

When `campusflow.bootstrap.enabled=true` (default) and the `users` table is empty:

| Env | Purpose |
|-----|---------|
| `CAMPUSFLOW_BOOTSTRAP_ADMIN_EMAIL` | First admin email (required to bootstrap) |
| `CAMPUSFLOW_BOOTSTRAP_ADMIN_PASSWORD` | Password (≥8 chars, required) |
| `CAMPUSFLOW_BOOTSTRAP_ADMIN_FIRST_NAME` | Default `System` |
| `CAMPUSFLOW_BOOTSTRAP_ADMIN_LAST_NAME` | Default `Admin` |

Compose local defaults (override in `docker/.env`):

- email: `admin@example.com`
- password: `Admin123!`

Production must set strong unique values (no demo campus emails).

## Optional demo pack

For local E2E / exploration only:

```bash
CAMPUSFLOW_SEED_DEMO=true
```

Loads Flyway scripts under `src/main/resources/db/demo-seed/` (`V900__demo_seed_data.sql`) with sample departments, users, courses, and enrollments. Password for demo users: `Admin123!`.

**Default is `false`.** Do not enable in real production databases.

## Migrations note

- `V2` / former seed content: no-op in default path (demo moved to `db/demo-seed`)
- `V3`: keeps `tokens.token` → `TEXT` schema change only
- Changing historical checksums requires a fresh DB volume locally:  
  `docker compose -f docker/docker-compose.yml down -v`

## How clones create their own data

1. Start Compose (seed demo off)
2. Sign in as bootstrap ADMIN
3. Create departments → users/lecturers → students → courses → enrollments
4. Students may also self-register (`STUDENT` role) when registration is enabled
