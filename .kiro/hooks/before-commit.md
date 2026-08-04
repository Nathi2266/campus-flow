# Hook: Before Commit

## Steps

1. Review diff for secrets (`.env`, tokens, passwords, certs, Azure local settings).
2. Run `node scripts/verify-no-secrets.mjs` from the repo root (fails if secret-like paths are tracked).
3. Run `npm run lint` in `frontend/` when FE touched.
4. Run `npm run typecheck` if JS/TS touched.
5. Ensure spec updates accompany behavior changes.
6. Stage only intentional files — never `.env`, `docker/.env`, `/creds`, `*.pem` / `*.p12` / `*.jks`, or `local.settings.json`.

## Failure

Do not commit until lint/typecheck and secret scan are clean.
