# Review screenshot evidence

Synthetic reviewer data only. Captured September 30, 2026 with Playwright
Chromium from actual rendered pages; these are screenshots, not reconstructions.

- `before-desktop.png` / `before-phone.png`: latest main, commit
  `431d6d8d577292cccc31f6d7b5859b32998c4598`, served from a temporary archive.
  The feedback form has text/target context and no screenshot field.
- `after-desktop.png` / `after-phone.png`: issue #109 working tree, the same
  heading selected, form answered, and a real page screenshot attached. The
  form is scrolled to the screenshot field. Viewports are 1280 × 900 and
  390 × 844, with reduced motion for comparable form evidence.
- `native-tab-capture.png`: a native headed Chromium tab frame produced by
  `tests/review-capture.spec.ts`, at 1280 × 720. The heading's red background
  is an intentional synthetic pixel marker. The review controls and backdrop
  are absent. Animation can move between permission and capture; this is the
  actual observed frame, including its partial animated text.

The native frame was retained from a run whose exact-color assertion initially
found a one-unit green-channel conversion difference. The test now allows that
small native-video color conversion; the full suite subsequently passed that
native capture scenario. This evidence does not establish production rollout
or live GitHub image-proxy rendering. See
[rollout and validation](../../../docs/REVIEW-SCREENSHOTS.md).

Validation: lint, typecheck, build, actionlint and Worker dry run passed. The
635-test run with `--workers=4` passed 631 tests; three failed against the old
public-notice assertion and one Firefox asset journey hit its timeout. After
updating the assertion, `playwright test --last-failed --workers=4` passed all
four in 6.1 seconds. Both standards and spec reviewers found no actionable
implementation issue. Production account-subscription verification returned
403 with the existing Wrangler OAuth permissions; no deployment was performed.
