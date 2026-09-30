# Repository instructions

## Development workflow

Before making changes, create a feature branch from the latest `main`. Use `feat/<description>`, `fix/<description>`, or `chore/<description>` as appropriate. Commit and push changes on that branch, then open a pull request targeting `main`. All changes to `main` must go through a pull request; direct commits and pushes to `main` are prohibited. Complete the relevant checks and report validation in the PR before merging.

Use two Playwright workers by default for local checks to limit resource contention. `npm run test:quick`, `npm run test:logic`, and `npm run test:jev` are intentionally partial feedback loops; they are not full verification. Use `npm run test:full` for all projects and browser engines. See `docs/guides/testing.md` for scope and commands. Change the worker count only for an explicit performance comparison or to isolate a concurrency-sensitive failure, and report why.

## Agent skills

### Issue tracker

Track issues and specs in GitHub Issues. Before reading or publishing tickets, read `docs/agents/issue-tracker.md`.

### Triage labels

Use the five default triage labels. Before triaging or changing issue labels, read `docs/agents/triage-labels.md`.

### Review feedback

Team feedback arrives as review-mode files (`found42-feedback-*.md`). Before acting on one, read `docs/REVIEW-MODE.md`.

### Domain docs

Use a multi-context layout: root `CONTEXT-MAP.md` points to domain glossaries under `docs/contexts/`. Before exploring the codebase, read `docs/agents/domain.md`.
