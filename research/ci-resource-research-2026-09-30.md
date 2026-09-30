# CI Runtime and Test Resource Research

Date: 2026-09-30. Based on repository inspection and Playwright's official documentation. This is research—not a change to test policy or coverage.

## Goal and observed state

Improve both CI elapsed time and local test-suite responsiveness while keeping required browser and assertion coverage. The workflow already has four shards, a Playwright container, npm caching, version checks, JSON timings, and manual benchmark variants; treat these as existing infrastructure rather than new recommendations.

A recent matched hosted run compared file-level sharding at four versus two workers. Four-worker shards took 208s, 177s, 261s, and 270s; the slowest was 270s, with 605 cases passing and one WebKit failure. Two-worker shards took 167s, 192s, 195s, and 182s; the slowest was 195s and all 606 passed. This is one paired run, so repeat before treating 2 workers as stable. The next dispatched run completed both arms successfully, but reported durations are contaminated by running benchmark and normal matrix jobs concurrently; do not compare those elapsed times as isolated arms.

A local trial of 11 Chromium tests found 2 workers with full parallelism at 7.38s wall / 21.80s CPU, versus 4 workers at 7.74s / 31.92s CPU. A full run passed 606 tests in 6m36.8s using two workers. These are initial measurements; peak process-tree memory has not yet been quantified.

There is a separate flake in current PR validation: WebKit `tests/review-mode.spec.ts:628` timed out waiting for a dialog in the concurrent-tab receipt test. The test launches the add-feedback dialog and clicks a target immediately; investigate/repair this test race separately from worker tuning. Do not treat one worker configuration's failure or pass as causal evidence by itself.

## Evidence-based candidates

### 1. Disable video recording first; retain useful failure diagnostics

The current Playwright config records `video: "retain-on-failure"` and `trace: "retain-on-failure"`. Playwright's recording documentation says those modes record on every run and discard successful recordings; this may consume CPU, disk, and I/O even if successful videos are not uploaded. Compare a candidate with video off while leaving failure traces, screenshots, timing output, and existing failure artifacts intact. Then decide separately whether trace mode is worth a second experiment. Do not switch to `on-first-retry` blindly: it only records a retry and would lose first-failure trace evidence if retries are not enabled.

Measure complete test wall time, CPU, peak process-tree RSS, artifact sizes, and whether a representative induced failure remains diagnosable. Keep the change only if paired runs show benefit without harming diagnosis.

Source: [Playwright recording options](https://playwright.dev/docs/test-use-options#recording-options).

### 2. Reuse Playwright's browser fixture for screenshot-based service tests

`tests/submission-service.spec.ts` starts Chromium directly in `screenshotPng()` and for a separate quota-image case. Playwright's built-in browser fixture is worker-scoped and designed to optimize resources; use a fresh context per capture and close contexts reliably. Preserve a genuine image capture integration test, real image transport/corruption checks, and quota behavior—do not substitute fabricated bytes for the actual capture path.

Measure browser launches, capture setup time, CPU/RSS, and full-suite behavior. This is a proposed refactor, not yet measured.

Sources: [Playwright built-in fixtures](https://playwright.dev/docs/test-fixtures#built-in-fixtures); [submission service tests](../tests/submission-service.spec.ts); [review capture tests](../tests/review-capture.spec.ts).

### 3. Profile Miniflare fixture startup before changing isolation

The service fixture creates Miniflare, runs migrations, and disposes per service test. Profile setup/teardown before attempting to share runtime state. If setup is material, test sharing only immutable runtime startup per worker while maintaining a fresh database or verified reset per test. These tests cover quota, receipt, and submission state; sharing a mutable database without proven reset is unsafe.

Require shuffled/repeated tests and concurrent-worker validation before adoption. No version-specific Miniflare snapshot/reset API is asserted here.

Sources: [service tests](../tests/submission-service.spec.ts); [Playwright worker fixtures](https://playwright.dev/docs/test-fixtures#worker-scoped-fixtures).

### 4. Replace only fixed waits with observable readiness conditions

There are `waitForTimeout` calls across accessibility, diagrams, and homepage tests. Playwright recommends web-first assertions and discourages fixed sleeps. Replace a wait only when its intended condition is clear—for example, a visible reveal, completed font load, or stable geometry. Preserve intentional animation observation windows and reduced-motion/animation coverage; do not globally disable motion to make tests faster.

Source: [Playwright `waitForTimeout`](https://playwright.dev/docs/api/class-page#page-wait-for-timeout).

### 5. Rebalance slow test cases using actual timings

With file-level sharding, one long spec can dominate a shard; `fullyParallel` permits individual tests to distribute, but does not guarantee improvement and may interact with fixture setup. Use existing successful JSON timing artifacts to identify critical cases. Parameterize long route/viewport loops only when measurements justify it, preserve each combination, and reconcile coverage—not just case counts—before accepting a change.

Sources: [Playwright sharding and balancing](https://playwright.dev/docs/test-sharding#balancing-shards); [repository timing summarizer](../scripts/summarize-playwright-timings.mjs).

## Safe local and CI workflow

- Use the narrower relevant project/spec during iteration; finish with all required projects before claiming cross-browser validation. The `unit` project is not browser-free: rendering tests use `page`, while service tests launch Chromium.
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

Jev can prioritize offline experiments or advisory test ordering, but should never decide which mandatory checks to skip. Any changed-test heuristic must be evaluated against deterministic dependency mapping, historical-duration ranking, and a no-model baseline; measure missed relevant tests, ranking quality, latency, and cost. Confidence is not proof of test correctness. Keep coverage policy and execution deterministic in code.

Source: [TypeSafe System One building guide](https://docs.typesafe.ai/concepts/how-to-build-with-system-one.md).

## Recommendation

First repeat a non-concurrent paired CI worker-count benchmark on the current suite and investigate the concurrent-tab WebKit flake. In parallel, benchmark video-off locally and on CI while preserving traces. Then profile browser launches and Miniflare setup. Adopt only measured improvements that preserve full coverage and failure diagnosis.
