# Standards review

Reviewed in working-tree mode against the recorded starting HEAD `e2b2a10d9ae7a3128fdc2c95e45fe824135292a9`. The required latest-main feature branch begins at `52f91a6630f1afb9709b31aa25144ccc6a3f15c8`; the fixed-point diff also includes already-merged audit/spec commits `1c42fe6` and `52f91a6`. Those upstream documentation changes are not prototype implementation changes. New source files were included with intent-to-add; generated screenshot evidence is reviewed separately.

Sources: root AGENTS.md, docs/agents/domain.md, CONTEXT-MAP.md, the relevant Resources/Services/Inquiries/Credibility glossaries, and the code-review skill’s Fowler smell baseline. No further coding-standards file or applicable ADR was present.

No remaining documented-standard violations or actionable baseline smells found. The implementation uses the required feature branch, preserves domain distinctions, groups resource copy and source metadata together, and keeps layout and browser interactions in small, direct modules. The plain static rendering function does not introduce speculative component abstractions. Source and stylesheet formatting were expanded for source editing. Generated/dependency outputs are ignored; original public brand assets are retained.

The working-tree changes are not yet committed at this review point. Commit/push/PR publication must follow the repository workflow; no direct main mutation is permitted.

Standards: 0 findings. This is one sequential self-review pass, not an independent reviewer’s approval.
