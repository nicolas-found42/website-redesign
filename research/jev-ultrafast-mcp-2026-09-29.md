# Using jev-ultrafast through MCP

Date: 2026-09-29. Baselines: [`browser-use/jev-ultrafast`](https://github.com/browser-use/jev-ultrafast)
`main` at `1231850` (2026-09-18, still the tip on 2026-09-29 per the GitHub API);
[`browser-use/browser-harness`](https://github.com/browser-use/browser-harness)
`main` at `afbcc38` (2026-09-07, 24 commits after release tag `v0.1.13` at `c24e507`).
Claude Code 2.1.284, `uv` 0.12.19, macOS 26 (Darwin 25.4.0, arm64). This report
changes nothing in the application; no global Claude Code config was modified.

## Findings at a glance

- **The dependency does not expose Jev through MCP.** jev-ultrafast uses browser-harness: it
  hard-pins `browser-harness==0.1.13` from PyPI and imports it in-process
  ([pyproject](https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/pyproject.toml#L8),
  [browser.py](https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/jev_ultrafast/browser.py#L9-L10)).
  browser-harness does ship an MCP server (`browser-harness-mcp`, stdio, 23
  tools, optional `[mcp]` extra). **But jev-ultrafast is not reachable through
  that server**, and jev-ultrafast ships no MCP server of its own.
- **jev-ultrafast is an unreleased demo/library, not a service.** Version
  `0.1.0`, no git tags, no GitHub releases, not on PyPI (HTTP 404), three
  commits on `main`, one merged PR (a README banner, by a browser-use maintainer). Its public surface is a
  Python `Agent(url, goal)` class plus a local web inspector (`uv run jev`).
  It needs a TypeSafe API key, and text-generation steps need an API key for an
  OpenAI-compatible text model. Pricing and key availability were not verified.
- **browser-harness's MCP server is small, released, and worked on first try.**
  `uvx --from 'browser-harness[mcp]==0.1.13' browser-harness-mcp` started on this
  Mac and listed 23 tools over stdio with no API keys. It exposes generic browser
  primitives (click at x/y, JS eval, raw CDP, screenshot to a file path); it
  has no "achieve this goal" tool and no plugin hook.
- **The smallest path to "Jev over MCP" is a ~40-line FastMCP-style wrapper**
  around `jev_ultrafast.Agent`. I wrote one as a single-file PEP 723 script that
  pins jev-ultrafast to a git SHA and `mcp==2.1.1`; it started and listed its
  tool over stdio here. I did **not** run it against a browser or the external APIs.
- **A third-party alternative exists:** `jev-browse` (PyPI 0.3.0, MIT, one
  author) is a port of the jev-ultrafast loop with an MCP server (8 tools). It
  is the fastest to install but is unofficial, four days old on PyPI, and I
  only read its docs and listed its tools, not its code.
- **The upstream browser-harness docs give a Claude Code command that fails.**
  `docs/MCP.md` omits the `--` separator; I confirmed locally that Claude Code
  rejects it with `error: unknown option '--from'`.
- **Recommendation:** for browser controls through MCP, register the official
  browser-harness server pinned to `0.1.13`. For **Jev's goal runner through
  MCP**, use a small, SHA-pinned wrapper; the harness server alone cannot run
  Jev. Treat the wrapper as experimental because the Jev loop is an MVP and no
  live browser or API run was tested here. Commands are below.

## Method and evidence limits

I cloned both repos with `gh repo clone` into the session scratchpad and read the
code at the SHAs above. I also read `browser-harness` at tag `v0.1.13`, because
that is what PyPI serves and what jev-ultrafast pins (PyPI upload
2026-09-04, per
[`uv.lock`](https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/uv.lock#L18-L30)).
Issue and PR data came from the GitHub API through `gh`; package metadata from
`https://pypi.org/pypi/<name>/json`; Claude Code syntax from the official docs.
`docs.claude.com/en/docs/claude-code/mcp` returns a 301 to
[`code.claude.com/docs/en/mcp`](https://code.claude.com/docs/en/mcp), which I
read as raw Markdown (`/docs/en/mcp.md`).

Labels used below: **[verified]** means I read the source or observed it running
here; **[inference]** means I derived it from verified facts but did not observe it.

What I ran, all with `BH_HOME` pointing at the scratchpad and `BH_TELEMETRY=off`
so nothing touched `~/.config/browser-harness`:

| Probe                                                                                                        | Result                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `uvx --from 'browser-harness[mcp]==0.1.13' browser-harness-mcp`, then `initialize` + `tools/list` over stdio | Started in about 4 s cold; Python 3.12.14, `mcp` 2.1.1; `serverInfo.name = browser-harness`; **23 tools**, names match `docs/MCP.md`                               |
| Same without the `[mcp]` extra                                                                               | Exits with `browser-harness-mcp requires MCP support. Install it with: pip install 'browser-harness[mcp]'`                                                         |
| `tools/call browser_page_info` with `BU_CDP_URL=http://127.0.0.1:1` (dead endpoint), PyPI 0.1.13             | After 30 s: result `isError: false` with text `{"error": "fatal: BU_CDP_URL=... unreachable ..."}`                                                                 |
| Same call against git `afbcc38`                                                                              | After 30 s: `isError: true` with `Error executing tool browser_page_info: fatal: ...`                                                                              |
| `uv sync` in the jev-ultrafast clone, import `jev_ultrafast`                                                 | Works; resolves `browser-harness 0.1.13`; exports `Agent`, `Browser`                                                                                               |
| My wrapper (below) as a PEP 723 script, `uv run --script --env-file ...`                                     | Built jev-ultrafast from git SHA, started, `tools/list` returned one tool, `jev_run`; `--env-file` variables reached the process                                   |
| `uvx --from 'jev-browse[mcp]==0.3.0' jev-browse mcp`, `tools/list`                                           | 8 tools: `fast_run`, `fast_run_status`, `jev_open`, `jev_find`, `jev_click`, `jev_check`, `jev_close`, `doctor`                                                    |
| `claude mcp add --scope bogus-scope x uvx --from ...` (with and without `--`)                                | Without `--`: `error: unknown option '--from'`. With `--`: parsed, then rejected only for the deliberately invalid scope. Nothing was written to `~/.claude.json`. |

**Not tested** (all would touch your real Chrome, spend money, or need secrets):
a real Chrome connection through either server, any live tool call that drives a
page, a live `jev_run`, and Claude Code actually loading a registered server.
An existing `browser_harness.daemon` process was running on the test machine; I
did not touch it. See the daemon-sharing note in the stability section.

## 1. What jev-ultrafast is and how it depends on browser-harness

**What it is [verified].** "A browser agent with a dynamic, indexed action space":
each observation yields a numbered element table; one TypeSafe "Jev" request
returns an operation (`CLICK`, `TYPE_TEXT`, `SELECT`, `SCROLL_UP/DOWN`, `WAIT`,
`DONE`, `BLOCKED`) plus a target; a small OpenAI-compatible LLM writes text only
for `TYPE_TEXT`
([README L9-L51](https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/README.md#L9-L51)).
The whole package is about 740 lines of Python
([agent.py](https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/jev_ultrafast/agent.py),
[browser.py](https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/jev_ultrafast/browser.py),
[model.py](https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/jev_ultrafast/model.py)).

**Public API [verified].** `from jev_ultrafast import Agent, Browser`
([`__init__.py`](https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/jev_ultrafast/__init__.py#L3-L6)).
`Agent(url, goals, *, record_dir=None, screenshots=False)` is a context manager;
`agent.run()` yields a state dict per step until `status` is `done` or `blocked`;
`close()` closes the owned tab
([agent.py L12-L13, L163-L174](https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/jev_ultrafast/agent.py#L163-L174);
README usage at
[L70-L92](https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/README.md#L70-L92)).
The action budget is 60
([`questions.py` L26](https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/jev_ultrafast/questions.py#L26)).
The only entry point is the console script `jev`, which starts a loopback web
inspector on port 8766, not an MCP server
([pyproject L10-L11](https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/pyproject.toml#L10-L11),
[demo.py `main`](https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/jev_ultrafast/demo.py#L131-L141)).

**Dependency on browser-harness [verified].** It is a normal, exactly pinned PyPI
dependency, imported in-process. Not a subprocess, not vendored:

- `dependencies = ["browser-harness==0.1.13", "httpx[http2]>=0.28,<1"]`
  ([pyproject L8](https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/pyproject.toml#L8)),
  locked to the 0.1.13 sdist/wheel hashes in `uv.lock`.
- `from browser_harness.admin import ensure_daemon` and
  `from browser_harness.helpers import cdp`; `Browser.__init__` calls
  `ensure_daemon()`, then drives its own background tab with raw `cdp(...)` calls
  ([browser.py L9-L10, L20-L28](https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/jev_ultrafast/browser.py#L20-L28)).
  The README also says Chrome "connects through Browser Harness, installed by
  `uv sync`"
  ([README L66](https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/README.md#L66)).

**What it adds on top [verified].** It uses harness only as a CDP transport and
daemon. Everything above that is new: the atomic DOM snapshot
([`snapshot.js`](https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/jev_ultrafast/snapshot.js)),
freshness and occlusion guards, the indexed action space, the TypeSafe request
(`POST https://api.typesafe.ai/v1/systemone`, hardcoded,
[model.py L119](https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/jev_ultrafast/model.py#L119)),
and the text helper
([model.py L160-L164](https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/jev_ultrafast/model.py#L160-L164)).
Page URL, title and visible text are sent to the TypeSafe endpoint on every step
([model.py L110](https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/jev_ultrafast/model.py#L110)).

**Required configuration [verified].** `TYPESAFE_API_KEY` (mandatory; read with
`os.environ[...]`, so a missing key is a `KeyError`), `TEXT_MODEL_API_KEY`
(mandatory for any `TYPE_TEXT` step), plus optional `TYPESAFE_MODEL`,
`TEXT_MODEL_BASE_URL`, `TEXT_MODEL`, `TEXT_MODEL_REASONING`
([.env.example](https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/.env.example#L1-L7)).
The library path does **not** load `.env`; only the inspector does
([demo.py L23-L29](https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/jev_ultrafast/demo.py#L23-L29)),
which is why the README runs library code with `uv run --env-file .env`
([README L84](https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/README.md#L84)).
TypeSafe's own quick start says to get the key from
[`console.typesafe.ai/keys`](https://docs.typesafe.ai/introduction/quickstart).
The README's waitlist banner concerns the separate "Browser Use Cloud" product.
Whether TypeSafe keys are open to everyone I could not establish.

**Self-declared limits [verified].** The README says shadow roots, frames,
canvas, uploads, pop-up tabs and nested scrolling are "outside this MVP", and
that the demo evidence is three repeats of one task
([README L122-L126](https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/README.md#L122-L126)).

## 2. What browser-harness's MCP server exposes

**Entry point and packaging [verified].** Console script
`browser-harness-mcp = "browser_harness.mcp_cli:main"`, gated behind the optional
extra `mcp = ["mcp==2.1.1"]`; the server module `mcp_server` is installed as a
top-level `py-module`
([pyproject L31-L36, L45 at v0.1.13](https://github.com/browser-use/browser-harness/blob/c24e5072ee66f8499bacd663f4f4bcb089bc4492/pyproject.toml#L31-L45)).
`mcp_cli.main` prints an install hint if the SDK is missing
([mcp_cli.py L4-L16](https://github.com/browser-use/browser-harness/blob/afbcc381b963040c19627d788e40c7e7663171ee/src/browser_harness/mcp_cli.py#L4-L16));
I reproduced that message. The server is `MCPServer("browser-harness")` and
`SERVER.run()` with no transport argument
([mcp_server.py L55, L294-L296](https://github.com/browser-use/browser-harness/blob/afbcc381b963040c19627d788e40c7e7663171ee/src/mcp_server.py#L294-L296)).

**Transport [verified].** stdio only. The docs say "The server speaks MCP stdio"
([docs/MCP.md L15](https://github.com/browser-use/browser-harness/blob/afbcc381b963040c19627d788e40c7e7663171ee/docs/MCP.md#L15-L17)),
and I spoke JSON-RPC to it over stdin/stdout. No HTTP or SSE mode exists in the
source I read. (An open PR, [#769](https://github.com/browser-use/browser-harness/pull/769),
mentions "the MCP HTTP tool", which is an unrelated `browser_http_get` helper,
not a transport.)

**Tools [verified].** 23 tools, each a thin wrapper over a `browser_harness.helpers`
function: `browser_new_tab`, `browser_goto`, `browser_page_info`, `browser_click`
(x/y coordinates), `browser_type`, `browser_fill` (CSS selector),
`browser_press`, `browser_scroll`, `browser_screenshot`, `browser_list_tabs`,
`browser_current_tab`, `browser_switch_tab`, `browser_close_tab`,
`browser_ensure_real_tab`, `browser_wait`, `browser_wait_for_load`,
`browser_wait_for_element`, `browser_js`, `browser_cdp`, `browser_upload_file`,
`browser_http_get`, `browser_start_recording`, `browser_stop_recording`
([mcp_server.py L138-L291](https://github.com/browser-use/browser-harness/blob/afbcc381b963040c19627d788e40c7e7663171ee/src/mcp_server.py#L138-L291);
the doc list is at
[docs/MCP.md L19-L46](https://github.com/browser-use/browser-harness/blob/afbcc381b963040c19627d788e40c7e7663171ee/docs/MCP.md#L19-L46)).
Practical consequences:

- `browser_screenshot` writes a PNG and returns `{path, width, height, size_bytes}`,
  not image content
  ([L192-L200](https://github.com/browser-use/browser-harness/blob/afbcc381b963040c19627d788e40c7e7663171ee/src/mcp_server.py#L191-L200)).
  Claude Code would have to `Read` the file to see it. **[inference]**
- `browser_js`, `browser_cdp`, `browser_upload_file` and `browser_http_get` are
  very powerful, and the browser is your real, logged-in Chrome (see the Chrome
  requirement below). Treat prompt injection from page content accordingly.
  **[inference]**
- Known defect: the `browser_switch_tab` description promises URL-substring
  matching that the helper does not implement
  ([L215-L217](https://github.com/browser-use/browser-harness/blob/afbcc381b963040c19627d788e40c7e7663171ee/src/mcp_server.py#L215-L217);
  [issue #690](https://github.com/browser-use/browser-harness/issues/690), open;
  fix PR [#751](https://github.com/browser-use/browser-harness/pull/751) open).
  The other half of #690 (mutable default on `browser_cdp`) is already fixed in
  the code I read (`params: dict | None = None`, L263).

**Error semantics differ between the release and `main` [verified by running
both].** In PyPI 0.1.13 a failing tool returns a normal result whose text is
`{"error": ...}` with `isError: false`
([v0.1.13 mcp_server.py L132](https://github.com/browser-use/browser-harness/blob/c24e5072ee66f8499bacd663f4f4bcb089bc4492/src/mcp_server.py#L132)).
On `main`, `raise ToolError` produces `isError: true`
([L116-L135](https://github.com/browser-use/browser-harness/blob/afbcc381b963040c19627d788e40c7e7663171ee/src/mcp_server.py#L116-L135);
merged in PR [#753](https://github.com/browser-use/browser-harness/pull/753),
2026-09-05, after the release). Docs still describe the older `{"error"}` shape
(docs/MCP.md L48-L49). Practical effect: on 0.1.13 Claude sees failures as
successful calls containing an error string.

**Env vars and keys [verified].** No API key is needed for local Chrome:
`.env.example` says "Only needed for remote browsers" and lists
`BROWSER_USE_API_KEY`
([.env.example](https://github.com/browser-use/browser-harness/blob/afbcc381b963040c19627d788e40c7e7663171ee/.env.example)),
and install.md says "Local Chrome does not need a Browser Use API key"
([install.md L70](https://github.com/browser-use/browser-harness/blob/afbcc381b963040c19627d788e40c7e7663171ee/install.md#L68-L70)).
Optional knobs seen in source: `BU_CDP_URL` / `BU_CDP_WS` (attach to a specific
CDP endpoint instead of discovering Chrome,
[admin.py L349-L357](https://github.com/browser-use/browser-harness/blob/afbcc381b963040c19627d788e40c7e7663171ee/src/browser_harness/admin.py#L349-L357)),
`BU_NAME` (named daemon), `BH_HOME` (state directory,
[paths.py L10-L13](https://github.com/browser-use/browser-harness/blob/afbcc381b963040c19627d788e40c7e7663171ee/src/browser_harness/paths.py#L10-L13)).

**Browser requirement [verified].** Default is your local Chrome over CDP, not a
cloud browser. The daemon looks up `DevToolsActivePort` in known Chrome profile
directories and probes ports 9222 and 9223
([daemon.py L331-L342](https://github.com/browser-use/browser-harness/blob/afbcc381b963040c19627d788e40c7e7663171ee/src/browser_harness/daemon.py#L331-L342)).
On first use you must tick "Allow remote debugging" at
`chrome://inspect/#remote-debugging`; on macOS Chrome then shows a
per-connection Allow sheet, and `browser-harness mac-approve` can click it if
the launching app has Accessibility permission
([install.md L46-L66](https://github.com/browser-use/browser-harness/blob/afbcc381b963040c19627d788e40c7e7663171ee/install.md#L46-L66)).
`ensure_daemon()` runs before every MCP tool call and, for local Chrome, waits
with no deadline while that approval sheet is showing
([admin.py L360-L365](https://github.com/browser-use/browser-harness/blob/afbcc381b963040c19627d788e40c7e7663171ee/src/browser_harness/admin.py#L360-L365),
[L525-L530](https://github.com/browser-use/browser-harness/blob/afbcc381b963040c19627d788e40c7e7663171ee/src/browser_harness/admin.py#L525-L530)).
So the first tool call can hang until you click Allow. **[inference]**: Claude Code
would background it after two minutes
([MCP docs, "Automatic backgrounding"](https://code.claude.com/docs/en/mcp)).
Cloud browsers are opt-in via `browser-harness auth login` and
`start_remote_daemon(...)`, which the MCP tool set does not expose.

**Telemetry [verified].** browser-harness has PostHog telemetry and a daily
update banner, but both are called only from the CLI wrapper
([run.py L258-L290, L383](https://github.com/browser-use/browser-harness/blob/afbcc381b963040c19627d788e40c7e7663171ee/src/browser_harness/run.py#L383);
a repo-wide grep finds no other callers). The MCP path imports `admin` and
`helpers` only, so I found no telemetry in MCP mode. Opt-out env vars are
`BH_TELEMETRY`, `BROWSER_HARNESS_TELEMETRY`, `ANONYMIZED_TELEMETRY`
([telemetry.py L18-L20, L82-L83](https://github.com/browser-use/browser-harness/blob/afbcc381b963040c19627d788e40c7e7663171ee/src/browser_harness/telemetry.py#L18-L20)).
`jev-ultrafast` also skips the CLI path, since it imports the library directly.

## 3. Can jev-ultrafast be reached over MCP today?

**Not through browser-harness [verified].** The MCP server registers a fixed list
of helpers imported at the top of the module
([mcp_server.py L28-L53](https://github.com/browser-use/browser-harness/blob/afbcc381b963040c19627d788e40c7e7663171ee/src/mcp_server.py#L28-L53))
and reads no config, flag, or plugin directory. A case-insensitive
`grep -r "typesafe\|jev"` over the whole browser-harness clone returns nothing.
(Its `agent-workspace/agent_helpers.py` mechanism is for the CLI, not for
adding MCP tools; that reading is **[inference]**.)

**Not in jev-ultrafast itself [verified].** `grep -ri mcp` over the clone (excluding
`uv.lock`) finds nothing. Upstream has open, unmerged community attempts:

- [PR #126](https://github.com/browser-use/jev-ultrafast/pull/126) (SemIf backend
  plus a stdio MCP server, `scripts/jev_mcp.py`) and the request in
  [issue #125](https://github.com/browser-use/jev-ultrafast/issues/125).
- [PR #141](https://github.com/browser-use/jev-ultrafast/pull/141) (opt-in Ego
  browser backend plus `run_goal` / `browser_status` MCP tools; 123 files
  changed).
- [Issue #145](https://github.com/browser-use/jev-ultrafast/issues/145)
  announcing `jev-browse`.

No maintainer has reviewed either PR (reviews are automated `cubic-dev-ai`
comments only), and `main` has had no code change since 2026-09-17. **[verified]**
via `gh pr view` and the commit log. Do not plan on upstream MCP support.

**Smallest wrapper, grounded in the real API.** The public surface is
`Agent(url, goal, screenshots=False)` as a context manager plus `agent.run()`.
One tool is enough. The sketch below is a single-file PEP 723 script: `uv run
--script` builds an isolated environment containing `mcp` and jev-ultrafast
(pinned to the SHA I read, which pulls `browser-harness==0.1.13`
transitively). I ran it to `tools/list` only.

```python
# /// script
# requires-python = ">=3.12"
# dependencies = [
#   "mcp==2.1.1",
#   "jev-ultrafast @ git+https://github.com/browser-use/jev-ultrafast@1231850a0bf1a0c0341fe408ef1668dbbfdfac46",
# ]
# ///
"""Thin stdio MCP wrapper around jev_ultrafast.Agent (NOT an official feature)."""
import contextlib
import sys
import threading

from mcp.server import MCPServer

from jev_ultrafast import Agent

SERVER = MCPServer("jev-ultrafast")
LOCK = threading.Lock()  # one shared Chrome; serialise runs


@SERVER.tool()
def jev_run(url: str, goal: str, screenshots: bool = False) -> dict:
    """Open `url` in a new background Chrome tab and pursue `goal` with Jev's
    indexed action loop (max 60 actions). Returns final status, URL and an
    action trace. status 'done' is the model's claim, not verified success."""
    if not LOCK.acquire(blocking=False):
        raise RuntimeError("Another jev_run is in progress")
    try:
        # stdout is the MCP wire; keep any library output off it
        with contextlib.redirect_stdout(sys.stderr), Agent(url, goal, screenshots=screenshots) as agent:
            for state in agent.run():
                pass
            return {
                "status": state["status"],  # done | blocked
                "elapsed_ms": state["elapsed_ms"],
                "final_url": state["page"]["url"],
                "final_title": state["page"].get("title"),
                "actions": [
                    {k: h[k] for k in ("step", "action", "kind", "text", "page_changed", "url")}
                    for h in state["history"]
                ],
            }
    finally:
        LOCK.release()


if __name__ == "__main__":
    SERVER.run()
```

Design notes, each tied to source:

- `Agent.__init__` calls `Browser(url)`, which runs `ensure_daemon()` and opens a
  background tab; `Agent.close()` closes it, so the context manager owns cleanup
  ([browser.py L20-L28, L109-L112](https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/jev_ultrafast/browser.py#L109-L112),
  [agent.py L167-L174](https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/jev_ultrafast/agent.py#L167-L174)).
- The `stdout` redirect mirrors what browser-harness's own MCP server does around
  helpers that print
  ([mcp_server.py L99-L113](https://github.com/browser-use/browser-harness/blob/afbcc381b963040c19627d788e40c7e7663171ee/src/mcp_server.py#L99-L113)).
- The lock exists because both jev and harness share one daemon and one Chrome
  session (`Agent` is not documented as re-entrant). **[inference]**
- The tool is synchronous and can run for tens of seconds up to the 60-action
  budget. Claude Code backgrounds MCP calls after two minutes. Whether
  `mcp` 2.1.1 runs sync tools off the event loop, I did not check; that only
  matters if you later add a second tool.
- `status == "done"` must not be read as success; the README and `AGENTS.md`
  both say outcomes need independent verification
  ([README L126](https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/README.md#L126)).
- The wrapper sends the page text of whatever URL you give it to
  `api.typesafe.ai` ([model.py L110, L119](https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/jev_ultrafast/model.py#L110)).
  Do not point it at logged-in pages you would not send to a third party.

## 4. Candidate approaches compared

| Criterion             | A. browser-harness MCP (official)                                                                                                                                                                                                                                             | B. Own wrapper over jev-ultrafast (pinned SHA)                                                                                                                                                                                                                                                                                                                                                                                                                                           | C. `jev-browse` (third party)                                                                                                                                                                                    | D. Upstream jev PRs #126 / #141                 |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Gives you Jev's loop? | No; generic primitives only                                                                                                                                                                                                                                                   | Yes, one `jev_run` goal tool                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Yes, plus step-level tools; a port, not the same code                                                                                                                                                            | Yes, but unmerged                               |
| Setup effort          | One `claude mcp add`                                                                                                                                                                                                                                                          | Save one file, make an env file with two keys, one `claude mcp add`                                                                                                                                                                                                                                                                                                                                                                                                                      | `uv tool install "jev-browse[mcp]"`, then `jev-browse install`, key in harness `.env`, one `claude mcp add`                                                                                                      | Check out a fork branch; not a realistic option |
| Version pinning       | PyPI `==0.1.13` (release and tag); or git SHA                                                                                                                                                                                                                                 | Git SHA only (no tags, no releases, not on PyPI); `browser-harness` 0.1.13 pinned transitively                                                                                                                                                                                                                                                                                                                                                                                           | PyPI `==0.3.0`; tags `v0.1.0`-`v0.3.0`; needs a separate browser-harness install ([docs/mcp.md L8-L15](https://github.com/danielnc/jev-browse/blob/935c69053c53ec66d737fc3dec6c67dfbfd8904f/docs/mcp.md#L8-L15)) | Unpinned branches                               |
| Maturity              | 14 tags (first `v0.1.1rc1`/`v0.1.1`, 2026-06-21; latest `v0.1.13`); alpha classifier; MCP added 2026-08-28 ([PR #601](https://github.com/browser-use/browser-harness/pull/601)), packaging fixed 2026-09-02 ([#711](https://github.com/browser-use/browser-harness/pull/711)) | jev-ultrafast is `0.1.0`, 3 commits, "MVP"; wrapper adds only ~40 lines of your own code                                                                                                                                                                                                                                                                                                                                                                                                 | First PyPI release 2026-09-25 (v0.2.0), 0.3.0 on 2026-09-27; one author; has CI and a CHANGELOG ([CHANGELOG](https://github.com/danielnc/jev-browse/blob/935c69053c53ec66d737fc3dec6c67dfbfd8904f/CHANGELOG.md)) | Open, 123 files (#141), no maintainer review    |
| Maintenance activity  | `main` pushed 2026-09-27; but last release 2026-09-04, `main` is 24 commits ahead; 402 open issues+PRs                                                                                                                                                                        | `main` frozen since 2026-09-17; 165 open issues+PRs; its only merged PR is a README banner                                                                                                                                                                                                                                                                                                                                                                                               | Active but one person                                                                                                                                                                                            | n/a                                             |
| Known MCP problems    | [#690](https://github.com/browser-use/browser-harness/issues/690) wrong `browser_switch_tab` description (open); error shape fixed only on `main`; docs' Claude Code command lacks `--`                                                                                       | None upstream (no MCP). Loop bugs open: [#93](https://github.com/browser-use/jev-ultrafast/issues/93)/[#156](https://github.com/browser-use/jev-ultrafast/issues/156) demo date in the past; [#36](https://github.com/browser-use/jev-ultrafast/issues/36) missing text key crashes mid-run; [#157](https://github.com/browser-use/jev-ultrafast/issues/157) no retry on text-model failure; [#16](https://github.com/browser-use/jev-ultrafast/issues/16) attaches to your real browser | None found (repo showed no issues via `gh`)                                                                                                                                                                      | Cubic flagged 40 issues on #141                 |
| License               | MIT ([LICENSE](https://github.com/browser-use/browser-harness/blob/afbcc381b963040c19627d788e40c7e7663171ee/LICENSE))                                                                                                                                                         | MIT (both)                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | MIT, with NOTICE for ported jev-ultrafast code                                                                                                                                                                   | MIT                                             |
| Keys required         | None for local Chrome                                                                                                                                                                                                                                                         | `TYPESAFE_API_KEY` + `TEXT_MODEL_API_KEY`                                                                                                                                                                                                                                                                                                                                                                                                                                                | `TYPESAFE_API_KEY` (text backends are pluggable, including local models)                                                                                                                                         | Same as B, plus Ego                             |

Notes on the table:

- **Stability caveat common to A, B and C [verified]:** all attach to your real
  Chrome through the shared browser-harness daemon. [Issue #16 on
  jev-ultrafast](https://github.com/browser-use/jev-ultrafast/issues/16) reports
  that the daemon takes the first CDP endpoint it finds (9222/9223), possibly your
  personal session; the workaround is `BU_CDP_URL`/`BU_CDP_WS` pointing at a
  dedicated Chrome with its own `--user-data-dir`. Also,
  [`new_tab()` reuses a blank tab](https://github.com/browser-use/browser-harness/blob/afbcc381b963040c19627d788e40c7e7663171ee/src/browser_harness/helpers.py#L429-L441),
  which the `jev-browse` author says led to user tabs being closed in their
  benchmark runner ([issue #145](https://github.com/browser-use/jev-ultrafast/issues/145)).
- **Shared-daemon note [inference]:** this Mac already has a
  `browser_harness.daemon` running from a different Python install. With default
  settings, a Claude Code MCP server would probably attach to that daemon rather
  than start its own, so the daemon's code version may differ from the one you
  pin. Setting `BU_NAME` (a separate named daemon) or `BH_HOME` in the server's
  `env` would isolate it; I did not test that on your Chrome.
- **`jev-browse` was assessed shallowly.** I read its README, `docs/mcp.md`,
  CHANGELOG, `pyproject.toml`, and listed its tools. I did not audit its code or
  run it against a browser. It runs each call through the `browser-harness` CLI,
  not through the library ([docs/mcp.md L8-L10](https://github.com/danielnc/jev-browse/blob/935c69053c53ec66d737fc3dec6c67dfbfd8904f/docs/mcp.md#L8-L10)),
  which is a different (and more subprocess-heavy) design from the in-process
  jev-ultrafast loop, and it carries its own claims about speed and cost that I
  did not check.

### Claude Code registration syntax (checked against the docs)

From the official page ([`code.claude.com/docs/en/mcp`](https://code.claude.com/docs/en/mcp),
"Option 3: Add a local stdio server"; `docs.claude.com/...` redirects there):

- Syntax is `claude mcp add [options] <name> -- <command> [args...]`. The `--`
  "separates Claude's own options, such as `--transport`, `--env`, and
  `--scope`, from the command and arguments that run the server", and without it
  Claude Code "would try to parse the server's flags ... as its own options".
- Options such as `--scope`, `--env` and `--transport` go **before** the server
  name. If the name directly follows `--env`, the CLI reads it as another
  `KEY=value` pair, so put another option (for example `--transport stdio`)
  between them.
- Scopes: `local` (default, stored per-project in `~/.claude.json`), `project`
  (`.mcp.json`, shared via git, requires interactive approval), `user`
  (`~/.claude.json`, all projects).
- `.mcp.json` stdio shape: `{"mcpServers": {"name": {"command": "...", "args":
[...], "env": {...}}}}`; `${VAR}` and `${VAR:-default}` expand in `command`,
  `args`, `env`, `url`, `headers`.
- `MCP_TIMEOUT` sets startup timeout in ms; a per-server `"timeout"` field caps a
  tool call; calls over two minutes move to a background task.
- Manage with `claude mcp list | get <name> | remove <name>`, and `/mcp` in a session.

I confirmed the `--` requirement locally (`error: unknown option '--from'` without
it). **The upstream instruction is therefore wrong as written:**
[`docs/MCP.md` L62-L65](https://github.com/browser-use/browser-harness/blob/afbcc381b963040c19627d788e40c7e7663171ee/docs/MCP.md#L62-L65)
gives `claude mcp add browser-harness uvx --from 'browser-harness[mcp]' browser-harness-mcp`.
It also does not pin a version, so it would install whatever the current release
is, including a future one with a different `mcp` pin.

## 5. Recommendation and exact steps

**Choose by goal.**

- If you want Claude Code to control the browser through MCP, use **A**. It is
  the officially released path, and it needs no API keys for local Chrome.
- If you specifically want Jev's goal-driven loop as a tool, use **B**. It
  wraps the actual Jev Python API and is the shortest direct route to that
  behavior, but the integration has only passed MCP startup and tool discovery,
  not a live task. It sends page text to TypeSafe and may send field context to
  a text model. Pin the SHA and upgrade deliberately. Consider **C** only after
  reading its code; it is quicker to install but is an unofficial port.
- Do not depend on upstream MCP support (D).

### Prerequisites (once)

1. Install `uv` if missing (`brew install uv`). Verified here with uv 0.12.19.
2. In Chrome open `chrome://inspect/#remote-debugging` and tick "Allow remote
   debugging for this browser instance". On the first MCP call, click Allow in
   Chrome's sheet (or run `uvx --from 'browser-harness==0.1.13' browser-harness
mac-approve` after granting your terminal Accessibility permission).
3. Pre-warm the uv cache so the first Claude Code startup does not race the
   default MCP startup timeout (network builds are the slow part):

   ```bash
   uvx --from 'browser-harness[mcp]==0.1.13' browser-harness-mcp </dev/null
   ```

### A. Official browser-harness MCP (recommended baseline)

```bash
claude mcp add --transport stdio --scope user browser-harness \
  -- /opt/homebrew/bin/uvx --from 'browser-harness[mcp]==0.1.13' browser-harness-mcp
```

Equivalent `.mcp.json` entry (use `--scope project` only if the team should share
it; this drives a personal Chrome, so I would keep it at user or local scope):

```json
{
  "mcpServers": {
    "browser-harness": {
      "type": "stdio",
      "command": "/opt/homebrew/bin/uvx",
      "args": ["--from", "browser-harness[mcp]==0.1.13", "browser-harness-mcp"]
    }
  }
}
```

Verify in a fresh session with `claude mcp list` and `/mcp`; expect 23
`browser_*` tools. Absolute path to `uvx` avoids PATH surprises; check yours
with `which uvx`.

Pinning note: `0.1.13` has the old error shape (`isError: false`). To get
`isError: true` today you would have to pin git
(`'browser-harness[mcp] @ git+https://github.com/browser-use/browser-harness@afbcc381b963040c19627d788e40c7e7663171ee'`),
which I ran successfully, at the cost of running unreleased code. I would stay on
the PyPI release and move to the next tag when one appears.

### B. Jev wrapper (optional, experimental)

```bash
# 1. Save the script from section 3 (unchanged) as:
mkdir -p ~/.config/jev-ultrafast
$EDITOR ~/.config/jev-ultrafast/jev_mcp.py

# 2. Keys live in a private env file, not in ~/.claude.json.
#    Get TYPESAFE_API_KEY at https://console.typesafe.ai/keys ; use your own text-model key.
cat > ~/.config/jev-ultrafast/.env <<'EOF'
TYPESAFE_API_KEY=
TYPESAFE_MODEL=jev-latest
TEXT_MODEL_API_KEY=
TEXT_MODEL_BASE_URL=https://openrouter.ai/api/v1
TEXT_MODEL=inception/mercury-2.5
TEXT_MODEL_REASONING=none
EOF
chmod 600 ~/.config/jev-ultrafast/.env
$EDITOR ~/.config/jev-ultrafast/.env      # paste the keys yourself

# 3. Pre-build the environment once (fetches jev-ultrafast at the pinned SHA)
/opt/homebrew/bin/uv run --script ~/.config/jev-ultrafast/jev_mcp.py </dev/null

# 4. Register
claude mcp add --transport stdio --scope user jev-ultrafast \
  -- /opt/homebrew/bin/uv run --script \
     --env-file "$HOME/.config/jev-ultrafast/.env" \
     "$HOME/.config/jev-ultrafast/jev_mcp.py"
```

Do not use `--env TYPESAFE_API_KEY=...` on `claude mcp add`: that stores the key
in plain text in `~/.claude.json`. The env values above match
[`.env.example`](https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/.env.example#L1-L7).
`--env-file` on `uv run --script` passing variables to the script is verified;
`$HOME` is expanded by your shell at registration time, so the stored command
contains absolute paths.

Before relying on it, do one supervised run with a task that does not need a login
and is not the bundled Flights example (whose fixed date is now in the past,
issues #93/#156), for example the README's Wikipedia task
([README L87-L90](https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/README.md#L84-L90)).

Removal: `claude mcp remove browser-harness` and `claude mcp remove jev-ultrafast`
(`claude mcp list` first).

### Alternative C (ready-made, unofficial)

```bash
uv tool install "jev-browse[mcp]==0.3.0"
jev-browse install          # hooks its skill into browser-harness; read its docs first
jev-browse doctor
claude mcp add --transport stdio --scope user jev-browse -- "$(which jev-browse)" mcp
```

This follows [its own docs](https://github.com/danielnc/jev-browse/blob/935c69053c53ec66d737fc3dec6c67dfbfd8904f/docs/mcp.md)
(the docs show Claude Desktop/Cursor/Codex snippets, not a Claude Code command;
the `claude mcp add` line is my translation), requires `browser-harness` to be
installed and connected separately, and puts `TYPESAFE_API_KEY` in the harness
`.env`. I did not run `jev-browse install` or `doctor`.

## Open questions and things I could not verify

- **Live behaviour.** I never connected to Chrome or ran a full page task with
  either server or the wrapper, so I have no measurement of reliability, latency,
  or whether Claude Code renders these tools sensibly. The Chrome permission flow
  on macOS 26 with your Chrome version is untested.
- **Wrapper correctness beyond startup.** The `state[...]` keys used in `jev_run`
  come from reading `agent.py` and `model.py`, not from a live run; `page.title`
  is read with `.get`. Handling of the `Agent` initial observation returning an
  empty action space ([issue #1](https://github.com/browser-use/jev-ultrafast/issues/1))
  and of transient text-model failures ([#157](https://github.com/browser-use/jev-ultrafast/issues/157))
  is not addressed by the sketch.
- **Sync tools in `mcp` 2.1.1.** I did not read the SDK to see whether blocking
  tools run on a worker thread.
- **TypeSafe key availability, pricing, and data terms.** Not established; only
  the docs' statement that keys come from `console.typesafe.ai/keys`.
- **Daemon sharing on your machine.** Whether a Claude Code-launched MCP server
  attaches to the already-running daemon, and what happens on a version mismatch,
  is inferred from `ensure_daemon()`'s "alive" check, not observed.
- **Upstream direction.** No maintainer statement about adding MCP to
  jev-ultrafast or about the next browser-harness release (the `main` branch has
  unreleased fixes: #753 and others; PR
  [#844](https://github.com/browser-use/browser-harness/pull/844) "run unit tests
  before releases" is still open, and the release workflow builds and publishes
  without running tests, per
  [release.yml](https://github.com/browser-use/browser-harness/blob/afbcc381b963040c19627d788e40c7e7663171ee/.github/workflows/release.yml)).
- **Issue counts** are GitHub's `open_issues_count` (issues plus PRs) at
  2026-09-29: 165 for jev-ultrafast and 402 for browser-harness.
- **jev-browse** was not code-reviewed (see section 4).

## Sources

- jev-ultrafast at `1231850a0bf1a0c0341fe408ef1668dbbfdfac46`:
  [README](https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/README.md),
  [pyproject](https://github.com/browser-use/jev-ultrafast/blob/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/pyproject.toml),
  [`jev_ultrafast/`](https://github.com/browser-use/jev-ultrafast/tree/1231850a0bf1a0c0341fe408ef1668dbbfdfac46/jev_ultrafast).
- browser-harness at `afbcc381b963040c19627d788e40c7e7663171ee` and tag `v0.1.13`
  (`c24e5072ee66f8499bacd663f4f4bcb089bc4492`):
  [docs/MCP.md](https://github.com/browser-use/browser-harness/blob/afbcc381b963040c19627d788e40c7e7663171ee/docs/MCP.md),
  [src/mcp_server.py](https://github.com/browser-use/browser-harness/blob/afbcc381b963040c19627d788e40c7e7663171ee/src/mcp_server.py),
  [install.md](https://github.com/browser-use/browser-harness/blob/afbcc381b963040c19627d788e40c7e7663171ee/install.md).
- jev-browse at `935c69053c53ec66d737fc3dec6c67dfbfd8904f` (v0.3.0 line,
  2026-09-27): [repository](https://github.com/danielnc/jev-browse).
- PyPI metadata: [browser-harness](https://pypi.org/project/browser-harness/),
  [mcp](https://pypi.org/project/mcp/) (2.1.1 released 2026-08-25; 2.2.0 exists),
  [jev-browse](https://pypi.org/project/jev-browse/); `jev-ultrafast` is not on PyPI.
- Claude Code: [MCP documentation](https://code.claude.com/docs/en/mcp).
- TypeSafe: [quick start](https://docs.typesafe.ai/introduction/quickstart).
