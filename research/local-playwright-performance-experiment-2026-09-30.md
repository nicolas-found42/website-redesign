# Playwright local resource and parallelism trial

Date: 2026-09-30. Scope: local Playwright test worker count and scheduling. No assertions or browser projects were removed.

## Result

`playwright.config.ts` enables `fullyParallel` only outside CI and caps the default worker count at two. This gives finer-grained local scheduling and limits local CPU concurrency. GitHub Actions keeps file-level scheduling at two workers per shard, based on same-SHA critical-path results. The workflow has `four-workers` and `fully-parallel` benchmark modes. The four-worker arm uses file-level scheduling, compared with the normal two-worker gate.

Playwright's documentation says workers are separate processes and explains that `fullyParallel` allows tests within files to run concurrently; without it, tests in a file are scheduled together. This matches the local result: the homepage spec by itself reported one worker despite a `--workers=2` setting until `--fully-parallel` was enabled. Sources: [Playwright parallelism](https://playwright.dev/docs/test-parallel), [Playwright sharding](https://playwright.dev/docs/test-sharding).

## Experiments

All commands ran sequentially in a worktree on the same checkout, with the same 11 Chromium homepage tests:

| Scheduling                                  |                         Playwright result |                    Wall time | CPU time (user + system) | `/usr/bin/time -l` max RSS |
| ------------------------------------------- | ----------------------------------------: | ---------------------------: | -----------------------: | -------------------------: |
| 1 worker, file-level (before config change) |                                 11 passed | 13.2s reported by Playwright |             not captured |               not captured |
| 2 workers, file-level                       | 11 passed; Playwright still used 1 worker | 10.3s reported by Playwright |             not captured |               not captured |
| 2 workers, `fullyParallel`                  |                                 11 passed |                        7.38s |                   21.80s |          541,933,568 bytes |
| 4 workers, `fullyParallel`                  |                                 11 passed |                        7.74s |                   31.92s |          529,842,176 bytes |

The comparable 2-versus-4-worker pair used **31.7% less CPU time** and was **4.7% faster** at two workers. The single-run maximum-RSS figures moved in the opposite direction and are too noisy to establish a memory reduction. The result supports a conservative local worker cap for CPU load and faster feedback, but not a claim that peak memory is lower or that four workers are always slower.

Then the full suite ran with `--workers=2 --fully-parallel`: **606/606 tests passed across unit, Chromium, Firefox, and WebKit in 6m36.8s**. A CI-like artifact-mode run (`PW_PREBUILT_DIST=1`, `--shard=1/4`) passed **152/152 tests in 1m18s**. The other three CI shards were not run locally, and no matched full-suite old-configuration run was done because that would duplicate a long, high-load suite run.

## Follow-up local run and Jev selection

With the homepage/accessibility loop refactors and video disabled, the complete two-worker suite with failure traces retained passed **606/606 in 403.67s**. A four-worker complete run also passed **606/606 in 6.7m**, with no observed wall-time improvement. A process-tree sampler recorded peak summed RSS of **3,664 MiB** and peak summed CPU of **517%** for the two-worker run, versus **5,747 MiB** and **790%** for four workers. Summed RSS may double-count shared pages; these are comparative process-tree samples, not physical-memory accounting.

Disabling local traces while preserving failure screenshots, and keeping traces enabled in CI, produced a trace-off complete run of **606/606 in 318.88s** after stabilizing a timing-dependent reduced-motion test. This is **84.79s / 21.0% faster** than the trace-on run in this local comparison. Its sampled peak process-tree RSS was **3,385 MiB** and summed CPU peak **499%**. These are single local runs, not a controlled distribution; trace-off requires opting in with `PW_TRACE=on` to retain local failure traces.

