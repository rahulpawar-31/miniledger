-- MiniLedger database. Run with: npm run db:init
-- Each user is a phone number. Each loan belongs to one user.

CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  phone      TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- A one-time password (OTP) for login. We keep only the latest one per phone.
CREATE TABLE IF NOT EXISTS otps (
  phone      TEXT PRIMARY KEY,
  code       TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);
-- Wrong guesses so far for the current code (added later, so it is safe to re-run on an old database).
ALTER TABLE otps ADD COLUMN IF NOT EXISTS attempts INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS loans (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_name TEXT NOT NULL,
  amount      NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  due_date    DATE NOT NULL,
  repaid      BOOLEAN NOT NULL DEFAULT false,
  repaid_at   TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS loans_user_idx ON loans(user_id);
