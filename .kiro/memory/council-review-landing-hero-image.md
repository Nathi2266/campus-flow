# Engineering Council Review: Landing hero photo (`campus_landing.png`)

> `.kiro/workflows/engineering-council.md` — no code during council.

## Proposal

- **Ask / feature:** Replace the landing hero’s abstract SVG “campus” illustration with `frontend/public/campus_landing.png` (campus / school scene). Public `/` entry for ADMIN → LECTURER → STUDENT sign-in paths.
- **Why now:** User-provided product photography; current `CampusVisual` SVG is placeholder material.
- **Owning specs:** `.kiro/specs/campusflow-frontend.md`, `.kiro/project/campusflow-design-system.md`
- **Opened by:** Loop Engineer
- **Verbose:** no

## Specs loaded for council

- `campusflow-frontend.md` — full-bleed hero visual; two auth CTAs only
- `campusflow-design-system.md` — landing hero budget; no hero overlays/chips
- `LandingPage.tsx` — `CampusVisual` SVG absolute plane + gradient scrim

## Seat inputs

### Product Manager

- **Stance:** support
- **Business value:** Real campus imagery strengthens brand trust before role login.
- **Acceptance intent:** Guest `/` shows the new photo as dominant hero plane; Sign in / Create account unchanged; authenticated users still redirect to `/dashboard`.
- **Conditions / risks:** Keep text contrast via existing gradient scrim.

### Business Analyst

- **Stance:** support
- **Spec gaps / updates needed:** Note hero asset path in design-system / frontend spec; no domain rules.
- **Domain rules cited:** none
- **Conditions / risks:** none

### Solution Architect

- **Stance:** support
- **Architectural fit:** FE-only static `public/` asset; no API/DB.
- **Boundaries / sequencing:** Swap visual → document → gates.
- **Conditions / risks:** Large PNG — serve from `public/`; keep `object-fit: cover` full-bleed.

### Frontend Engineer

- **Stance:** support
- **UI impact:** `LandingPage` only (`CampusVisual` → `<img>` / Chakra `Image` of `/campus_landing.png`). Shared MarketingLayout unchanged. Role dashboards unaffected (public landing precedes ADMIN/LECTURER/STUDENT shells).
- **A11y notes:** Decorative hero → `alt=""` / `aria-hidden`; keep gradient for white text contrast.
- **Conditions / risks:** Preserve full-bleed + existing overlay; no cards/overlays on the photo.

### Backend / Database / Security

- **Stance:** abstain — static public asset only.

### QA Engineer

- **Stance:** support
- **Testing needs:** Guest `/` loads image; CTAs work; auth redirect; hard-refresh if cache stale.
- **Regression scope:** Landing hero only; lint/typecheck/build.
- **Conditions / risks:** Confirm PNG exists under `frontend/public/`.

### Performance Engineer

- **Stance:** support-with-conditions
- **Scalability / hotspots:** Photo heavier than SVG — acceptable for one hero; use `loading="eager"` (LCP) + `object-fit: cover`.
- **Conditions / risks:** If file is huge later, compress; out of scope unless build fails.

### Documentation / Preview

- **Stance:** support — design-system hero asset note; rebuild Docker FE if serving stale public assets.

## Conflicts

| Topic | Positions | Resolution |
|-------|-----------|------------|
| SVG vs photo weight | Prior landing council preferred light SVG | User asset wins; keep single full-bleed PNG |

## Loop Engineer recommendation

- **Decision:** go
- **Summary:** Replace `CampusVisual` SVG with `/campus_landing.png` full-bleed cover image; keep scrim + CTAs; document asset path.
- **Spec updates:** design-system + campusflow-frontend hero asset line
- **Conditions:**
  - [x] Full-bleed cover; no inset card
  - [x] Contrast scrim retained
  - [x] Gates pass
- **Pipeline:**
  1. Council memory
  2. LandingPage swap
  3. Specs / future-features
  4. lint / typecheck / test / build

## Next step

- [x] Council
- [x] Implement
- [x] Verify / document

## Implementation result

- `LandingPage` `CampusVisual` → `/campus_landing.png` cover image; gradient scrim retained
