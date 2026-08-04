# Engineering Council Review: Production readiness + gitignore hygiene

> Filled during `.kiro/workflows/engineering-council.md`. User asked to implement after review.

## Proposal

- **Ask / feature:** Full project review; update all `.gitignore` files; prioritize highest-impact production-readiness improvements; implement/verify/document until production-ready.
- **Why now:** Root `.gitignore` missing; ~407 `target/` artifacts tracked; AEOS project docs still describe Express/Prisma; security defaults and CI gaps block a production claim.
- **Owning specs:** `.kiro/specs/campusflow-architecture.md`, `security-implementation.md`, `devops-deployment.md`, `.kiro/project/folder-structure.md`, `tech-stack.md`
- **Opened by:** Loop Engineer
- **Verbose:** no (standard council record)

## Specs loaded for council

- `.kiro/constitution/definition-of-done.md`, `security-principles.md`, `testing-principles.md`
- `.kiro/project/folder-structure.md`, `tech-stack.md`
- `.kiro/memory/admin-cycle2-readiness-2026-08-04.md`, `future-features.md`
- Explore assessments: backend/security/devops, frontend/QA/perf, AEOS docs drift

## Seat inputs

### Product Manager

- **Stance:** support-with-conditions
- **Business value:** Demo/ADMIN Cycle 2 is green; production claim needs hygiene + auth/ops hardening over new features.
- **Acceptance intent:** Repo clean of build artifacts; secrets fail-closed in prod; CI gates; docs match Spring+React stack.
- **Conditions / risks:** Defer Notifications MVP; do not invent new product rules.

### Business Analyst

- **Stance:** support-with-conditions
- **Spec gaps:** `business-rules.md` still indexes timesheets; agent entrypoints risk wrong domain.
- **Domain rules cited:** `campusflow-roles.md`, grades, data-flows (canonical).
- **Conditions:** Point indexes at CampusFlow specs; no domain rule invention in this loop.

### Solution Architect

- **Stance:** support-with-conditions
- **Architectural fit:** Runtime is Spring Boot 3.2 + JPA/Flyway + React/Vite; AEOS project/* and skills still Express/Prisma.
- **Boundaries / sequencing:** (1) gitignore/untrack (2) security config (3) docs/DoD (4) CI/coverage realism (5) auth rate-limit/cookies later.
- **Conditions:** Single CORS source; fail-closed secrets; align DoD to Maven/Flyway.

### Frontend Engineer

- **Stance:** support-with-conditions
- **UI impact:** None for gitignore/docs; token storage remains localStorage (future hardening).
- **A11y notes:** Skip-link / axe deferred unless touching UI this cycle.
- **Conditions:** Frontend `.gitignore` must cover `.env`, coverage; untrack `playwright-report`.

### Backend Engineer

- **Stance:** support-with-conditions
- **API / logic impact:** Error handler path leak; dual CORS; weak test/coverage gate.
- **Permission enforcement:** Method security present; login 400 vs 401 polish.
- **Conditions:** Harden errors/CORS/secrets; realistic JaCoCo; optional repo package path fix.

### Database Engineer

- **Stance:** support-with-conditions
- **Schema / migration implications:** Seed passwords in Flyway V2/V3 are demo bootstrap — document as non-prod; no schema change this cycle unless seed split.
- **Data risk:** Running prod migrations with seed credentials = backdoor accounts.
- **Conditions:** Document; prefer seed profile separation in a later cycle.

### QA Engineer

- **Stance:** support-with-conditions
- **Testing needs:** Keep AdminApiSecurityTest + Playwright green; CI should run unit/security at minimum.
- **Regression scope:** Auth/CORS/error handler changes; gitignore must not break Docker ignore.
- **Conditions:** Do not lower security tests; JaCoCo floor must still fail on regressions of critical packages eventually.

### Security Engineer

- **Stance:** support-with-conditions
- **Security concerns:** Tracked `target/` (incl. copied YAML/classes); insecure JWT/DB defaults; dual CORS; error message leakage; seed `Admin123!`; no rate limit / httpOnly cookies (Cycle 3+).
- **Conditions:** Git hygiene + fail-closed prod secrets + single CORS + safe error bodies this cycle; rate-limit/cookies backlog.

### Performance Engineer

- **Stance:** support (low local impact)
- **Scalability / hotspots:** `@SpringBootTest` ~421s smell for CI; Playwright always-on video costly.
- **Conditions:** CI should use focused surefire first; retain-on-failure video later.

### Optional seats

#### DevOps

- **Stance:** support-with-conditions
- **Findings:** No root `.gitignore`; no `.github/workflows` despite README badges; compose defaults `dev`.
- **Conditions:** Add ignore + CI; ground `devops-deployment.md` to actual `docker/` assets.

#### Documentation

- **Stance:** support
- **Findings:** Rewrite folder-structure/tech-stack; update DoD; refresh technical-debt; add AGENTS.md pointer.

## Conflicts

| Topic | Positions | Resolution |
|-------|-----------|------------|
| JaCoCo 95% vs ~14% service coverage | QA wants high bar; BE says verify is broken | Lower package minimum to achievable floor now; expand tests incrementally; document debt |
| Seed passwords in migrations | Sec: split seeds; DB: no migration churn this cycle | Document + backlog seed profile; no Flyway rewrite this cycle |
| httpOnly cookies | Sec/FE want for prod; scope large | Backlog Cycle 3+; do not block git/security hygiene |

## Loop Engineer recommendation

- **Decision:** go-with-conditions
- **Summary:** Highest impact is repo hygiene (root `.gitignore`, untrack `target/` + Playwright report), then security config hardening (CORS, error leak, prod secrets), then AEOS project/DoD/devops doc alignment, then CI + realistic coverage gate. Full “production ready” (rate limits, httpOnly cookies, seed split, broad tests) continues across cycles.
- **Spec updates required before code:**
  - [x] None blocking for hygiene/security config (docs update in same pipeline)
- **Conditions to satisfy:**
  - [x] Root + frontend gitignore complete; build artifacts untracked
  - [x] Single CORS source; safer error responses; prod fail-closed secrets path
  - [x] Project docs / DoD / debt memory updated for Spring+React
  - [x] Minimal CI workflow present
  - [ ] Rate limiting / httpOnly cookies — deferred
  - [ ] Seed migration split — deferred
- **Recommended workflow:** `.kiro/workflows/refactor.md` + security-minded bug-fix for config
- **Implementation pipeline (ordered):**
  1. DevOps/Docs — `.gitignore` files + untrack artifacts
  2. Security/Backend — CORS, GlobalExceptionHandler, application.yml profiles
  3. Docs — folder-structure, tech-stack, DoD, devops, technical-debt, AGENTS.md
  4. DevOps/QA — CI workflow + JaCoCo floor
  5. Loop — verify `mvn test` (security suite) + FE typecheck/lint
- **DoD extras / test focus:** AdminApiSecurityTest; no secrets in tree; ignore verified via `git check-ignore`
- **Approved by:** user (explicit implement-until-production-ready request) — approved

## Next step

- [x] Begin implementation workflow
- [ ] Continue Cycle 3 auth hardening after this loop
