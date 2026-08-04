# Secrets hygiene loop — 2026-08-05

## Problem

- User gate: never commit `.env`, API keys, passwords, Azure secrets, DB passwords, private certificates.
- Finding: `/creds` (seed email/password dump) was **tracked** even though `.gitignore` listed `creds`.

## Changes

1. Expanded root `.gitignore` (env, PEM/KEY/P12/JKS/PFX, Azure local, `/creds`, credential JSON, Spring local overrides).
2. Reinforced `frontend/.gitignore`.
3. `git rm --cached creds` — stop tracking; keep local file for operator convenience.
4. `scripts/verify-no-secrets.mjs` + CI job `secrets` (blocks backend/frontend until green).
5. Docs: README, before-commit hook, council, future-features.

## Verify

```bash
node scripts/verify-no-secrets.mjs
# → OK: no secret-like paths in git index.
```

## Follow-ups (optional)

- Commit staged `D creds` + ignore/CI changes when ready.
- History rewrite only if non-demo secrets ever appeared (not required for current seed dump).
