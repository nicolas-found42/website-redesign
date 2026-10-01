# Running tests locally

This repository has three kinds of local test run. The fast commands are deliberately scoped subsets; **they are not substitutes for full verification**.

## Short edit-feedback loops (partial)

```sh
# Run a focused Chromium spec against Vite's dev server. Production-artifact cases
# tagged [production] are excluded; pass a file, line, or --grep filter.
npm run test:quick -- tests/homepage.spec.ts
npm run test:quick -- tests/homepage.spec.ts:54
npm run test:quick -- --grep 'audiences link'

# Let Jev rank relevant Chromium spec files for the current working-tree changes.
# This is an advisory, partial smoke pass; it needs OPENROUTER_API_KEY exported in the calling environment.
npm run test:jev

# Run pure rendering/scorecard logic and the Worker submission-service suite.
# Starts no site server or browser; the one browser-backed render case is omitted.
npm run test:logic
```

`test:quick` uses Chromium only and excludes tests explicitly tagged `[production]` because they need the built Pages preview. `test:logic` runs only `render.spec.ts` and `submission-service.spec.ts` and excludes the browser-backed resource-page test. Both use two workers, skip video, and omit traces; they intentionally provide partial, faster feedback. Use `test:quick` with a focused file/line/filter rather than running every Chromium test.

Export `OPENROUTER_API_KEY` in your calling environment before running `test:jev`. The command invokes Node directly and does not load shell startup files.

`test:jev` lists the eligible Chromium quick-test candidates, sends only changed file paths and test filenames/titles (never source contents) to Jev through the [OpenRouter TypeSafe System One endpoint](https://openrouter.ai/docs/guides/community/typesafe-sdk), and runs directly changed eligible specs plus up to three Jev-ranked relevant specs. It reports changed specs outside its quick scope (for example, built-production or logic-project tests); run those through the appropriate full or logic command. It uses `typesafe/jev-1.13`; a request failure stops before tests start, and reported latency/cost are visible when available. The scores are relevance judgments, not correctness guarantees. This command is intentionally a small **partial** feedback loop; it cannot waive full verification.

## Full local verification

```sh
npm run test:full
```

This runs the complete configured suite with the unit, Chromium, Firefox, and WebKit projects and two workers. It keeps failure screenshots and disables local video and trace recording to reduce overhead. CI retains failure traces; set `PW_TRACE=on` locally when a trace is needed. For release/PR validation, run the other repository gates as appropriate:

```sh
npm run lint
npm run typecheck
npm run worker:check
npm run build
```

Do not use a green `test:quick` or `test:logic` result as evidence that unrun projects, production-page behavior, accessibility, or browser-engine-specific behavior passed.

## Performance experiments

For worker-count or recording experiments, freeze the commit and test selection; compare the same tests with one setting changed at a time. Report wall time and failures, and measure the test process tree—not only the parent process—when comparing CPU or memory. Keep all browser engines and assertions in the full gate.
