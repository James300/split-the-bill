CREATE TABLE IF NOT EXISTS expense_invitation (
  id SERIAL PRIMARY KEY,
  expense_id INTEGER NOT NULL REFERENCES expense(id) ON DELETE CASCADE,
  created_by_user_id TEXT NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  CONSTRAINT expense_invitation_valid_expiry CHECK (expires_at > created_at)
);

CREATE INDEX IF NOT EXISTS expense_invitation_active_by_expense
  ON expense_invitation (expense_id, expires_at)
  WHERE revoked_at IS NULL;
