# CampusFlow

[![CI](https://github.com/Nathi2266/campus-flow/actions/workflows/ci.yml/badge.svg)](https://github.com/Nathi2266/campus-flow/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

CampusFlow is a full-stack **Student Management System** for campus academics. Administrators run departments, users, and courses; lecturers manage rosters and grades; students browse the catalogue, enroll, and view their results.

Built with **Java 21 / Spring Boot 3** and a **React + Vite** UI. Roles: `ADMIN` · `LECTURER` · `STUDENT`.

> Self-hostable demo / MVP. Local Compose includes Flyway seed accounts for exploration — do not use those passwords in a real production database. See [Production notes](#production-notes).

---

## What the project is

CampusFlow covers the academic loop for a single campus organization:

1. **Admins** manage departments, staff/student users, courses, enrollments, reports, notifications, and audit history.
2. **Lecturers** update their courses, view rosters, enter grades (including bulk), and review scoped reports.
3. **Students** browse the active course catalogue, self-enroll/drop, and view grades, profile, and notifications.

Department is the soft organizational boundary. Authorization is enforced on the API with Spring Security + JWT (not client-only gates).

Authoritative product rules live under [`.kiro/specs/`](.kiro/specs/) (start with [`project-overview.md`](.kiro/specs/project-overview.md) and [`campusflow-roles.md`](.kiro/specs/campusflow-roles.md)).

---

## Features

- **Authentication** — JWT login, refresh rotation, logout; registration creates **STUDENT** accounts only (staff provisioned by ADMIN)
- **Role-based access** — ADMIN / LECTURER / STUDENT capability matrix on API and UI
- **Departments & users** — CRUD, search/filter, soft activate/deactivate, temp-password invite flow
- **Students** — directory, academic record drawer, GPA display on profile/record views
- **Courses** — catalogue with search, capacity badges, activate/deactivate, lecturer assignment
- **Enrollments** — staff create/drop; student self-enroll/drop with capacity checks
- **Grades** — per-enrollment grading and bulk grade entry on the course roster
- **Reports & CSV** — statistics, students-per-course, active-courses, graduation-progress exports
- **Notifications** — in-app inbox + per-user `notifyInApp` preference
- **Audit log** — ADMIN visibility into key administrative actions
- **Role dashboards** — KPIs and quick links per persona
- **Marketing site** — public landing, features, roles, and about pages

---

## Screenshots

### Marketing

Landing page:

![CampusFlow landing](docs/screenshots/01-landing.png)

Login:

![CampusFlow login](docs/screenshots/02-login.png)

Features:

![CampusFlow features](docs/screenshots/03-features.png)

Roles:

![CampusFlow roles](docs/screenshots/04-roles.png)

### Administrator

Dashboard:

![Admin dashboard](docs/screenshots/05-admin-dashboard.png)

Departments:

![Admin departments](docs/screenshots/06-admin-departments.png)

Users:

![Admin users](docs/screenshots/07-admin-users.png)

Students:

![Admin students](docs/screenshots/08-admin-students.png)

Courses:

![Admin courses](docs/screenshots/09-admin-courses.png)

Enrollments:

![Admin enrollments](docs/screenshots/10-admin-enrollments.png)

Reports:

![Admin reports](docs/screenshots/11-admin-reports.png)

Audit log:

![Admin audit](docs/screenshots/12-admin-audit.png)

Notifications:

![Admin notifications](docs/screenshots/13-admin-notifications.png)

### Lecturer

Dashboard:

![Lecturer dashboard](docs/screenshots/14-lecturer-dashboard.png)

Courses:

![Lecturer courses](docs/screenshots/15-lecturer-courses.png)

Course roster / grades:

![Lecturer roster](docs/screenshots/16-lecturer-roster.png)

Reports:

![Lecturer reports](docs/screenshots/17-lecturer-reports.png)

### Student

Dashboard:

![Student dashboard](docs/screenshots/18-student-dashboard.png)

Course catalogue:

![Student catalogue](docs/screenshots/19-student-catalogue.png)

My enrollments:

![Student enrollments](docs/screenshots/20-student-enrollments.png)

Profile:

![Student profile](docs/screenshots/21-student-profile.png)

| Asset | Path |
|-------|------|
| Captured UI screenshots | [`docs/screenshots/`](docs/screenshots/) |
| Hero photo source | [`frontend/public/campus_landing.png`](frontend/public/campus_landing.png) |
| Brand logo | [`frontend/public/campus_logo.png`](frontend/public/campus_logo.png) |
| Full role walkthrough (video) | [`frontend/e2e-artifacts/campusflow-full-app-walkthrough.webm`](frontend/e2e-artifacts/campusflow-full-app-walkthrough.webm) |
| Re-capture gallery | `cd frontend && node scripts/capture-readme-screenshots.mjs` |

After a local run, explore role UIs at `http://localhost:5173` using the demo accounts below.

---

## Technologies used

| Layer | Stack |
|-------|--------|
| Backend | Java 21, Spring Boot 3.2.5, Spring Security, Spring Data JPA |
| API docs | springdoc OpenAPI (Swagger UI — **dev** profile) |
| Database | PostgreSQL 15, Flyway migrations |
| Auth | JWT (access + refresh), BCrypt passwords |
| Frontend | React 19, TypeScript, Vite, Chakra UI, TanStack Query, Zustand, React Router |
| Forms / validation | React Hook Form, Zod |
| Testing | JUnit 5, Mockito, Vitest, Playwright |
| Ops | Docker Compose, GitHub Actions CI (`.github/workflows/ci.yml`) |
| Build | Maven 3.9 (backend), npm (frontend) |

---

## Installation

### Prerequisites

- **Docker Desktop** (recommended for Postgres + full stack)
- **Node.js 22+** and npm (frontend)
- **Java 21** and **Maven 3.8+** (optional — only if you run the API outside Docker)

**Windows:** start Docker Desktop and wait until the engine is running before any `docker compose` command. If you see `npipe:////./pipe/dockerDesktopLinuxEngine`, the engine is not up yet.

### Clone

```bash
git clone https://github.com/Nathi2266/campus-flow.git
cd campus-flow
```

---

## How to run it

### Option A — Full stack with Docker (recommended)

From the repository root:

```powershell
docker compose -f docker/docker-compose.yml up -d --build
docker compose -f docker/docker-compose.yml ps
```

| Service | URL |
|---------|-----|
| UI | http://localhost:5173 |
| API | http://localhost:8090 |
| Swagger (dev) | http://localhost:8090/swagger-ui.html |

```powershell
# Logs / stop
docker compose -f docker/docker-compose.yml logs -f app
docker compose -f docker/docker-compose.yml down
```

#### Demo logins (Flyway seed — local/demo only)

| Role | Email | Password |
|------|-------|----------|
| ADMIN | `admin@campusflow.edu` | `Admin123!` |
| LECTURER | `lecturer1@campusflow.edu` | `Admin123!` |
| STUDENT | `student1@campusflow.edu` | `Admin123!` |

These accounts are **not** shown in the login UI. Never reuse them for a shared or production database.

### Option B — Local backend + frontend (Postgres via Docker)

**Terminal 1 — Postgres**

```powershell
docker compose -f docker/docker-compose.yml up -d postgres
```

**Terminal 2 — Backend** (Maven on PATH)

```powershell
$env:SPRING_PROFILES_ACTIVE="dev"
$env:SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5433/campusflow"
$env:SPRING_DATASOURCE_USERNAME="campusflow"
$env:SPRING_DATASOURCE_PASSWORD="campusflow123"
$env:JWT_SECRET="campusflow-dev-secret-key-min-32-bytes!!"
mvn spring-boot:run
```

If Maven is not installed, run the API container instead:

```powershell
docker compose -f docker/docker-compose.yml up -d postgres app
```

**Terminal 3 — Frontend**

```powershell
cd frontend
npm install
npm run dev
```

Vite proxies `/api` to `http://localhost:8090` by default. If the API is on Maven’s local port `8080`:

```powershell
$env:VITE_API_PROXY_TARGET="http://localhost:8080"
npm run dev
```

UI: http://localhost:5173

### Useful commands

```bash
# Backend tests / package
mvn test
mvn clean package

# Frontend quality gates
cd frontend
npm run lint
npm run typecheck
npm run test
npm run build

# Playwright e2e (API + UI must be reachable)
npm run test:e2e
```

### Environment variables (backend)

| Variable | Default / notes | Description |
|----------|-----------------|-------------|
| `SPRING_PROFILES_ACTIVE` | `dev` in Compose | `dev` or `prod` |
| `SERVER_PORT` | `8080` in container (`8090` published) | API port |
| `SPRING_DATASOURCE_URL` | Compose / `application-dev.yml` | JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | `campusflow` | DB user |
| `SPRING_DATASOURCE_PASSWORD` | dev only | Required in **prod** |
| `JWT_SECRET` | dev only (≥32 chars) | Required in **prod** |
| `CORS_ALLOWED_ORIGIN_PATTERNS` | localhost patterns | Comma-separated origins |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | `validate` | Hibernate DDL mode |

Production (`SPRING_PROFILES_ACTIVE=prod`) fails closed without `JWT_SECRET` and datasource credentials. See [`.kiro/specs/devops-deployment.md`](.kiro/specs/devops-deployment.md) for the full checklist. Env examples: [`docker/.env.example`](docker/.env.example).

### Production notes

Shipped hygiene includes fail-closed secrets outside `dev`, CORS owned by security config, auth rate limiting (in-memory per node), registration gated for prod, and CI for Maven + frontend gates.

### Secrets — do not commit

| Never commit | Safe alternative |
|--------------|------------------|
| `.env`, `docker/.env` | [`docker/.env.example`](docker/.env.example) |
| `/creds`, password dumps | Seed accounts documented in this README (demo only) |
| `*.pem` / `*.key` / `*.p12` / `*.jks` / `*.pfx` | Keep certs outside the repo / secret store |
| Azure `local.settings.json`, `.azure/`, `*.publishsettings` | Portal / Key Vault / CI secrets |
| `application-local.yml` with real JWT/DB passwords | Env vars + prod profile |

Root [`.gitignore`](.gitignore) blocks these patterns. CI runs `node scripts/verify-no-secrets.mjs` so secret-like paths cannot stay tracked. Local check before commit:

```bash
node scripts/verify-no-secrets.mjs
```

Still on the hardening roadmap (not done in this packaging slice):

- httpOnly cookie sessions (tokens currently in frontend `localStorage`)
- Flyway seed data split out of schema migrations for real prod DBs
- Broader backend test / coverage floors

Treat Compose + seed accounts as a **demo** until those items are addressed for your deployment.

---

## Project structure

```
campus-flow/
├── src/main/java/com/campusflow/   # Spring Boot API
├── src/main/resources/db/migration # Flyway
├── frontend/                       # React + Vite + Playwright
├── docker/                         # Dockerfile + compose
├── .github/workflows/ci.yml
├── .kiro/                          # AEOS specs, skills, memory
├── LICENSE                         # MIT
└── pom.xml
```

---

## License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE).

You may use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software, including in closed-source and commercial products, provided you keep the copyright notice and license text.

## Repository access (GitHub)

Public showcase repo. **Others may view, clone, and fork.** Direct contribution to this repository is locked down:

| Capability | Public / non-admin |
|------------|--------------------|
| Browse / clone / fork | Allowed |
| Push to `main` (or any branch) | Blocked |
| Create / delete branches on this repo | Blocked |
| Run GitHub Actions | Disabled |

Maintainer (admin) retains bypass to update the project. Prefer **forks** for your own changes; optional discussion via [Issues](https://github.com/Nathi2266/campus-flow/issues).

Settings applied: Actions disabled; active ruleset *Public read-only — no push / no new branches* (see repo **Settings → Rules → Rulesets**).

---

## Contact

| | |
|--|--|
| **Maintainer** | Nkosinathi Radebe ([Nathi2266](https://github.com/Nathi2266)) |
| **Email** | [Nathiradebe20@gmail.com](mailto:Nathiradebe20@gmail.com) |
| **Repository** | [github.com/Nathi2266/campus-flow](https://github.com/Nathi2266/campus-flow) |
| **Issues** | [github.com/Nathi2266/campus-flow/issues](https://github.com/Nathi2266/campus-flow/issues) |

Questions, bugs, and contribution ideas are welcome via GitHub Issues or email.
