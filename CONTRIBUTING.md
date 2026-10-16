# Contributing

Working conventions for this repository. For what each part of the site does
and how it is hosted, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Development workflow

For new work, fetch `origin/main` and branch from that commit:

- `feat/<description>` — new behavior or content.
- `fix/<description>` — corrections.
- `chore/<description>` — tooling, documentation, dependency upkeep.

Continue existing work on its implementation branch and preserve local changes
when selecting a checkout. Commit and push the branch, then open a pull request
targeting `main`. **All changes to `main` go through a pull request**; direct
commits and pushes to `main` are prohibited and rejected by branch protection,
which requires the `verify` status check.

## Requirements

Node.js 22.22+ or 24+, and npm. That floor is set by the toolchain's own
`engines` fields (`lint-staged` needs 22.22.1; `wrangler`, `miniflare` and
`markdownlint-cli2` need 22.0.0). CI pins Node 22.

```sh
npm ci
npm run dev -- --port 4173
```

The development server is at <http://127.0.0.1:4173/>.

## Commands

| Command                   | Purpose                                                                                                                           |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`             | Vite development server.                                                                                                          |
| `npm run build`           | Typecheck, bundle and prerender every route into `dist/`.                                                                         |
| `npm run preview:pages`   | Strict static server for the built Pages output at <http://127.0.0.1:4179/website-redesign/>.                                     |
| `npm run preview`         | Vite's own preview; it adds a development SPA fallback, so it does not verify static routing.                                     |
| `npm run lint`            | `lint:code` + `lint:styles` + `lint:docs`.                                                                                        |
| `npm run lint:code`       | ESLint over TypeScript and JavaScript, including the Playwright test rules.                                                       |
| `npm run lint:styles`     | Stylelint over `src/**/*.css`.                                                                                                    |
| `npm run lint:docs`       | markdownlint-cli2 over repository Markdown.                                                                                       |
| `npm run lint:actions`    | actionlint over `.github/workflows/`. Install the binary first (`brew install actionlint` on macOS); CI runs the versioned image. |
| `npm run typecheck`       | `tsc --noEmit` for the site, the Worker and the tests.                                                                            |
| `npm run worker:check`    | Dry-run build of the Cloudflare Worker bundle.                                                                                    |
| `npm run worker:deploy`   | Guarded Worker deploy; see [docs/REVIEW-SUBMISSION.md](docs/REVIEW-SUBMISSION.md).                                                |
| `npm run feedback:issues` | Convert an exported review-mode feedback file into GitHub issues.                                                                 |
| `npm test`                | Full Playwright suite; see [docs/guides/testing.md](docs/guides/testing.md).                                                      |

Browser tests need the engines installed once:

```sh
npx playwright install chromium firefox webkit
```

`npm run test:full`, `test:quick`, `test:logic` and `test:jev` are scoped
subsets documented in [docs/guides/testing.md](docs/guides/testing.md); they
are not substitutes for the full suite.

## Pre-commit hook

`.husky/pre-commit` runs `lint-staged`, which formats staged files with
Prettier, then runs `npm run lint` and `npm run typecheck` when any staged file
is not Markdown, or `npm run lint:docs` when only documentation changed. The
hook does not run Playwright.
