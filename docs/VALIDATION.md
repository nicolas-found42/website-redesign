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

## Issue #43 review remediation

The final review pass aligned service and audience handoffs with the live
form's vocabulary, kept unavailable learning routes explicit, removed the
remaining technical visual furniture, and updated visitor-level assertions.
The Private Equity page no longer publishes the unapproved eight-hour figure;
the Resources opening names availability honestly, and ScoreApp and Toolkit
links now come from the destination register.
The service rail holds the latest explicit choice until its scroll reaches the
selected article; reduced motion lands there immediately and settles the
drawing. The regression failed before that change and passed 15 repeated runs
across Chromium, Firefox and WebKit afterwards.

Final local gate on the feature branch: `npm run typecheck` passed;
`npm run build` passed; `npm test` — **251 passed (1.3m)** across unit,
Chromium, Firefox and WebKit. The focused homepage, UX, service-drawing and
audience set passed 37/37 in Chromium. The render contract passed 8/8 and
content coverage passed 3/3. The new count supersedes the earlier 257-test
implementation record above; the two runs used different test contracts.

The external contact submission, gated resource fulfillment, course access
terms and final audience recommendations still require owner-approved checks
before release. The preview retains noindex and its current domain routing.

The first PR `verify` run exposed Linux fallback-font overflow at 320px and a
wrapped-rail WebKit choice that could lose its selected state. Both were
reproduced in a Linux container. Constraining the inquiry-step grid and answer
choices removed the overflow. The service rail now keeps an explicit choice
until its article reaches the CSS scroll-margin and page scroll-padding landing;
a settled scroll reconciles the active article after an anchor jump. Natural
short-viewport regressions at 500px and 600px caught cases where the selected
article starts below the viewport midpoint. Eighteen targeted Linux checks
passed in Chromium, Firefox and WebKit, followed by the
full local gate above. Remote verification is reported in the PR.

### Reproducing browser failures

Playwright keeps a trace, screenshot and video for each failed browser test and
writes an HTML report. When Playwright tests fail, the GitHub `verify` job
uploads `test-results/` and `playwright-report/` as a seven-day
`playwright-failure-<run id>` artifact. Open
the report with `npx playwright show-report`, or inspect one captured sequence
with `npx playwright show-trace path/to/trace.zip`. The trace shows the action,
DOM snapshot, network and console around the failure. Passing tests discard
their media, so routine runs do not produce a large artifact.

For a browser race, run the exact test repeatedly, keeping CI's two workers:

```sh
npm run test:stress -- tests/standup-gaps.spec.ts --project=webkit --grep "short-phone choice"
```

The second PR `verify` run caught an intermittent WebKit short-phone jump. A
trace showed the selected service changing while its scroll position was still
settling. The click now measures the wrapped rail before scrolling. At a short
viewport, the preceding article can still span the viewport midpoint when the
chosen article starts below the rail. The rail therefore keeps an explicit
choice selected until the visitor scrolls or follows an anchor. The natural
phone landing and short-phone choice tests each passed 16 repeated local
WebKit runs. The adjacent Chromium and WebKit checks passed 42/42.

The third PR `verify` run failed the same 500px WebKit check again. Content
above the landed article was still reflowing after the 200% text change, and
WebKit has no CSS scroll anchoring, so the article slid out of view after
landing. A narrow choice now holds its article at the landing while the page
resizes, until the visitor moves on. Before the hold, 7 of 40 repeated local
WebKit runs failed; afterwards the short-phone, rapid-choice and reduced-motion
checks passed 180/180 across Chromium, Firefox and WebKit, and the full local
suite passed 251/251.

An earlier full local `npm test` attempt reached 229/251 passes. Eighteen startup
failures were connection refusals on the shared 4173/4179 preview ports; four
Firefox tests then timed out or missed an element in that run. The focused
service checks above and production build passed. The PR's isolated GitHub
`verify` job is the full-suite gate for this change.

## September 23 small-business UX review (#45–#48)

The deployed services section had lost its ink band in #44 while its type kept
ink-band colours: 24 elements at 1:1 and 9 more under 4.5:1 on the homepage and
`/services/`, in every engine. Axe did not report it because the text reveals on
scroll. `tests/ux-review-phone.spec.ts` now measures every visible text node on
all seven routes at 390px after reveals settle, against the first opaque ground
behind it; the same scan reports 33 failures against the pre-fix deployment and
none locally. It also covers the direct email and phone links, the skill gloss
and example, the executive link note, the resources grouping, the outlined hero
action and the 13px annotation floor.

Validation: `npm run typecheck` passed; `npm test` — **266 passed (1.5m)**
across Chromium, Firefox and WebKit, including the production build. The first
run failed nine 320px/200%-text overflow checks on the footer email address;
footer and dialog contact links now wrap inside the address.

The `main` verify run after merging #49 failed one WebKit check, the 600px
short-phone choice, so nothing deployed. It was a regression, not a flake: under
stress the 500px and 600px checks failed about half the time on the merged
commit (20 of 40), against 40 of 40 passes on the commit before it. The new
services example sized its list by inheritance. WebKit settled that inherited
size 100–200ms after the test doubled the root text, so the box grew from 468px
to 1,172px after the jump had landed and pushed the chosen article off the
reading line. The example now sets `--size-body` like every other reading block.
Afterwards the short-phone check passed 60 of 60 in WebKit, the narrow services
checks passed 180 of 180 across the three engines, and `npm test` passed 266 of
266.
