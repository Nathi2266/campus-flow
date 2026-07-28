# Workflow: E2E Test Loop

Agent-driven browser verification of CampusFlow UI against a live local stack. Failures are reported in council format; owning engineers fix; Loop retries until green.

## When to run

- After frontend/backend changes that affect user journeys
- On request: “E2E test loop”, “run role tests”, “verify data flow”
- Before declaring production-ready UI

## Prerequisites

1. CampusFlow API healthy (compose maps **8090** → app 8080)
2. Frontend Vite on **5173** with proxy `VITE_API_PROXY_TARGET` (default `http://localhost:8090`)
3. Playwright browsers installed (`npx playwright install chromium`)

## Pipeline

```
Loop Engineer — start preview health checks
↓
QA Engineer — run `npm run test:e2e` (Playwright opens localhost)
↓
If FAIL → write `.kiro/memory/e2e-failure-report.md` (council-style)
↓
Loop assigns owning engineer (FE / BE / Preview)
↓
Engineer fixes code
↓
Loop re-runs `npm run test:e2e:loop` until pass or max retries
↓
QA sign-off + Docs update if needed
```

## Role coverage (required)

| Role | Flows |
|------|-------|
| ADMIN | Login → dashboard → students → courses → enrollments → reports → profile |
| LECTURER | Login → dashboard → courses → enrollments → reports |
| STUDENT | Login → dashboard → enrollments → profile → notifications |

Plus **data flow**: register/login → create student → create course → enroll → list enrollments / reports stats visible.

## Commands

```bash
cd frontend
npm run test:e2e          # single run
npm run test:e2e:loop     # retry loop with failure report
```

## Failure report contract

File: `.kiro/memory/e2e-failure-report.md`

Must include: failing test title, expected vs actual, suspected layer (FE/BE/env), recommended engineer, screenshot path if any.

## Hard rules

1. Do not invent business rules — cite `campusflow-frontend.md` / security / API.
2. Prefer fixing root cause over weakening assertions.
3. Max retries default: 3 (override with `E2E_MAX_RETRIES`).
4. Loop Engineer owns coordination until green or escalate.