The isolated Chromium quick command passed 10 homepage tests in 3.3s; the no-server logic command passed 32 tests in 2.9s. Two Jev-ranked local smoke runs considered 17 eligible spec files, selected nine, and passed all 139 selected Chromium tests (50.9s and a reported 1.2m). System One request latency was 422ms and 1,409ms; one response reported a charge of **$0.000198**. The requests contained changed paths and test names only, not source contents. This is an advisory partial run, not full verification.

A matched same-SHA GitHub Actions comparison then ran both the normal four-worker fully-parallel gate and the four-worker file-level benchmark at `151e293`. Each variant ran all **606 unique project/test cases**, with **zero failures and zero retries**. Playwright command-step durations by shard were:

| Scheduling      | Shard 1 | Shard 2 | Shard 3 | Shard 4 | Slowest shard |
| --------------- | ------: | ------: | ------: | ------: | ------------: |
| `fullyParallel` |    157s |    167s |    277s |    276s |      **277s** |
| file-level      |    221s |    204s |    184s |    209s |      **221s** |

In this run, full parallelism increased the critical test step by **56s (25.3%)** and summed test-step time by 59s. As a single comparison, this is evidence for keeping CI file-level, not a universal estimate. The configuration now uses `fullyParallel` locally but disables it when `CI` is set.

A second same-SHA experiment at `206eb35` compared four and two workers with file-level scheduling and all three browsers:

| Workers | Shard 1 | Shard 2 | Shard 3 | Shard 4 | Slowest shard | Test outcomes                    |
| ------: | ------: | ------: | ------: | ------: | ------------: | -------------------------------- |
|       4 |    208s |    177s |    261s |    270s |      **270s** | 605 passed, 1 failed; no retries |
|       2 |    167s |    192s |    195s |    182s |      **195s** | 606 passed; no retries           |

Two workers finished the slowest test shard **75s (27.8%) faster** in this paired run and avoided a WebKit transition-state failure seen in the four-worker run. This is still one comparison, but it justifies setting normal CI shards to two workers and retaining the manual four-worker/file-level benchmark for repeat measurement. The PR gate should confirm the change before treating this as stable.

## Jev input

Four successful OpenRouter System One calls used the account key already available through the user's interactive shell; no key was printed or saved. The first ranked preserving all engines while capping workers and avoiding repeated build work highest (A, probability 0.95), and flagged shard balance as a risk. The second recommended more local data (probability 0.62), specifically peak CPU/RSS comparison. After the user clarified that CI speed matters more than GitHub runner cost, the third selected a matched same-SHA CI scheduling comparison (probability 0.98) and retained two workers locally (probability 0.99). With the matched CI measurements, the fourth favored two workers for normal CI (probability 0.82) and recommended repeating the comparison before treating the result as stable (probability 0.99).

The decisions endpoint and TypeSafe/OpenRouter integration are documented at [OpenRouter's TypeSafe SDK guide](https://openrouter.ai/docs/guides/community/typesafe-sdk); Jev returns typed judgments, not performance measurements. Performance claims in this report come only from command output.

## CI constraint and next validation

The repository's [`ci-runtime-implementation-2026-09-29.md`](ci-runtime-implementation-2026-09-29.md) records earlier mixed results, including a shared-build trial that did not improve the critical path. The current workflow uses file-level scheduling at two workers per shard. Retain three-browser coverage and the `verify`/Pages gates; compare slowest-shard duration, total workflow time, test counts, retries, and failures before claiming any further CI speedup.

## October 1 review correction

The earlier one-frame wait hid a reduced-motion landing race. A live `MediaQueryList.matches` read in the click frame could observe the new setting before its change event reached layout subscribers. The shared page-motion state now changes at that event boundary. The landing regression runs with the click frame held until the preference event, without a frame wait, and after the click frame. The measurements above describe the September 30 version, rather than timings for this correction.

The redundant `file-level` benchmark and `PW_FILE_LEVEL` flag were removed. The old `two-workers` manual arm is now `four-workers`, giving a distinct comparison against the two-worker CI gate.
