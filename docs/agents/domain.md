# Domain Docs

## Layout

This repo uses a multi-context layout. Root `CONTEXT-MAP.md` identifies the contexts, links to their glossaries, and describes their relationships. Context documents live under `docs/contexts/<context>/CONTEXT.md`.

System-wide architecture decisions belong in `docs/adr/`; context-specific decisions belong in `docs/contexts/<context>/docs/adr/`. Create ADRs when a decision warrants one.

## Before exploring

Read `CONTEXT-MAP.md`, then each `CONTEXT.md` relevant to the topic. Read applicable system-wide and context-specific ADRs. For changes spanning contexts, read every affected glossary.

Before changing site copy, resource destinations, service positioning, or inquiry journeys, also read the affected context's `AUDIT.md` and `docs/contexts/SITE-AUDIT.md`. These files contain dated observations, recommendations, and unverified claims; treat them as evidence for decisions, not as approval of new commercial promises. Recheck volatile destinations before publication.

If a referenced glossary or ADR directory does not yet exist, proceed silently. The domain-modeling skill creates these lazily when terms or decisions are resolved.

## Use the glossary's vocabulary

Use terms defined in the relevant `CONTEXT.md` when naming domain concepts in issues, proposals, hypotheses, and tests. Keep glossaries limited to domain terms; specifications and implementation decisions belong in their own documents. If a needed concept is absent, reconsider the term or note the gap for domain modeling.

## Flag ADR conflicts

If a proposal contradicts an existing ADR, identify the ADR and explain why its decision should be reconsidered.
