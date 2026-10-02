# AGENTS.md refinement experiments

## Source and scope

Studied [The Book of Secret Knowledge](https://github.com/trimstray/the-book-of-secret-knowledge/blob/7d37069a361d3fd9f214480755f7969744e866fa/README.md) at commit `7d37069a361d3fd9f214480755f7969744e866fa` on October 2, 2026. The raw README matched the pinned revision byte for byte. Six bounded chunks covering its full text passed typesafe Jev screening. The source is a broad reference catalogue, primarily aimed at systems, network, DevOps and security work; the selected entries fit this website repository's diagnostic needs.

AGENTS.md remains the owner of repository-wide instructions. This artifact records experiments and evidence; it adds no instructions for future runs. Source entries supply the references. Symptom wording, tool preflight, OS/shell adaptation, TLS verification and sanitized online examples are local adaptations.

## Experiment 1: brainstorm and rank six approaches

Typesafe Jev reranked six alternatives against source fidelity, relevance, actionable routing and compact instructions.

| Approach                                 | Relevance judgment | Result                                                    |
| ---------------------------------------- | ------------------ | --------------------------------------------------------- |
| Inline symptom-to-tool table             | 0.95               | Selected for a concrete draft.                            |
| Separate guide with an AGENTS.md pointer | 0.91               | Useful, but adds another instruction home for six routes. |
| Generic source-index pointer             | 0.58               | Selected for a concrete draft.                            |
| Machine-specific availability matrix     | 0.30               | Environment changes would make it stale.                  |
| Inline tool list                         | 0.22               | Selected for a concrete draft.                            |
| Mandatory diagnostic sequence            | 0.18               | The catalogue does not prescribe that sequence.           |

## Experiment 2: compare three concrete drafts

Each draft was judged on the same six propositions: whether it explicitly routes the stated symptom to the tool and, where applicable, retains array order or calls for site-specific verification. The draft text and full probability outputs are in [experiments.json](experiments.json).

| Explicit route                                 | Tool list | Generic pointer | Symptom table |
| ---------------------------------------------- | --------- | --------------- | ------------- |
| HTTP headers/redirects to curl                 | 0.22      | 0.08            | 0.99          |
| Local port ownership to lsof                   | 0.17      | 0.05            | 0.99          |
| JSON key order to jq -S, preserving arrays     | 0.09      | 0.04            | 0.98          |
| Shell quoting bugs to ShellCheck               | 0.20      | 0.07            | 0.99          |
| Shell explanation plus local flag verification | 0.13      | 0.04            | 0.96          |
| Browser support plus repository browser tests  | 0.07      | 0.03            | 0.97          |

These are semantic probabilities, not success rates from autonomous agent runs. The explicit-routing rubric favors a table; it does not establish that an agent using a generic pointer could never find the answer.

## Experiment 3: preservation and final choice

A Jev comparison judged all six existing-policy aspects as `same_fact`, each at confidence 1.0: branch/PR workflow, two-worker/full-test policy, and the issue, triage, review and domain pointers. Its overall judgment was uncertain (confidence 0.33) because the table adds information. A deterministic comparison after editing checks that the original content remains intact.

The bounded structure decision selected `symptom_table`, with selection probability 0.93 and confidence 0.92. All three requirements were supported: preserve workflow/testing, cover all six source routes and retain AGENTS.md as the instruction home.

## Local capability checks

Availability is a snapshot of this macOS host, not a promise about CI or future hosts. AGENTS.md directs agents to recheck tools at use time. Sanitized command arguments, exit codes and output are in [command-checks.json](command-checks.json).

| Entry           | Measured status                           | Check and result                                                                                           |
| --------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| curl            | Installed; exercised                      | Controlled localhost redirect returned both 302 and 200 header sets.                                       |
| lsof            | Installed; exercised                      | Identified the Python process listening on the controlled server's port.                                   |
| jq              | Installed; exercised                      | Sorted-key fixture outputs matched; array order `[2,1]` remained intact.                                   |
| ShellCheck      | Installed; exercised                      | Unquoted expansion produced SC2086 and exit 1; corrected script returned exit 0.                           |
| explainshell    | HTTP 403 from this environment            | Removed from the final routes; replaced with local tldr and man.                                           |
| Can I use       | HTTP 200                                  | Public homepage reachable; interactive functionality was not tested.                                       |
| HTTPie (`http`) | Absent                                    | Excluded from the final routes.                                                                            |
| tldr            | Installed after user follow-up; exercised | Installed Homebrew tlrc 1.13.1; refreshed 7,557 cached pages; `tldr --color never curl` returned examples. |

Jev verified the four local command outcome claims against their logs. Web responses establish endpoint reachability only. The user then requested concrete tooling with no optional routes. Installed `tlrc` through Homebrew, which provides `tldr`; the old Homebrew `tldr` formula is disabled and identifies `tlrc` as its replacement. Verified all six final commands with `command -v`: curl, lsof, jq, shellcheck, tldr and man. Read the curl, lsof and jq manuals successfully. The remaining commands were already installed.

## Evidence sanitization

The published captures replace authoring-host fixture paths with `<FIXTURE_DIR>`, the controlled server port with `<PORT>`, HTTP dates with `<DATE>`, and process/user identifiers with `<SERVER_PID>` and `<USER>`. The listener row omits file-descriptor, device, size and node columns. The command inventory records availability and versions rather than executable locations. The tldr evidence retains only the original HTTPS GET, redirect/header, and download examples; it is an excerpt, and omitted examples do not form part of the published evidence.

These placeholders describe sanitized recorded observations; they are not literal arguments executed by the original harness. Exit codes, HTTP status/redirect behavior, sorted JSON values and array order, SC2086 and its correction, command availability, versions, and the experiment judgments retain their original meaning. The PR was rebuilt on current main so its commit range contains the sanitized artifacts rather than the original unsanitized commit.

## Final revision after user follow-up

Replaced the explainshell route with tldr examples and local `man <command>` pages. Removed the optional-tool wording and the unavailable-tool substitution rule. The final AGENTS.md directs installation and verification of missing commands through the host's package manager. Jev checked the revised six routes at probabilities 0.97–0.99; these remain semantic judgments, not autonomous-run success rates. The original draft comparisons above remain historical and are preserved unchanged in the experiment record.

## Review and limitations

The pre-edit Jev review had composite 0.94375 and `safe_to_apply` 0.84, but requested review because test-gap confidence was 0.67. Documentation lint, diff checks, local-pointer resolution and deterministic baseline preservation are performed on the final artifact before the final completion gate. Their outputs belong in the pull request validation record.

An oversized rerank batch and an invalid context object were rejected, then corrected to bounded batches and the supported evidence shape. The initial command harness assumed both web references returned 200 and stopped at explainshell's 403. A Jev verification correctly marked its missing-log claims unsupported. The repaired harness records actual response codes and supplied logs before verifying the local claims. Rejected inputs and unsupported claims were not treated as successful evidence.
