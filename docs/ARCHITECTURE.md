# Architecture and hosting

What each part of the site is, and how the built output is served. Contributor
workflow lives in [CONTRIBUTING.md](../CONTRIBUTING.md); design decisions in
[docs/DESIGN.md](DESIGN.md) and `docs/adr/`.

## Structure

- `src/content.ts`: source offerings, resources, biography, industry scopes,
  forthcoming essays and assessment wording.
- `src/homepage.ts`: homepage rendering and shared page mounting; navigation,
  adaptive header, motion controls, reveal and drawing lifecycles.
- `src/homepage/`: homepage bands and reusable site header/footer/inquiry,
  including the three-audience gallery (`audiences.ts`, `audiences-behaviour.ts`).
- `src/audiences.ts`, `src/scene.ts`: the audience scenes (executives install and
  use a system; contributors get a skill per role; builders climb to a workflow
  in use) and the failure-mode review figure, with their live engine.
- `src/art/`: authored landscape/portrait drawing material and the shared motion
  engine (`kit.ts`, `field.ts`, `motion.ts`).
- `src/schematic.ts`, `src/system.ts`: what each working-system drawing says and
  the engine that switches between compositions.
- `src/pages.ts`: dedicated resource, services, industry, biography and blog
  layouts, plus route metadata. Plain render functions match existing conventions.
- `src/interactions.ts`: assessment state, native dialogs and local validation.
  No form sends or stores visitor data.
- `src/readiness*.ts`: the native AI Readiness Scorecard — questions, scoring,
  result view and locally generated PDF (`readiness-pdf.ts`).
- `src/catalog.ts`, `src/resource-materials.ts`: services catalog and the
  downloadable `.skill` packages.
- `src/paths.ts`: deployment-aware internal routes and assets.
- `src/review/`: the invited review tool — activation, form, target capture,
  local store, export, issue formatting and hosted submission. Loads only from
  `?review`; the Worker validates and records it.
- `worker/`: the Cloudflare Worker and D1 migrations for review receipts and
  screenshot storage. `worker/index.ts` owns validation, limits and recovery.
- `src/styles/`: tokens and band styles, imported in order by `src/style.css`,
  with `motion.css` last so reduced-motion preferences take precedence.
- `public/assets/`: logo, founder portrait and license notices.
- `public/resources/skills/`: the four static `.skill` packages.

## Build and scripts

- `scripts/prerender.mjs`: generates the HTML for every route after Vite builds.
- `scripts/serve-pages.mjs`: strict local static server for production checks.
- `scripts/deploy-review-service.mjs`: applies Worker migrations and enables the
  hosted review service after a fresh Workers Free check.
- `scripts/feedback-to-issues.mjs`: turns an exported review-mode feedback file
  into GitHub issues.
- `scripts/capture-*.mjs`, `diagram-inventory.mjs`,
  `summarize-playwright-timings.mjs`: evidence capture and reporting utilities.
  They are never part of the published output.

## GitHub Pages

The production base is `/website-redesign/`. The build emits `/index.html`,
seven nested directory `index.html` files and `/404.html`, all with real
rendered content, individual metadata and `noindex, nofollow`. JavaScript
enhances those pages; normal anchors handle navigation and browser history.
Unknown paths render a dedicated missing-page view rather than the homepage.
Forms are disabled until their validation handlers are attached, preventing
accidental native submission when scripts fail.

`.github/workflows/pages.yml` verifies PRs and deploys **only `dist`** after a
merge to `main`. Audit captures, research, scripts and tests are outside the
published output. Hosted review delivery is the exception on another provider:
the Pages build bakes the `VITE_REVIEW_SUBMISSION_URL` Actions variable into the
browser bundle, and review tools post from the browser to the Cloudflare Worker,
while the deployed site itself stays on GitHub Pages. CI rejects a missing
production endpoint on PRs and before publication.

## Tests

`tests/` covers source-manifest coverage, browser journeys, assessment branches,
accessibility, motion, reflow, static routing and script-failure checks;
`review-*.spec.ts` covers the review tool and `submission-service.spec.ts`
covers the Worker boundary against local D1; `audit-remediation.spec.ts`,
`ux-review.spec.ts` and `ux-review-phone.spec.ts` guard the September 22 audit
and the two September 23 UX review findings. Run commands and scoping are in
[docs/guides/testing.md](guides/testing.md).
