# Technical Debt

| Item | Impact | Notes |
|------|--------|-------|
| JaCoCo package floor at 10% (was 95%) | Weak coverage gate | Raise per package as Auth/Enrollment/JWT tests land |
| Thin automated backend suite | Regressions caught late | Only a few test classes; expand Auth + Enrollment + handler tests |
| Flyway seed passwords (`Admin123!`) in V2/V3 | Prod bootstrap risk | Split seeds from schema / profile-gate before real prod DBs |
| Auth rate limiting is in-memory per node | Multi-instance needs Redis/shared store | MVP filter shipped; scale later |
| Tokens still in frontend `localStorage` | XSS session theft | httpOnly cookie migration still open |
| Nginx may 502 while API cold-starts | Ops UX | Frontend `depends_on` should wait for healthy `app` (Compose wait shipped; optional nginx retry still useful) |
| Legacy AEOS specs still describe Express/Prisma | Agent misrouting | Prefer `campusflow-*`; purge/retarget remaining indexes over time |
| `@SpringBootTest` context load slow | CI time | Prefer sliced tests / Testcontainers suite selectively |

### Resolved (2026-08-05)

| Item | Resolution |
|------|------------|
| README Apache LICENSE badge vs missing LICENSE file | MIT `LICENSE` added; README badges/license section updated (council `council-review-mit-license-readme-prod-2026-08-05.md`) |
