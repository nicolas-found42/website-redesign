# Found42 homepage prototype

A complete, responsive homepage based on `SPEC-PLAN.md` and the September 9, 2026 audit. Nicolas selected the **light editorial** direction after reviewing desktop and 390px hero renders. Black/red identity, the original logo and Richard Achée’s portrait are preserved.

## Run the preview

Requires Node.js 22.12+ (Node 26.8.1 used locally) and npm.

```sh
npm ci
npm run dev -- --port 4173
```

Open http://127.0.0.1:4173/. This is also the running development preview. Vite will print an alternative port if 4173 is occupied.

```sh
npm run typecheck
npx playwright install chromium firefox webkit
npm test
npm run build
npm run preview
```

`npm run preview` serves the production `dist` directory, normally on port 4173; if another server uses it, Vite prints the next available port. Current screenshots are in `docs/preview/expressive/`; earlier `docs/preview/` captures are historical.

## Edit

- `src/content.ts`: resource titles, gates, links, service summaries, testimonial excerpts, and evidence metadata.
- `src/main.ts`: semantic page composition, opening/founder/inquiry copy, responsive navigation and section entrances.
- `src/workflow.ts`: original ribbon geometry, three illustrative states and interruptible Motion transitions.
- `src/icons.ts`: selected Lucide SVG icons.
- `src/style.css`: palette, typography, layout, breakpoints, visible focus, and reduced-motion treatment.
- `public/assets/`: bundled Found42 logo and portrait. Logo padding is cropped by the CSS viewport; the original file is unmodified.
- `tests/`: public browser journeys, accessibility and local asset checks; no external form submissions.

Vite + TypeScript builds a static page. Fonts come from local Fontsource packages, with their OFL license files in those packages. There is no runtime content service, analytics, cookie overlay, form backend or secret requirement. Resource, About, blog, policy and inquiry links deliberately navigate to the existing external destinations in the same tab.

Run `npm run artwork` after changing the ribbon path source to regenerate the two optimized static SVGs. Generated artwork is committed; normal preview/build commands do not require regeneration. The script uses Node’s TypeScript stripping flag, supported by the documented Node version.

## GitHub Pages

`.github/workflows/pages.yml` verifies pull requests and builds/deploys `dist` after a merge to `main`. In GitHub **Settings → Pages**, select **GitHub Actions** as the source. The expected repository URL is https://nicolas-found42.github.io/website-redesign/.

Asset paths are relative (`base: './'`), so the site works at a repository subpath. Only `dist` is published; research, tests and review screenshots are not part of the site. The homepage carries `noindex, nofollow` and a discreet “Design prototype” footer label. Noindex does not restrict access.

Changes must use a feature branch and PR. Do not push directly to `main`. A successful local build is not a verified public deployment; see `docs/VALIDATION.md` for actual status and outstanding coverage.

## Handoff

- `docs/SITE-MAP.md`: supporting destinations and purposes.
- `docs/CONTENT-SOURCES.md`: source inventory, attribution and fulfillment limits.
- `docs/DESIGN.md`: visual, motion and library rationale.
- `docs/VALIDATION.md`: browser evidence, performance and remaining verification gaps.
- `docs/LAUNCH-BACKLOG.md`: production work deliberately deferred.
