# Domain Docs

## Layout

This repo uses a single-context layout: `CONTEXT.md` at the repo root for domain vocabulary, and `docs/adr/` for architecture decision records.

## Before exploring

Read root `CONTEXT.md` and the ADRs in `docs/adr/` that touch the area being explored.

If these files do not exist, proceed silently. The domain-modeling skill creates them lazily when terms or decisions are resolved.

## Use the glossary's vocabulary

Use terms defined in `CONTEXT.md` when naming domain concepts in issues, proposals, hypotheses, and tests. If a needed concept is absent, reconsider the term or note the gap for domain modeling.

## Flag ADR conflicts

If a proposal contradicts an existing ADR, identify the ADR and explain why its decision should be reconsidered.
