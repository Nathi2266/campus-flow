-- V3 originally reset demo user passwords. Demo seed is optional now
-- (see db/demo-seed). Keep the schema fix that widened tokens.token for JWTs.

ALTER TABLE tokens
    ALTER COLUMN token TYPE TEXT;
