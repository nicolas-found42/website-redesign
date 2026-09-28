# Found42 website

A seven-page, responsive preview of the Found42 website, built with Vite and
TypeScript. The site uses the **Working Drawings** visual system and presents
Found42's resources, learning materials, services, and inquiry paths.

## Preview and feedback

| Destination      | Link                                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| Website preview  | [Open the hosted preview](https://nicolas-found42.github.io/website-redesign/)                  |
| Team review mode | **[Open the feedback review link](https://nicolas-found42.github.io/website-redesign/?review)** |

To leave feedback, open the review link, choose **Add feedback**, and select the
part of the page you want to discuss. When finished, choose **Send** to download
or copy the feedback file and share it with the team. Review mode stays active
as you navigate between pages in the same tab. See the
[review guide](docs/REVIEW-MODE.md) for the full process.

This is a **noindex design preview**. Newsletter subscription, course
enrollment, and the Skills Starter Library are unavailable here. The on-page
AI Readiness Scorecard keeps answers in the browser; the separate ScoreApp
assessment offers an emailed report whose delivery has not been verified.
Consultation inquiries open Found42's live contact form. Available resources
link to their published destinations.

## Get started

Requires Node.js 22.13+ or 24+, and npm.

```sh
npm ci
npm run dev -- --port 4173
```

Open <http://127.0.0.1:4173/> for the development site. To validate the
production build with the same base path used by GitHub Pages:

```sh
npm run build
npm run preview:pages
```

Open <http://127.0.0.1:4179/website-redesign/> for the static preview.
`preview:pages` checks directory indexes, trailing-slash redirects, and real
404 responses without a development server's SPA fallback. Rebuild after code
changes before testing against an already-running production server.

## Quality checks

```sh
npm run lint
npm run typecheck
npx playwright install chromium firefox webkit
npm test
```

`npm run lint` checks TypeScript, JavaScript, CSS, and repository Markdown.
`npm run lint:actions` also checks the GitHub Actions workflow; it requires
actionlint locally (`brew install actionlint` on macOS). The commit hook runs
lint, typecheck, and the full Playwright suite.

## Project layout

| Path                               | Responsibility                                                  |
| ---------------------------------- | --------------------------------------------------------------- |
| `src/content.ts`                   | Offerings, resources, biography, and page copy                  |
| `src/homepage.ts`, `src/homepage/` | Homepage and shared site sections                               |
| `src/pages.ts`                     | Dedicated page layouts and route metadata                       |
| `src/interactions.ts`              | Scorecard, workflow preview, and inquiry handoff                |
| `src/review/`                      | Optional, on-demand feedback tools                              |
| `src/paths.ts`                     | Deployment-aware routes and asset paths                         |
| `src/styles/`                      | Design tokens and page styles                                   |
| `scripts/prerender.mjs`            | Static HTML generation for every route                          |
| `scripts/serve-pages.mjs`          | Strict static server for production checks                      |
| `tests/`                           | Browser journeys, accessibility, routing, and regression checks |

## Deployment

The production base path is `/website-redesign/`. The build generates an
`index.html` for each route and a dedicated `404.html`, with page-specific
metadata and `noindex, nofollow`. Navigation uses normal links; JavaScript
enhances the rendered pages.

[The GitHub Pages workflow](.github/workflows/pages.yml) verifies pull requests
and deploys the `dist` directory after a merge to `main`. Changes go through a
feature branch and pull request. A production-domain launch requires a
separate decision.

## Project documentation

- [Site map](docs/SITE-MAP.md) and [content sources](docs/CONTENT-SOURCES.md)
- [Visual system](docs/DESIGN.md) and [domain context map](CONTEXT-MAP.md)
- [Validation status](docs/VALIDATION.md) and
  [launch dependencies](docs/LAUNCH-BACKLOG.md)
- [Review mode instructions](docs/REVIEW-MODE.md)
- [Migration teardown](artifacts/lovable-migration/2026-09-16/teardown.md) and
  [source-derived manifest](artifacts/lovable-migration/2026-09-16/manifest.json)
- [September 16 implementation coverage](docs/MEETING-COVERAGE.md) and
  [stand-up convergence record](docs/STANDUP-CONVERGENCE.md)

Earlier found42.com audits are historical evidence. The seven-page migration
and its source manifest define the current preview scope.
