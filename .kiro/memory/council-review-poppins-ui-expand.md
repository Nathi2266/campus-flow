# Engineering Council Review: Poppins typography + system-wide UI expansion

> Fill during `.kiro/workflows/engineering-council.md`. **No code changes** until Loop recommendation is approved.

## Proposal

- **Ask / feature:** Adopt **Poppins** as the system typeface; expand and upgrade UI across CampusFlow (shell, auth, dashboards, management pages, profile/settings/notifications/reports).
- **Why now:** Current design system uses Fraunces + Source Sans 3; product ask is Poppins + broader visual expansion for a more spacious, consistent SMS UI.
- **Owning specs (known):** `.kiro/specs/campusflow-frontend.md`, `.kiro/project/campusflow-design-system.md`
- **Opened by:** Loop Engineer
- **Verbose:** yes (council + pipeline)

## Specs loaded for council

- `.kiro/specs/campusflow-frontend.md`
- `.kiro/project/campusflow-design-system.md`
- `.kiro/specs/project-overview.md` (product context via prior memory)
- `.kiro/constitution/definition-of-done.md`
- Prior: `.kiro/memory/council-review-ui-upgrade.md`

## Seat inputs

### Product Manager

- **Stance:** support
- **Business value:** Unified Poppins branding and roomier layouts improve clarity/trust for academic SMS users across ADMIN / LECTURER / STUDENT.
- **Acceptance intent:** All screens use Poppins; content areas feel expanded (wider canvas, richer thin pages); no new domain features required.
- **Conditions / risks:** Do not invent new product capabilities (e.g. real notifications API); UI shells may be expanded but must degrade honestly per frontend known gaps.

### Business Analyst

- **Stance:** abstain
- **Spec gaps / updates needed:** None for domain rules. Typography belongs in design-system / frontend specs only.
- **Domain rules cited:** N/A — no timesheet/task/role rule changes.
- **Conditions / risks:** Keep role gates and stub messaging accurate.

### Solution Architect

- **Stance:** support
- **Architectural fit:** Theme-level font swap + shared layout/component upgrades; no new FE stack; stays within Chakra + Framer Motion + existing route map (`campusflow-frontend.md`).
- **Boundaries / sequencing:** Docs (design-system typography) → Frontend theme/shell/pages → Perf motion budget → QA visual/a11y → Loop gates. No BE/DB.
- **Conditions / risks:** Load Poppins via Google Fonts (existing pattern); keep lazy routes; avoid per-row animation weight.

### Frontend Engineer

- **Stance:** support
- **UI impact (routes/components/roles):**
  - `index.html` + `theme/index.ts`: Poppins for `heading` + `body` (weight hierarchy, not dual-family).
  - Expand `AppLayout` content width / shell atmosphere; upgrade auth, dashboard, tables, profile, settings, notifications, reports.
  - Shared: `PageHeader`, `Surface`, `StatTile`, `DataTableShell`, feedback states.
- **A11y notes:** Preserve skip link, focus rings, labelled controls, `prefers-reduced-motion`; ensure contrast on teal brand surfaces.
- **Conditions / risks:** Fix any layout import gaps (e.g. AuthLayout); keep role-filtered nav.

### Backend Engineer

- **Stance:** abstain
- **API / logic impact:** None.
- **Permission enforcement notes:** Client role gates unchanged; server RBAC still defense-in-depth only per frontend known gaps.
- **Conditions / risks:** None.

### Database Engineer

- **Stance:** abstain
- **Schema / migration implications:** None.
- **Data risk:** None.
- **Conditions / risks:** None.

### QA Engineer

- **Stance:** support-with-conditions
- **Testing needs (from specs):** Visual regression on all routes; typography applied globally; role nav still correct; empty/error/loading states intact; reduced-motion still respected.
- **Regression scope:** Auth, dashboards (3 roles), students/courses/enrollments tables, reports, profile, settings, notifications, 404.
- **Conditions / risks:** Lint/typecheck/build/test gates; no false claims of live notifications API.

### Security Engineer

- **Stance:** support
- **Security concerns:** No auth/token UX regressions on login/register/logout; no secrets in theme/font URLs.
- **Conditions / risks:** Logout + session clear paths unchanged.

### Performance Engineer

- **Stance:** support-with-conditions
- **Scalability / hotspots:** Single font family reduces dual-font payload; subset weights 400–700 only; keep existing motion budgets; no heavy table-row animations.
- **Conditions / risks:** `display=swap` retained; avoid layout thrash from oversized page motion.

### Optional seats

#### Documentation Engineer

- **Stance:** support
- **Findings:** Update `.kiro/project/campusflow-design-system.md` typography; note Poppins in frontend stack/docs if typography called out.
- **Conditions:** Specs before or with code so design-system remains source of truth.

## Conflicts

| Topic | Positions | Resolution |
|-------|-----------|------------|
| Display serif (Fraunces) vs Poppins-only | Prior DS used Fraunces headings; user requires Poppins | **Poppins for heading + body**; differentiate via weight/size/tracking, not a second family |
| “Expand UI” vs invent features | PM: no fake APIs; FE: richer shells | Expand layout density/structure/placeholders; keep stub honesty |

## Loop Engineer recommendation

- **Decision:** **go-with-conditions**
- **Summary:** UI-only change: adopt Poppins system-wide, expand shell and thin pages, polish shared primitives. No business-rule or API changes.
- **Spec updates required before code:**
  - [x] `.kiro/project/campusflow-design-system.md` — typography → Poppins; note expanded layout tokens
  - [x] `.kiro/specs/campusflow-frontend.md` — note Poppins / design-system pointer if needed
- **Conditions to satisfy:**
  - [x] Poppins loaded once (Google Fonts) with weights 400,500,600,700
  - [x] Chakra `fonts.heading` + `fonts.body` use Poppins
  - [x] Expanded layouts without inventing backend capabilities
  - [x] Preserve a11y + reduced-motion
  - [x] Lint, typecheck, build, tests pass
- **Recommended workflow:** `.kiro/workflows/new-feature.md` (UI polish path; council complete)
- **Implementation pipeline (ordered):**
  1. Documentation Engineer — design-system + frontend typography notes
  2. Frontend Engineer — theme, index.html, shell, shared UI, all pages
  3. Performance Engineer — font/motion sanity check
  4. QA Engineer — route/role/a11y regression checklist
  5. Loop Engineer — lint / typecheck / build / test / preview
- **DoD extras / test focus:** Global font application; expanded thin pages; role dashboards; table pages; auth brand still Poppins.
- **Approved by:** user ask (“Implement the objective”) — **approved**

## Next step

- [x] Update specs (Docs) if required
- [x] Begin implementation workflow
- [ ] Stop (no-go / defer)
