# Engineering Council Review: Full-system E2E + durable recordings

> Date: 2026-08-04  
> User approved implement/verify (goal includes production-ready loop).

## Proposal

- **Ask:** Full-system test of all screens/roles; keep Playwright playback videos (do not delete); prioritize high-impact improvements; implement → verify → document.
- **Owning specs:** `campusflow-roles.md`, `campusflow-frontend.md`, `campusflow-data-flows.md`, `testing-strategy.md`
- **Opened by:** Loop Engineer

## Seats (compact)

| Seat | Stance | Finding |
|------|--------|---------|
| PM | support | Trust via green full E2E + watchable recordings |
| BA | support | No new product rules; verify existing matrix |
| Architect | support | Durable archive under `e2e-artifacts/runs/<stamp>/` — Playwright wipes `test-results/` on next run |
| FE | support | `video: on`; post-run preserve all `.webm`; never clear `e2e-artifacts/` |
| BE | support-with-conditions | Re-engage only if E2E finds API regressions |
| DB | abstain | No schema |
| QA | support | Run all e2e specs; fix→re-run; archive videos before any cleanup |
| Security | support | Keep IDOR / role-gate coverage in suite |
| Perf | support-with-conditions | Serial workers=1; archive disk growth acceptable |
| DevOps | support | Stack healthy `:8090`/`:5173` |
| Docs | support | README + INDEX for each run; future-features honesty |

## Conflicts

| Topic | Resolution |
|-------|------------|
| Delete old recordings? | **Never auto-delete** `e2e-artifacts/` |
| One video vs all clips | Keep **walkthrough** hero file + **per-test clips** in dated run folder |

## Loop recommendation

- **Decision:** go (user-approved)
- **Pipeline:** Enhance preserve → full Playwright → fix → document

## Next step

- [x] Council
- [x] Preserve-all videos (`e2e-artifacts/runs/<stamp>/` + hero walkthrough)
- [x] Full system E2E **16/16**
- [x] Document

## Loop verification

- Command: `npm run test:e2e:full`
- Hero video: `frontend/e2e-artifacts/campusflow-full-app-walkthrough.webm`
- Run archive: `frontend/e2e-artifacts/runs/20260804-111139/`
- Stack: compose healthy `:8090` / `:5173`
