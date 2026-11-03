# Repository Guidelines

## Project Overview

- `found42-website-preview`: the Found42 website redesign **hub**, published as a static site to GitHub Pages under the base path `/website-redesign/`.
- The site root is a generated, **script-free hub index** (`dist/index.html`) listing every site iteration. Each iteration is a folder under `versions/<slug>/` and is **discovered at build time from the folders themselves** — there is no central registry (ADR 0013); deleting a folder removes the version from build, hub, and tests.
- Only `dist/` is deployed to Pages. A separate Cloudflare Worker (`worker/`) receives in-page review feedback and turns it into GitHub issues (D1 receipts + optional screenshots).
- Currently one version exists: `versions/current` (the baseline).

## Architecture & Data Flow

- **Build-time:** `npm run build` = `tsc --noEmit` + `node scripts/build-site.mjs`. The script discovers and validates every `versions/*/version.json` (`scripts/versions.mjs`), then runs **one `vite build` per version** into `dist/<slug>/` (`vite.config.ts` sets root `versions/<slug>`, production base `/website-redesign/<slug>/`, `outDir dist/<slug>`, defines `VITE_VERSION`, aliases `@shared` → `shared/`). It then calls the version's optional `prerender.mjs`, injects the hub strip into every built `.html` (`hub/strip.mjs`), writes a root `dist/404.html`, captures hub preview PNGs per version with Playwright Chromium into `dist/previews/`, and finally renders the hub `dist/index.html` (`hub/render.mjs`) plus `dist/versions.json`.
- **Request-time (static):** Pages serves the hub at `/website-redesign/` and versions at `/website-redesign/<slug>/<route>/index.html`; missing paths get the root `404.html`. Reproduce locally with `npm run preview:pages` (strict Pages-like server on `http://127.0.0.1:4179/website-redesign/`; do **not** use `npm run preview`, which adds a dev SPA fallback).
- **Version runtime:** `versions/<slug>/index.html` loads `src/main.ts`; pages are rendered as HTML strings and behavior is attached with disposer-returning `mount*` functions (`versions/current/src/homepage.ts`). `prerender.mjs` reuses the same renderers in a Vite SSR server to emit every route in `pageMeta` plus `404`.
- **Review feedback flow:** version page + `?review` → `shared/review` (lazy-loaded; only `activation.ts` is in the visitor bundle) → `POST $VITE_REVIEW_SUBMISSION_URL` → `worker/index.ts` (`/submit`, D1-backed rate limits, idempotency marker) → GitHub issue labelled `needs-triage`, `review-feedback`, `version:<slug>`. Drafts are stored per version in localStorage under `found42-review:feedback:<slug>` (ADR 0014).
- **Runtime fetches (complete set):** jsPDF font files from version assets; screenshot upload `POST <worker>/screenshots/<sha256>`; feedback `POST $VITE_REVIEW_SUBMISSION_URL`; worker `GET /screenshots/<sha>` for issue images. Everything else is first-party and goes through `sitePath()` (prefixes `BASE_URL`).

## Key Directories

| Path                                        | Purpose                                                                                                                                                                                                           |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hub/`                                      | `render.mjs` builds the static hub page + 404; `strip.mjs` is the per-page hub nav injected into every built HTML                                                                                                 |
| `versions/`                                 | One folder per site iteration; `versions/current` is the baseline. Each holds `version.json` (validated contract), `index.html`, `src/`, `public/`, optional `prerender.mjs`                                      |
| `shared/`                                   | Code shared by all versions: `review/` (feedback tool), `content/` (shared facts). Never imports from `versions/`                                                                                                 |
| `worker/`                                   | Cloudflare Worker `found42-review-submission`: `index.ts` submission handler, `screenshots.ts`, `wrangler.jsonc`, D1 `migrations/`                                                                                |
| `scripts/`                                  | Build/tooling `.mjs` scripts (see commands below); CI helpers `changed-versions.mjs`, `list-project-shard.mjs`; manual `capture-*.mjs` evidence tools                                                             |
| `tests/`                                    | 31 Playwright specs + `drawing.ts` helper + `fixtures/diagram-inventory.json`                                                                                                                                     |
| `docs/`                                     | `ARCHITECTURE.md`, `DESIGN.md`, `SITE-MAP.md`, `CONTENT-SOURCES.md`, `guides/testing.md`, `agents/*` (domain, issue-tracker, triage-labels, diagnostics), `contexts/*/CONTEXT.md`, `adr/0001-0014`, `REVIEW-*.md` |
| `artifacts/`, `research/`, `.out-of-scope/` | Dated evidence, rationale, and rejected concepts. Inert to CI version selection; never published                                                                                                                  |
| `.github/workflows/pages.yml`               | The only workflow: lint + 4 sharded browser-test jobs + `verify` gate + Pages deploy on `main`                                                                                                                    |

## Development Commands

| Command                                  | What it does                                                                                                                    |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev -- --port 4173`             | Vite dev server for `versions/current` at `http://127.0.0.1:4173/` (`VERSION=<slug>` for another version)                       |
| `npm run build`                          | `tsc --noEmit` + full Pages artifact into `dist/` (needs Playwright Chromium for previews; preview failure is fatal under `CI`) |
| `npm run preview:pages`                  | Pages-faithful static preview of `dist/` on port 4179                                                                           |
| `npm run typecheck`                      | `tsc --noEmit` for root + `worker/` + `tests/` tsconfigs                                                                        |
| `npm run lint`                           | ESLint (`--max-warnings 0`) + stylelint + markdownlint. `lint:actions` (actionlint) is CI-only                                  |
| `npm test` / `npm run test:full`         | Full Playwright suite, 2 workers, projects `unit`, `chromium`, `firefox`, `webkit`                                              |
| `npm run test:quick -- tests/x.spec.ts`  | Partial: Chromium only, dev server only, excludes `[production]` tests                                                          |
| `npm run test:logic`                     | Browserless: `render`/`submission-service`/`versions` specs (Miniflare for the Worker)                                          |
| `npm run test:jev`                       | Changed-path → Jev-ranked partial Chromium run (needs `OPENROUTER_API_KEY`)                                                     |
| `npm run test:stress`                    | `--repeat-each=12 --workers=2`                                                                                                  |
| `npm run version:new`                    | Scaffold a new `versions/<slug>` (copy of `current` by default, `--blank`, `--from`, `--name`) with draft `version.json`        |
| `npm run worker:check` / `worker:deploy` | Wrangler dry-run / guarded manual Worker deploy (not in CI)                                                                     |
| `npm run feedback:issues`                | Convert an exported review file into GitHub issues                                                                              |

