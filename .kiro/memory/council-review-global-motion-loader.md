# Engineering Council Review: Global motion + logo loader

> `.kiro/workflows/engineering-council.md` — no code during council.

## Proposal

- **Ask / feature:** Creative hover animations; screen-to-screen transitions on every navigate; centered global loader with theme-aware CampusFlow logo rotation (once → wait 2s → repeat until done). Apply across ADMIN → LECTURER → STUDENT shells, auth, marketing, and landing.
- **Why now:** Motion polish + consistent busy feedback before production readiness.
- **Owning specs:** `.kiro/project/campusflow-design-system.md`, `.kiro/specs/campusflow-frontend.md`
- **Opened by:** Loop Engineer
- **Verbose:** no

## Specs loaded for council

- Design-system Motion table + a11y `prefers-reduced-motion`
- Frontend routes: public marketing, auth, role AppLayout
- Existing: AppLayout `AnimatePresence` + `pageVariants`; Suspense `LoadingState` spinner

## Seat inputs

### Product Manager

- **Stance:** support
- **Business value:** Feels finished; clear feedback on nav/actions for all roles.
- **Acceptance intent:** Every route change transitions; loader centered with correct logo (light=ink, dark=white); rotation cycle as specified; landing included.
- **Conditions / risks:** Do not block usability with endless overlays on tiny fetches.

### Business Analyst

- **Stance:** support
- **Spec gaps:** Document motion + global loader in design-system; no domain rule change.
- **Conditions / risks:** none

### Solution Architect

- **Stance:** support
- **Architectural fit:** FE-only: loading store + host overlay; layout-route `AnimatePresence` for marketing/auth/app; Suspense/mutations drive busy state.
- **Sequencing:** Loader primitives → route bridge → layout transitions → hover tokens → docs/gates.
- **Conditions / risks:** Restructure marketing pages under shared `MarketingLayout` outlet so exit/enter transitions work across landing/explore.

### Frontend Engineer

- **Stance:** support-with-conditions
- **UI impact:** All screens via App/Auth/Marketing layouts; `LoadingState` uses logo mark; nav/buttons/surfaces richer hover; global portal overlay.
- **A11y:** `role="status"`, `aria-busy`, reduced-motion → no rotation (fade only); overlay must not trap focus permanently.
- **Conditions:** Loader triggers = route change + lazy Suspense + mutations (debounced). Avoid perpetual loader on background `isFetching`.

### Backend / Database

- **Stance:** abstain

### QA Engineer

- **Stance:** support
- **Testing:** Nav Admin/Lecturer/Student menus; landing → features → login → dashboard; theme toggle logo swap; reduced-motion; mutation (e.g. save) shows overlay.
- **Regression:** lint/typecheck/test/build; E2E may need tolerant waits for overlay.

### Security

- **Stance:** abstain — cosmetic overlay only.

### Performance

- **Stance:** support-with-conditions
- **Notes:** Debounce mutation overlay (~150ms); min nav display short; CSS/framer only; respect reduced-motion.
- **Impact:** low–medium if over-triggered.

### Documentation / Preview

- **Stance:** support — design-system motion + loader assets; council + future-features.

## Conflicts

| Topic | Positions | Resolution |
|-------|-----------|------------|
| Loader on every query fetch | Perf: noisy; PM: “does something” | Mutations + route/Suspense only; in-page `LoadingState` uses logo without full-screen unless global busy |
| Rotation vs reduced-motion | FE/a11y | Skip rotate; gentle opacity pulse |

## Loop Engineer recommendation

- **Decision:** go-with-conditions
- **Summary:** Ship global logo loader + universal page transitions + restrained hover lift across all shells including landing.
- **Conditions:**
  - [x] Theme logos: ink light / white dark
  - [x] Rotate once → 2s pause → repeat until idle
  - [x] `prefers-reduced-motion` honored
  - [x] No domain rule edits
- **Pipeline:**
  1. Council memory
  2. loading store + RotatingLogo + GlobalLoaderHost
  3. Route/Suspense/mutation bridge
  4. Marketing layout route + Auth/App transitions
  5. Hover polish
  6. Specs + gates

## Next step

- [x] Council
- [x] Implement
- [x] Verify / document

## Implementation result

- `GlobalLogoLoaderHost` + `GlobalLoadingBridge` + `RotatingLogo`
- `PageTransition` on Marketing / Auth / App layouts; marketing routes use shared outlet
- Hover lift on nav, buttons, surfaces, landing CTAs, feature rows
