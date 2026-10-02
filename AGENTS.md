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

## Diagnostic references

For HTTP, port ownership, JSON comparison, shell, or browser compatibility questions, use the symptom routes below. They adapt entries from [The Book of Secret Knowledge](https://github.com/trimstray/the-book-of-secret-knowledge/blob/7d37069a361d3fd9f214480755f7969744e866fa/README.md), a reference catalogue rather than a repository workflow.

| Symptom or question                          | Reference to consult                                                                                          |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| HTTP status, headers, or redirects           | curl — CLI Tools / Network (HTTP).                                                                            |
| Local dev server cannot bind its port        | lsof — Shell One-liners / Tool: lsof, for the process using that port.                                        |
| JSON fixtures differ only in key order       | jq `-S` — Shell One-liners / Tool: vimdiff / Compare two JSON files. Preserve array order.                    |
| Shell script has quoting or expansion bugs   | ShellCheck — Web Tools / Code parsers/playgrounds; check the script's declared shell is supported.            |
| Unfamiliar shell flags or pipelines          | tldr — CLI Tools / Other, for command examples. Use `man <command>` to confirm flags for each pipeline stage. |
| Browser support for a web feature is unclear | Can I use — Web Tools / Browsers. Confirm site behavior with the repository's browser tests.                  |

Use `curl`, `lsof`, `jq`, `shellcheck`, `tldr`, and `man` for these routes. Check `command -v <tool>` before use; install a missing command through the host's package manager and verify it runs. Confirm flags in local help/manuals. Treat upstream examples as references: adapt them to the current OS and shell, retain TLS verification, and use public or sanitized examples in online tools. These references supplement the development and testing requirements above.
