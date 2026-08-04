# Engineering Council Review: Full-system E2E + durable recordings (re-verify)

> Date: 2026-08-04 (afternoon)  
> User approved implement/verify.

## Proposal

- **Ask:** Full-system test all screens/roles; keep Playwright playback videos; prioritize improvements; production-ready loop.
- **Why now:** Re-verify after production-readiness hygiene; Cycle 3 (bulk/CSV/notifications) not yet shipped — do not invent those into E2E.
- **Owning specs:** `campusflow-roles.md`, `campusflow-frontend.md`, `testing-strategy.md`
- **Opened by:** Loop Engineer

## Seats (compact)

| Seat | Stance | Finding |
|------|--------|---------|
| PM | support | Green E2E + watchable archive > new Cycle 3 until decided |
| BA | support | Assert current matrix (notifications nav still hidden per Cycle 2) |
| Architect | support | Start missing `campusflow-app`; archive to `e2e-artifacts/runs/` |
| FE | support | `npm run test:e2e:full` + preserve script; never clear artifacts |
| BE | support-with-conditions | App container was down — bring up before E2E |
| DB | abstain | No schema this pass |
| QA | support | 16-test suite + walkthrough; fix→re-run; archive all webms |
| Security | support | Keep IDOR + role gates |
| Perf | support | Serial workers=1 |
| DevOps | support | Compose up app; FE waits on healthy API |
| Docs | support | e2e-failure-report + council close |

## Conflicts

| Topic | Resolution |
|-------|------------|
| Ship Cycle 3 in this Loop? | **No** — future-features still "awaiting user decision"; this Loop = verify + recordings |
| Delete prior run folders? | **Never auto-delete** |

## Loop recommendation

- **Decision:** go
- **Pipeline:** Start API → full E2E + archive → fix → document

## Next step

- [x] Council
- [x] Bring up app + rebuild FE + full E2E (16/16)
- [x] Document (`e2e-failure-report.md`; archive `runs/20260804-142950`)

## Outcome (2026-08-04 PM)

- Stale Compose frontend lacked Notifications nav → rebuild fixed.
- Role assertions updated to dashboard eyebrows (Administrator/Lecturer/Student).
- Preserve always runs after Playwright; hero skip if walkthrough &lt; 1 MB.
- Cycle 3 features (notifications nav, bulk grades, CSV) are already in product — this Loop was verify-only, not Cycle 3 invent.
