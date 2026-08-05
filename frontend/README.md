# CampusFlow Frontend

React 19 + Vite + Chakra UI client for the CampusFlow Spring Boot API.

## Develop

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173  
API proxy: `/api` → `http://localhost:8080`

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server (proxies `/api` → `:8090`) |
| `npm run build` | Typecheck + production build |
| `npm run typecheck` | TypeScript only |
| `npm run lint` | oxlint |
| `npm test` | Vitest unit tests |
| `npm run test:e2e` | Playwright opens localhost and runs all-role + data-flow E2E |
| `npm run test:e2e:live` | **Watchable demo:** one continuous walkthrough in Google Chrome, real-user pace, archives 1× + **0.5×** videos |
| `npm run test:e2e:full` | Full suite + archive all `.webm` to `e2e-artifacts/` (even on failure) |
| `npm run test:e2e:walkthrough` | Continuous walkthrough only + archive (headless) |
| `npm run test:e2e:headed` | Headed full suite (multiple tests — prefer `:live` for one-browser demos) |
| `npm run test:e2e:preserve-video` | Copy current `test-results/*.webm` into `e2e-artifacts/` |
| `npm run test:e2e:loop` | Retry loop; writes `.kiro/memory/e2e-failure-report.md` for council |
| `npm run preview` | Preview production build |

## E2E recordings

- Ephemeral: `test-results/` (cleared on next Playwright run)
- Durable: `e2e-artifacts/runs/<timestamp>/` + hero `e2e-artifacts/campusflow-full-app-walkthrough.webm`
- **0.5× playback:** `e2e-artifacts/campusflow-full-app-walkthrough-0.5x.webm` (from `test:e2e:live`)
- Live demo uses **one Chrome window / one tab** (not a new browser per test)
- Against Docker FE (`:5173`), rebuild frontend after UI changes: `docker compose -f docker/docker-compose.yml up -d --build frontend`

## E2E prerequisites

1. API with **demo seed** (E2E expects canned users):  
   `docker compose -f docker/docker-compose.yml -f docker/docker-compose.e2e.yml up -d --build`  
   Default Compose alone has **no mock data** (bootstrap admin only).
2. Frontend on **5173** (Vite `npm run dev` **or** Compose `campusflow-frontend` — must match current source)
3. Google Chrome installed (for `test:e2e:live`); `npx playwright install chromium` for headless suite

Workflow: `.kiro/workflows/e2e-test-loop.md`

## Specs

- `.kiro/specs/campusflow-frontend.md`
- `.kiro/project/campusflow-design-system.md`
- Council: `.kiro/memory/council-review-campusflow-frontend.md`
