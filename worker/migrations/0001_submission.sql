CREATE TABLE submissions (
  id TEXT PRIMARY KEY,
  fingerprint TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('ready', 'creating', 'confirmed')),
  claim TEXT,
  started TEXT NOT NULL,
  issue_number INTEGER,
  issue_url TEXT
);
CREATE TABLE limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  expires INTEGER NOT NULL
);
CREATE INDEX limits_expiry ON limits(expires);
