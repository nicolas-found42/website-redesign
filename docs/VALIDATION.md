# Website validation

The project now covers seven pages, superseding the former homepage-only scope. The current evidence and precise limits are in [the migration validation report](../artifacts/lovable-migration/2026-09-16/validation.md); source-derived coverage is in [the manifest](../artifacts/lovable-migration/2026-09-16/manifest.json). Historical design evidence remains under `docs/preview/working-drawings/` and in Git history.

Run `npm run build` and `npm test`. The build typechecks, bundles and prerenders seven directory index files plus a real 404. Playwright runs unit assertions and Chromium, Firefox and WebKit checks against both development and strict static production servers. Latest local run: **120 passed (40.0s)**.

Coverage includes 215 source-derived text records, assessment scoring/branches, form validation and truthful unavailable-delivery states, navigation and dialog keyboard behavior, axe accessibility, mobile/intermediate/desktop reflow, motion pause/reduced motion, no-JavaScript readable content, and GitHub Pages direct entry, refresh, assets, links, back/forward and 404 handling. Static tests use `/website-redesign/`; a development-server fallback is not accepted as route verification.

Review screenshots separately for visual consistency. `scripts/capture-evidence.mjs` records 390px/1440px source and destination evidence plus the original baseline served on port 4181. It is an audit utility and is never included in the published site. Full setup and remaining fulfillment dependencies are documented in the audit report and [launch backlog](LAUNCH-BACKLOG.md).

A passing suite establishes local content and behavior, not working email delivery, resource fulfillment, authentic testimonials, live external submissions or a public deployment. Retain noindex until a separately authorized launch.


## September 16 meeting implementation

Baseline at main 0ecffdc: `npm test` — 120 passed (40.9s).
Current validation: `npm run typecheck` passed; `npm run build` passed;
`npm test` — **126 passed (46.3s)** across Chromium, Firefox and WebKit.
`git diff --check` passed. No new dependencies. Existing tests retain all 81
prototype scoring combinations, dialogs, no-send forms, reduced motion, axe,
360px doubled text, no-JavaScript content and strict GitHub Pages routing.
Six additional engine checks cover the meeting hierarchy/order/audiences and
blocked external assessment behavior. The old manifest failed during editorial
changes; its source text was retained and replacements explicitly documented.

Browser captures: `node scripts/capture-meeting-evidence.mjs` against the strict
static server at `http://127.0.0.1:4179/website-redesign/`. Seven routes at
1440×900, 1366×768, 768×1024, 390×844 and 320×844: all HTTP 200, no document
overflow or page errors. Original-provider gate opened in the iframe at each
width without entering or submitting details. The provider hydrates after
rendering its initial markup; capture waits for initialization and modal motion.
Report delivery beyond the gate is unverified, not simulated as successful.

Evidence is under `artifacts/meeting-2026-09-16/`: before captures of local,
Adejoke, original and deployed homepages at 1440/390; after captures of every
route and scorecard/course/menu states; `after/report.json`; source-page browser
inventory and public captures under `sources/`. Raw transcript and temporary
provider debugging files are not committed or published. Workflow publishes only
dist, retaining noindex and prototype disclosures.

Deployment status will be recorded in the PR and final handoff after the normal
required-check and merge path. This local report does not assert deployment.

One subsequent run hit local connection failures after an overlapping rebuild
removed dist while the already-running static server was reading it. The server
was restarted after the build completed and the suite rerun against fixed output;
no application change was needed for those connection failures.
