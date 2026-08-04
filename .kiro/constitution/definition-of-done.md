# Definition of Done

A change is done only when all applicable items are true:

1. Specs updated if product behavior or API/schema contracts changed (prefer `campusflow-*` specs).
2. Implementation matches the referenced specifications.
3. Authorization and scoping follow `.kiro/specs/campusflow-roles.md` / `security-implementation.md`.
4. Frontend lint passes (`cd frontend && npm run lint`) when frontend is affected.
5. Frontend typecheck passes (`cd frontend && npm run typecheck`) when frontend is affected.
6. Frontend production build passes (`cd frontend && npm run build`) when frontend is affected.
7. Backend tests pass for affected areas (`mvn test`); add/update tests per constitution testing rules.
8. Accessibility requirements met for UI changes.
9. Schema changes include a **Flyway** migration under `src/main/resources/db/migration/`.
10. No secrets committed; env examples documented if new vars are required; build artifacts stay gitignored (`target/`, `node_modules/`, Playwright reports).
11. Memory updated only when there is a lasting lesson, ADR, or debt to record.
