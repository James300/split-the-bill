ALTER TABLE payments
  ADD COLUMN date DATE;

ALTER TABLE settlement
  ALTER COLUMN date DROP NOT NULL,
  ALTER COLUMN date DROP DEFAULT;

ALTER TABLE expense_user_read_state
  ADD COLUMN last_read_activity_date DATE,
  ADD COLUMN last_read_activity_id INTEGER,
  ADD COLUMN last_read_activity_type TEXT;

ALTER TABLE expense_user_read_state
  ADD CONSTRAINT expense_user_read_state_activity_type_check
  CHECK (
    last_read_activity_type IS NULL
    OR last_read_activity_type IN ('payment', 'settlement')
  ),
  ADD CONSTRAINT expense_user_read_state_activity_cursor_check
  CHECK (
    (last_read_activity_date IS NULL AND last_read_activity_id IS NULL AND last_read_activity_type IS NULL)
    OR (last_read_activity_date IS NOT NULL AND last_read_activity_id IS NOT NULL AND last_read_activity_type IS NOT NULL)
  );
