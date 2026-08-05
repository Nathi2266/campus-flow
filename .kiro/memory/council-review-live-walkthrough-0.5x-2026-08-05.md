# Engineering Council Review: Live Chrome walkthrough @ 0.5×

> Date: 2026-08-05  
> User approved implement/verify.

## Proposal

- **Ask:** One continuous Playwright walkthrough in a **single headed Chrome** window (real-user pace), record video, archive at **0.5× playback** speed so the operator can watch live and review later.
- **Why now:** Operator monitoring + demo artifact; multi-test suite opens new contexts (feels robotic).
- **Owning specs:** `campusflow-roles.md`, `campusflow-frontend.md`, `testing-strategy.md`
- **Opened by:** Loop Engineer

## Seats (compact)

| Seat | Stance | Finding |
|------|--------|---------|
| PM | support | Watchable single journey > fragmented tests for this ask |
| BA | support | Cover ADMIN → LECTURER → STUDENT → register; all role screens |
| Architect | support | One test, one browser, `channel: chrome`, workers=1 |
| FE | support | Human pauses; visit notifications/profile/settings per role |
| BE | support | Stack healthy; no API change |
| DB | abstain | — |
| QA | support | Live script separate from CI headless suite |
| Security | support | Keep IDOR checks; seed creds only |
| Perf | support | 0.5× via ffmpeg post + slowMo for watch |
| DevOps | support | Ensure FE on :5173 |
| Docs | support | README + memory |

## Conflicts

| Topic | Resolution |
|-------|------------|
| Run full 16-test suite live? | **No** — one continuous walkthrough only (one browser) |
| Chromium vs Chrome | **Google Chrome** (`channel: 'chrome'`) |

## Loop recommendation

- **Decision:** go
- **Pipeline:** Harden walkthrough + live script → headed run → archive + 0.5× video → document

## Next step

- [x] Council
- [x] Implement (`npm run test:e2e:live`)
- [x] Live verify + document

## Outcome

- **1/1 passed** (~4.4m live, single Chrome window)
- Archive: `frontend/e2e-artifacts/runs/20260805-042048/`
- Hero 1×: `campusflow-full-app-walkthrough.webm` (4.80 MB)
- Hero 0.5×: `campusflow-full-app-walkthrough-0.5x.webm` (9.39 MB)
