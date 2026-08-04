# Engineering Council Review: Campus logo + favicon

> Asset: `frontend/public/campus_logo.png`. Apply as app logo + browser favicon for all roles.

## Proposal

- **Ask:** Use `campus_logo.png` as CampusFlow logo and favicon. Apply across Admin / Lecturer / Student surfaces (shared chrome).
- **Why now:** Replace “CF” text marks and default `favicon.svg` with the provided brand asset.
- **Owning specs:** `campusflow-frontend.md`, `campusflow-design-system.md`
- **Opened by:** Loop Engineer
- **Verbose:** compact all-seats

## Specs / evidence

- `index.html` → `/favicon.svg`
- “CF” marks: `AuthLayout`, `MarketingLayout`
- App shell brand: `AppLayout` BrandMark (text only today; shared by all roles)
- Asset present: `public/campus_logo.png`

## Seat inputs

### Product Manager
- **Stance:** support
- **Value:** Consistent brand trust on login, landing, and in-app for every role.
- **Acceptance:** Favicon + logo image everywhere brand mark appears; same for ADMIN/LECTURER/STUDENT.
- **Impact:** medium

### Business Analyst
- **Stance:** support
- **Gaps:** Note brand asset path in design-system / frontend specs.
- **Impact:** low

### Solution Architect
- **Stance:** support
- **Fit:** Static asset under `public/`; shared `BrandLogo` component; no BE/DB.
- **Sequencing:** Specs → BrandLogo → layouts + favicon → gates.
- **Impact:** low

### Frontend Engineer
- **Stance:** support
- **UI:** Favicon PNG (+ apple-touch optional); replace CF boxes with image; sidebar centered logo above CampusFlow text; auth + marketing headers.
- **A11y:** `alt="CampusFlow"` / decorative empty alt when adjacent text present.
- **Impact:** high

### Backend / Database
- **Stance:** abstain
- **Impact:** n/a

### QA
- **Stance:** support-with-conditions
- **Tests:** `/login`, `/`, `/dashboard` show logo; tab favicon is `campus_logo.png`; E2E still finds “CampusFlow” text.
- **Impact:** low

### Security
- **Stance:** support
- **Notes:** Local static asset only; no remote URL.
- **Impact:** low

### Performance
- **Stance:** support-with-conditions
- **Notes:** Single PNG from `/public`; size logo via CSS (40–56px); browser caches favicon.
- **Impact:** low

### DevOps / Docs / Preview
- **Stance:** support
- **Notes:** Docker frontend rebuild picks up `public/`; document asset in design-system.
- **Impact:** low

## Conflicts

| Topic | Resolution |
|-------|------------|
| Sidebar previously text-only (no CF) | **Add logo image** centered above CampusFlow + tagline (user request) |
| Keep favicon.svg? | **Point HTML to PNG**; leave old SVG unused or unused |

## Prioritized backlog

1. Favicon → `/campus_logo.png`
2. Shared `BrandLogo` component
3. AppLayout (all roles) → AuthLayout → MarketingLayout
4. Specs + memory; Loop gates

## Loop recommendation

- **Decision:** **go**
- **Approved by:** user ask — approved
- **Pipeline:** Docs → FE → Loop gates

## Next step

- [x] Council
- [x] Implement
- [x] Verify / document

## Implementation result

- Favicon: `index.html` → `/campus_logo.png`
- Shared `BrandLogo` on AppLayout (all roles), AuthLayout, MarketingLayout
- Specs: design-system + campusflow-frontend
