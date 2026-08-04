# Technical Debt

| Item | Impact | Notes |
|------|--------|-------|
| JaCoCo package floor at 10% (was 95%) | Weak coverage gate | Raise per package as Auth/Enrollment/JWT tests land |
| Thin automated backend suite | Regressions caught late | Only a few test classes; expand Auth + Enrollment + handler tests |
| Flyway seed passwords (`Admin123!`) in V2/V3 | Prod bootstrap risk | Split seeds from schema / profile-gate before real prod DBs |
| Auth rate limiting absent | Brute-force on login/register | Cycle 3+ (see `future-features.md`) |
| Tokens in frontend `localStorage` | XSS session theft | Prefer httpOnly cookie refresh before public prod |
| Nginx may 502 while API cold-starts | Ops UX | Frontend `depends_on` should wait for healthy `app` |
| Legacy AEOS specs still describe Express/Prisma | Agent misrouting | Prefer `campusflow-*`; purge/retarget remaining indexes over time |
| README Apache LICENSE badge vs missing LICENSE file | Legal clarity | Add LICENSE or remove badge |
| `@SpringBootTest` context load slow | CI time | Prefer sliced tests / Testcontainers suite selectively |
| Public registration in all profiles | Abuse surface | Disable or gate in prod if not required |
