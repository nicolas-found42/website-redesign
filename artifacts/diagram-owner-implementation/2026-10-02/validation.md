# Owner-specific diagram implementation validation

The five approved work settings are implemented in commit
`e99b83edf6dc8c58620496632a95d61ff394ddba` on PR
[161](https://github.com/nicolas-found42/website-redesign/pull/161).
The original validation below applies to that implementation commit. Subsequent
review fixes update the Builders accessible description and its matching fixture
entry, route the Automation output branch clear of its labels, and correct the
capture workflow and overflow measurements. Visible words and connection
identities remain unchanged.
Workshops remains the reference. Every existing label and connection remains;
the audience marks and beats remain. The Workflow engagement now assembles
its five stations sequentially. No source content or inventory fixture changed.

## Actual checks

- `npm run test:full`: **826 passed (18.2m)** using two workers. This includes
  unit, Chromium, Firefox and WebKit projects, diagram inventory and connections,
  contributor lane separation, enlarged text, reduced motion, no-script production
  states, and the remaining site regressions.
- `npm run lint` and `npm run typecheck`: passed, including the implementation
  commit hook.
- `npm run worker:check`: passed as a dry run.
- `npm run build`: passed again after the complete suite, with no subsequent
  application source edits. Vite transformed 2173 modules and built in 2.12s;
  TypeScript and prerendering also exited successfully.
- [CI run 37084597173](https://github.com/nicolas-found42/website-redesign/actions/runs/37084597173):
  lint, all four browser shards and aggregate verify passed for `e99b83e`.
  Deployment is skipped on this PR. Later documentation-only commits have
  separate CI runs; this record identifies the application commit actually tested.
- `git diff 017ee98 -- src/art/training.ts src/schematic.ts tests/fixtures/diagram-inventory.json`
  returned empty output. The original Workshop, schematic source contract and
  inventory fixture are unchanged.

The local full-suite footer was:

```text
[826/826] [webkit] › tests/ux-review.spec.ts:352:1 › #41: the scorecard says what its result is, not what it is not
  826 passed (18.2m)
```

The complete local test/build/lint/typecheck logs remain local companions.
They are not replacements for the independently recorded GitHub CI run.

## Visual inspection

The [review board](preview.html) contains ten actual implementation captures,
one desktop (1440px) and one mobile (390px) composition per scene.
[Capture records](captures.json) record all labels and connection identities,
with no horizontal overflow in those ten captures. The capture script uses
the repository's actual font assets and styles.

The refreshed capture records distinguish `pageOverflow`, measured in the
complete homepage before isolation, from `isolatedSceneOverflow`, measured
after the selected diagram replaces the page body for the screenshot.
The previous single `overflow` field measured only the isolated scene and
could not establish whether the surrounding homepage overflowed.

## Reproducing the captures

From the repository root, start the configured development server in one
terminal and run the capture script in another:

```sh
npm run dev -- --port 4173 --strictPort
node artifacts/diagram-owner-implementation/2026-10-02/capture.mjs
```

The script defaults to `http://127.0.0.1:4173/`. For an already running server
on another port or a built Pages preview, provide its complete homepage URL:

```sh
CAPTURE_BASE_URL=http://127.0.0.1:4183/ node artifacts/diagram-owner-implementation/2026-10-02/capture.mjs
# Built preview, after npm run build and npm run preview:pages:
CAPTURE_BASE_URL=http://127.0.0.1:4179/website-redesign/ node artifacts/diagram-owner-implementation/2026-10-02/capture.mjs
```

The script writes the ten PNGs and `captures.json` next to itself. It does not
start a server. The review board displays those files from the same directory.

## Review-fix validation

The two focused Chromium checks passed: the Builders accessible description
matches the collaborative stations, and the Automation output connector stays
clear of the direction and review words at 100%, 150% and 200% text size.
The connector check reads actual path and rendered text geometry.

Capture generation completed with both the default server URL (4173) and the
configured alternate URL (4183). All ten refreshed records report
`pageOverflow: false` and `isolatedSceneOverflow: false`. A controlled 5000px
element inserted outside a diagram before isolation produces
`pageOverflow: true` and `isolatedSceneOverflow: false`, confirming that removal
of the surrounding page no longer hides its overflow in the page record.
Only the desktop Automation image changes; the other nine refreshed PNGs match
their prior files. The assistant inspected the changed image and confirmed
that both unnamed branches remain and the upper branch clears both labels.

Lint and typecheck passed. Full local verification and CI results for the
review-fix commit are recorded in the PR discussion when those runs complete.

The assistant inspected all ten captures. Final refinements route the Workflow
return clear of its review caption, leave the contributor review words visible,
extend the contributor result panel to receive all four paths, and give the
portrait Builder sequence room for its connecting arrows. Executive sequence
and decision arrowheads are visible after the final correction.

Portrait scenes deliberately take more vertical space to preserve the exact
words, separate connections and selected detail level. No visitor comprehension
or recognition study has been performed.

## Jev judgment and its limits

Jev screened the new dense visual transcript and audited three extracted
observations, with no flagged record. The [visual audit](visual-audit.json)
retains the raw results. This cross-check compares text artifacts; Jev did not
inspect pixels.

The first final gate attempt failed with `OpenRouter decisions API 400` and
produced no judgment. The repaired call reduced the payload to a whole-change
summary and explicitly bounded source excerpts, alongside real test logs and
capture records. The [completion gate](completion-gate.json) retains the valid
result: **escalate**, `safe_to_apply: 0.43`, composite `0.728`, and test-gap
confidence `0.23`. All four completion claims received a verified verdict;
the full-suite claim still had confidence `0.35` and required review.

That low-confidence judgment is unresolved; it was not rerun to seek a pass.
The actual command footer, tested source commit and independent CI evidence
are recorded above. The complete patch and captures are available for human
PR review. This report does not claim Jev automatic acceptance, approval to
merge, publication, or measured audience recognition.
