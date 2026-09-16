# Found42 website preview

A seven-page Found42 site built with Vite and TypeScript. The Lovable content
baseline is expressed through the existing **Working Drawings** visual system:
paper and ink, red signals, editorial typography, and responsive schematic
illustrations. The positioning is customized AI systems and training built
around a specific role, industry and company.

This is a noindex design preview. Resource delivery, newsletter subscriptions,
course enrollment and local inquiry submission are not connected. Forms validate
locally and state that nothing was sent. The established Found42 contact form
remains available as an external inquiry fallback.

## Develop and validate

Requires Node.js 22.12+ and npm.

```sh
npm ci
npm run dev -- --port 4173
npm run typecheck
npx playwright install chromium firefox webkit
npm run build
npm test
npm run preview:pages
```

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
- `src/homepage/`: homepage bands and reusable site header/footer/inquiry.
- `src/pages.ts`: dedicated resource, services, industry, biography and blog
  layouts, plus route metadata. Plain render functions match existing conventions.
- `src/interactions.ts`: assessment state, native dialogs and local validation.
  No form sends or stores visitor data.
- `src/paths.ts`: deployment-aware internal routes and assets.
- `src/schematic.ts`, `src/system.ts`: authored landscape/portrait drawings and
  their shared motion engine. Geometry is retained; service labels now match
  Workshops, Workflows and Automations.
- `src/styles/`: existing tokens and band styles, extended by `pages.css`.
  `motion.css` remains last so reduced-motion preferences take precedence.
- `public/assets/`: existing logo, founder portrait and license notices.
- `scripts/prerender.mjs`: generates HTML for every route after Vite builds.
- `scripts/serve-pages.mjs`: strict local static server for production checks.
- `tests/`: source-manifest coverage, browser journeys, assessment branches,
  accessibility, motion, reflow, static routing and script-failure checks.

## GitHub Pages

The production base is `/website-redesign/`. Build emits `/index.html`, six
nested directory `index.html` files and `/404.html`, all with real rendered
content, individual metadata and `noindex, nofollow`. JavaScript enhances those
pages; normal anchors handle navigation and browser history. Unknown paths
render a dedicated missing-page view rather than the homepage. Forms are
disabled until their validation handlers are attached, preventing accidental
native submission when scripts fail.

`.github/workflows/pages.yml` verifies PRs and deploys **only `dist`** after a
merge to `main`. Audit captures, research, scripts and tests are outside the
published output. All changes use a feature branch and pull request; this
migration does not authorize a production-domain change or direct push to main.

## Migration evidence

- [Site map](docs/SITE-MAP.md)
- [Content authority and access limits](docs/CONTENT-SOURCES.md)
- [Visual system](docs/DESIGN.md)
- [Validation status](docs/VALIDATION.md)
- [Launch dependencies](docs/LAUNCH-BACKLOG.md)
- [Teardown](artifacts/lovable-migration/2026-09-16/teardown.md)
- [Source-derived manifest](artifacts/lovable-migration/2026-09-16/manifest.json)

The earlier found42.com audits remain historical evidence. Their homepage-only
scope and older offer/resource taxonomy do not constrain this migration.
