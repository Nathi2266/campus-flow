# Engineering Council Review: Landing CTA discipline + explore pages

> Full seats. Goal: fewer auth buttons, richer landing, explorabile public screens.

## Proposal

- **Ask:** Landing has too many Sign in / Create account controls. Keep **exactly two buttons** (Sign in + Create account). Add richer content. Add other screens so guests can explore the product.
- **Why now:** CTA repetition dilutes conversion; thin marketing depth; no public explore path beyond `/`.
- **Owning specs:** `campusflow-frontend.md`, `campusflow-design-system.md`, `project-overview.md`
- **Opened by:** Loop Engineer
- **Verbose:** compact all-seats

## Specs / evidence

- Current `LandingPage.tsx`: auth CTAs in nav + hero + closing + footer links (6+ auth affordances)
- Routes: public `/` only for marketing; no `/features`, `/roles`, `/about`
- Prior: `council-review-landing-ui.md`

## Seat inputs

### Product Manager
- **Stance:** support
- **Value:** Clear primary actions; deeper storytelling; explore paths build trust before login.
- **Acceptance:** Landing has only two `<button>`/Button auth CTAs; explore via text nav; new public pages with real CampusFlow capabilities (no fake features).
- **Impact:** high

### Business Analyst
- **Stance:** support
- **Gaps:** Spec route table + landing CTA rule; explore copy cites `project-overview` / roles only.
- **Impact:** low

### Solution Architect
- **Stance:** support
- **Fit:** Shared `MarketingLayout`; routes `/features`, `/roles`, `/about` public; FE-only.
- **Sequencing:** Specs → layout + pages → landing refactor → router → gates.
- **Impact:** medium

### Frontend Engineer
- **Stance:** support
- **UI:** Hero-only Sign in + Create account buttons; header/footer use text links for Explore; richer sections (how it works, security posture, explore teasers); MarketingLayout chrome.
- **A11y:** Landmark nav; links not buttons for secondary nav.
- **Impact:** high

### Backend / Database
- **Stance:** abstain — no API/schema.
- **Impact:** n/a

### QA
- **Stance:** support-with-conditions
- **Tests:** Exactly two auth Buttons on `/`; explore routes load; Sign in still from those two; no auth required for explore.
- **Impact:** medium

### Security
- **Stance:** support
- **Notes:** Explore pages static; no session data; no fake “live campus stats” from API for guests.
- **Impact:** low

### Performance
- **Stance:** support-with-conditions
- **Notes:** Lazy routes; shared layout; light motion.
- **Impact:** low

### DevOps / Preview
- **Stance:** support — Vite route smoke only.
- **Impact:** low

### Documentation
- **Stance:** support — update frontend + design-system landing CTA rule + explore routes; memory + future-features.
- **Impact:** medium

## Conflicts

| Topic | Resolution |
|-------|------------|
| Auth in footer/nav? | **No buttons.** Explore = text links only. Auth only via the two hero buttons. |
| Closing CTA band with more Sign in buttons? | **Remove duplicate auth buttons.** Closing section invites explore pages or quiet copy only. |
| How many explore pages? | **Three:** `/features`, `/roles`, `/about` — highest impact, maintainable. |

## Prioritized backlog

### P0
1. Landing: exactly two auth buttons (hero)
2. Richer landing content sections
3. MarketingLayout + `/features`, `/roles`, `/about`

### P1
4. Specs + council memory + future-features

## Loop recommendation

- **Decision:** **go**
- **Approved by:** user ask — approved
- **Workflow:** `new-feature.md`
- **Pipeline:** Docs → FE → QA smoke → Loop gates

## Next step

- [x] Specs
- [x] Implement
- [x] Verify / document

## Implementation result (Loop)

- Landing: only two auth Buttons (hero Sign in + Create account)
- Explore text links in MarketingLayout header/footer
- Pages: `/features`, `/roles`, `/about`
- Richer landing: how it works, roles, capabilities, trust, explore teasers
- Gates: lint / typecheck / test / build green (2026-07-30)

