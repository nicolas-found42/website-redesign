# Standards review — expressive homepage

Working-tree review against starting HEAD `d3592fa5596c0acb4ecd6ef0ffa535cd46fec7cf`, resolved before editing. `git diff d3592fa` is nonempty and includes new source files using intent-to-add. `git log d3592fa..HEAD --oneline` is empty at this review point. The branch was created from latest `origin/main` (`52f91a6`) and fast-forwarded to the earlier prototype before this implementation.

Sources: `AGENTS.md`, `docs/agents/domain.md`, `CONTEXT-MAP.md`, affected domain glossaries/audits, and the code-review skill's Fowler smell baseline. No additional coding-standards document or applicable ADR was found.

No remaining actionable documented-standard or baseline-smell findings. The workflow controller owns its state, labels, animation lifecycle and disposal. A generation guard and replacement paths prevent stale animation writes after interruption. SVG artwork shares its source with the static asset preparation script; icons use a restricted import set. Content records retain resource/inquiry distinctions and traceable attribution. Native layout handles both normal widths and enlarged text. Original brand bytes are unchanged, third-party notices are bundled, and generated screenshots are separate from the deployed build.

Tests observe browser journeys, visible state and rendering rather than private functions. The reduced-motion screenshot comparison checks two user journeys leading to the same complete state and caught an actual interrupted-animation defect. The enlarged-text regression also failed before its fix. All 39 browser tests pass; typecheck and production build pass.

**Standards: 0 findings.** This report is the completed first sequential self-review pass, not independent review or user acceptance. Commit/push/PR publication follows the user's repository instructions; main has not been modified.
