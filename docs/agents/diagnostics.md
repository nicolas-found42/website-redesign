# Diagnostic references

These symptom routes select entries from [The Book of Secret Knowledge](https://github.com/trimstray/the-book-of-secret-knowledge/blob/7d37069a361d3fd9f214480755f7969744e866fa/README.md). The pinned source is a catalogue, not a repository workflow. The constraints below are local conventions; they supplement the validation rules in [the testing guide](../guides/testing.md).

## Symptom routes

| Symptom or question                                         | Reference to consult                                                 | Repository constraint                                                                                                                        |
| ----------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| HTTP status, redirects, or connection/response timing       | curl — CLI Tools / Network (HTTP), and Shell One-liners / Tool: curl | Distinguish connection failures from HTTP responses; retain TLS verification.                                                                |
| Unexpected response headers                                 | curl; Web Tools / HTTP Headers & Web Linters                         | Identify whether GitHub Pages or the Worker controls the response before proposing a header change.                                          |
| Local dev or production-preview server cannot bind its port | lsof — Shell One-liners / Tool: lsof                                 | Inspect the listener's PID, command, and working directory. Stop only a server owned by the current task, using orderly shutdown first.      |
| JSON fixtures differ only in object-key order               | jq `-S` — Shell One-liners / Tool: vimdiff / Compare two JSON files  | Preserve array order; normalized output is comparison evidence, not a reason to rewrite fixtures.                                            |
| Shell script has quoting or expansion bugs                  | ShellCheck — Web Tools / Code parsers/playgrounds                    | Check that the script's declared shell is supported. Node scripts use the repository's JavaScript checks.                                    |
| GitHub Actions syntax or expressions fail                   | `npm run lint:actions` and `.github/workflows/pages.yml`             | Use the repository's actionlint gate rather than a generic shell or YAML check.                                                              |
| Unfamiliar shell flags or pipelines                         | tldr — CLI Tools / Other; local `man <command>` or `--help`          | Confirm flags for each pipeline stage against the installed version and OS.                                                                  |
| Browser support for a web feature is unclear                | Can I use — Web Tools / Browsers                                     | Confirm behavior with the affected browser projects; support tables supplement repository tests.                                             |
| Reported page-performance regression                        | Lighthouse and PageSpeed Insights — Web Tools / Performance          | These are optional diagnostic references. Compare the same route, build, viewport, and conditions; retain the repository's validation gates. |

## Tool use

Check `command -v <tool>` before use and confirm relevant flags in local help or manuals. Prefer available repository and OS tools; install a missing command through the host's package manager when the diagnosis requires it, then verify it runs. Tool availability is host-specific, so this document does not assume every catalogue entry is installed.

Adapt upstream examples to the current OS and shell. Use TLS verification for HTTPS requests, and public or sanitized examples in online tools. Process ownership and shutdown rules above apply even when an upstream one-liner force-kills a process found by port.

For route and asset failures, use the built Pages preview described in [README](../../README.md) and [the site map](../SITE-MAP.md). A response from Vite's development server does not establish static directory-index, trailing-slash redirect, or missing-page behavior. Rebuild the current checkout before validating a reused production-preview server.
