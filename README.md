# Found42 homepage prototype

A complete, responsive homepage. The current direction is **Working Drawings**:
the page is built around one graphic idea — an ink transit-map drawing of how a
business works, with red reserved for human direction and for the signals
running its routes — used at the scale of the opening spread, of each service,
and of a link's underline. The project's specification is the
[Found42 website prototype map](https://github.com/nicolas-found42/website-redesign/issues/9).
The black/red identity, the original logo and Richard Achée's portrait are
preserved; `docs/DESIGN.md` records what changed and why.

## Run the preview

Requires Node.js 22.12+ (Node 26.8.2 used locally) and npm.

```sh
npm ci
npm run dev -- --port 4173
```

Open http://127.0.0.1:4173/. Vite prints an alternative port if 4173 is taken.

```sh
npm run typecheck
npx playwright install chromium firefox webkit
npm test
npm run build
npm run preview
```

`npm run preview` serves the production `dist` directory. Current screenshots,
motion frames and measurements are in `docs/preview/working-drawings/`; earlier
`docs/preview/` captures document the iteration this one replaces.

## Edit

- `src/content.ts`: resource titles, gates, links, service summaries,
  testimonial excerpts and evidence metadata. The fields the page renders are
  asserted against these records; the audit fields are not.
- `src/homepage.ts`: the page's interface — `renderHomepage()` and
  `mountHomepage()` — plus the navigation, the header's adaptive ground, the
  opening drawing and the motion control.
- `src/homepage/`: one renderer per band — chrome, hero, resources, services,
  credibility, inquiry — each owning its band's copy and markup.
  `services-behaviour.ts` drives the scroll-linked sequence.
- `src/schematic.ts`: the drawing's geometry. Four compositions, each with a
  wide layout and a separate portrait composition for narrow screens.
- `src/system.ts`: the live drawing — route drawing, node travel, signals,
  pointer depth, and the still composition every state rests in.
- `src/reveal.ts`: the entrance choreography, including the headline masks.
- `src/scroll.ts`, `src/motion-preference.ts`: scroll feel, and whether the page
  may move at all.
- `src/styles/`: one file per band, behind `src/style.css`. `tokens.css` holds
  the palette, type scale and motion tokens; `motion.css` is deliberately last
  so a reduced-motion preference wins.
- `public/assets/`: bundled Found42 logo and portrait, and the licence notices
  that travel with the built assets. Logo padding is cropped by a CSS viewport;
  the original file is unmodified.
- `tests/`: public browser journeys, the drawing's guarantees, accessibility,
  reflow and local-asset checks; no external form submissions.
  `tests/render.spec.ts` asserts the page through `renderHomepage()` and runs
  once in the `unit` project rather than once per engine.

Vite + TypeScript builds a static page. Fonts come from local Fontsource
packages and are declared face by face in `src/styles/fonts.css`, so the build
publishes only the three Latin files the page uses; their OFL licences are in
those packages. There is no runtime content service, analytics, cookie overlay,
form backend or secret requirement. Resource, About, blog, policy and inquiry
links deliberately navigate to the existing external destinations in the same
tab.

## GitHub Pages

`.github/workflows/pages.yml` verifies pull requests and builds/deploys `dist`
after a merge to `main`. In GitHub **Settings → Pages**, select **GitHub
Actions** as the source. The expected repository URL is
https://nicolas-found42.github.io/website-redesign/.

Asset paths are relative (`base: './'`), so the site works at a repository
subpath. Only `dist` is published; research, tests and review screenshots are
not part of the site. The homepage carries `noindex, nofollow` and a discreet
"Design prototype" footer label. Noindex does not restrict access.

Changes must use a feature branch and PR. Do not push directly to `main`. A
successful local build is not a verified public deployment; see
`docs/VALIDATION.md` for actual status and outstanding coverage.

## Handoff

- `docs/SITE-MAP.md`: supporting destinations and purposes.
- `docs/CONTENT-SOURCES.md`: source inventory, attribution and fulfillment
  limits.
- `docs/DESIGN.md`: visual, motion and library rationale.
- `docs/VALIDATION.md`: browser evidence, performance and remaining gaps.
- `docs/LAUNCH-BACKLOG.md`: production work deliberately deferred.
- `research/art-direction-2026-09-14.md` and
  `research/motion-libraries-2026-09-14.md`: the reference and library research
  behind this direction, with sources and licences.
