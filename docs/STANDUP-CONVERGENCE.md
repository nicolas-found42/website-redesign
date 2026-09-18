# Stand-up convergence: implementation record

This record covers the later stand-up meeting in which Richard asked the two
redesigns to be brought together: Adejoke's direct explanation of the offering
and its audiences, carried by Nicolas's visual identity, drawings, transitions
and interactions. It is distinct from the earlier September 16 record in
[MEETING-COVERAGE.md](MEETING-COVERAGE.md), which remains the history of the
free-resource progression, the three-audience content and the scorecard path.

The meeting's calendar date is not established; its timestamps are elapsed
meeting time. No transcript was supplied or copied into this repository. The
requirement IDs below are the brief's: M1–M6 confirmed, E1–E2 requested with
unresolved scope, D1 preserved.

## Starting point

Branch `feat/converged-audience-visuals` from `main` at `cb0c8ba` (PR #27
merged). Working tree clean; no local work was reset. `npm ci` on Node 26.8
against the lockfile; `npm run build` and the baseline `npm test` passed
(126 tests, three engines). The deployed GitHub Pages preview matched that
`main`. Adejoke's reference had moved on since the September 16 capture: it
now carries a "Three audiences, one method" section and a copy of the
working-system drawing with rail labels. Its current text is treated as
consistent direction, not as verified claims.

Inventory before editing: an abstract opening headline; a static three-column
audience grid (`pathways()`); the scroll-linked Workshops / Workflows /
Automations sequence with its rail and per-article portrait drawings; text-only
failure-mode explanation on the home and resources pages; one public "no
fluff" string in the course dialog; a provider-backed ScoreApp assessment plus
a separate, labelled four-question prototype.

## Coverage

| ID | Status | Where | Evidence |
| --- | --- | --- | --- |
| M1 Direct opening | Implemented | `src/homepage/hero.ts`, `src/styles/hero.css`, `src/pages.ts` meta, `index.html` | Headline "Hands-on Claude skills and training for your business." with a lead that separates usable systems for executives from practical training for the people doing the work, both built around role, industry and company. One primary action retained. `tests/homepage.spec.ts`, `tests/system.spec.ts`; `artifacts/standup-convergence/home-opening-*.png` |
| M2 Service-method presentation | Preserved | `src/homepage/services*.ts`, `src/system.ts`, `src/schematic.ts` | Unchanged sticky drawing, rail, scroll sync and per-article portrait drawings. `tests/system.spec.ts`, `tests/accessibility.spec.ts` pass unchanged |
| M3 Three audience visualizations | Implemented | `src/audiences.ts`, `src/scene.ts`, `src/homepage/audiences.ts`, `src/homepage/audiences-behaviour.ts`, `src/styles/audiences.css` | Three distinct scenes (install → planner in use; role roster with a skill per role; reviewed climb to a workflow in use), rail + arrows + arrow keys, synchronized kicker/heading/body/drawing/link. `tests/audiences.spec.ts` (8 checks × 3 engines); `artifacts/standup-convergence/audience-*.png`, `builders-frame-*.png` |
| M4 Responsive | Implemented | `src/styles/audiences.css`, portrait layouts in `src/audiences.ts` | Separate portrait compositions ≤860px; rail becomes a list ≤480px; no document overflow at 320/360/390/700/960/1024 at 100% and 200% text; landscape-phone check in the browser pane. `tests/accessibility.spec.ts`, `tests/migration.spec.ts` |
| M5 Remove "no fluff" | Implemented | `src/interactions.ts`; manifest item `course-7` | Public copy now: "One short, practical lesson each day for five days. Unsubscribe anytime." Manifest keeps the original string as provenance. `tests/audiences.spec.ts` scans every route and the course dialog; `dist` grep is clean |
| M6 Praised messaging kept | Preserved | `src/content.ts` | "More signal per deal." remains the Private Equity opening; the eight-hour figure remains a qualified target on the home services band and PE aside. `tests/render.spec.ts` |
| E1 Failure-mode visual | Implemented within the supported material | `src/pages.ts` (resources `#playbook`), `src/audiences.ts` `reviewScene` | A drawn review gate: a draft result, the three named failure modes from the source description, human review, then the business. The advertised 12 checks are not enumerated; the published request link and access disclosures are unchanged. `tests/audiences.spec.ts`; `artifacts/standup-convergence/playbook-*.png` |
| E2 Native scorecard | Blocked; provider path preserved | `src/pages.ts`, `src/interactions.ts` unchanged | See "Scorecard dependency" below. `tests/meeting.spec.ts` blocked-provider fallback still passes |
| D1 Services section | Preserved | `src/homepage/services.ts`, `src/pages.ts` | No new packages, prices or tiers. The services page now carries the same audience gallery in place of the static grid |

## Decisions the meeting left open

These are implementation choices, not stakeholder instructions:

- **Gallery, not tabs and not a second sticky sequence.** The audience
  presentation is a rail of three choices above one shown panel, with
  previous/next arrows and arrow-key movement along the rail. It was chosen
  over a scroll-driven sequence so the section does not duplicate the services
  band, and over hidden tabs because all three names and propositions stay
  visible in the rail. Without a script the three panels read one after
  another with their still scenes; the arrows are hidden until the script
  makes them do something.
