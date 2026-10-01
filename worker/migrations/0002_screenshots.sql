CREATE TABLE screenshots (
  sha256 TEXT PRIMARY KEY,
  pixels BLOB NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL
);
CREATE TABLE screenshot_storage (id INTEGER PRIMARY KEY CHECK(id=1), bytes INTEGER NOT NULL);
INSERT INTO screenshot_storage VALUES (1,0);
CREATE TRIGGER screenshot_quota BEFORE INSERT ON screenshots
WHEN NOT EXISTS(SELECT 1 FROM screenshots WHERE sha256=NEW.sha256)
BEGIN
  SELECT CASE WHEN (SELECT bytes FROM screenshot_storage WHERE id=1) + length(NEW.pixels) > 134217728
    THEN RAISE(ABORT, 'screenshot quota') END;
END;
CREATE TRIGGER screenshot_bytes AFTER INSERT ON screenshots
BEGIN
  UPDATE screenshot_storage SET bytes=bytes+length(NEW.pixels) WHERE id=1;
END;
CREATE TRIGGER screenshot_deleted AFTER DELETE ON screenshots
BEGIN
  UPDATE screenshot_storage SET bytes=bytes-length(OLD.pixels) WHERE id=1;
END;
