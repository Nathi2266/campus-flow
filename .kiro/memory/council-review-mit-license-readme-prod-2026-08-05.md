# Engineering Council Review: MIT LICENSE + README OSS packaging + production-readiness triage

> Filled during `.kiro/workflows/engineering-council.md`.
> **Approved by user** (implement / verify / document until production-ready packaging) — 2026-08-05.

## Proposal

- **Ask / feature:**
  1. Add **MIT LICENSE** (copyright **Nkosinathi Radebe / Nathi66**) and rewrite root `README.md` for GitHub with: What the project is, Features, Screenshots, Installation, How to run, Technologies, License, Contact.
  2. Triage highest-impact production-readiness work: NOW vs defer.
- **Why now:** Remote `https://github.com/Nathi66/campus-flow.git`; README claimed Apache 2.0 with missing `LICENSE` (`.kiro/memory/technical-debt.md`).
- **Owning specs:** `.kiro/specs/project-overview.md`, `devops-deployment.md`, `security-implementation.md`, `campusflow-roles.md`, `.kiro/constitution/definition-of-done.md`
- **Opened by:** Loop Engineer
- **Verbose:** no

## Specs loaded for council

- `.kiro/specs/project-overview.md`
- `.kiro/specs/campusflow-roles.md`
- `.kiro/specs/security-implementation.md`
- `.kiro/specs/devops-deployment.md`
- `.kiro/memory/future-features.md`
- `.kiro/memory/technical-debt.md`
- `.kiro/constitution/definition-of-done.md`
- `README.md`, `docker/docker-compose.yml`, `.github/workflows/ci.yml`

## Seat inputs (summary)

| Seat | Stance | Impact |
|------|--------|--------|
| Feature Engineer | support-with-conditions | medium |
| Product Manager | support-with-conditions | high (trust) |
| Business Analyst | support-with-conditions | low |
| Solution Architect | support-with-conditions | medium |
| Frontend Engineer | support-with-conditions | low (this slice) |
| Backend Engineer | support-with-conditions | low (this slice) |
| Database Engineer | support / support-with-conditions | none / high later |
| QA Engineer | support-with-conditions | low–medium |
| Security Engineer | support-with-conditions | high (legal) |
| Performance Engineer | abstain / defer | low |
| Documentation Engineer | support | high |
| DevOps / Preview | support-with-conditions | medium |

### Themes

- LICENSE + accurate README is **release packaging**, not a product feature.
- Features list must match **shipped** capabilities only.
- Do **not** claim fully production-hardened while `localStorage` tokens and Flyway seed passwords remain.
- Fix wrong-org / fake Codecov / Apache badges.
- Defer httpOnly cookies, Flyway seed split, GPA, waitlists, JaCoCo raise.

## Conflicts

| Topic | Resolution |
|-------|------------|
| Apache (README) vs MIT (ask) | Adopt MIT; add `LICENSE`; rewrite badge |
| “Production ready” vs residual auth/seed debt | README: self-hostable demo / MVP + hardening roadmap |
| Docs-only vs cookies/seeds same session | OSS packaging NOW; hardening deferred |
| Codecov / wrong-org badges | Point CI at `Nathi66/campus-flow`; drop Codecov |

## Loop Engineer recommendation

- **Decision:** **go-with-conditions** — **approved**
- **THIS session (ordered):**
  1. Add MIT `LICENSE` (copyright Nkosinathi Radebe / Nathi66)
  2. Rewrite root `README.md` (required sections)
  3. Fix badges (Actions + MIT; no Codecov/Apache)
  4. Screenshots gallery (public PNGs / light captures; link e2e videos)
  5. Memory hygiene (`technical-debt.md`, this council file, `future-features.md` note)
- **Defer (priority):** httpOnly cookies → Flyway seed profile-split → BE tests/JaCoCo → GPA/transcript → waitlists / Redis rate-limit / CI Playwright / CONTRIBUTING
- **DoD:** Manual README walkthrough; FE gates only if FE code touched
