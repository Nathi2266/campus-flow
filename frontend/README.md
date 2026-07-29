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
| `npm run test:e2e:loop` | Retry loop; writes `.kiro/memory/e2e-failure-report.md` for council |
| `npm run preview` | Preview production build |

## E2E prerequisites

1. API healthy on **8090** (`docker compose -f docker/docker-compose.yml up -d`)
2. `npm run dev` on **5173**
3. `npx playwright install chromium` (once)

Workflow: `.kiro/workflows/e2e-test-loop.md`

## Specs

- `.kiro/specs/campusflow-frontend.md`
- `.kiro/project/campusflow-design-system.md`
- Council: `.kiro/memory/council-review-campusflow-frontend.md`
