# Submission deployment verification

The guarded `npm run worker:deploy` path was run after verifying the existing account’s Workers Free plan in the dashboard on 2026-10-02. Before deploying the validator for optional reviewer uncertainty and plain comments, the required D1 migration step failed with `incomplete input: SQLITE_ERROR [code: 7500]` on the pending `0002_screenshots.sql`.

The file has LF line endings. Wrangler’s local splitter recognizes its six complete statements, and local service tests passed, but D1’s remote splitter rejected the quota trigger’s unparenthesized `CASE … END`. This matches [Cloudflare’s upstream report](https://github.com/cloudflare/workers-sdk/issues/4727). A read-only remote schema query confirmed no screenshot tables or triggers were partially applied after the failure.

Parenthesizing that CASE expression, without changing its condition, quota, or abort, made the same guarded deployment succeed. The focused test `screenshot quota is atomic and known images remain reusable when storage is full` passed: concurrent new uploads are still refused at capacity, and a known image remains reusable. Both `0002_screenshots.sql` and `0003_screenshot_admission.sql` then applied successfully.

The service was deployed as version `e8f93c95-6cd5-4e1e-aa76-59a98b2ff300` before shipping the client’s new record variants. Existing classified records remain valid. No credentials were added or widened; the existing Worker secrets and free D1 database were used. The guarded deployment step remains in place.