Rules: default to **2 Playwright workers**; only change for explicit performance comparisons. `test:quick`/`test:logic`/`test:jev` are partial feedback loops — `test:full` is the gate. Workflow: branch `feat|fix|chore/<description>` from fetched `origin/main`, push, open a PR; **direct pushes to `main` are prohibited**, merge requires the `verify` CI check. Report validation against the tested commit (commands, outcomes, unrun checks).

## Code Conventions & Common Patterns

- **ESM everywhere** (`"type": "module"`); Node tooling is `.mjs`, browser code is `.ts`. TypeScript `strict`, `moduleResolution: "Bundler"`, `@shared/*` path alias.
- **No framework.** Markup is composed as template strings from small functions; one concern per kebab-case file (e.g. `motion-preference.ts`, `submission-contract.ts`); exports are camelCase. `mount*` functions return a disposer; `interactions.ts` centralizes one `AbortController`.
- **Data-driven registries over conditionals:** `pageMeta` (`versions/current/src/pages.ts`), `art/index.ts` dispatch map, status tables in `scripts/versions.mjs`.
- **Dependency direction is one-way and test-enforced** (`tests/versions.spec.ts`): `shared/`, `hub/`, `scripts/`, `worker/` never import from `versions/`; versions import shared code only via `@shared` and never import each other. Shared facts are read-only to versions unless `version.json.changesFacts` declares the change.
- **Type safety on untrusted input:** validate through `unknown` predicates (`shared/review/submission-contract.ts`), `Object.hasOwn` for tag maps, `readonly` tuples for content. `recommendedTypeChecked` ESLint applies to `versions/*/src` and `shared/`.
- **Errors:** user-facing failures throw plain `Error`/`RangeError` with complete sentences; storage/media access degrades silently in `try/catch`; Worker distinguishes retryable/pending/confirmed/invalid.
- **Async:** lazy `void import()` for code splitting; `AbortSignal.timeout`; streamed request bodies with byte caps (Worker); `navigator.locks` with storage-lease fallback for batched submission.
- **CSS:** single entry `style.css` with documented `@import` order; all design values from `styles/tokens.css`; motion start states gated on `html[data-motion="on"]` in `motion.css` so script failure leaves the final state. Stylelint covers `versions/*/src/**/*.css` and `shared/**/*.css`.
- **Progressive enhancement / a11y:** prerendered HTML with real anchors, `<noscript>` fallbacks, every page `noindex`, hub strip on every page, focus trap + Escape in dialogs/menu, `data-reveal*` opt-in, reduced-motion respected.
- **Formatting (Prettier):** 2-space indent, double quotes, semicolons, trailing commas, `printWidth: 80` — enforced by lint-staged on every commit.
- **HTML escaping:** small per-serializer `esc` helper at each boundary (hub render/strip, review form) rather than a shared util.

## Important Files

