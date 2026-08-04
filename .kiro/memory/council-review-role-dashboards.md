# Engineering Council Review: Role dashboards (Admin → Lecturer → Student)

> Enrich `/dashboard` with KPIs, graphics, and missing content grounded in live APIs.

## Proposal

- **Ask:** Improve look/feel of role dashboards; extend content with graphics + important KPI cards; use codebase to determine what can be shown. Order: **1 Admin → 2 Lecturer → 3 Student**.
- **Why now:** Dashboards are thin vs Reports/API surface; admins lack charts/audit/quick actions; lecturers lack KPI summary; students lack status breakdown & catalog hooks.
- **Owning specs:** `campusflow-frontend.md`, `campusflow-roles.md`, `campusflow-data-flows.md`, `project-overview.md` (replace legacy timesheet `dashboards.md` pointers)
- **Opened by:** Loop Engineer
- **Verbose:** compact all-seats

## Specs / evidence loaded

- `DashboardPage.tsx` — Admin: 5 tiles + recent students; Lecturer: course cards; Student: GPA + enrollment cards
- `resources.ts` — `getStatistics`, `getStudentsPerCourse`, `getActiveCourses`, `getGraduationProgress`, `listAuditLogs`, `listCourses`, `listEnrollments`, `getStudent`
- `campusflow-roles.md` — report/audit scoping
- No chart library in `package.json` (avoid new dep unless needed)

## Seat inputs

### Product Manager
- **Stance:** support
- **Value:** Role home must answer “what matters now?” with KPIs + next actions.
- **Acceptance:** Admin org health + charts + recent activity; Lecturer capacity KPIs + courses; Student academic snapshot + enrollments + catalog CTA. No fake metrics.
- **Impact:** high

### Business Analyst
- **Stance:** support
- **Gaps:** Document CampusFlow dashboard contracts in `campusflow-frontend.md`; mark legacy `dashboards.md` as non-authoritative (timesheet).
- **Impact:** medium

### Solution Architect
- **Stance:** support
- **Fit:** FE composition only; reuse report endpoints already scoped server-side; split role dashboards into modules; lightweight CSS/SVG charts (no recharts required this cycle).
- **Sequencing:** Specs → shared chart primitives → Admin → Lecturer → Student → gates.
- **Impact:** medium

### Frontend Engineer
- **Stance:** support
- **UI:** KPI grids, horizontal bar charts (students-per-course / capacity), progress rings, quick links, recent lists; Poppins/teal; a11y labels on charts.
- **Impact:** high

### Backend / Database
- **Stance:** abstain (support existing APIs)
- **Notes:** No new endpoints; rely on existing report/list APIs.
- **Impact:** n/a

### QA
- **Stance:** support-with-conditions
- **Tests:** Role switch shows correct dashboard; empty/error/loading; charts degrade when report empty; STUDENT never calls audit.
- **Impact:** medium

### Security
- **Stance:** support-with-conditions
- **Notes:** ADMIN-only audit fetch; LECTURER reports stay scoped; STUDENT only own student/enrollments/catalog.
- **Impact:** medium

### Performance
- **Stance:** support-with-conditions
- **Notes:** Parallel React Query; limit list sizes (5–10); no per-row animation; skip unused report calls on student.
- **Impact:** medium

### DevOps / Docs
- **Stance:** support
- **Docs:** Council memory + frontend dashboard section + future-features shipped note.
- **Impact:** low

## Conflicts

| Topic | Resolution |
|-------|------------|
| Add recharts? | **Defer** — Chakra/SVG meters sufficient; avoid dep churn |
| Duplicate Reports page? | Dashboard = **summary**; deep tables stay on `/reports` |
| Legacy `dashboards.md` | **Non-authoritative** for CampusFlow; update frontend spec |

## Prioritized backlog

### P0 — Admin
1. KPI tiles (existing + inactive courses / active share)
2. Graphics: active vs total, graduation progress, top courses by enrollment
3. Recent students + recent audit + quick links

### P0 — Lecturer
4. KPI tiles (courses, seats filled, near-full, active)
5. Capacity overview graphic + course cards + enrollment peek + quick links

### P0 — Student
6. KPI tiles (GPA, active, completed, graded)
7. Status breakdown graphic + enrollments + catalog teaser + quick links

## Loop recommendation

- **Decision:** **go**
- **Approved by:** user ask — approved
- **Pipeline:** Docs → FE Admin → Lecturer → Student → Loop gates
- **DoD:** lint/typecheck/test/build; role-scoped data only

## Next step

- [x] Council
- [x] Specs
- [x] Implement Admin → Lecturer → Student
- [x] Verify / document (lint/typecheck/test/build green 2026-08-03)
