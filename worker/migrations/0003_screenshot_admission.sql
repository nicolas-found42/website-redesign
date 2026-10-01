ALTER TABLE screenshots ADD COLUMN uploaded INTEGER NOT NULL DEFAULT 0;
-- Existing images may already be public and must remain available.
ALTER TABLE screenshots ADD COLUMN retained INTEGER NOT NULL DEFAULT 1;
CREATE INDEX screenshot_expiry ON screenshots(retained, uploaded);
