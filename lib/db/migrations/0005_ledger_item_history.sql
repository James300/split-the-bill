ALTER TABLE payments
  ADD COLUMN created_by_user_id TEXT;

ALTER TABLE settlement
  ADD COLUMN created_by_user_id TEXT;

CREATE TABLE ledger_item_history (
  id BIGSERIAL PRIMARY KEY,
  item_type TEXT NOT NULL CHECK (item_type IN ('payment', 'settlement')),
  item_id INTEGER NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('updated', 'deleted')),
  changed_by_user_id TEXT NOT NULL,
  previous_state JSONB NOT NULL CHECK (jsonb_typeof(previous_state) = 'object'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ledger_item_history_by_item
  ON ledger_item_history (item_type, item_id, created_at DESC);
