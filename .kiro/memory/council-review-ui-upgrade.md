# Engineering Council Review: CampusFlow UI polish & motion

> UI-only upgrade. No business-rule changes. Approved for immediate implementation.

## Proposal

- **Ask:** World-class UI across all screens + intentional animations; screens must look correct
- **Owning specs:** `campusflow-frontend.md`, `campusflow-design-system.md`
- **Opened by:** Loop Engineer

## Seat inputs (condensed)

| Seat | Stance | Key finding |
|------|--------|-------------|
| PM | support | Clarity & trust for academic SMS; consistent role UX |
| BA | abstain | No domain rule changes |
| Architect | support | Shared motion/theme primitives; no new stack |
| Frontend | support | Elevate theme, layouts, tables, auth, dashboards; Framer Motion |
| Backend / DB | abstain | No API impact |
| QA | support-with-conditions | Visual + a11y regression; reduced-motion |
| Security | support | No token UX regressions |
| Performance | support-with-conditions | Keep lazy routes; avoid heavy per-row animation |
| Preview / Docs | support | Verify all routes; update design-system motion section |

## Conflicts

None. Visual polish only.

## Loop recommendation

- **Decision:** **go**
- **Pipeline:** Docs (design-system) → Frontend (theme + shared UI + all pages) → Perf (motion budget) → QA → Preview → Loop gates
- **Approved by:** user ask — approved
