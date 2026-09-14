# Homepage validation

Current implementation: `feat/art-directed-homepage`, branched from `main` at
`06061aa`. Evidence for this iteration is under
[`preview/working-drawings/`](preview/working-drawings). Everything under
`preview/expressive/` and `preview/` documents the iteration this one replaces
and is kept as the "before" record; `preview/working-drawings/before-*.png` are
fresh captures of that design taken from the deployed site before any change.

## Checks performed

- `npm run typecheck`: passed.
- `npm run build`: passed.
- `npm test`: **58 passed** — 54 browser tests across Chromium, Firefox and
  WebKit, plus 4 rendering assertions in the `unit` project that cross
  `renderHomepage()` without an engine.
- Axe WCAG 2 / 2.1 / 2.2 A and AA at 390, 768 and 1440px: **no violations**.
  These checks now run against the settled page. A block on its way in is
  part-way through its opacity, and the contrast of a transition is not what a
  reader is given; the entrance's opacity resolves in 300ms while its travel
  takes 720ms, so that window is as short as the design allows. Automated checks
  are not a claim of complete accessibility certification.
- Reflow at 320, 360, 390, 700, 960 and 1024px, at default **and doubled root
  text size**: no document horizontal overflow at any combination. This is now a
  test rather than a one-off measurement. It is a browser check, not a physical
  device test.
- Keyboard: responsive menu, Escape, section focus transfer, the three service
  choices by Enter and Space, the motion control, and a visible focus ring on
  every control including the closing action on red
  (`keyboard-focus-contact-1440.png`).
- Touch: the three service choices by tap at 390px, where each article carries
  its own still drawing rather than a shared sticky pane.
- Reduced motion: no animation running, no `data-motion` state, no smooth
  scrolling, no Lenis instance, all annotations present and signals placed at
  rest. Interrupting four rapid choices and then switching the preference
  settles to the same composition as a fresh motionless page — asserted node by
  node, route by route, and against any drawing state left on a path.
- The visitor-facing motion control was exercised in both directions and
  asserted to leave zero running animations and nothing hidden.
- Production build served at `http://127.0.0.1:4179/website-redesign/`: every
  JavaScript chunk, stylesheet, font and image resolved, no failed requests, no
  console or page errors, and all three font families loaded. `#resources`,
  `#services`, `#about` and `#contact` scroll correctly on direct entry and
  survive a reload.
- `git diff --check`: passed.

No production form was submitted, no personal detail was entered anywhere, and
no external destination was exercised beyond confirming the links the page
carries are the ones recorded in `CONTENT-SOURCES.md`.

## Rendered environments

| Environment         | Coverage                                                               |
| ------------------- | ---------------------------------------------------------------------- |
| Playwright Chromium | Full suite; production opening and full-page renders at 390 and 1440px |
| Playwright Firefox  | Full suite; production opening renders at 390 and 1440px               |
| Playwright WebKit   | Full suite; production opening renders at 390 and 1440px               |

All three engines reported zero page errors, document width equal to viewport
width, 25 annotations rendered and no drawing state left on any route. Document
heights agree to within 0.3%: 10,153 / 10,178 / 10,152px at 390 and 8,364 /
8,368 / 8,364px at 1440 (`render-report.json`).

## Layout and performance

Measured on the production build at the repository subpath, one unthrottled
local run, Playwright Chromium.

| Observation                | Before (deployed) |  This iteration |
| -------------------------- | ----------------: | --------------: |
| Cumulative layout shift    |                 — |       **0.000** |
| Largest contentful paint   |                 — | 1,000ms / 812ms |
| First contentful paint     |                 — |     36ms / 20ms |
| Frame time, median and p95 |                 — |   16.7 / 16.7ms |
| Document height at 1440px  |           5,105px |         8,364px |
| Document height at 390px   |           7,413px |        10,153px |

Desktop and mobile figures are given in that order. The signal loop holds a
steady 16.7ms frame at both sizes. Each drawing runs one
`requestAnimationFrame` loop moving its own signals — eight in the opening
drawing, six in the services drawing — along cached path lengths, and each loop
is paused by an intersection observer whenever its drawing is off screen, by the
visitor's motion control, and by a reduced-motion preference.

Layout shift reached zero deliberately. The measured split that masks a headline
lays every word out as an inline block, which did not always group them the way
the finished text breaks; the opening headline stood a whole line deeper for the
length of its own entrance and the page jumped when it reverted. Headings
written as sentences are now masked at the sentences they declare, and the two
line boxes agree exactly at every width (`allheads` measurements: 117.3 /
117.3px at 390, 217.9 / 217.9px at 1440).

The page is **longer than the one it replaces** — 64% at 1440px and 37% at
390px. That is the cost of the drawings: each service carries a labelled
schematic of its own, and on a narrow screen all three are present rather than
one shared pane. It is a measured layout change, not a conversion claim.

Built output: **128kB JavaScript / 43kB gzip**, **32kB CSS / 8kB gzip**, and
three Latin variable font files totalling 88kB. First view transfers about
328kB including the portrait. The previous iteration's application JavaScript
was about 29kB gzip; the increase pays for Lenis, SplitType and the drawing
engine. These are measurements of this build, not vendor size estimates.

Declaring the three faces individually rather than importing the Fontsource
stylesheets means the build publishes three font files instead of thirty — a
browser would never have downloaded the other subsets, but they would all have
been deployed.

## Defects found and fixed during this work

Recorded because each was invisible in a passing build:

- A finished `pathLength` tween writes `stroke-dasharray` as a presentation
  _attribute_. Left behind, it held every route at a one-unit dash — a solid
  line rendered as dots — and permanently overrode the stylesheet's own dash on
  the feedback loop.
- Motion's transforms overwrote the CSS transform that places a node marker and
  an annotation, collapsing every marker onto the drawing's origin. Both now
  animate an inner element.
- Headings were re-split on every resize, which removed the class that had
  already played them and left them invisible until the entrance ran again.
- `align-items: start` on the services grid collapsed the sticky pane's
  container, so the flagship drawing did not stick at all.
- Allowing the header to wrap introduced a wrapping _column_ in the mobile menu
  panel, which spilled into extra columns sideways.
- `invert(1)` on the logo over an ink band turns its red "42" cyan.

## Remaining coverage and acceptance

Physical iOS and Android devices, stable branded Chrome, Edge, Safari and
Firefox, screen-reader sessions and outside-reader comprehension testing were
not performed. Engine emulation does not establish those results. Field Core Web
Vitals, INP and mobile-network behaviour are not established by one local
unthrottled run.

The GitHub Pages workflow is unchanged and a production build works locally
under `/website-redesign/`. **No public deployment of this branch is claimed.**
Public hosting remains pending merge and deployment verification; the expected
repository URL remains `https://nicolas-found42.github.io/website-redesign/`.

Visual and content acceptance of this direction is pending. Resource
fulfillment, assessment scoring and report delivery, and inquiry email routing
remain unverified and outside this prototype's acceptance scope.

## Earlier records

The expressive iteration's validation, including its cross-engine parity and
refactor measurements, is preserved in
[`preview/expressive/`](preview/expressive) and
[`preview/refactor-2026-09-10/parity.json`](preview/refactor-2026-09-10/parity.json).
Its own written record was replaced by this document when the design it
described was replaced.
