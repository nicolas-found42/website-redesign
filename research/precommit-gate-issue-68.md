# Issue 68 pre-commit gate validation

Measured on 2026-09-28 in the same isolated checkout on an Apple Silicon Mac,
at commit `3c72a1e` plus the hook change. Node was `v26.9.0`, npm was
`11.19.1`, and Playwright was `1.63.0`. Dependencies came from `npm ci`.
The benchmark invoked the real `.husky/pre-commit` script with a staged file;
it did not create benchmark commits. Its output was timestamped as it ran.

The docs case staged only `research/precommit-benchmark-68.md`. The source
case staged only `src/precommit-benchmark-68.ts`, containing a valid exported
number. These temporary files were removed after the measurements. Before each
baseline run, `lsof` found no listeners on ports 4173 or 4179. Playwright
started both servers in the baseline runs and stopped them afterward; the
second run was also a cold server start. The new hook does not start either
server. No port listener was present for its measurements.

## Before: original hook

| Staged set  | Formatting | Full lint | Typecheck | Browser suite |     Total | Result                                                |
| ----------- | ---------: | --------: | --------: | ------------: | --------: | ----------------------------------------------------- |
| Docs only   |    ~0.94 s |   ~3.06 s |   ~0.68 s |     ~213.45 s | 218.117 s | Failed: 315 passed, two WebKit drawing-state failures |
| Source only |    ~0.59 s |   ~3.01 s |   ~0.68 s |     ~231.83 s | 236.108 s | Failed: same two WebKit failures, 315 passed          |

The command times are approximate boundaries from the first npm command banner
in the timestamped hook output. The totals are wall-clock measurements. These
failed runs are not passing-suite baselines and do not establish a measured
speedup. There was one baseline run per staged set, so no within-set baseline
variation is available. Both runs launched all 317 tests.

## After: staged-file gate

The hook always runs staged Prettier formatting. A Markdown-only commit then
runs `lint:docs`. Any staged non-Markdown path runs the repository's full lint
and TypeScript typecheck. All local checks stop a commit on failure. The
required CI `verify` workflow remains the full lint, typecheck, and four-shard
Playwright gate.

| Staged set  | Run | Formatting |              Lint | Typecheck |   Total | Result |
| ----------- | --: | ---------: | ----------------: | --------: | ------: | ------ |
| Docs only   |   1 |    ~0.45 s | ~0.22 s docs lint |         — | 0.671 s | Passed |
| Docs only   |   2 |    ~0.45 s | ~0.22 s docs lint |         — | 0.664 s | Passed |
| Docs only   |   3 |    ~0.45 s | ~0.21 s docs lint |         — | 0.655 s | Passed |
| Source only |   1 |    ~0.98 s | ~4.32 s full lint |   ~0.51 s | 5.818 s | Passed |
| Source only |   2 |    ~0.53 s | ~2.71 s full lint |   ~0.52 s | 3.768 s | Passed |
| Source only |   3 |    ~0.53 s | ~2.66 s full lint |   ~0.50 s | 3.687 s | Passed |

The docs median was **0.664 s**, within the approved 10-second target; the
range was 0.655–0.671 s. The source median was **3.768 s**, within the
approved 30-second target; the range was 3.687–5.818 s. These are warm npm and
dependency-cache runs without browser servers. Run 1 of the source set was
slower than its repeats by about two seconds, mainly in lint. The command
boundaries are approximate; the totals are measured wall time.

With an invalid staged TypeScript assignment (`number = "invalid"`), the real
hook reached `tsc --noEmit`, reported `TS2322`, and exited 2 in 3.204 s. The
invalid file was removed afterward.

## Repository checks

`npm run lint` and `npm run typecheck` passed with the final hook and this
report. A final local `npm test -- --workers=2` run exercised all 317 tests:
315 passed and the same two WebKit drawing-state tests failed as in both
before-change baselines (`tests/system.spec.ts:78` and `:103`). The hook change
does not affect Playwright configuration, site code, or those tests. A passing
local full-suite result remains unverified.
