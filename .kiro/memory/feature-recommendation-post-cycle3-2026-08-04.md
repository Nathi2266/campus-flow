# Feature recommendation: post Cycle 3 (2026-08-04)

## Shipped this loop

- Bulk grades + roster Save all
- Notifications MVP (V6, nav, settings)
- Course search + CSV pack (3 exports)
- Auth: rate limit login/register; refresh blocks inactive; prod registration default off

## Remaining for full production claim

| Rank | Item | Why |
|------|------|-----|
| 1 | httpOnly cookie sessions | localStorage XSS residual |
| 2 | Flyway seed profile split | Demo passwords on real DBs |
| 3 | GPA auto-recompute + transcript | Academic truth (spec update first) |
| 4 | Waitlists + term/year | Deferred by design |
| 5 | Raise JaCoCo + Auth/Enrollment tests | Regression safety |

## Engineer seats (synthesis)

- **Security:** support continuing cookies + seed gate before public prod
- **Feature Engineer:** Cycle 3 goals met; next highest impact = remaining auth/session
- **Loop:** FE lint/typecheck/build green; BE Docker build green; API healthy after recreate

## User decision needed for next slice

- [ ] httpOnly cookies + FE auth store migration
- [ ] Seed migration split
- [ ] GPA/transcript (BA first)
- [ ] Pause — run E2E / manual QA on Cycle 3
