-- Soft-deactivate flag for user accounts (login blocked when false).
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);
