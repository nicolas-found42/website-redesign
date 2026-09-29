# CI runtime implementation and trials

Date: 2026-09-29. The application and 422-case Playwright suite were unchanged
through these paired trials. The direct-install trial ran at `ace76ba`; the
others ran at `4bb32bc`, which changed only the benchmark workflow. Every trial
produced 422 distinct `(spec ID, project)` pairs, exactly matching its paired
four-shard gate. A failed test still counts as an executed case.

The existing fast pre-commit gate and pinned Playwright image had already
shipped. This PR retains per-test JSON and human-readable timing reports from
successful browser shards and exposes manual benchmark modes through the
existing workflow. The reports include test, project, file, duration, retry,
and outcome data. Normal PR and `main` runs keep the same four-shard gate,
`verify` status, three browsers, production Pages tests, and deployment order.

## Paired benchmark results

The times below are GitHub job timestamps rounded to seconds. "Slowest" is the
longest browser job, except the shared-build trial, which includes its build
job dependency. "Runner" sums the listed jobs and is not elapsed time. Each
manual run also ran the normal gate on the same commit, so the two columns in
one row are comparable but still subject to runner and network variation.

| Trial                                                                                                  | Paired normal gate: slowest / runner | Trial: slowest / runner | Result                                                                                                                      |
| ------------------------------------------------------------------------------------------------------ | -----------------------------------: | ----------------------: | --------------------------------------------------------------------------------------------------------------------------- |
| [Direct install](https://github.com/nicolas-found42/website-redesign/actions/runs/36529470355)         |                          234 / 833 s |             252 / 882 s | Both passed. Keep the image. The trial omitted the normal explicit typecheck, so the install result is slightly optimistic. |
| [One browser per job](https://github.com/nicolas-found42/website-redesign/actions/runs/36530398831)    |                          206 / 757 s |             268 / 755 s | Trial passed; gate failed a WebKit review-mode test. Keep four shards. The unit job needs Chromium for its page test.       |
| [Two workers, first run](https://github.com/nicolas-found42/website-redesign/actions/runs/36530856571) |                          215 / 788 s |             202 / 739 s | Trial passed; gate failed a Firefox review-mode wait.                                                                       |
| [Two shards](https://github.com/nicolas-found42/website-redesign/actions/runs/36531304655)             |                          231 / 773 s |             324 / 615 s | Both passed. Two shards use fewer runner seconds but delay verification.                                                    |
| [Shared build](https://github.com/nicolas-found42/website-redesign/actions/runs/36531885663)           |                          241 / 777 s |             248 / 785 s | Gate passed; trial failed a WebKit drawing-state test. Artifact handoff erased the build saving.                            |
| [Fully parallel tests](https://github.com/nicolas-found42/website-redesign/actions/runs/36532348074)   |                          231 / 812 s |             228 / 751 s | Both passed. A 3-second critical-job difference in one run is inconclusive.                                                 |
| [Two workers, repeat](https://github.com/nicolas-found42/website-redesign/actions/runs/36532788930)    |                          211 / 811 s |             231 / 848 s | Gate passed; trial failed the same WebKit drawing-state test seen in the shared-build trial. Keep four workers.             |

The one-browser trial initially omitted Chromium from the once-only `unit`
project and failed its first page test. The [failed setup run](https://github.com/nicolas-found42/website-redesign/actions/runs/36529885014)
is excluded from the comparison above; the corrected trial installed Chromium
and passed all 422 cases. This corrects the earlier report's description of
all eight `unit` cases as browser-free.

## What to keep

- Keep the Playwright image pinned to the package version. In the paired trial,
  direct installation used 45–69 seconds per shard, while container startup
  used 26–27 seconds. The complete job is the deciding measure.
- Keep successful-run timing artifacts and file-level summaries. The first
  reports found an exhaustive scorecard test taking 80–133 seconds across
  observed CI runs. Its 4,096 combinations and all checks remain in place;
  collecting mismatches before one final assertion reduced the local eight-test
  run from 15.1 to 1.1 seconds. The final CI result will validate this change.
- Keep four shards and four workers for now. Two-worker results reversed on
  repeat and did not eliminate the existing WebKit drawing-state flake.
- Keep the current build and typecheck path. The shared artifact path was
  slower on the critical path and introduced another job dependency.
- Keep the current linters. Lint finished in roughly 30 seconds and was not on
  the critical browser path in these runs; no rule-equivalent replacement has
  been demonstrated.

A manual comparison can be repeated with
`gh workflow run pages.yml --ref <branch> -f benchmark=<mode>`, using one of
`direct-install`, `single-browser`, `two-workers`, `two-shards`, `shared-build`,
or `fully-parallel`. Run one mode at a time: the workflow cancels older runs on
the same branch ref. Inspect both the normal and trial jobs and their timing
artifacts. Do not infer a stable speedup from one run. These trials do not
establish whether a different shard or worker layout would win after the suite
changes again.
