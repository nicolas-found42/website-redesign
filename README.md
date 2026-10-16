# Found42 website preview

An eight-page Found42 site built with Vite and TypeScript. The Lovable content
baseline is expressed through the existing **Working Drawings** visual system:
paper and ink, red signals, editorial typography, and responsive schematic
illustrations. The opening says it plainly: hands-on Claude skills and
training for your business — usable systems for executives, practical training
for the people doing the work, built around a specific role, industry and company.

This is a noindex design preview. Local resource delivery, newsletter subscriptions,
course enrollment and local inquiry submission are not connected. The AI
Readiness Scorecard asks 18 questions and generates its full personalized report
and PDF locally. It sends nothing; email delivery is deferred until launch. Each of the eight content
pages opens with one preview notice — “Design preview: nothing you type here is
sent, and requested resources are not delivered yet.” — above the opening,
rather than
each card repeating it. Forms
validate locally and state that nothing was sent. The inquiry dialog leads with
the established Found42 contact form; its local draft can be checked and copied
into that form.

## Review mode

Reviewers open the review link,
**https://nicolas-found42.github.io/website-redesign/?review**. The `?review`
parameter stays on while they move between pages in that tab; `?review=off` or
the toolbar's **Exit** ends it. The site deliberately does not advertise the
mode, so whoever runs a review round sends the link out of band. **Add
feedback** records the page, section, element and current text behind a precise
change request, **Save feedback** keeps a local draft, and **Send** posts each
saved item as a separate public GitHub issue through the hosted Worker. Drafts
and receipts stay in the reviewer's browser until Send.

`src/review/activation.ts` is the only review code in the main bundle: it reads
`?review` and loads the tool on demand, so ordinary visitors never fetch it.
Guide for reviewers and triage: [review mode](docs/REVIEW-MODE.md). Hosted
delivery, receipts and limits: [hosted submission](docs/REVIEW-SUBMISSION.md)
and [review screenshots](docs/REVIEW-SCREENSHOTS.md).

## Develop and validate

Requires Node.js 22.13+ or 24+, and npm.

```sh
npm ci
npm run dev -- --port 4173
npm run lint
npm run typecheck
npx playwright install chromium firefox webkit
npm run build
npm test
npm run preview:pages
npm run worker:check
```

`npm run lint` checks TypeScript and JavaScript with ESLint (including Playwright
test rules), CSS with Stylelint, and repository Markdown with markdownlint-cli2.
Run `npm run lint:actions` to check the GitHub Actions workflow with actionlint.
Install its binary first (`brew install actionlint` on macOS); CI runs the
versioned actionlint image. The commit hook formats staged files and runs lint
and typecheck for changes beyond Markdown, or Markdown lint for documentation
changes. Follow [the testing guide](docs/guides/testing.md) for browser-suite
validation; the hook does not run Playwright.

Development: http://127.0.0.1:4173/.
Static production validation: http://127.0.0.1:4179/website-redesign/.
The test configuration starts both servers when needed. After changing code,
rebuild before testing against an already-running production server.

`npm run preview` is also available, but the acceptance checks use
`preview:pages`: directory indexes, trailing-slash redirects and real 404s,
without a development SPA fallback.

## Structure

- `src/content.ts`: source offerings, resources, biography, industry scopes,
  forthcoming essays and assessment wording.
- `src/homepage.ts`: homepage rendering and shared page mounting; navigation,
  adaptive header, motion controls, reveal and drawing lifecycles.
- `src/homepage/`: homepage bands and reusable site header/footer/inquiry,
  including the three-audience gallery (`audiences.ts`, `audiences-behaviour.ts`).
- `src/audiences.ts`, `src/scene.ts`: the audience scenes (executives install
  and use a system; contributors get a skill per role; builders climb to a
  workflow in use) and the failure-mode review figure, with their live engine.
