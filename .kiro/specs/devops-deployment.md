# CampusFlow DevOps and Deployment

## Overview (current)

| Capability | Status |
|------------|--------|
| Docker multi-stage API image | Yes — `docker/Dockerfile` |
| Docker Compose (Postgres + API + frontend) | Yes — `docker/docker-compose.yml` |
| Healthchecks | Yes — Postgres `pg_isready`, API `/actuator/health` |
| Env example | Yes — `docker/.env.example` |
| GitHub Actions CI | Yes — `.github/workflows/ci.yml` (Maven test/package + FE lint/typecheck/test/build) |
| Prod Compose / Kubernetes / Prometheus | **Not in repo** — aspirational; do not assume present |

## Layout

```
campus/
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── healthcheck.sh
│   └── .env.example
├── frontend/
│   ├── Dockerfile
│   └── docker/nginx.conf
├── .github/workflows/ci.yml
├── .gitignore
└── pom.xml
```

## Local stack

```powershell
docker compose -f docker/docker-compose.yml up -d --build
```

| Service | Host port |
|---------|-----------|
| UI (nginx) | 5173 |
| API | 8090 → 8080 |
| Postgres | 5433 → 5432 |

Seed logins (Flyway demo only — **not** for production): see root `README.md`.

## Production checklist

1. `SPRING_PROFILES_ACTIVE=prod`
2. Strong unique `JWT_SECRET` (≥32 chars) and `POSTGRES_PASSWORD`
3. Exact `CORS_ALLOWED_ORIGIN_PATTERNS` (no broad wildcards if avoidable)
4. `SPRINGDOC_SWAGGER_UI_ENABLED=false` (prod profile disables springdoc)
5. Do not rely on Flyway seed accounts; rotate or disable before shared/prod DBs
6. TLS terminated at reverse proxy / platform load balancer

## Git hygiene

Root `.gitignore` must exclude Maven `target/`, frontend `node_modules`/`dist`, Playwright reports, `.env` files (keep `*.env.example`), IDE junk, and keystores. Never commit JaCoCo/Surefire outputs.

## CI

`.github/workflows/ci.yml` runs:

- Backend: `mvn test` then `mvn -DskipTests package`
- Frontend: `npm ci` → lint → typecheck → test → build

E2E Playwright remains manual/compose-driven until a dedicated job is added.
