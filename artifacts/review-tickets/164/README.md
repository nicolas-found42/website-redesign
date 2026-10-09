# Executive document drawing (#164)

The `before/` captures use the executive artwork from `fea4a9c`; `after/`
shows the document-focused replacement. Both use the same 1440 × 900 and
390 × 900 browser viewports. The October 9 capture repair renders each
complete still scene at its measured on-page field width, using the same
scene renderer and loaded page styles. All surrounding page DOM is removed
from the capture, so sticky chrome cannot cover the first document. All three
bundled fonts returned HTTP 200 in both sets. Every title, sample line, decision
mark and disclosure is checked in the capture before saving it.

The titles, sample lines, decision mark, disclosure, beats and connections
are retained. The accessible description now names the specific document
structures. Desktop disclosure spacing and the decision background accommodate
200% text.

Focused validation used Chromium and two workers on an isolated Vite server:
`npx playwright test --config=.scratch/164.quick.config.ts tests/diagrams.spec.ts --grep 'executive|audience scene keeps'`.
All five cases passed with the bundled fonts loaded. `npm run typecheck`
also passed. The full browser suite, production no-script checks and aggregate
lint remain the integration branch's validation gates.
