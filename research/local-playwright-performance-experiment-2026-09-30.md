# Playwright local resource and parallelism trial

Date: 2026-09-30. Scope: local Playwright test worker count and scheduling. No assertions or browser projects were removed.

## Result

`playwright.config.ts` now enables `fullyParallel` and caps local execution at two workers. This gives Playwright finer-grained work distribution while preventing its default worker count from scaling up with the host's CPU count. GitHub's existing workflow explicitly passes `--workers=4`; this trial does not change the CI worker count or claim a CI speedup.

Playwright's documentation says workers are separate processes and explains that `fullyParallel` allows tests within files to run concurrently; without it, tests in a file are scheduled together. This matches the local result: the homepage spec by itself reported one worker despite a `--workers=2` setting until `--fully-parallel` was enabled. Sources: [Playwright parallelism](https://playwright.dev/docs/test-parallel), [Playwright sharding](https://playwright.dev/docs/test-sharding).

## Experiments

All commands ran sequentially in a worktree on the same checkout, with the same 11 Chromium homepage tests:

| Scheduling | Playwright result | Wall time | CPU time (user + system) | `/usr/bin/time -l` max RSS |
| --- | ---: | ---: | ---: | ---: |
| 1 worker, file-level (before config change) | 11 passed | 13.2s reported by Playwright | not captured | not captured |
| 2 workers, file-level | 11 passed; Playwright still used 1 worker | 10.3s reported by Playwright | not captured | not captured |
| 2 workers, `fullyParallel` | 11 passed | 7.38s | 21.80s | 541,933,568 bytes |
| 4 workers, `fullyParallel` | 11 passed | 7.74s | 31.92s | 529,842,176 bytes |

The comparable 2-versus-4-worker pair used **31.7% less CPU time** and was **4.7% faster** at two workers. The single-run maximum-RSS figures moved in the opposite direction and are too noisy to establish a memory reduction. The result supports a conservative local worker cap for CPU load and faster feedback, but not a claim that peak memory is lower or that four workers are always slower.

Then the full suite ran with `--workers=2 --fully-parallel`: **606/606 tests passed across unit, Chromium, Firefox, and WebKit in 6m36.8s**. A CI-like artifact-mode run (`PW_PREBUILT_DIST=1`, `--shard=1/4`) passed **152/152 tests in 1m18s**. The other three CI shards were not run locally, and no matched full-suite old-configuration run was done because that would duplicate a long, high-load suite run.

## Jev input

Two OpenRouter System One calls used the account key already available through the user's interactive shell; no key was printed or saved. The first ranked preserving all engines while capping workers and avoiding repeated build work highest (A, probability 0.95), and flagged shard balance as a risk. The second saw the 11-test microbenchmark and 606-test pass, but recommended more data (probability 0.62) and specifically identified peak CPU/RSS comparison as the next validation. This aligns with the evidence limits above: the local cap is exercised and validated, but any CI worker-count change needs controlled full-workflow runs.

The decisions endpoint and TypeSafe/OpenRouter integration are documented at [OpenRouter's TypeSafe SDK guide](https://openrouter.ai/docs/guides/community/typesafe-sdk); Jev returns typed judgments, not performance measurements. Performance claims in this report come only from command output.

## CI constraint and next validation

The repository's [`ci-runtime-implementation-2026-09-29.md`](ci-runtime-implementation-2026-09-29.md) records that prior two-worker CI trials had inconsistent wall-time results and failures in paired runs; a shared-build trial did not improve the critical path, and a four-worker fully-parallel trial differed by only three seconds. Those historical results are why this change leaves CI at four workers and does not add a build-artifact dependency. For an actual CI runtime claim, compare repeated same-SHA runs using the workflow's existing `two-workers` and normal gate, then compare slowest-shard duration, aggregate runner time, retries, and failures. Keep three-browser coverage and the `verify`/Pages gates intact.
