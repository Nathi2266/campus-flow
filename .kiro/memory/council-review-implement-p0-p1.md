# Engineering Council Review: Implement P0–P1 role-value backlog

> Implementation council. User approved prior backlog (2026-07-28).

## Proposal

- **Ask / feature:** Implement P0 foundations + P1 ADMIN/LECTURER/STUDENT features from `council-review-role-value-features.md`. Defer P2 (notifications MVP, CSV, pagination polish).
- **Why now:** User approved recommendation and requested implementation.
- **Owning specs:** `campusflow-roles.md` (new), `security-implementation.md`, `campusflow-frontend.md`, `campusflow-grades.md` (new)
- **Opened by:** Loop Engineer
- **Verbose:** no (compact seats)

## Conflict resolutions (approved)

| Topic | Resolution |
|-------|------------|
| STUDENT self-enroll | **Allow.** STUDENT may POST enrollments for their own student record and DELETE (drop) own enrollments. Server enforces ownership. |
| LECTURER course mutate | **ADMIN** creates/activates/deletes courses. **LECTURER** may PUT update metadata on courses where `lecturer_id` = self. LECTURER may PATCH grades on enrollments for own courses. |

## Seat summary

- **PM:** support — ship P0 then P1; defer P2.
- **BA:** support — lock rules in `campusflow-roles.md` + `campusflow-grades.md`.
- **Architect:** support — sequence Auth+Token → RBAC → Departments/Users → Reports/Grades → FE.
- **BE/FE/DB/QA/Security/Perf:** support-with-conditions — real BCrypt seeds via V3; method security; scoped queries; E2E after auth.

## Loop recommendation

- **Decision:** go
- **Approved by:** user (explicit implement request) — approved
- **Pipeline:** Specs → Backend (P0+P1 APIs) → Frontend → Loop gates — **completed**
- **Out of scope this sprint:** Notifications entity/API, CSV export, heavy pagination UX (P2)

## Loop verification (2026-07-28)

| Gate | Result |
|------|--------|
| Specs (`campusflow-roles`, `campusflow-grades`, security matrix) | Done |
| Backend `mvn -DskipTests compile` (Docker Temurin 21) | Pass |
| Frontend typecheck / lint / build / unit tests | Pass |
| E2E helpers updated for STUDENT-only register + seed admin flow | Updated (full E2E needs running API+DB) |
| P2 deferred | Notifications, CSV, pagination polish |

## Next step

- [x] Spec updates
- [x] Implementation
- [x] Loop verification (compile/build)
- [ ] Optional: run Playwright against live preview stack
- [ ] P2 sprint when prioritized
