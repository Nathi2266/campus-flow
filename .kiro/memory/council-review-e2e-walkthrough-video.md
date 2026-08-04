# Engineering Council Review: Full E2E + durable walkthrough video

> Date: 2026-08-04  
> **No code during council.** User ask includes implement → approved.

## Proposal

- **Ask:** Re-test whole CampusFlow app (all roles/features) with Playwright; fix until green; leave **one long retained video** of the full run for playback; prioritize highest-impact improvements; production-ready loop.
- **Why now:** Prior cycles shipped ADMIN Cycle 2 + dashboards; user needs a durable visual record of full verification.
- **Owning specs:** `campusflow-roles.md`, `campusflow-frontend.md`, `campusflow-data-flows.md`, `testing-strategy.md`
- **Opened by:** Loop Engineer

## Seat inputs (compact)

| Seat | Stance | Key finding |
|------|--------|-------------|
| PM | support | Trust via green E2E + visible walkthrough > new features |
| BA | support | Enforce existing role matrix; no new product rules |
| Architect | support | One serial walkthrough test → single Playwright video; copy to durable artifacts dir (test-results is ephemeral) |
| FE | support | Keep granular suite; add `full-app-walkthrough.spec.ts` (one test) for continuous recording |
| BE | abstain* | No API change required unless E2E finds regressions (*re-engage on fail) |
| DB | abstain | No schema this cycle |
| QA | support | Run full suite + walkthrough; fix→re-run until green; preserve video |
| Security | support-with-conditions | Keep IDOR negatives in walkthrough; do not disable security for recording |
| Perf | support-with-conditions | Serial workers=1; video on increases disk I/O only |
| DevOps | support | Stack already healthy on compose (:8090/:5173) |
| Docs | support | Document artifact path in memory + e2e-artifacts README |

## Conflicts

| Topic | Resolution |
|-------|------------|
| One video vs per-test clips | **One walkthrough test** (no ffmpeg required on Windows) |
| Commit video to git? | **No** — keep on disk under `frontend/e2e-artifacts/`; gitignore `*.webm` |
| Notifications in walkthrough? | Assert nav hidden (current product); do not invent UI |

## Loop recommendation

- **Decision:** go (user-approved)
- **Pipeline:** Walkthrough + video preserve → full suite → fix failures → document improvements
- **DoD:** Playwright green; durable video path documented; future-features honesty

## Next step

- [x] Council
- [x] Implement walkthrough + preserve
- [x] Run / fix until green (15/15 + walkthrough; durable video)
- [x] Document

## Loop verification

- Video: `frontend/e2e-artifacts/campusflow-full-app-walkthrough.webm`
- Command: `npm run test:e2e:walkthrough`
- Fixes this cycle: stale Docker FE rebuild; paginated student/course assertions; enrollment course filter wait; login response assert
