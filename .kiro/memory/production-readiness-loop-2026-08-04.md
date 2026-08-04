# Production readiness loop — 2026-08-04

Council: `.kiro/memory/council-review-production-readiness-2026-08-04.md`

## Shipped this loop

| Item | Result |
|------|--------|
| Root `.gitignore` | Added (Maven `target/`, secrets, IDE, FE artifacts) |
| Frontend `.gitignore` | `.env`, coverage, Playwright cache |
| Untrack build artifacts | `target/**` + `frontend/playwright-report` removed from index |
| Fail-closed secrets | Base `application.yml` no JWT/DB password defaults; insecure only in `dev` |
| Single CORS | Removed hardcoded MVC CORS; `SecurityConfig` owns patterns |
| Error leak fix | `GlobalExceptionHandler` `path` = request URI |
| Repository path | Moved to `src/main/java/com/campusflow/repository/` |
| Compose cold-start | Frontend `depends_on` app `service_healthy` |
| CI | `.github/workflows/ci.yml` |
| JaCoCo floor | Package minimum 0.10 (raise with coverage) |
| Docs | `folder-structure`, `tech-stack`, DoD, devops, `AGENTS.md`, README, debt |

## Gates

| Gate | Result |
|------|--------|
| FE lint / typecheck / vitest | Pass |
| `AdminApiSecurityTest` + `StudentServiceTest` (Docker Maven) | Pass (exit 0) |
| `git check-ignore` on `target/`, `.env`, `docker/.env` | Pass |

## Still not production-claimed

- Auth rate limiting + httpOnly cookies
- Flyway seed password split / prod seed policy
- Broad backend coverage + Testcontainers Postgres path
- LICENSE file vs badge
- Remaining legacy Express/Prisma AEOS index specs

## Next

Commit when ready (large staged deletion of `target/`). Then Cycle 3 auth hardening.
