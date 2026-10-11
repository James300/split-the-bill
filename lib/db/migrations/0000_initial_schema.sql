CREATE TABLE IF NOT EXISTS "user" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS expense (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  currency VARCHAR(3) NOT NULL,
  created_by_user_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS user_expense (
  user_id TEXT NOT NULL,
  expense_id INTEGER NOT NULL REFERENCES expense(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, expense_id)
);

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  expense_id INTEGER NOT NULL REFERENCES expense(id) ON DELETE CASCADE,
  paid_by_user_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS payment_allocations (
  id SERIAL PRIMARY KEY,
  payment_id INTEGER NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS settlement (
  id SERIAL PRIMARY KEY,
  expense_id INTEGER NOT NULL REFERENCES expense(id) ON DELETE CASCADE,
  payer_user_id TEXT NOT NULL,
  payee_user_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

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

CREATE INDEX IF NOT EXISTS user_expense_by_expense
  ON user_expense (expense_id);

CREATE INDEX IF NOT EXISTS payments_by_expense
  ON payments (expense_id);

CREATE INDEX IF NOT EXISTS payment_allocations_by_payment
  ON payment_allocations (payment_id);

CREATE INDEX IF NOT EXISTS settlement_by_expense
  ON settlement (expense_id);

CREATE INDEX IF NOT EXISTS expense_invitation_active_by_expense
  ON expense_invitation (expense_id, expires_at)
  WHERE revoked_at IS NULL;
