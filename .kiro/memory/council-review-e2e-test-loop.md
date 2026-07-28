# Engineering Council Review: CampusFlow E2E Test Loop

> Browser E2E loop for all roles + data flow. Council complete → implement.

## Proposal

- **Ask:** Agent-runnable loop that opens localhost UI, logs in as ADMIN/LECTURER/STUDENT, exercises flows, reports failures to council format, fixes code, retries until green
- **Owning specs:** `campusflow-frontend.md`, `security-implementation.md`, `testing-strategy.md`, `campusflow-frontend` routes
- **Opened by:** Loop Engineer

## Seat inputs

| Seat | Stance | Key finding |
|------|--------|-------------|
| QA | support | Playwright E2E against live UI; role matrix + CRUD data flow |
| Preview | support-with-conditions | FE :5173 must proxy to CampusFlow API (**8090** in compose; :8080 is another app) |
| Frontend | support | Stable selectors (`data-testid`); auth storage clear between roles |
| Backend | support-with-conditions | Login email-only today; enrollment list may stub — fix if E2E blocked |
| Security | support-with-conditions | Test users only; no prod secrets; document seed accounts |
| Loop | support | Workflow: run → fail report → assign fix → retest |
| Docs / DevOps | support | `test:e2e` + `test:e2e:loop` scripts; AEOS workflow file |

## Conflicts

| Topic | Resolution |
|-------|------------|
| API port | Proxy/target **8090** for local docker CampusFlow (env override) |
| Seed password hashes | Invalid bcrypt in seed — use email login (current BE) or register fresh E2E users |

## Loop recommendation

- **Decision:** **go**
- **Pipeline:** Fix proxy → Playwright install → E2E suite → loop script/workflow → run → fix failures → green
- **Approved by:** user ask
