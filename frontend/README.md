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
| `npm run dev` | Vite dev server |
| `npm run build` | Typecheck + production build |
| `npm run typecheck` | TypeScript only |
| `npm run lint` | oxlint |
| `npm test` | Vitest |
| `npm run preview` | Preview production build |

## Specs

- `.kiro/specs/campusflow-frontend.md`
- `.kiro/project/campusflow-design-system.md`
- Council: `.kiro/memory/council-review-campusflow-frontend.md`
