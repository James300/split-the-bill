-- Created by npm run db:migration:new -- add_expense_user_read_state.
-- Add transactional PostgreSQL DDL below; do not include transaction-control statements.

CREATE UNIQUE INDEX IF NOT EXISTS user_expense_by_user_and_expense
  ON user_expense (user_id, expense_id);

CREATE TABLE expense_user_read_state (
  expense_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  last_read_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (expense_id, user_id),
  FOREIGN KEY (user_id, expense_id)
    REFERENCES user_expense (user_id, expense_id)
    ON DELETE CASCADE
);

INSERT INTO expense_user_read_state (expense_id, user_id, last_read_at)
SELECT expense_id, user_id, NOW()
FROM user_expense
ON CONFLICT (expense_id, user_id) DO NOTHING;