- `package.json` — all npm scripts (single source for commands)
- `vite.config.ts` — per-version root/base/`@shared` alias/`VITE_VERSION`; `tsconfig.json` — strict, `@shared/*` paths (plus `worker/tsconfig.json`, `tests/tsconfig.json`)
- `scripts/build-site.mjs`, `scripts/versions.mjs` — build pipeline and version discovery/validation
- `hub/render.mjs`, `hub/strip.mjs` — hub page and injected strip
- `versions/current/version.json` — version contract (fields: `title`, `summary`, `status` ∈ `draft|in-review|shortlisted|chosen|archived`, `created`, `author`, `changesFacts`, `prerender` (boolean, must match whether `prerender.mjs` exists); unknown keys rejected)
- `versions/current/src/main.ts`, `pages.ts`, `homepage.ts` — version entry, route map, mount/dispose pattern
- `shared/review/` — review mode (activation, store, submission-contract, submission, screenshot, export/issue)
- `worker/index.ts`, `worker/screenshots.ts`, `worker/wrangler.jsonc` — submission Worker
- `playwright.config.ts`, `playwright.quick.config.ts`, `playwright.logic.config.ts` — test configs
- `tests/version-contract.spec.ts`, `tests/versions.spec.ts`, `tests/hub.spec.ts` — executable hub/version/import rules
- `.github/workflows/pages.yml` — CI gates and deploy
- `CONTEXT-MAP.md`, `docs/agents/domain.md` — domain routing before behavior work; each task area has a prerequisite doc (see `docs/guides/testing.md`, `docs/REVIEW-*.md`, `docs/contexts/hub/CONTEXT.md`, ADRs 0013/0014, `docs/agents/issue-tracker.md` + `triage-labels.md`)

## Runtime/Tooling Preferences

- **Node.js 22+** (CI pins Node 22; `CONTRIBUTING.md` documents 22.22+ or 24+), **npm** with `package-lock.json` (lockfile v3) — always `npm ci` in CI. No Bun/pnpm/yarn, no workspaces, no `engines` field.
- Versions: TypeScript 5.9, Vite 7, Playwright **1.63.0 exactly** (CI container `playwright:v1.63.0-noble` hard-asserts the installed version — bumping Playwright means bumping both), ESLint 10 flat config, Prettier 3, stylelint 17, markdownlint-cli2, Husky + lint-staged.
- `npm run build` requires Playwright Chromium installed (`npx playwright install chromium firefox webkit`) because it captures hub previews; under `CI` any preview failure fails the build.
- Pre-commit hook (`.husky/pre-commit`): Prettier on staged files, then `npm run lint` + `npm run typecheck` for non-Markdown changes (`lint:docs` for Markdown-only). Playwright is **not** run at commit time.
- `VITE_REVIEW_SUBMISSION_URL` is a required repository Actions variable, baked into the production bundle; tests inject a fake `https://review-submission.test/submit`.

## Testing & QA

- **Playwright only** (`@playwright/test`), 31 specs under `tests/`. No Jest/Vitest, no coverage tooling, no retries, no screenshot baselines (visual checks are geometry/computed-style based; screenshots only on failure).
- Three configs: `playwright.config.ts` (full: `unit`, `chromium`, `firefox`, `webkit`; spins up Vite dev on 4173 **and** built Pages preview on 4179), `playwright.quick.config.ts` (Chromium + dev server, excludes `[production]`), `playwright.logic.config.ts` (no server/browser; `render|submission-service|versions` specs, Worker tested via Miniflare D1).
- Title tags select scope: `[production]` = built Pages artifact at 4179; `[browser]` = needs a browser. Default **2 workers**; CI runs 4 shards via `scripts/list-project-shard.mjs` inside a Playwright container.
- Accessibility: `@axe-core/playwright` scans tagged `wcag2a, wcag2aa, wcag21aa, wcag22aa` plus custom contrast math. No-script tests use `browser.newContext({ javaScriptEnabled: false })`.
- The **version contract** (`tests/version-contract.spec.ts`, narrowed in CI by `VERSIONS` from `scripts/changed-versions.mjs`) requires every version: `noindex`, readable with JS off, hub strip present, internal links 200, axe-clean home, review mode absent without `?review` and version-scoped with it.
- CI gate (`pages.yml`): `lint` (incl. actionlint and non-empty `VITE_REVIEW_SUBMISSION_URL`) + 4 `browser-tests` shards (typecheck, `worker:check`, Playwright) → `verify` (required branch-protection check) → `deploy` on `main` only, uploading only `dist/`. Quick/logic/jev commands are local-only partial feedback.

## Agent skills

### Issue tracker

Issues and specs live as GitHub issues in `nicolas-found42/website-redesign`, operated with the `gh` CLI (PRs are not a triage surface). See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles map 1:1 to label strings already present in the tracker: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Multi-context layout: root `CONTEXT-MAP.md` routes to per-context glossaries at `docs/contexts/<context>/CONTEXT.md`; system-wide ADRs live in `docs/adr/`. See `docs/agents/domain.md`.
