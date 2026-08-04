# AGENTS — CampusFlow (AEOS)

This repository is **CampusFlow**: Spring Boot + React student management, orchestrated by AEOS under `.kiro/`.

## Before coding

1. Read `.cursor/rules/aeos.mdc` and `.kiro/constitution/*` (especially definition-of-done, security, testing).
2. Prefer CampusFlow specs over legacy Khonofy timesheet docs:
   - `.kiro/specs/campusflow-architecture.md`
   - `.kiro/specs/campusflow-roles.md`
   - `.kiro/specs/campusflow-frontend.md`
   - `.kiro/specs/backend-java.md`
   - `.kiro/specs/database-schema.md`
   - `.kiro/specs/security-implementation.md`
3. Use role skills via `.cursor/skills/<role>/` → `.kiro/skills/<role>/SKILL.md`.
4. Non-trivial work: Engineering Council (`.kiro/workflows/engineering-council.md`) before implementation.

## Stack facts (do not invent otherwise)

- Backend: `src/main/java`, Maven `pom.xml`, Flyway under `src/main/resources/db/migration/`
- Frontend: `frontend/` (Vite/React)
- Docker: `docker/docker-compose.yml` (API `:8090`, UI `:5173`)
- Schema changes: **Flyway migrations**, not Prisma

## Index

Human-oriented map: `README.md` and `.kiro/specs/project-overview.md`.