- **A scene module beside the schematic, not inside it.** The audience
  drawings need frames, a drawn control, people, checks and a beat order that
  the transit-map schematic does not have. `src/scene.ts` follows the same
  rules as `src/system.ts` (still state at rest, one frame loop, released
  draws, orientation listener, disposal) without changing the working-system
  engine. Recorded in [ADR 0003](adr/0003-audience-scenes.md).
- **Executive scene.** A conceptual "Install a system" control drawn on paper
  (no red, no button semantics), a result marker "A system you use", and an
  illustrative daily planner whose rows carry signals once installed, with the
  human-direction node on its edge. The caption states it is illustrative and
  not a product or a live installation; the commercial link remains the
  existing services anchor.
- **Contributor scene.** Four roles under one company outline — deal team,
  operations, product, sales — each with a skill drawn from the existing
  industry pages (deal screening; plans and reviews; feedback triage; account
  planning), all ending at the human in the loop. The caption says the roles
  are examples; no supported-profession list is claimed.
- **Builder scene.** A learner with a work problem climbs three reviewed steps
  labelled from the existing builder copy — test, troubleshoot, anticipate
  failures — to "Workflow in use". No course, dates or modules are implied.
- **Headline wording.** Richard's benchmark phrase was kept nearly verbatim
  because it met the clarity test; the lead carries the systems-versus-training
  distinction so audiences are not described as buying the same thing.
- **Section heading.** "Three audiences. One method." adopts the framing
  Richard liked. The lead sentence is new editorial text consistent with the
  established content, not a quotation.
- **Review figure** uses one vertical composition at every width: a checklist
  reads down the page, and a horizontal version could not hold its labels in
  the resources column.

## Scorecard dependency (E2)

The genuine AI Readiness Scorecard cannot be reproduced natively from what is
available. Checked without submitting any personal data:

- `https://found42.scoreapp.com/` embeds only the lead-gate fields in its page
  data: first name, last name, email, company name, country, plus an opt-in
  consent ("I agree to allow Found42 LLC to store and process my personal
  data…"). The assessment questions, answer options, scoring, result bands and
  report content are served only after that gate.
- Its public description: a five-minute assessment, questions "on a scale of
  1–10", covering current tools usage, data management practices, workflow
  efficiency, AI integration readiness and automation goals, followed by a
  PDF report with recommendations. One template section of the provider page
  still contains placeholder Latin text; the owner should review provider copy.
- No local source (manifest, captured pages, meeting sources) contains the
  question set or scoring specification. The local four-question workflow
  preview is a separate prototype and is not presented as the scorecard.

To replace the provider, supply: the full question list with option wording
and any branching; per-question scoring and the category or total thresholds;
each result band's title, interpretation and recommendations; the report
delivery expectation (on-page result only, or email/PDF, which this static
site cannot send); and the consent wording. With that, a native assessment
would render through `src/interactions.ts` next to the existing prototype
state machine, keep its own result copy in `src/content.ts`, and be covered by
the same scoring-matrix and branch tests. Until then the on-request iframe and
direct link stay, with their delay and failure fallbacks.

## Services direction (D1) — for review

Richard has not decided what to do with the services section. Nothing was
invented. Points for that decision: whether the boundary band ("Free shows the
pattern / Paid builds the advantage") stays; whether the three method articles
should each name an example engagement; and whether the audience gallery on
the services page should link into the method articles more directly than the
existing anchors.

## Validation

- `npm run typecheck`, `npm run build`, `npm test`: **150 passed** on Chromium,
  Firefox and WebKit against the development server and the strict Pages-style
  static server (24 new checks: 8 in `tests/audiences.spec.ts` × 3 engines, plus
  a no-script gallery assertion in `tests/pages-production.spec.ts`).
- Static output rebuilt after the last source change and served by
  `npm run preview:pages`: `/website-redesign/` 200, `/website-redesign/resources`
  301 to the slash form, unknown path 404 with the missing-page view; no console
  errors or failed requests on the homepage; `noindex` retained.
- Browser pane (production preview): opening at 1440; audience gallery via
  the Next arrow with motion on; 390×844 and 844×390 (orientation change) with
  the portrait scenes; labels read at 320.
- `node scripts/capture-convergence-evidence.mjs` against the static server:
  five widths, three audience states each, the playbook figure, and four
  frames of the builder scene being told. Report: no overflow, no page errors.
- Not run: physical devices, screen readers, and a live provider gate walk
  (already captured on September 16 and unchanged).

## Handoff for Adejoke

The converged site is Nicolas's repository, deployed through the existing
GitHub Pages workflow after review. What each audience gets is in
`src/audiences.ts` (copy, links, captions, and both drawings per audience);
how a scene is told is in `src/scene.ts`; how the gallery behaves is in
`src/homepage/audiences-behaviour.ts`. A still scene needs no script:
`sceneFigure()` renders it. Her project was not modified and nothing here
depends on exporting her animation code.

Raw meeting material, private captures and temporary provider debugging files
are not committed. The published output is `dist` only.
