ALTER TABLE expense
  ADD COLUMN IF NOT EXISTS created_by_user_id TEXT;

