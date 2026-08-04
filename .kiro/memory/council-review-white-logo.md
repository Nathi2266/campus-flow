# Engineering Council Review: White brand logo + favicon

> Fill during `.kiro/workflows/engineering-council.md`. **No code changes** until Loop recommendation is approved.

## Proposal

- **Ask / feature:** Convert CampusFlow brand mark and browser favicon from dark/near-black ink to **white**, shared by ADMIN → LECTURER → STUDENT chrome.
- **Why now:** Current `campus_logo.png` opaque pixels are dark teal (~#004C4D); low contrast on brand-dark auth/landing surfaces; user requires white mark.
- **Owning specs (known):** `.kiro/project/campusflow-design-system.md`, `.kiro/specs/campusflow-frontend.md`
- **Opened by:** Loop Engineer
- **Verbose:** no

## Specs loaded for council

- `.kiro/project/campusflow-design-system.md` (Brand assets)
- `.kiro/specs/campusflow-frontend.md` (shell / marketing)
- Layouts: AppLayout (light surface), AuthLayout (dark), MarketingLayout (hero dark / sticky light)

## Seat inputs

### Product Manager

- **Stance:** support
- **Business value:** Recognisable brand on login, marketing, and role shells; tab identity matches product mark.
- **Acceptance intent:** White logo visible for all three roles; favicon shows white mark; no role-specific logos.
- **Conditions / risks:** Pure white favicon on light browser tabs can disappear — prefer white mark on brand-dark tile for the tab icon while keeping in-app mark white on transparent.

### Business Analyst

- **Stance:** support
- **Spec gaps / updates needed:** Design-system brand assets note white mark + favicon tile; no domain business-rule change.
- **Domain rules cited:** none
- **Conditions / risks:** none

### Solution Architect

- **Stance:** support
- **Architectural fit:** FE-only asset + `BrandLogo`; no API/DB.
- **Boundaries / sequencing:** Generate white asset → wire component → update favicon links → document.
- **Conditions / risks:** Keep source dark asset for light surfaces or badge the white mark on brand chip so Admin sidebar stays legible.

### Frontend Engineer

- **Stance:** support-with-conditions
- **UI impact (routes/components/roles):** AuthLayout, LandingPage, MarketingLayout footer/hero → white mark. AppLayout (ADMIN/LECTURER/STUDENT) and marketing sticky white header sit on light `app-surface` / white — pure white PNG is invisible there.
- **A11y notes:** Decorative logos `alt=""`; meaningful logos keep `alt="CampusFlow"`. Contrast required on both light and dark chrome.
- **Conditions / risks:** (1) White transparent PNG for dark surfaces. (2) On light shells: white mark on small `brand.*` badge **or** dark ink variant. Prefer badge so “logo is white” holds everywhere. Favicon: white mark on brand-dark square.

### Backend Engineer

- **Stance:** abstain
- **API / logic impact:** none
- **Permission enforcement notes:** n/a
- **Conditions / risks:** none

### Database Engineer

- **Stance:** abstain
- **Schema / migration implications:** none
- **Data risk:** none

### QA Engineer

- **Stance:** support
- **Testing needs (from specs):** Visual check login, landing hero, marketing explore header (light), footer, Admin/Lecturer/Student sidebar + mobile drawer; favicon after hard refresh.
- **Regression scope:** BrandLogo call sites only; lint/typecheck/build.
- **Conditions / risks:** Cached favicons — hard refresh / rebuild Docker FE if used.

### Security Engineer

- **Stance:** abstain
- **Security concerns:** none (static public asset)
- **Conditions / risks:** none

### Performance Engineer

- **Stance:** support
- **Scalability / hotspots:** One extra small PNG negligible; avoid runtime pixel filters if static assets exist.
- **Conditions / risks:** none

### Optional seats

#### Documentation Engineer

- **Stance:** support
- **Notes:** Update design-system brand assets; council + `future-features` shipped note.

#### Preview / DevOps

- **Stance:** support
- **Notes:** Rebuild frontend container if serving stale `public/` assets.

## Conflicts

| Topic | Positions | Resolution |
|-------|-----------|------------|
| Pure white favicon vs tab contrast | PM/FE: white mark must read on light tabs | Favicon = white mark on brand-dark square; in-app = white on transparent |
| White logo on light AppLayout | User wants white; FE needs contrast | White mark on compact brand badge in light chrome |

## Loop Engineer recommendation

- **Decision:** go-with-conditions
- **Summary:** Produce white transparent mark; use it on dark surfaces; on light Admin/Lecturer/Student (and sticky marketing) wrap with brand badge so the mark stays white and visible; favicon white-on-brand-dark.
- **Spec updates required before code:**
  - [x] design-system Brand assets (during implement)
- **Conditions to satisfy:**
  - [x] White mark visible on dark + light chrome for all three roles
  - [x] Favicon white mark (brand-dark tile OK)
  - [x] Gates: lint, typecheck, build
- **Recommended workflow:** `.kiro/workflows/new-feature.md` (thin FE asset pass)
- **Implementation pipeline (ordered):**
  1. Generate `campus_logo_white.png` + `favicon.png` (white on brand dark)
  2. Update `BrandLogo` (+ optional badge prop / wrapper)
  3. Wire layouts/landing; `index.html` favicon
  4. Specs + memory; verify gates

## Next step

- [x] Council
- [x] Implement
- [x] Verify / document

## Implementation result

- `campus_logo.png` = white mark (ink backup: `campus_logo_ink.png`)
- `favicon.png` = white mark on `#0B3A4A` tile
- `BrandLogo` `surface="light"|"dark"` for contrast on all roles
