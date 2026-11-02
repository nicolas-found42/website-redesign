# Architecture and hosting

What each part of the site is, and how the built output is served. Contributor
workflow lives in [CONTRIBUTING.md](../CONTRIBUTING.md); design decisions in
[docs/DESIGN.md](DESIGN.md) and `docs/adr/`.

## Structure

- `versions/<slug>/`: one folder per version of the website. Each holds
  `version.json` (status, title, summary, author, created date), its
  `index.html`, `src/`, `public/`, an optional `prerender.mjs` and any of its
  own tests. Deleting a folder removes the version. See
  [ADR 0013](adr/0013-version-folders-discovered-at-build.md).
- `versions/current/`: today's site, the baseline. Inside it, `src/content.ts`
  holds offerings, resources, industry scopes and assessment wording;
  `src/homepage.ts` and `src/homepage/` the pages and bands; `src/pages.ts` the
  dedicated layouts and route metadata; `src/interactions.ts` and
  `src/readiness*.ts` the dialogs and the AI Readiness Scorecard;
  `src/audiences.ts`, `src/scene.ts`, `src/schematic.ts`, `src/system.ts` and
  `src/art/` the drawings and motion engine; `src/styles/` the tokens and band
  styles; `src/paths.ts` deployment-aware routes; `public/` its assets and the
  four static `.skill` packages. Design records for it are `docs/DESIGN.md` and
  ADRs 0001–0012.
- `shared/review/`: the invited review tool, shared by every version and loaded
  only from `?review`: activation, form, target capture, local store (per
  version), export, issue formatting and hosted submission.
- `shared/content/`: facts every version shares: destinations, contact details,
  biography, principles, testimonials and resource inventory.
- `hub/`: renders the hub index (static HTML, no scripts, neutral styling, a
  "How this works" guide) and the hub strip (`strip.mjs`) that the build injects
  after `<body>` in every built page of every version.
- `worker/`: the Cloudflare Worker and D1 migrations for review receipts and
  screenshot storage. `worker/index.ts` owns validation, limits and recovery.

Shared code never imports from a version, and a version never imports from
another; a test enforces it. Versions reach shared code through the `@shared`
alias.

## Build and scripts

- `scripts/versions.mjs`: discovers and validates `versions/*/version.json`.
- `scripts/build-site.mjs`: builds every version to `dist/<slug>/` (running its
  `prerender.mjs` if present), captures previews, and renders the hub index.
- `scripts/new-version.mjs`: `npm run version:new` scaffolds a draft version
  with a generated, never-reused name.
- `scripts/changed-versions.mjs`: tells CI which versions a change touches.
- `scripts/serve-pages.mjs`: strict local static server for production checks.
- `scripts/deploy-review-service.mjs`: applies Worker migrations and enables the
  hosted review service after a fresh Workers Free check.
- `scripts/feedback-to-issues.mjs`: turns an exported review-mode feedback file
  into GitHub issues.
- `scripts/capture-*.mjs`, `diagram-inventory.mjs`,
  `summarize-playwright-timings.mjs`: evidence capture and reporting utilities.
  They are never part of the published output.

## GitHub Pages

The production base is `/website-redesign/`. The hub is `/index.html`; each
version publishes under `/website-redesign/<slug>/`, and Pages serves the hub's
own `/404.html` for every missing path. The build also emits `versions.json`
and `previews/`. The hub and each version's rendered pages carry
`noindex, nofollow`. JavaScript
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

`tests/hub.spec.ts` checks the built hub against the version folders,
`tests/version-contract.spec.ts` runs the small contract every version must
pass (CI limits it to changed versions through `VERSIONS`), and
`tests/versions.spec.ts` covers discovery, the scaffold and the import rules.
The rest of `tests/` protects the `current` version, the shared review tool and
the Worker: it covers source-manifest coverage, browser journeys, assessment branches,
accessibility, motion, reflow, static routing and script-failure checks;
`review-*.spec.ts` covers the review tool and `submission-service.spec.ts`
covers the Worker boundary against local D1; `audit-remediation.spec.ts`,
`ux-review.spec.ts` and `ux-review-phone.spec.ts` guard the September 22 audit
and the two September 23 UX review findings. Run commands and scoping are in
[docs/guides/testing.md](guides/testing.md).
