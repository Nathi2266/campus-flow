# Engineering Council Review: No mock / demo seed by default

> Date: 2026-08-05  
> User approved implement/verify.

## Proposal

- **Ask:** Remove hardcoded/mock/demo data so clones start empty and create their own data. Keep an optional opt-in demo seed for E2E only.
- **Why now:** Public clone experience; production-readiness (no baked-in campus).
- **Owning specs:** `seed-data.md`, `database-schema.md`, `devops-deployment.md`, `campusflow-roles.md`

## Seats (compact)

| Seat | Stance | Finding |
|------|--------|---------|
| PM | support | Empty start + first-admin bootstrap |
| BA | support | Spec: demo seed opt-in, not default |
| Architect | support | Flyway schema-only; optional `db/demo-seed`; bootstrap runner |
| BE | support | Env-driven first ADMIN when users empty |
| DB | support-with-conditions | Replace V2/V3 with no-ops; wipe volume / repair for existing DBs |
| FE | support | Confirm no mock lists in UI (API-driven) |
| QA | support | E2E uses bootstrap admin or `SEED_DEMO=true` |
| Security | support | Bootstrap password from env only; no default in prod |
| DevOps | support | Compose defaults: seed off, bootstrap on for local |
| Docs | support | README + seed-data.md rewrite |

## Conflicts

| Topic | Resolution |
|-------|------------|
| Keep demo accounts for E2E? | Opt-in `CAMPUSFLOW_SEED_DEMO=true` only |
| Changing V2/V3 checksums | Document `docker compose down -v` for local |

## Loop recommendation

- **Decision:** go

## Outcome

- Default Flyway: schema only (V2 seed removed; V3 keeps tokens TEXT)
- Optional `db/demo-seed` via `CAMPUSFLOW_SEED_DEMO=true` / `docker-compose.e2e.yml`
- `AdminBootstrap` creates first ADMIN from env when users empty
- Verified fresh volume: bootstrap `admin@example.com`, students=0, courses=0
- Specs/README updated (`seed-data.md`)
