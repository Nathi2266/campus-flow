# ADMIN readiness verification — 2026-08-03

Council: `.kiro/memory/council-review-mock-cleanup-admin-e2e.md`

## Gates

| Gate | Result |
|------|--------|
| FE typecheck | Pass |
| Playwright E2E (15) | Pass |
| Backend `mvn test` | Pass (fixed H2 driver `org.h2.Driver`) |
| API Docker health | Healthy |
| Flyway seed (demo DB) | Kept (not UI mock) |

## Mock cleanup (ADMIN → LECTURER → STUDENT)

| Item | Action |
|------|--------|
| Login demo fillers (all 3 roles) | **Removed** from `LoginPage` |
| Role dashboards | Already API-backed — no fabricated KPIs |
| Settings fake toggles | Already removed earlier |
| Notifications | Honest empty shell (no fake inbox) |
| Flyway V2/V3 seed | **Kept** for local/E2E (README + helpers only) |

## ADMIN E2E coverage now

- Nav walk: students, courses, enrollments, departments, users, reports, audit, profile, settings, notifications
- Create department + lecturer user (+ API assert)
- Course deactivate / reactivate
- Reports department filter
- Settings dark mode → `preferredTheme` on `/auth/me`
- Data flow: student → course → enroll → reports
- Plus lecturer/student regression suite

## Recommendations (from testing)

### Add (highest impact next)

1. **Notifications MVP** or hide `/notifications` until API ships (nav noise for all roles)
2. **User deactivate/delete** — ADMIN can create users but cannot retire accounts
3. **User/email search** on Users page (E2E hit pagination until newest-first sort)
4. **Report CSV export** for ADMIN analytics
5. **Backend `@WebMvcTest` / security negatives** for ADMIN-only endpoints
6. **Staff invite / temp password** when creating LECTURER (students already get temp password)

### Reduce / simplify

1. Do not add more pretend settings toggles
2. Avoid embedding credentials in any authenticated UI
3. Keep notifications as empty shell or remove from nav — do not invent inbox rows

### Shipped this cycle as improvements

- `GET /reports/statistics?departmentId=` for ADMIN filter consistency
- Users list sorted `id DESC` so new accounts appear on page 1
