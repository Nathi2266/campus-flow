# Engineering Council Review: Public repo read-only for others

> Date: 2026-08-05  
> User approved implement/verify.

## Proposal

- **Ask:** Public GitHub repo; others may view/clone/fork only. No push to `main`, no branch creation on this repo, no GitHub Actions. Owner retains admin bypass to maintain the project.
- **Why now:** Production / showcase hardening of contribution surface.
- **Owning specs:** `git-workflow.md`, `devops-deployment.md`
- **Opened by:** Loop Engineer + DevOps

## Seats (compact)

| Seat | Stance | Finding |
|------|--------|---------|
| PM | support | Showcase without drive-by writes |
| Security | support | Disable Actions; lock refs; no write collaborators |
| DevOps | support | Rulesets + Actions permissions API |
| QA | support | Verify with `gh api` after apply |
| Docs | support | Memory + README note |

## Loop recommendation

- **Decision:** go
- **Controls:** (1) Disable Actions (2) Active ruleset: block create/update/delete on all branches except admin bypass (3) Confirm forking on, no write collaborators

## Outcome

- Actions: `enabled=false` on `Nathi2266/campus-flow`
- Ruleset id `20427363`: creation + update + deletion + non_fast_forward on `~ALL`; admin bypass
- Visibility public; `allow_forking=true`; only owner collaborator
- README “Repository access” section added
- Ruleset JSON: `.kiro/memory/github-ruleset-readonly.json`
