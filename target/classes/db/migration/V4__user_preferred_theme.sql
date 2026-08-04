-- Persist per-user UI theme preference (light | dark).

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS preferred_theme VARCHAR(10) NOT NULL DEFAULT 'light';

ALTER TABLE users
    ADD CONSTRAINT chk_users_preferred_theme
    CHECK (preferred_theme IN ('light', 'dark'));

CREATE INDEX IF NOT EXISTS idx_users_preferred_theme ON users(preferred_theme);
