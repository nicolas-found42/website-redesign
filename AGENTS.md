# Repository instructions

## Development workflow

For new implementation work, fetch `origin/main` and create a branch from that commit using `feat/<description>`, `fix/<description>`, or `chore/<description>`. Continue existing work on its implementation branch and preserve local changes when selecting a checkout. Commit and push changes, then open a pull request targeting `main`. All changes to `main` must go through a pull request; direct commits and pushes to `main` are prohibited.

Before selecting validation or reporting readiness, read `docs/guides/testing.md` and the applicable gates in `.github/workflows/pages.yml`. Package scripts and CI configuration are the executable sources of truth. Use two Playwright workers by default to limit resource contention. The quick, logic, and Jev test commands provide partial feedback; `npm run test:full` covers every configured project and browser engine. Change the worker count only for an explicit performance comparison or to isolate a concurrency-sensitive failure, and report why.

Report validation against the tested commit, including commands, outcomes, and any unrun checks. Before an authorized merge, confirm successful CI for the current PR head. After merging, verify the merged commit's CI and Pages deployment; verify closure of any issues the PR claims to resolve.

## Task routes

### Issue tracker

Track issues and specs in GitHub Issues. Before reading or publishing tickets, read `docs/agents/issue-tracker.md`.

### Triage labels

Use the five default triage labels. Before triaging or changing issue labels, read `docs/agents/triage-labels.md`.

### Review feedback

Review feedback always arrives through GitHub Issues. Before triaging or implementing review feedback, read `docs/REVIEW-MODE.md` and `docs/agents/issue-tracker.md`.

### Review service

Before changing browser submission, Worker behavior, screenshots, deployment, or receipt recovery, read `docs/REVIEW-SUBMISSION.md` and `docs/REVIEW-SCREENSHOTS.md`.

### Domain docs

Before exploring application behavior, read `docs/agents/domain.md`. It routes to the existing multi-context layout through `CONTEXT-MAP.md`, relevant glossaries, and ADRs.

### Presentation and content

Before changing layout, drawings, motion, or visual behavior, read `docs/DESIGN.md` and its applicable ADRs. Before changing copy, offers, or visitor journeys, read the relevant domain contexts and `docs/CONTENT-SOURCES.md`; distinguish current decisions from dated migration evidence.

### Static hosting

Before changing routes, asset paths, prerendering, or hosting, read the production-preview rules in `README.md`, `docs/SITE-MAP.md`, and `docs/guides/testing.md`. Validate the built Pages output, including direct entry, redirects, missing paths, and content when scripts fail.

## Diagnostic references

For HTTP failures, port conflicts, JSON comparison, shell or workflow errors, browser compatibility, or page-performance regressions, read `docs/agents/diagnostics.md` for symptom-specific references and repository constraints.
