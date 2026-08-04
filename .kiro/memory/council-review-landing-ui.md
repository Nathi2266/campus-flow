# Engineering Council Review: Landing page + UI production polish

> Full-project review for public landing + highest-impact UI. **No code during council.**

## Proposal

- **Ask / feature:** Improve application UI; create a public **landing screen** with valuable product info and clear navigation to **Sign in** (and register); implement → verify → document until production-ready for this scope.
- **Why now:** App currently drops unauthenticated users into `/login` with no marketing/home surface; `/` is dashboard-only behind auth. First impression and entry path are incomplete.
- **Owning specs (known):** `.kiro/specs/campusflow-frontend.md`, `.kiro/project/campusflow-design-system.md`, `.kiro/specs/project-overview.md`, `.kiro/specs/campusflow-roles.md`
- **Opened by:** Loop Engineer
- **Verbose:** yes (all seats)

## Specs loaded for council

- `.kiro/specs/campusflow-frontend.md` — routes today: `/` = authenticated dashboard; no landing
- `.kiro/project/campusflow-design-system.md` — Poppins, teal brand, motion
- `.kiro/specs/project-overview.md` — product purpose & role capabilities
- `.kiro/memory/council-review-production-readiness.md` — P0 security already prioritized separately
- `.kiro/memory/council-review-poppins-ui-expand.md` — typography baseline
- Code: `frontend/src/app/router.tsx`, `ProtectedRoute`, `AuthLayout`, `AppLayout`

## Seat inputs

### Product Manager

- **Stance:** support
- **Business value:** High — public landing establishes CampusFlow identity and converts visitors to Sign in / Register; aligns with SMS purpose in `project-overview.md`.
- **Acceptance intent:** Guest opens `/` → branded landing with Sign in; authenticated users land on dashboard; copy reflects real ADMIN / LECTURER / STUDENT capabilities (no fake claims).
- **Conditions / risks:** Do not invent notifications/CSV as live features. **Impact:** high

### Business Analyst

- **Stance:** support-with-conditions
- **Spec gaps / updates needed:** Add public `/` landing + `/dashboard` authenticated home to `campusflow-frontend.md`. No domain rule changes in grades/roles.
- **Domain rules cited:** Role capabilities from `project-overview.md` / `campusflow-roles.md` for landing copy only.
- **Conditions / risks:** Register remains STUDENT-only if that is current product rule. **Impact:** low (docs)

### Solution Architect

- **Stance:** support
- **Architectural fit:** FE-only. Public route outside `ProtectedRoute`; move app home to `/dashboard`; keep existing resource paths (`/students`, etc.).
- **Boundaries / sequencing:** Specs → Landing + router → auth redirect updates → e2e helpers → Loop gates. No BE/DB.
- **Conditions / risks:** AuthLayout / login success / role-denied redirects must target `/dashboard`, not landing. **Impact:** medium

### Frontend Engineer

- **Stance:** support
- **UI impact:** New `LandingPage` + optional `LandingLayout`; router index public; nav logo → `/dashboard`; auth pages link back to `/`; NotFound links to home + sign in; light polish for entry flows.
- **A11y notes:** Landmark nav, skip-friendly CTAs, contrast on teal hero, reduced-motion.
- **Design notes:** Brand-first full-bleed hero; Poppins; teal DS; first viewport = brand + headline + sentence + CTA group + dominant visual; capability sections below. **Impact:** high

### Backend Engineer

- **Stance:** abstain
- **API / logic impact:** None for landing.
- **Permission enforcement notes:** Unchanged. **Impact:** n/a

### Database Engineer

- **Stance:** abstain
- **Schema / migration implications:** None. **Impact:** n/a

### QA Engineer

- **Stance:** support-with-conditions
- **Testing needs:** Guest `/` shows landing + Sign in → `/login`; auth `/` redirects to `/dashboard`; login/register post-auth URL; deep-link unauth still → `/login`.
- **Regression scope:** Update Playwright helpers expecting `/` after login to `/dashboard`.
- **Conditions / risks:** Unit gates + smoke preview. **Impact:** medium

### Security Engineer

- **Stance:** support-with-conditions
- **Security concerns:** Landing must not leak authenticated data; no secrets in static copy; keep protected routes behind JWT session.
- **Conditions / risks:** Public landing is static marketing only. **Impact:** low

### Performance Engineer

- **Stance:** support-with-conditions
- **Scalability / hotspots:** Lazy-load landing; keep motion budget light; no large unoptimized assets.
- **Conditions / risks:** Prefer CSS/SVG hero over heavy images. **Impact:** low

### DevOps / Docker / Preview

- **Stance:** support
- **Findings:** No compose change; verify Vite `/` and `/login` in preview. **Impact:** low

### Documentation Engineer

- **Stance:** support
- **Findings:** Update frontend routes table + design-system landing section; council memory; cross-link. **Impact:** medium

### Loop Engineer

- **Stance:** facilitate
- **Findings:** Prioritize landing + routing integrity over broad app restyle this cycle; production-readiness security P0 remains tracked in prior council (out of this UI scope unless blocking).

## Conflicts

| Topic | Positions | Resolution |
|-------|-----------|------------|
| Keep `/` as dashboard vs landing | FE/PM want public home; app needs authenticated home | **`/` = landing (public)**; **`/dashboard` = app home** |
| Logout → login vs landing | UX prefers brand home | **Logout → `/` (landing)**; Sign in still available |
| Scope vs full production-readiness P0 | Prior council listed security P0 | **This cycle = landing + entry UI**; security P0 remains separate backlog unless already shipped |

## Prioritized backlog (this Loop)

### P0 — must ship
1. Public landing at `/` with Sign in (+ Register) CTAs and valuable role/product info
2. Authenticated home at `/dashboard`; all redirects updated
3. Spec + e2e helper updates

### P1 — same Loop if time
4. Auth “Back to home” links; 404 → home + sign in
5. Landing motion + a11y polish

### P2 — later
6. Broader app chrome restyle; marketing CMS; screenshots gallery

## Loop Engineer recommendation

- **Decision:** **go**
- **Summary:** FE-only landing + route home split is highest-impact UX gap. Ship P0–P1, verify gates, document.
- **Spec updates required before code:**
  - [x] `campusflow-frontend.md` routes
  - [x] `campusflow-design-system.md` landing patterns
- **Conditions to satisfy:**
  - [x] Guest `/` → landing; Sign in → `/login`
  - [x] Authenticated `/` → `/dashboard`
  - [x] Login/register default success → `/dashboard`
  - [x] Lint / typecheck / test / build
- **Recommended workflow:** `.kiro/workflows/new-feature.md`
- **Implementation pipeline (ordered):**
  1. Documentation — specs
  2. Frontend — LandingPage, router, redirects, auth/404 polish
  3. QA — e2e helper URL expectations
  4. Preview — smoke `/` and `/login`
  5. Loop — gates + memory
- **DoD extras / test focus:** Landing CTAs; auth redirect matrix; Poppins/teal consistency
- **Approved by:** user ask (“Implement…”) — **approved**

## Next step

- [x] Update specs
- [x] Begin implementation
- [x] Loop gates (lint / typecheck / test / build)
- [x] Document

## Implementation result (Loop)

- Shipped public `/` landing with Sign in / Create account CTAs and role/capability sections
- Authenticated app home moved to `/dashboard`
- Auth redirects, logout → `/`, NotFound → Home + Sign in
- E2E helpers updated for `/dashboard` post-login
- Gates: green (2026-07-30)
