# Website validation

The project now covers seven pages, superseding the former homepage-only scope. The current evidence and precise limits are in [the migration validation report](../artifacts/lovable-migration/2026-09-16/validation.md); source-derived coverage is in [the manifest](../artifacts/lovable-migration/2026-09-16/manifest.json). Historical design evidence remains under `docs/preview/working-drawings/` and in Git history.

Run `npm run build` and `npm test`. The build typechecks, bundles and prerenders seven directory index files plus a real 404. Playwright runs unit assertions and Chromium, Firefox and WebKit checks against both development and strict static production servers. Historical migration run: **120 passed (40.0s)**. Current meeting-implementation validation is recorded below.

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

## Stand-up convergence

Baseline at main cb0c8ba: `npm test` — 126 passed (43.7s). Current validation:
`npm run typecheck` passed; `npm run build` passed; `npm test` — **150 passed
(46.3s)** across Chromium, Firefox and WebKit. `tests/audiences.spec.ts` adds
eight checks per engine: discovery and choice of all three audiences with
synchronized kicker, drawing description, link and pressed state; arrows and
arrow keys; three distinct drawings; complete still scenes under reduced
motion and after a pause mid-sequence; portrait scenes and touch at 390px;
the failure-mode figure's traced content; and a public-copy scan for the
removed phrase on every route and in the course dialog.
`tests/pages-production.spec.ts` now also asserts the three panels read in
full without a script. Existing overflow checks at 320–1024px and 200% text
pass; a label that reached past its figure at 960px/200% is now clipped at the
figure rather than pushing the page sideways.

Browser captures: `node scripts/capture-convergence-evidence.mjs` against the
strict static server. Evidence in `artifacts/standup-convergence/`: opening at
five widths, three audience states at each, the playbook figure, four frames
of the builder scene with motion on, and `report.json` (no overflow, no page
errors). See [STANDUP-CONVERGENCE.md](STANDUP-CONVERGENCE.md) for what was
inspected by hand in the browser pane and what was not run.

One subsequent run hit local connection failures after an overlapping rebuild
removed dist while the already-running static server was reading it. The server
was restarted after the build completed and the suite rerun against fixed output;
no application change was needed for those connection failures.

## September 22 site audit

Baseline at main 6baad73: `npm test` — 150 passed. Audit and remediation of
17 findings (one High: dialogs and the open mobile menu could not be scrolled
with a wheel or trackpad because Lenis took their wheel events). Current
validation: `npm run typecheck` passed; `npm run build` passed; `npm test` —
**183 passed** across Chromium, Firefox and WebKit, including
`tests/audit-remediation.spec.ts` (11 checks per engine, 10 of which fail on
the pre-fix source). Axe clean at 390/1440 on every route, with the menu open
and in the dialog's error state. After matrix: 8 routes × 6 widths × 3 engines,
no overflow or page errors. Findings register, coverage matrix, before/after
evidence and logs: [artifacts/site-audit/2026-09-22](../artifacts/site-audit/2026-09-22/report.md).
Re-capture with `scripts/capture-audit-evidence.mjs`. Not run: physical devices,
real Safari, screen readers.

## September 23 homepage journeys

Issue #43 replaces prototype-era journey copy and local no-send forms with clear
homepage paths, published resource destinations, interim service routes, and
honest unavailable states. The inquiry dialog now hands off directly to Found42's
live contact form; the scorecard's open answer remains local and is shown only as
context to copy. The ordinary interface adopts the approachable business-site
visual voice while the routed drawings keep their alternatives and motion states.

Validation: `npm run typecheck` passed; `npm run build` passed; `npm test` —
**257 passed (1.8m)** across unit, Chromium, Firefox and WebKit. This includes
320px doubled-text reflow, three-engine drawing geometry, resource destination
coverage, unavailable-state copy, and no local submission forms. A local passing
suite still does not verify delivery by Found42's external contact form or any
resource request route.

## Stand-up transcript follow-up

Baseline at main c00cc1c: `npm test` — 183 passed. Current validation:
`npm run typecheck` passed; `npm run build` passed; `npm test` — **212
passed (1.6m)** across Chromium, Firefox and WebKit. New:
`tests/standup-gaps.spec.ts` (eight checks per engine: a phone article's
drawing arriving from the service before it and settling as its own; every
phone drawing its own composition throughout under reduced motion; the rail
under the header with a jump landing below it, at 390px and at 320px with
doubled text, where the rail wraps; the homepage playbook figure;
the scorecard's forward/back, kept open answer, escaped echo, focus, axe on the
result, inquiry prefill, retake and no external requests; the header lifted
after an anchor load or an early jump; every scorecard state at 320px with
doubled text and fonts blocked) and five unit checks in `tests/render.spec.ts`
(the Plan B questions and five areas; all 4,096 answer sets against the stage
thresholds, statuses, ordering and barrier advice, with no numbers in any
result; every adopted or equivalent line of the Lovable delta on the rendered
homepage; the industries strip; the homepage review figure). The ScoreApp
embed test in `tests/meeting.spec.ts` now checks the on-page scorecard and that
nothing reaches the provider.

A Firefox reflow failure at 360px with doubled text (6 in 20 runs) was the new
scorecard rail's two labels refusing to share a line before the page fonts
arrived; the rail now wraps, and the reflow test passed 20 of 20 afterwards.
`F07` in `tests/audit-remediation.spec.ts` also fails intermittently in Firefox
on `main` (2 in 15 runs) and on this branch; it is recorded as a separate task.

Browser captures: `node scripts/capture-standup-gaps-evidence.mjs` against the
strict static server. Evidence in `artifacts/standup-gaps/2026-09-23/`: the
homepage playbook entry, the builders panel, the industries strip and two
scorecard states at 1440, 768, 390 and 320; two phone frames of the Workflows
drawing approaching and arrived with motion on; `report.json` (no overflow,
no page errors, including the motion-on phone page).
Not run: physical devices, real Safari, screen readers.
