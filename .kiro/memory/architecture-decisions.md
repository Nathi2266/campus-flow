# Architecture Decisions

## ADR-001: Local Express API behind Base44-shaped client

- **Status:** Accepted (current state) — applies to sibling Khonofy product, not CampusFlow
- **Context:** App originated on Base44; local development uses Express + Prisma with a compatible client facade.
- **Decision:** Keep `src/api/base44Client.js` as the frontend integration surface over local REST until a deliberate client redesign.
- **Consequences:** Entity helpers may look Base44-like; true source of API behavior is Express + `specs/api.md`.

## ADR-002: CampusFlow React frontend stack

- **Status:** Accepted (2026-07-28)
- **Context:** Campus repo is Spring Boot CampusFlow with no UI. Mission requires React 19 + Chakra. Legacy AEOS `tech-stack.md` / `frontend.md` describe Khonofy timesheets (Tailwind/shadcn) — different product.
- **Decision:** Ship CampusFlow FE under `campus/frontend` with React 19, Vite, TypeScript, Chakra UI, React Router, TanStack Query, RHF, Zod, Axios, Framer Motion, React Icons. API base `/api/v1` on port 8080. Specs: `campusflow-frontend.md`, `campusflow-design-system.md`.
- **Consequences:** Khonofy FE specs remain for sibling product; CampusFlow agents must prefer CampusFlow specs. OpenAPI path prefix should be aligned to `/api/v1` in a follow-up.
