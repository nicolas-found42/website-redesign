# CI runtime investigation

Date: 2026-09-28. Baseline: `main` at `3c72a1e` (the latest fetched commit when
this research branch was created). This report investigates runtime; it does not
change CI or application behavior. No target runtime was supplied.

## Findings at a glance

- The two completed, successful runs with the current workflow took **4m07s**
  for a PR and **4m12s** for `main`. The slowest browser shard determined when
  verification could finish. Its Playwright step took **142–148 seconds**, and
  its browser installation took **58–62 seconds**. Together those two steps
  occupied **82–83% of the end-to-end run**. These are observations, not an
  estimate of how much an alternative would save.
- The suite covers **317 cases** on current `main`: eight browser-free rendering
  cases plus 103 cases run in each of Chromium, Firefox, and WebKit. Several
  cases deliberately revisit all seven routes, multiple viewport sizes, and
  accessibility states. The Playwright step also starts a Vite server and
  builds the production server, so its timing is not pure test execution.
- Browser installation is repeated on four fresh runners. The existing npm
  cache helps package downloads but does not cache installed browser binaries
  or skip `npm ci`. Lint, typecheck, the final build, and Pages deployment are
  small or parallel in the measured runs; optimizing them first would have
  limited effect on elapsed time.

## Method and evidence limits

I inspected the current [workflow](../.github/workflows/pages.yml),
[package scripts and dependencies](../package.json),
[Playwright configuration](../playwright.config.ts),
[Vite configuration](../vite.config.ts), the test files, and relevant
[homepage test architecture](../docs/adr/0001-homepage-module-seams.md). I read
GitHub Actions job and step timestamps through `gh run view --json jobs` and
checked test counts in the run logs. Step durations below are rounded to whole
seconds from GitHub's timestamps; they include command startup and may not
match timings printed inside a tool. End-to-end time is run creation through
its last update. The two selected successes are the first PR and `main` runs
after the current lint job was restored. They are **available examples, not a
proven representative sample**; cache state, runner placement, and future code
could change the distribution.

