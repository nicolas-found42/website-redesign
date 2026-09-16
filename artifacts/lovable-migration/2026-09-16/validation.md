# Migration validation — 2026-09-16

## Status and coverage

Seven of seven publicly discovered pages implemented at their original paths, with directory trailing slashes under `/website-redesign/`. Home, resources, services, private equity, B2B SaaS, about and blog have separate prerendered HTML, metadata and content. Discovery queue closed after a second link-graph pass; public route registry and Firecrawl map agree. This does not claim access to private/unpublished material.

215/215 captured visible or interaction-dependent source text records pass normalized exact comparison with their manifest replacement. 194 unchanged records; 21 recorded edits: 14 extraction punctuation/list-marker repairs and 7 editorial, attribution or action changes. Original/replacement/reason remain together in the manifest. Reviewed rewrites preserve meaning while qualifying savings, labeling samples, and making unavailable delivery truthful. Global repeated chrome shares one implementation. Six unavailable body collections remain blocked: playbook, starter library, course lessons, three forthcoming essays. They are not counted as delivered content.

Seven interaction families: two fully functional (navigation, assessment), one partial (inquiry validation/modal and live external fallback), four blocked for fulfillment (playbook, library, course, newsletter). All local controls and validation are implemented. No source or destination test submitted an inquiry or subscribed anyone. Source JavaScript implements only simulated success; the destination never claims successful delivery. The existing external inquiry URL was fetched successfully, but actual submission was not tested.

## Commands and results

- Baseline `npm test`: 70 passed, 26.4s, before changes at `46fa96c168e8218ac8d55deb04fb4fb7d8102c8c`.
- Final `npm run build`: passed TypeScript checking, Vite build and seven-route/404 prerender.
- Final `npm test`: **117 passed (39.0s)**. Full output: `test-log.txt`. Chromium, Firefox, WebKit and unit assertions. Earlier focused test output in `interaction-test-log.txt` records a dialog focus-wrap defect; the final run verifies the fix in every engine.
- `node scripts/capture-evidence.mjs`: captures all source/destination pages at 390×844 and 1440×1000, both baseline references and destination interaction states. Requires static preview on 4179 and detached original baseline on 4181. Evidence stays outside `dist`.
- `git diff --check`: passed before commit.

Source-derived comparisons exercise initial content plus assessment questions/results, inquiry and course dialogs. Unit checks cover all 81 assessment answer combinations; browser tests cover all result branches, Back, Retake and focus transfer. Tests exercise every email gate, invalid/valid local inputs, absence of non-GET submission requests, truthful status, dialog Escape/focus wrap/restore and mobile industry menu.

Production tests use a strict static server at `/website-redesign/`, not Vite's development fallback. All seven routes load directly and refresh with their own content, server HTML includes content/noindex, internal links/assets resolve, no residual Lovable destination links, no console/page errors or failed asset requests, trailing-slash redirects work, browser back/forward works, and unknown routes return a distinct 404. With JavaScript disabled, page content remains readable and submission controls are disabled so no accidental native GET can expose field values.

Accessibility tests include axe WCAG 2/2.1/2.2 A/AA on all pages at 390, 768 and 1440px, mobile menus over dark surfaces, and dialogs. All seven pages reflow at 360px with doubled root text; original homepage checks additionally cover 320, 390, 700, 960 and 1024px. These are browser and automated checks, not physical-device testing or an accessibility certification. Existing motion tests verify pause/resume, reduced motion, fail-visible content, font delays, responsive schematic geometry and rapid transitions.

## Visual review and resolved findings

Reviewed all fourteen destination full-page captures as desktop/mobile contact sheets, then inspected opening views and interaction evidence. Compared shared composition with the recorded original baseline. Retained paper/ink/red, type families, printed grid, rules, diagram construction, editorial resource composition, service motion and red inquiry band. Supporting pages use indexed scope rows, static schematics, spacious biography and forthcoming essay layouts.

Fixed 320px doubled-text grid overflow; mobile header contrast over ink/red and filtered-header clipping of the fixed menu (with a new full-height viewport assertion); dialog keyboard wrap; mobile service scopes appearing before headings; inherited sticky-panel blank space on mobile. In-app full-page capture stitching initially produced duplicate bands. Replaced page captures using native Playwright screenshot output and recaptured the unchanged original commit in a detached worktree. Capture dimensions and document widths are recorded in `capture-metrics.json`.

## Launch dependencies and publication boundary

Resource files/lesson bodies, email subscription/delivery backend and inquiry integration require authorized business inputs. Three essays are explicitly Coming soon. Both testimonials remain unmistakably samples and require authentic approved replacement. Savings targets require evidence before stronger claims. Historical issue #9 was inaccessible; the assignment and public source determine expanded scope.

Local build and verification are complete for the publicly accessible content and local behavior. Full fulfillment is incomplete for the stated dependencies. Feature branch/PR only: no merge, domain change, source-site modification or production launch. The public GitHub Pages deployment remains the previously merged site until the PR is reviewed and merged through the existing workflow. Noindex remains intact.

## PR review follow-up

The initial Linux CI run passed 116 tests but failed the desktop WebKit reveal-settling wait. Five local repetitions passed; a fast-scroll stress harness reproduced skipped observer regions, while visiting those same targets individually revealed all of them. The accessibility traversal now visits each reveal target and waits for its actual class and full opacity before moving on, retaining the all-target completion assertion. No application reveal state is forced and accessibility assertions are unchanged.

Added a manifest orphan-page guard and explicit captured-state diagnostics; retained exact mobile menu geometry with a non-null assertion; moved production failure collection verification after the entire navigation journey. `npm run build` passed; the updated complete local suite passed **120 tests (40.0s)**. See `review-test-log.txt`. GitHub CI must pass before the authorized PR merge; the historical publication status above describes the initial delivery.