- `src/pages.ts`: dedicated resource, services, industry, biography and blog
  layouts, plus route metadata. Plain render functions match existing conventions.
- `src/interactions.ts`: assessment state, native dialogs and local validation.
  No form sends or stores visitor data.
- `src/paths.ts`: deployment-aware internal routes and assets.
- `src/review/`: the invited review tool — activation, form, target capture,
  local store, export, issue formatting and hosted submission. Loads only from
  `?review`; the Worker validates and records it.
- `worker/`: the Cloudflare Worker and D1 migrations for review receipts and
  screenshot storage. `worker/index.ts` owns validation, limits and recovery.
- `src/schematic.ts`, `src/system.ts`: authored landscape/portrait drawings and
  their shared motion engine. Geometry is retained; service labels now match
  Workshops, Workflows and Automations.
- `src/styles/`: existing tokens and band styles, extended by `pages.css`.
  `motion.css` remains last so reduced-motion preferences take precedence.
- `public/assets/`: existing logo, founder portrait and license notices.
- `scripts/prerender.mjs`: generates HTML for every route after Vite builds.
- `scripts/serve-pages.mjs`: strict local static server for production checks.
- `scripts/deploy-review-service.mjs`: applies Worker migrations and enables the
  hosted review service after a fresh Workers Free check.
- `tests/`: source-manifest coverage, browser journeys, assessment branches,
  accessibility, motion, reflow, static routing and script-failure checks;
  `review-*.spec.ts` covers the review tool and `submission-service.spec.ts`
  covers the Worker boundary against local D1;
  `audit-remediation.spec.ts`, `ux-review.spec.ts` and
  `ux-review-phone.spec.ts` guard the September 22 audit and the two
  September 23 UX review findings.

## GitHub Pages

The production base is `/website-redesign/`. Build emits `/index.html`, seven
nested directory `index.html` files and `/404.html`, all with real rendered
content, individual metadata and `noindex, nofollow`. JavaScript enhances those
pages; normal anchors handle navigation and browser history. Unknown paths
render a dedicated missing-page view rather than the homepage. Forms are
disabled until their validation handlers are attached, preventing accidental
native submission when scripts fail.

`.github/workflows/pages.yml` verifies PRs and deploys **only `dist`** after a
merge to `main`. Audit captures, research, scripts and tests are outside the
published output. Hosted review delivery is the exception on another provider:
the Pages build bakes the `VITE_REVIEW_SUBMISSION_URL` Actions variable into the
browser bundle, and review tools post from the browser to the Cloudflare Worker,
while the deployed site itself stays on GitHub Pages. CI rejects a missing
production endpoint on PRs and before publication. All changes use a feature
branch and pull request; this migration does not authorize a production-domain
change or direct push to main.

## Migration evidence

- [Site map](docs/SITE-MAP.md)
- [Content authority and access limits](docs/CONTENT-SOURCES.md)
- [Visual system](docs/DESIGN.md)
- [Validation status](docs/VALIDATION.md)
- [Launch dependencies](docs/LAUNCH-BACKLOG.md)
- [Review mode](docs/REVIEW-MODE.md): how the team sends exact feedback
- [Hosted submission](docs/REVIEW-SUBMISSION.md): Worker setup, receipts and
  release verification
- [Review screenshots](docs/REVIEW-SCREENSHOTS.md): optional image evidence,
  limits and retention
- [Teardown](artifacts/lovable-migration/2026-09-16/teardown.md)
- [Source-derived manifest](artifacts/lovable-migration/2026-09-16/manifest.json)

The earlier found42.com audits remain historical evidence. Their homepage-only
scope and older offer/resource taxonomy do not constrain this migration.

September 16 meeting implementation: [requirements and Adejoke handoff](docs/MEETING-COVERAGE.md).
Stand-up convergence (direct opening, audience scenes, failure-mode figure,
copy changes): [implementation record](docs/STANDUP-CONVERGENCE.md).