| Run and source                                                                                          | Event                | End-to-end | Slowest browser job | Browser install across four jobs | Playwright step across four jobs | Other relevant jobs                             |
| ------------------------------------------------------------------------------------------------------- | -------------------- | ---------: | ------------------: | -------------------------------: | -------------------------------: | ----------------------------------------------- |
| [#36482837198](https://github.com/nicolas-found42/website-redesign/actions/runs/36482837198), `119e87e` | PR, success          |       247s |       236s, shard 3 |                           47–62s |                         137–147s | lint 39s; verify 3s                             |
| [#36483466818](https://github.com/nicolas-found42/website-redesign/actions/runs/36483466818), `3c72a1e` | `main` push, success |       252s |       230s, shard 2 |                           46–59s |                         134–148s | lint 31s; verify 2s; deploy 8s                  |
| [#36491326958](https://github.com/nicolas-found42/website-redesign/actions/runs/36491326958), `6cf87e0` | later PR, failure    |       253s |       243s, shard 2 |                           37–63s |                         135–159s | two browser shards failed; different site/tests |

For the successful PR, the critical shard spent 62s installing browsers and
142s in `npm test`; 204/247 seconds, or 83% of elapsed run time. On `main`, the
critical shard spent 58s and 148s respectively; 206/252 seconds, or 82%.
Across four shards, browser installation consumed 216s and 215s of runner
time in the PR and `main` runs, respectively. The test steps consumed 564s and
559s of runner time. Parallel runner time must not be mistaken for elapsed
time. The reported 31–39s lint job finished long before any browser shard.

The later failed PR has downloadable Playwright failure artifacts. Its reports
show examples of costly cases: WebKit `migration.spec.ts` checks for six
supporting routes at three widths took 23–28s each; a WebKit 16-width drawing
overlap check took 22s; and a Firefox production Pages route test took 19s.
These per-test durations include browser and fixture work and come from a
different PR with two failures, so they **identify profiling candidates, not a
current-`main` runtime baseline**. The successful runs only retain the dot
report in their logs, which does not expose comparable per-test durations.
[Run #36491326958](https://github.com/nicolas-found42/website-redesign/actions/runs/36491326958)
and its `playwright-failure-36491326958-3/4` artifacts contain the reports.

### Current execution path

The [workflow](../.github/workflows/pages.yml) runs on PRs to `main`, pushes to
`main`, and manual dispatch. `lint` runs independently. Four `browser-tests`
matrix jobs run in parallel, each with checkout, Node 22 and npm cache,
`npm ci`, installation of all three browsers plus system dependencies,
typecheck, and one Playwright shard with four workers. On `main`, shard 1 then
builds and uploads `dist`. `verify` waits for lint and every browser shard;
the Pages `deploy` job follows `verify` on `main`. Failure evidence is uploaded
only when a shard fails. The PR and push on `main` each run the full gate, so a
merged change commonly pays for both events; whether both events must retain
identical checks is a policy question, not a permission to skip them.

The [test configuration](../playwright.config.ts) defines a one-time `unit`
project for `render.spec.ts` and Chromium, Firefox, and WebKit projects for
the remaining tests. The successful `main` [run log](https://github.com/nicolas-found42/website-redesign/actions/runs/36483466818)
lists 81, 81, 79, and 76 cases across the four shards. The configuration starts
both a Vite development server and a production Pages server for Playwright;
the latter runs `npm run build` first. Thus **each shard builds for its
production-server tests inside `npm test`**, and the `main` shard builds once
more afterward for deployment. The [build script](../package.json) itself runs
`tsc --noEmit`, Vite, and prerender. This duplication is real, but a standalone
typecheck measured only 2s per shard and the post-test `main` build 4s; the
cost of the build inside each test step was not separately timed.

### Why it takes this long

1. **Browser execution is the largest observed block.** The Playwright step
   occupies 134–148s on the two successful runs. The three-engine project
   matrix multiplies 103 browser cases to 309 executions. Examples of
   substantive work include six routes with an axe scan at each of three
   widths in [`migration.spec.ts`](../tests/migration.spec.ts), a full-page
   reveal sweep at each route in
   [`ux-review-phone.spec.ts`](../tests/ux-review-phone.spec.ts), and direct
   entry, reload, link, and 404 checks in
   [`pages-production.spec.ts`](../tests/pages-production.spec.ts). The tests
   cover real accessibility and publishing behavior; their runtime alone does
   not show that any check is redundant. The [accepted module ADR](../docs/adr/0001-homepage-module-seams.md)
   already moved rendering assertions into the once-only `unit` project.
2. **Fresh browser setup is the next largest measured block.** Every shard
   invokes `npx playwright install --with-deps chromium firefox webkit`, taking
   46–62s per job in the two successes. The command installs browser binaries
   and Linux dependencies by [Playwright's CI procedure](https://playwright.dev/docs/ci).
   The workflow's `setup-node` npm cache stores package data, not browser
   binaries or `node_modules`, as its [maintainer README](https://github.com/actions/setup-node/blob/main/README.md)
   states. `npm ci` itself took 4–8s in these jobs, so package installation is
   a much smaller observed contributor.
3. **Repeated work and serial tail add smaller amounts.** Four typechecks add
   roughly 2s each to runner time, plus the typecheck in each build. The final
   build took 4s and Pages artifact upload 2s on `main`; deployment took 8s.
   `verify` starts only after both job families finish, so its new runner adds
   a short tail. These durations make job consolidation worth considering only
   after setup and tests. The lint job's Docker-based actionlint image pull
   took 6–8s, but lint remained off the measured critical path.

History does not isolate a regression cause. An earlier
[PR run #36443329756](https://github.com/nicolas-found42/website-redesign/actions/runs/36443329756)
finished in 164s with a Playwright container, two workers per shard, and 245
cases. The latest successful `main` run has 317 cases, four workers per shard,
and direct browser installation. Code, suite size, and runner setup all
changed, so the 83s difference cannot be credited to one of them. The
repository's earlier shard experiments also did not establish that more
shards help: an [eight-shard PR](https://github.com/nicolas-found42/website-redesign/actions/runs/36026715293)
took 220s, and a later [four-shard PR](https://github.com/nicolas-found42/website-redesign/actions/runs/36027969480)
took 222s, with intervening code and runner variation. These runs are useful
warnings against assuming an effect, not controlled benchmarks.

## Prioritized recommendations and validation

| Priority and approach                                                                                                      | Bottleneck addressed; likely benefit                                                                                                                                                                                                                                                                   | Effort and tradeoff                                                                                                                                                                                                                     | How to validate while keeping intended behavior                                                                                                                                                                                                                        |
| -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Benchmark the official Playwright image pinned to lockfile version 1.63.0** against the present fresh-runner install. | Directly targets the 46–62s browser-install step. Prior container runs initialized in roughly 24–40s, suggesting setup _could_ shrink by tens of seconds; this is a cross-revision, non-controlled comparison, not a forecast for the whole run.                                                       | Low to medium. Image pull/startup replaces browser installation; `npm ci` remains. Pinning must track the lockfile. Prior Git history includes a Firefox home-permission fix (`904c4ea`), which a trial must preserve.                  | On the same application SHA and suite, run repeated PR-branch workflows with each setup variant. Compare median and spread of setup, slowest shard, full run, runner minutes, and failure rate. Confirm 317 cases, all three engines, and production Pages tests pass. |
| **2. Retain per-test timing from successful runs, then target the slowest specs.**                                         | Addresses the 134–148s Playwright step, the largest measured block. Potential savings are unknown until a comparable success report names the slow tests. The failed PR suggests multi-route accessibility, contrast, and viewport checks are candidates.                                              | Medium. A blob or JSON report adds small artifact transfer and reporting work. Test restructuring can increase concurrency or reduce repeated page work, but must preserve route, viewport, accessibility, and three-engine assertions. | Record per-file and per-test duration by project on several successful PR runs. Change one spec at a time in a future PR; compare slowest shard and total run, not just that spec's duration. Diff test IDs and assertions, and track failures/retries.                |
| **3. Trial browser-specific jobs as an alternative to the full Playwright image.**                                         | Installing one browser per job might cut the 46–62s setup on each shard. The benefit is unmeasured because a browser matrix changes test distribution and runner count.                                                                                                                                | Medium to high. Requires explicit ownership of the once-only `unit` project, three-engine coverage, artifacts, and an equivalent `verify` gate. Uneven engine workloads may lengthen the slowest job.                                   | Compare against the same-SHA four-shard baseline. Check that every test ID appears in each intended engine exactly once, then compare browser setup, slowest job, total run, runner minutes, and reliability.                                                          |
| **4. Consolidate duplicate typecheck/build work only if setup cost stays lower.**                                          | The explicit typecheck is 2s per shard, and the post-test `main` build is 4s. There is also an untimed build inside each Playwright step. The directly measured ceiling for removing one typecheck and one final build from the critical path is small; shared artifacts may cost more.                | Medium. A separate build job and artifact handoff introduce dependencies, fresh-runner time, and the risk that tests validate different output from deployment.                                                                         | Time build, upload, download, and test startup separately. Verify the same `dist` passes production route checks and is the exact artifact deployed after `verify`; retain type errors in the gate.                                                                    |
| **5. Leave shard/worker and linter changes as measured experiments, not assumed wins.**                                    | Four shards already run concurrently. The two current successes show only 10–14s spread in Playwright step durations across shards, a rough upper bound for perfect balancing at unchanged throughput. Lint finishes early, so lint caching or replacing linters cannot materially shorten these runs. | Low for measurement, higher for changes. More shards repeat setup; four workers per shard may stress a runner. Different linters need a rule-by-rule equivalence review.                                                                | Benchmark worker and shard combinations at a fixed SHA; record wall time, runner minutes, test IDs, retries, and failures. Profile one long file before trying `fullyParallel`; preserve the accepted once-only unit tests and all current checks.                     |

For any future optimization, use matched PR-branch runs on the same site SHA and
test set, preferably several repetitions per variant. Report the median and
range (or p90 with enough samples) of end-to-end time, critical-shard setup and
test steps, total runner minutes, and failure rate. Compare cache hits/misses
and runner queue time separately. A change should keep the `verify` status,
three browsers, production-server behavior, lint/typecheck coverage, and the
`main` Pages artifact-to-deploy gate. No target runtime or permission to remove
checks is inferred from this investigation.

## Open questions

- Are the two current-workflow successes typical? More successful runs and
  cache-hit details are needed before reporting a stable baseline.
- Which individual tests dominate **successful** current-`main` shards, and
  how much of each `npm test` step is web-server startup or build?
- Does the official container beat direct installation at the **same** commit,
  runner type, shard count, and Playwright version? Its earlier use is
  suggestive but confounded.
- Is four workers per GitHub runner the best stability/runtime tradeoff? The
  later PR failed two WebKit checks, but one failed run cannot establish that
  worker count caused them.
- What are the required branch-protection checks and desired PR-versus-`main`
  validation policy? Both event types run the full suite now; changing either
  should be a separate policy decision.

## External approaches and source review

The following evaluates official tool behavior and alternatives discovered
through other projects, awesome lists, Reddit, and Stack Overflow. Its sources
support tool capabilities and tradeoffs; they do not establish measured savings
for this repository.

## Setup and browser execution

| Approach                                          | Evidence and applicability                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Tradeoff or limit                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Keep the existing npm download cache and `npm ci` | [`setup-node` source documentation](https://github.com/actions/setup-node/blob/main/README.md) says its `cache: npm` stores global package data, **not** `node_modules`. [`npm ci` documentation](https://docs.npmjs.com/cli/commands/npm-ci/) says it removes any existing `node_modules` and installs from the lockfile. Thus all five current jobs still recreate the dependency tree even on a cache hit.                                                                    | Caching `node_modules` to bypass `npm ci` would change the clean-install guarantee. The npm cache only removes some network work; its benefit here needs timing.                                                                                                                                        |
| Reduce browser installation per job               | [Playwright's CLI reference](https://playwright.dev/docs/test-cli) supports `--project`; [Playwright's own CI workflow](https://github.com/microsoft/playwright/blob/main/.github/workflows/tests_primary.yml) has browser matrix jobs and passes `browsers-to-install` per job, with a separate Chromium-only job elsewhere. A browser-project matrix could install only its browser.                                                                                           | This site's current sharding distributes _all_ projects across four jobs. Converting to browser jobs changes load balancing, adds matrix/setup duplication, and must keep the browser-free `unit` project and all three engine results. Measure slowest job, not only total browser bytes.              |
| Use the official Playwright container             | [Playwright Docker documentation](https://playwright.dev/docs/docker) describes an image with browser binaries and system dependencies and says the image version must match the project's Playwright version or executables may not be found.                                                                                                                                                                                                                                   | Avoids installation in each job but pulls an image per fresh runner and still requires project packages. Compare image pull plus startup with the current `playwright install --with-deps`; pin to the exact lockfile version.                                                                          |
| Cache browser binaries                            | [Playwright CI documentation](https://playwright.dev/docs/ci) explicitly advises against it: cache restoration can take as long as downloading binaries, and Linux system packages are not cacheable. If attempted, the key must follow the Playwright version.                                                                                                                                                                                                                  | More cache storage and invalidation complexity without a documented expected speedup. Community anecdotes about caching are not evidence for this repository.                                                                                                                                           |
| Adjust shard count and worker count               | [Playwright sharding guidance](https://playwright.dev/docs/test-sharding) explains that, without `fullyParallel`, sharding is at file granularity and uneven file sizes can leave one shard much slower. [Parallelism guidance](https://playwright.dev/docs/test-parallel) says each worker is a separate process and launches its own browser. [Playwright CI guidance](https://playwright.dev/docs/ci) cautions that more workers than the available cores can cause timeouts. | Fewer shards save repeated setup and runner minutes but may increase wall time. `fullyParallel` could balance tests but may break assumptions or increase concurrent server/browser load. The current four workers per shard merit measurement against runner cores and flaky outcomes before changing. |
| Run likely affected tests first on pull requests  | [Playwright CI documentation](https://playwright.dev/docs/ci) gives an `--only-changed` PR example and says it uses the suite's dependency graph. Playwright calls it a heuristic that may miss tests and runs the full suite afterward.                                                                                                                                                                                                                                         | This may improve first-failure feedback but adds a preliminary run; it does not reduce the full gate's work and may increase total CI time.                                                                                                                                                             |

## Job structure, checks, and artifacts

- **Run typecheck once per workflow.** The same `npm run typecheck` appears in
  each browser shard, and `npm run build` also begins with `tsc --noEmit` on the
  main-branch shard. A standalone gate can remove redundant checks, subject to
  job ordering and setup costs. [GitHub's job dependency documentation](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax)
  supports `needs`; additional jobs create another runner setup and can extend
  the critical path. The current repetition and build behavior are verified in
  the local workflow and package script, not inferred from external examples.
- **Build once and pass output.** [GitHub's artifact documentation](https://docs.github.com/en/actions/tutorials/store-and-share-data)
  documents upload/download between jobs. [GitHub Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
  documents the GitHub Actions publishing flow. This can decouple release output from a test shard,
  but an extra job and artifact transfer may slow wall time. Preserving the
  existing `verify` gate before deployment is essential.
- **Keep one useful report across shards.** [Playwright's sharding example](https://playwright.dev/docs/test-sharding)
  uploads blob reports per shard, merges them after tests, then uploads one HTML
  report. This improves diagnosis if a shard fails. It adds report transfer and
  a merge job, so it is a diagnostics improvement rather than a presumed runtime
  win. The current workflow uploads HTML/failure files only on failure.
- **Cache linter analysis only after measuring lint time.** [ESLint CLI docs](https://eslint.org/docs/latest/use/command-line-interface)
  and [Stylelint CLI docs](https://stylelint.io/user-guide/cli/) both support
  `--cache` and a `content` strategy suited to fresh Git checkouts whose file
  timestamps change. Cache files still need transfer between fresh runners to
  help across runs. [Vite's own package scripts](https://github.com/vitejs/vite/blob/main/package.json)
  use ESLint caching, a relevant first-party example; Vite's much larger
  monorepo does not establish a benefit for this smaller site.
- **Preserve the existing linters unless equivalence is demonstrated.** The
  [markdownlint-cli2 README](https://github.com/DavidAnson/markdownlint-cli2)
  documents the existing glob-based CLI; the
  [official action](https://github.com/DavidAnson/markdownlint-cli2-action)
  offers a dedicated job route, including changed-file examples, but would add
  action startup and may skip regressions if used as the only gate. The
  [actionlint usage guide](https://github.com/rhysd/actionlint/blob/main/docs/usage.md)
  supports the pinned Docker image pattern used here and a downloaded binary
  pattern; the latter might avoid container startup but adds a download step.
  [Oxlint's migration guide in its own repository](https://github.com/oxc-project/oxc/blob/main/.agents/skills/migrate-oxlint/SKILL.md)
  describes unmigrated-rule inspection and optional type-aware migration. It
  cannot be assumed equivalent to this project's type-checked ESLint and
  Playwright plugin rules without a rule-by-rule comparison. A formatter change
  has no demonstrated bearing on the browser-test critical path.

## External discovery and examples

- **Web development:** [Awesome Web Development](https://github.com/brandonhimpfen/awesome-web-development)
  links [Vite's repository](https://github.com/vitejs/vite) via its site, GitHub
  Actions, and Playwright in its tooling, deployment, and testing sections.
  These are the same families already used here. The
  [Vite-owned Pages guide](https://vite.dev/guide/static-deploy) confirms the
  needed build and project `base`; the
  [Playwright-owned sharding guide](https://playwright.dev/docs/test-sharding)
  supplies the test distribution details. The list reveals no separate build
  shortcut for this seven-page site.
- **Linting:** [Awesome Linters](https://github.com/caramelomartins/awesome-linters)
  links the [ESLint repository](https://github.com/eslint/eslint),
  [Stylelint](https://stylelint.io/user-guide/cli/), and the
  [markdownlint library](https://github.com/DavidAnson/markdownlint).
  Those are the present lint families, with `markdownlint-cli2` as this site's
  CLI. Their own [ESLint](https://eslint.org/docs/latest/use/command-line-interface)
  and [Stylelint](https://stylelint.io/user-guide/cli/) CLI documentation
  verifies the cache options discussed above. The list itself gives no timing
  data and does not justify changing rule coverage.
- **Formatting:** [Awesome Code Formatters](https://github.com/rishirdua/awesome-code-formatters)
  links [Prettier](https://prettier.io/) and its
  [source repository](https://github.com/prettier/prettier), already a
  development dependency here.
  [Prettier's CLI documentation](https://prettier.io/docs/cli) documents
  `--check` for a CI formatting gate. The current `lint` script does not run
  Prettier; adding a check would increase validation, not reduce the measured
  browser-test critical path. A formatter replacement would require a
  compatibility check across this site's TypeScript, CSS, and Markdown files.
- **GitHub Pages:** [Awesome GitHub Pages](https://github.com/brandonhimpfen/awesome-github-pages)
  links the [html-proofer repository](https://github.com/gjtorikian/html-proofer)
  and [VitePress](https://vitepress.dev/guide/deploy#github-pages), among other
  tools. `html-proofer` is a rendered-HTML validation option, but would add a
  Ruby toolchain and a new check; VitePress would replace the existing page
  implementation. Neither is a supported runtime reduction for the present
  workflow. [GitHub's Pages source configuration guide](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
  is the primary reference for the current artifact-to-deployment flow.
- [Awesome Actions](https://github.com/sdras/awesome-actions) and
  [Awesome GitHub Actions](https://github.com/brandonhimpfen/awesome-github-actions)
  list Pages deployment and lint/report actions. The linked
  [peaceiris Pages action](https://github.com/peaceiris/actions-gh-pages) is an
  alternative deployment mechanism, but this project already uses GitHub's
  documented artifact-and-deploy flow. Replacing deployment is not a clear CI
  runtime optimization.
- [Awesome Playwright](https://github.com/mxschmitt/awesome-playwright)
  and [Awesome Testing](https://github.com/TheJambo/awesome-testing) surface
  reporting, container, and configuration ideas. [Awesome Stylelint](https://github.com/stylelint/awesome-stylelint)
  surfaces formatter integrations. These lists were used for discovery only;
  the technical statements above are traced to tool-owned docs or source.
- [Playwright's own CI workflow](https://github.com/microsoft/playwright/blob/main/.github/workflows/tests_primary.yml)
  shows browser-specific matrix jobs and selective browser installation.
  [Vite's own package scripts](https://github.com/vitejs/vite/blob/main/package.json)
  show cached ESLint and separate test commands. Both are larger projects with
  different suites, so their organization is an example, not runtime evidence
  for Found42. [Vite's Pages guide](https://vite.dev/guide/static-deploy)
  confirms that a build and the correct `base` are needed for a project-path
  Pages deployment, consistent with this repository's Vite config.
- The [Reddit Playwright cache discussion](https://www.reddit.com/r/Playwright/comments/1ehvu9b/)
  proposes browser caching, while the [CI flakiness discussion](https://www.reddit.com/r/Playwright/comments/1qitvj4/playwright_tests_are_solid_locally_but_flaky_in/)
  raises worker and shared-resource concerns. The
  [Stack Overflow npm-cache question](https://stackoverflow.com/questions/70440783/does-the-npm-cache-speed-up-npm-install)
  reports little install-time improvement in one comparison, and the
  [cross-job `node_modules` question](https://stackoverflow.com/questions/67067410/github-action-not-caching-node-modules-across-jobs)
  illustrates the temptation to cache installed packages. These are community
  discovery signals only; the applicable behavior is established above from
  Playwright, npm, and `setup-node` documentation. No community runtime number
  is treated as a prediction for this workflow.

## Evidence limits for an implementation decision

Official docs establish what each option _can_ do. They do not establish which
step dominates Found42's current run. Compare per-step timing from representative
PR and `main` runs, cache hits and misses, each shard's test duration, slowest
job wall time, total runner minutes, and failures before choosing a change.
Preserve three-browser coverage, local production-server tests, the branch
protection `verify` result, and the Pages deployment gate while evaluating
runtime changes.
