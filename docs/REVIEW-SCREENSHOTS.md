# Review screenshots

Issue [#109](https://github.com/nicolas-found42/website-redesign/issues/109) adds
optional screenshot evidence to the existing review form and submission service.
Written feedback, target context, anonymous access, receipts and issue retry
protection still work without an image.

## Reviewer journey

The form offers **Capture this tab** where native capture and current-tab
identity are available. Choose this review tab in the browser's sharing prompt.
The tool refuses other tabs, windows and desktop captures, hides its controls
and backdrop, takes a native frame of the visible viewport, then immediately
stops sharing. The selected target must be visible. Large sections may extend
outside that viewport; the image does not claim to show their offscreen parts.
The target's current page state is refreshed alongside a successful tab capture.

**Attach screenshot file** accepts a real PNG screenshot in every supported
browser. Include the selected target and enough surrounding page context in the
reviewed state. The tool labels this as supplied evidence; its attachment time
is not proof of when the original screenshot was taken. Do not use generated
images, unrelated files, or desktop captures. No automatic provenance or privacy
detection is promised. Inspect the preview, remove it, or choose another file
before Save and Send. A failed replacement retains the previous image. Removing
an image returns focus to the file control. Written answers survive failures.

The public-image notice appears in the form and beside Send. **Send** publishes
images before creating issues, so an uploaded image can be public while its
issue is still pending. Draft previews stay local until Send. Capture/file
processing only resizes real pixels; it does not reconstruct the DOM or invent
missing images, fonts, animation frames or cross-origin content.

Files may be up to 8 MB and 32 million decoded pixels. Preview pixels are resized
to at most 1600 pixels per side, 2 million pixels and 512 KiB of PNG data. The
preview is the actual image that will be delivered. Draft pixels stay with their
item in browser storage and in downloaded backups. Storage refusal or exhaustion
uses the existing in-memory warning: send before leaving that page.

## Delivery, limits and retention

Use the existing **Workers Free** service and D1 database, with no new account,
reviewer signup, paid storage, domain or GitHub token permissions. On September
30, 2026, the official [D1 limits](https://developers.cloudflare.com/d1/platform/limits/)
list 500 MB per Free database and 2 MB per blob. [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/)
lists 5 million rows read/day, 100,000 rows written/day and no egress charge.
Free quota exhaustion refuses operations. [Workers limits](https://developers.cloudflare.com/workers/platform/limits/)
include 100,000 requests/day and 10 ms CPU/invocation. Reverify the account's Free
plan before deploying, using the existing guarded deployment script. Quotas are
shared with other applications; this feature never enables paid overages.

`POST /screenshots/<sha256>` accepts PNG bytes only from the review-site origin.
The service incrementally bounds the body, validates the signature, chunk order,
CRC checksums, dimensions, RGB/RGBA format, decompressed scanline length and
filters, and verifies the pixel digest. Unsupported, truncated, mismatched and
oversized data cannot become evidence. Browser decoding normalizes supplied
PNG variants to supported RGB/RGBA PNGs before upload.

The existing 30 requests/client/hour and 1000 upload/submission requests/day
apply before decoding. An atomic SQLite trigger caps retained screenshot bytes
at 128 MiB, leaving room under the 500 MB Free database limit for receipts and
overhead. Duplicate digests consume no extra storage, even at quota. Images are
not automatically deleted or expired, including successful uploads whose issue
creation later fails. The cap stops new uploads; it does not evict evidence.

`GET /screenshots/<sha256>` serves the stored PNG anonymously, without an Origin
header, login, private token or signed expiration. It also works when submissions
are disabled. URLs use the deployed Worker's stable origin. Responses have PNG
content type, nosniff, a restrictive CSP and immutable public cache headers.
Retain the database and Worker address across deployments; deleting either
breaks public evidence. D1 Time Travel on Free retains seven days of recovery
history, not a seven-day image expiration. Preserve backups and receipts.

The issue embeds the matching image with target/section/page alt text and a
caption recording page, visible state, source, dimensions and capture/attachment
time. The complete readable and structured text/target record stays beside it.
Local pixel data never enters a submission JSON envelope or GitHub issue body.
The backup importer preserves text and screenshot metadata, but cannot publish
local pixels; use hosted Send for image delivery.

## Failure and retry

The digest identifies immutable uploaded pixels. Confirmed uploads are remembered
across refreshes. An uncertain upload can safely retry the same digest; it cannot
allocate another copy. A confirmed image upload is reused when GitHub delivery
fails. Upload failures do not claim an issue ID or call GitHub. Their receipts
explain invalid/oversized images, interruption, rate limits or free-storage
exhaustion and offer **Send text without screenshot**. This is an explicit
reviewer choice. Pending issue creation retains the existing recovery rules;
it never silently drops evidence or creates a duplicate issue.

## Verification and rollout

The existing browser-journey and service-contract boundaries cover real
synthetic page screenshots, desktop/phone PNG attachment journeys in Chromium,
Firefox and WebKit, keyboard removal and fallback, confirmed-upload reuse after
reload, invalid/oversized/interrupted/rate/quota failures, anonymous reads and
issue embedding/retries. The bundled Worker is also tested in its native runtime
with actual PNG upload, read, issue creation and retry against local D1 and a
controlled GitHub response. Tests never publish live issues.

Native capture is tested in headed Chromium, including the selected target's
visible pixel marker. macOS headless Chromium returns `NotSupportedError` for
native screen capture. The native test uses a visible browser and CI runs tests
under Xvfb; all Playwright commands retain `--workers=4`. Firefox, WebKit and
mobile viewports exercise the supplied-PNG path. Browser permission refusal or
missing native identity produces a clear fallback. Cross-origin pixels and fonts
are captured as rendered by the browser; animations remain a moment in time and
may change while permission is being granted. The preview is the final check.
See [MDN screen capture](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia)
and the [Capture Handle draft](https://www.w3.org/TR/capture-handle-identity/).

Apply migration `0002_screenshots.sql` and deploy the Worker **before** releasing
the Pages UI. Use `npm run worker:deploy` after fresh Workers Free verification;
it applies migrations without deleting the receipt database. Keep screenshot
storage when rolling back UI/Worker code. Existing text-only submissions remain
compatible with this additive migration. Rollback must continue serving the
public image route for already published evidence.

After deployment, verify one synthetic screenshot from the published review
site context: inspect the rendered public issue and caption, fetch the image
without authentication, retry the exact request and confirm the same issue,
then close the synthetic issue. Record the link and account Free-plan verification
in the release PR. Local tests and a dry run do not establish production rollout,
GitHub's rendered image proxy behavior, or the provider's production CPU quota.
