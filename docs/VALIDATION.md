# Expressive homepage validation

Current implementation: `feat/expressive-homepage`, based on the approved light prototype and `research/visual-design-critique-2026-09-09.md`. Review fixed point: `d3592fa5596c0acb4ecd6ef0ffa535cd46fec7cf`. Current evidence is under `preview/expressive/`; other screenshots under `preview/` document the earlier prototype or hero comparison.

## Checks performed

- `npm run typecheck`: passed throughout implementation; the final production build also typechecks.
- `npm test`: **39 passed** across Chromium, Firefox and WebKit. After the final narrow-text wrapping adjustment, the complete accessibility test file passed again: **18 passed** across all three engines. The final contact focus-color enhancement was checked in a rendered keyboard-focus capture.
- `npm run build`: passed. Production output was served at `http://127.0.0.1:4175/website-redesign/` to check repository-relative assets and navigation.
- `npm run artwork`: passed; both standalone SVGs decode successfully. The asset browser test blocks external content hosts and verifies all homepage images load locally.
- Keyboard navigation: responsive menu, Escape, section focus transfer, workflow choices and visible focus. Click/touch/Enter/Space select equivalent states. Stationary actions remain available while the illustration moves.
- Reduced motion: no movement or smooth scrolling; switching preferences during rapid selections settles to the same rendered result as a fresh motionless page. This regression failed before the queued animation writes were fixed.
- Axe WCAG 2/2.1/2.2 A/AA checks at 390, 768 and 1440px: no reported violations. Automated checks are not a claim of complete accessibility certification.
- Width/reflow checks at 320, 390, 700, 768, 960, 1024 and 1440px, both default and doubled root text size: no document horizontal overflow. This enlarged-text stress check supplements responsive viewport checks; it is not a physical-device test.
- Rendered destination checks: all four resources, blog, About, Contact and source homepage returned HTTP 200. Opened the external ScoreApp pre-question details gate; no details entered, questionnaire completed or production forms submitted. The selected Andrew Miller excerpt was present in the rendered source.
- `git diff --check`: passed. The implement skill's Standards and Spec passes were completed separately against the starting HEAD; see `reviews/expressive-standards.md` and `reviews/expressive-spec.md`.

## Rendered environments

| Environment             | Version       | Actual coverage                                                                                        |
| ----------------------- | ------------- | ------------------------------------------------------------------------------------------------------ |
| Playwright Chromium     | 153.0.8010.12 | Browser suite; production opening/full-page renders at 1440×844 and 390×844; all three workflow states |
| Playwright Firefox      | 155.0         | Browser suite; production opening/full-page renders at 1440×844 and 390×844                            |
| Playwright WebKit       | 26.6          | Browser suite; production opening/full-page renders at 1440×844 and 390×844                            |
| Installed Google Chrome | 152.0.7977.83 | Production opening/full-page renders, reflow stress checks and synthetic loading/interaction samples   |

All final production renders reported zero page errors and document width equal to viewport width. The portrait was decoded before full-page capture. `render-metrics.json` preserves browser-by-browser measurements; `reflow.json` records intermediate-width checks. Screenshots include `chromium-opening-1440.png`, `chromium-opening-390.png`, their full-page counterparts, workflow variants, enlarged text and contact keyboard focus.

## Layout and performance evidence

Compared with the research's 390px Chromium baseline, using an 844px viewport height:

| Observation                      | Researched version | Expressive version |
| -------------------------------- | -----------------: | -----------------: |
| Resource section height          |            2,553px |            2,032px |
| Services start from document top |            3,707px |            3,187px |
| Default workflow button text     |               11px |               14px |

The resource sequence is about **20% shorter**, and services start **520px earlier**. This is a measured layout change, not a conversion or financial claim. Main content is approximately 620 words; typography and the mobile layout account for small extracted-word differences.

The final application bundle is approximately **80.6kB JavaScript / 28.9kB gzip**, and **28.2kB CSS / 8.8kB gzip**. The additional JavaScript pays for Motion and selected icons; the prior prototype's JS was about 5.2kB gzip. The actual build, not advertised library size, is recorded in `performance.json`.

Loading and click-to-two-animation-frame samples were collected in one unthrottled installed-Chrome localhost run. Raw values and exact bundle sizes are in `performance.json`. These are synthetic engineering observations, not field Core Web Vitals, INP, mobile-network guarantees or physical-device results. The lazy portrait is outside the initial transfer sample. No analytics was added.

## Remaining coverage and acceptance

Physical iOS/Android devices, branded Edge/Safari/Firefox, screen-reader sessions and outside-reader comprehension testing were not performed. Engine emulation does not establish those results.

The GitHub Pages workflow is present, and a production build works locally under `/website-redesign/`. **No public deployment is claimed for this branch.** Public hosting remains pending merge and deployment verification. The expected future repository URL remains `https://nicolas-found42.github.io/website-redesign/`.

Nicolas selected the original light direction; final visual/content acceptance of this expressive version remains pending. Resource fulfillment, assessment scoring/report delivery and inquiry email routing remain unverified and outside this prototype's acceptance scope.
