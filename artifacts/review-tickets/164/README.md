# Executive document drawing (#164)

The `before/` captures use the executive artwork from `fea4a9c`; `after/`
shows the document-focused replacement. Both use the same 1440 × 900 and
390 × 900 browser viewports, with complete scene captures. Only the sticky
header and audience choice rail are hidden during capture, so they cannot
cover the first document. The bundled fonts load in both sets.

The titles, sample lines, decision mark, disclosure, beats and connections
are retained. The accessible description now names the specific document
structures. Desktop disclosure spacing and the decision background accommodate
200% text.

Focused validation used Chromium and two workers on an isolated Vite server:
`npx playwright test --config=.scratch/164.quick.config.ts tests/diagrams.spec.ts --grep 'executive|audience scene keeps'`.
All five cases passed with the bundled fonts loaded. `npm run typecheck`
also passed. The full browser suite, production no-script checks and aggregate
lint remain the integration branch's validation gates.
