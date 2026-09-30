# CI Runtime and Test Resource Research

Date: 2026-09-30. Based on repository inspection and Playwright's official documentation. This is research—not a change to test policy or coverage.

## Goal and observed state

Improve both CI elapsed time and local test-suite responsiveness while keeping required browser and assertion coverage. The workflow already has four shards, a Playwright container, npm caching, version checks, JSON timings, and manual benchmark variants; treat these as existing infrastructure rather than new recommendations.

A recent matched hosted run compared file-level sharding at four versus two workers. Four-worker shards took 208s, 177s, 261s, and 270s; the slowest was 270s, with 605 cases passing and one WebKit failure. Two-worker shards took 167s, 192s, 195s, and 182s; the slowest was 195s and all 606 passed. This is one paired run, so repeat before treating 2 workers as stable. The next dispatched run completed both arms successfully, but reported durations are contaminated by running benchmark and normal matrix jobs concurrently; do not compare those elapsed times as isolated arms.

An earlier local trial of 11 Chromium tests found 2 workers with full parallelism at 7.38s wall / 21.80s CPU, versus 4 workers at 7.74s / 31.92s CPU. An earlier full run passed 606 tests in 6m36.8s using two workers. Updated full-run and process-tree measurements are in [the follow-up performance report](local-playwright-performance-experiment-2026-09-30.md).

An earlier PR validation run had a WebKit timeout at `tests/review-mode.spec.ts:628`, waiting for the concurrent-tab receipt dialog. It was a single recorded failure; do not infer that worker count caused it. The later local full-suite runs passed this case.

## Evidence-based candidates

### 1. Disable video recording first; retain useful failure diagnostics

The initial config recorded video and traces with `retain-on-failure`; Playwright documents that these modes record every run and discard successful recordings. Video is now disabled in local and CI runs. Local traces are off by default to reduce overhead, while CI retains failure traces; set `PW_TRACE=on` locally to opt into failure traces. Screenshots remain on failure. The local trace-off full run passed after a timing-sensitive test was stabilized; see the follow-up report. Do not switch to `on-first-retry` blindly: it only records a retry and would lose first-failure trace evidence if retries are not enabled.

Measure complete test wall time, CPU, peak process-tree RSS, artifact sizes, and whether a representative induced failure remains diagnosable. Keep the change only if paired runs show benefit without harming diagnosis.

Source: [Playwright recording options](https://playwright.dev/docs/test-use-options#recording-options).

### 2. Reuse Playwright's browser fixture for screenshot-based service tests

The current `tests/submission-service.spec.ts` contains no direct `chromium.launch()`, `screenshotPng()`, or browser screenshot capture path; search returned no matches. The proposed browser-fixture reuse change does not apply to this checkout, so no code was changed. If screenshot-based service tests are added later, use Playwright's shared browser fixture with fresh, closed contexts and preserve a real image-capture integration check.

Measure browser launches, capture setup time, CPU/RSS, and full-suite behavior. This is a proposed refactor, not yet measured.

Sources: [Playwright built-in fixtures](https://playwright.dev/docs/test-fixtures#built-in-fixtures); [submission service tests](../tests/submission-service.spec.ts); [review capture tests](../tests/review-capture.spec.ts).

### 3. Profile Miniflare fixture startup before changing isolation

The service fixture creates Miniflare, applies migrations and disposes it per service test. The isolated serverless `test:logic` run passed all 32 rendering-logic and submission-service tests in 2.9s, so setup did not emerge as a demonstrated local bottleneck. Do not introduce shared mutable D1 state without profiling and reset/isolation proof; the suite covers quota, receipts, and submissions.

Require shuffled/repeated tests and concurrent-worker validation before adoption. No version-specific Miniflare snapshot/reset API is asserted here.

Sources: [service tests](../tests/submission-service.spec.ts); [Playwright worker fixtures](https://playwright.dev/docs/test-fixtures#worker-scoped-fixtures).

### 4. Replace only fixed waits with observable readiness conditions

Playwright recommends web-first assertions and discourages fixed sleeps. The accessibility viewport/font checks now reuse one page across all width/scale combinations and wait for two animation frames instead of navigating repeatedly and sleeping 300–400ms. Deliberate animation-observation windows elsewhere remain; do not globally disable motion or remove waits that are part of motion coverage.

Source: [Playwright `waitForTimeout`](https://playwright.dev/docs/api/class-page#page-wait-for-timeout).

### 5. Rebalance slow test cases using actual timings

With file-level sharding, one long spec can dominate a shard; `fullyParallel` permits individual tests to distribute, but does not guarantee improvement and may interact with fixture setup. Use existing successful JSON timing artifacts to identify critical cases. Parameterize long route/viewport loops only when measurements justify it, preserve each combination, and reconcile coverage—not just case counts—before accepting a change.

Sources: [Playwright sharding and balancing](https://playwright.dev/docs/test-sharding#balancing-shards); [repository timing summarizer](../scripts/summarize-playwright-timings.mjs).

## Safe local and CI workflow

- Use the narrower relevant project/spec during iteration; finish with all required projects before claiming cross-browser validation. The `unit` project includes a browser-backed render case; the service tests use Miniflare but do not launch Chromium directly.
- Preserve all browser engines, accessibility and production-route tests, and the required deploy verification gate.
- Keep the Playwright container/version check. npm cache does not cache `node_modules` or skip `npm ci`.
- Existing benchmark results are mixed; repeat worker-count and parallelism trials on the same SHA, alternating arms, and avoid running both arms concurrently if wall time is the metric.
- Do not use changed-test selection as a replacement for required validation: Playwright documents it as heuristic.

Sources: [Playwright CI guidance](https://playwright.dev/docs/ci); [setup-node v4 README](https://github.com/actions/setup-node/blob/v4/README.md); [Playwright changed-test guidance](https://playwright.dev/docs/ci#fail-fast).

## Measurement plan

Freeze commit, lockfile, Node version, container image, endpoint configuration, and test coverage. Compare one factor at a time with at least five paired baseline/candidate runs, alternating order; extend if variability is high. Report individual outcomes and median/range, not only a selected best run.

Track gate creation-to-verification time, critical-shard time, server/build/setup time, added job time; local CPU time, peak process-tree RSS (not only Node parent), temporary disk/artifact bytes, browser launches, fixture setup/teardown; exact test/project IDs, assertion-combination coverage, failures/flakes, and diagnostic adequacy.

The timing summarizer reports attempt/test durations; sum of test durations is not wall-clock time because workers overlap and server startup is separate.

## TypeSafe / Jev use

`npm run test:jev` uses Jev only to rank an explicitly partial Chromium smoke set: directly changed eligible specs plus at most three relevant candidates. It sends changed paths and candidate test titles, never source contents. One paired set of smoke executions considered 17 files and passed 139 selected tests in about 51–72s; request latency was 0.4–1.4s and one request reported $0.000198. The command flags changed test specs excluded from its quick scope. Jev never selects or waives required checks; `npm run test:full` remains deterministic and runs every project.

Source: [TypeSafe System One building guide](https://docs.typesafe.ai/concepts/how-to-build-with-system-one.md).

## Recommendation

Keep the two-worker local default: a four-worker full run had no observed wall-time improvement and higher sampled resource peaks. Local video and traces are off by default, with `PW_TRACE=on` available when diagnostics need a trace; CI still retains traces. The complete local suite now passes in 5.3m with the same 606 cases, while `test:logic`, focused `test:quick`, and advisory `test:jev` offer shorter edit loops. Do not change browser, accessibility, production-route, or concurrency coverage to chase a smaller full-suite count.
