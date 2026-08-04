# Engineering Council Review: Headed full-system E2E (watchable)

> Date: 2026-08-04 (evening)  
> User approved implement/verify.

## Proposal

- **Ask:** Full-app E2E across all roles/screens; verify cross-role data flow; run **headed** so the operator can watch in a real browser; keep durable video archives; prioritize production gaps after green.
- **Why now:** Operator wants live visibility during verify (not headless-only).
- **Owning specs:** `campusflow-roles.md`, `campusflow-frontend.md`, `campusflow-data-flows.md`, `testing-strategy.md`
- **Opened by:** Loop Engineer
- **Verbose:** yes

## Specs loaded for council

- `.kiro/specs/campusflow-roles.md` (role matrix)
- `.kiro/specs/campusflow-frontend.md`
- `.kiro/memory/future-features.md`
- `.kiro/memory/e2e-failure-report.md`

## Seat inputs (compact)

| Seat | Stance | Finding |
|------|--------|---------|
| PM | support | Watchable verify builds trust; green E2E before next feature |
| BA | support | Assert current matrix: ADMIN/LECTURER/STUDENT + shared enrollments/grades |
| Architect | support | Headed Playwright against Compose `:5173` / `:8090`; no new architecture |
| FE | support | `--headed --slow-mo`; preserve videos; role eyebrows |
| BE | support | API healthy; IDOR + role gates stay in suite |
| DB | abstain | No schema this pass |
| QA | support | 16-test suite + walkthrough; serial workers=1 |
| Security | support | Keep student IDOR + inactive-user checks |
| Perf | support | Slow-mo OK for watch; not a perf gate |
| DevOps | support | Compose stack already healthy |
| Docs | support | Update e2e-failure-report + README headed script |

## Conflicts

| Topic | Resolution |
|-------|------------|
| Invent new features in this Loop? | **No** — verify + watch + archive; backlog after green |
| Delete prior `e2e-artifacts/runs`? | **Never** |

## Loop recommendation

- **Decision:** go
- **Pipeline:** Confirm health → open app URL → `test:e2e:headed` → archive → document → backlog next impact item

## Next step

- [x] Council
- [ ] Headed full E2E + preserve
- [ ] Document
