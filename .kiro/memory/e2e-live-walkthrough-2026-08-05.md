# Live Chrome walkthrough — 2026-08-05

## Command

```bash
cd frontend
npm run test:e2e:live
```

Opens **one Google Chrome window**, one continuous test (ADMIN → LECTURER → STUDENT → register), real-user typing/pauses, records video, archives, exports **0.5×** playback.

## Artifacts (this run)

| File | Notes |
|------|--------|
| `e2e-artifacts/campusflow-full-app-walkthrough.webm` | 1× recorded pace (~4.8 MB) |
| `e2e-artifacts/campusflow-full-app-walkthrough-0.5x.webm` | Half-speed export for review (~9.4 MB) |
| `e2e-artifacts/runs/20260805-042048/` | Run folder + INDEX |

## Design choices

- Not the 16-test suite (that opens a new context per test)
- `workers=1`, `E2E_CHANNEL=chrome`, `E2E_LIVE=1`
- `ffmpeg-static` for portable 0.5× export
