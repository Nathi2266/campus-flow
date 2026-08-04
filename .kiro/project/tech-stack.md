# Tech Stack

| Layer | Choices |
|-------|---------|
| Frontend | React 19, Vite, React Router, TanStack Query, Chakra UI, Zod, Zustand |
| Backend | Java 21, Spring Boot 3.2, Spring Security, Spring Data JPA, MapStruct |
| Auth | JWT (access + refresh rotation), BCrypt(12), method security (`@PreAuthorize`) |
| Database | PostgreSQL 15, Flyway migrations |
| API docs | springdoc OpenAPI (enabled in `dev` profile only) |
| Frontend tooling | TypeScript, oxlint, Vitest, Playwright |
| Backend tooling | Maven 3.9, JUnit 5, Mockito, JaCoCo, Testcontainers (available) |
| Ops | Docker multi-stage + Compose (`docker/`); GitHub Actions CI |

Ports (local Compose): UI **5173**, API host **8090** → container **8080**, Postgres host **5433** → **5432**.

Canonical product specs: `.kiro/specs/campusflow-*.md`, `backend-java.md`, `database-schema.md`, `security-implementation.md`.
