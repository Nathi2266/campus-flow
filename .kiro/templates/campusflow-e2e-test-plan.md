# CampusFlow E2E Test Plan

## Specs under test

- `.kiro/specs/campusflow-frontend.md`
- `.kiro/specs/security-implementation.md`
- `.kiro/workflows/e2e-test-loop.md`

## Cases

| ID | Scenario | Role | Expected | Result |
|----|----------|------|----------|--------|
| T1 | UI loads login | public | Login form visible | automated |
| T2 | Seed login + nav | ADMIN | Dashboard + students/courses/enrollments/reports/profile | automated |
| T3 | Seed login + nav | LECTURER | Dashboard + courses/reports | automated |
| T4 | Seed login + limited nav | STUDENT | No admin nav; enrollments/profile | automated |
| T5 | Register → student → course → enroll → reports | ADMIN | End-to-end data visible | automated |

## Run

```bash
# API on :8090, Vite on :5173
cd frontend
npx playwright install chromium
npm run test:e2e
# or retry loop with council report:
npm run test:e2e:loop
```

## Failure handoff

`.kiro/memory/e2e-failure-report.md` → Engineering Council / Loop assigns FE or BE.
