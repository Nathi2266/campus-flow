# Engineering Council Review: Secrets hygiene & .gitignore

> Date: 2026-08-05  
> User approved implement/verify.

## Proposal

- **Ask:** Ensure `.env`, API keys, passwords, Azure secrets, DB passwords, and private certificates cannot be committed; harden `.gitignore`; remove any tracked leaks; document.
- **Why now:** Production-readiness gate; `creds` was tracked despite ignore rule.
- **Owning specs:** `security-principles.md`, `git-workflow.md`, `devops-deployment.md`
- **Opened by:** Loop Engineer

## Seat inputs (compact)

| Seat | Stance | Finding |
|------|--------|---------|
| PM | support | Trust / deploy safety before features |
| BA | abstain | No product rule change |
| Architect | support | Ignore + untrack; examples only in repo |
| FE | support | Reinforce `frontend/.gitignore` env patterns |
| BE | support | Keep prod yml fail-closed (env-only) |
| DB | support | Never commit real DB passwords |
| QA | support | Script to verify no secret paths tracked |
| Security | support | Untrack `creds`; expand cert/Azure ignores; history note |
| Perf | abstain | — |
| DevOps | support | `docker/.env` ignored; `.env.example` stays |
| Docs | support | README + memory |

## Conflicts

| Topic | Resolution |
|-------|------------|
| Rewrite git history to purge `creds`? | **Defer** — content matches public seed demo passwords already in README; `git rm --cached` + ignore is enough unless rotating prod secrets |
| Commit this Loop? | Only if user asks |

## Loop recommendation

- **Decision:** go
- **Pipeline:** Harden ignore → untrack `creds` → verify script → document

## Next step

- [x] Council
- [x] Implement + verify + document

## Outcome

- `creds` removed from git index (local file kept); ignore hardened
- `node scripts/verify-no-secrets.mjs` → OK
- CI secrets gate + README section
- History still contains old `creds` blob (demo seed passwords only) — full history rewrite deferred
