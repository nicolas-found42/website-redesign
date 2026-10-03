# The October review drawings

**Status:** accepted (owner's review follow-through, 2026-10-02, issues #136–#140 under tracker #141)

This decision revises the drawing-composition statements of
[ADR 0008](0008-text-led-opening-and-solid-drawings.md) where the October
review changed them, and extends [ADR 0009](0009-executive-day-and-audience-sequence.md)'s
executive timeline with per-card sample content. Nothing here changes the
drawing architecture ([ADR 0006](0006-drawings-made-of-material.md)), the
solid-material rules, or the separate wide and narrow compositions.

## Contributors: lanes, not a braid

ADR 0008 describes the contributors scene as role ribbons "braided" through
the human-review gate. The reviewer found the crossings confusing (#137):
each role's ribbon now runs as its own lane — told apart by position and
per-lane labels, not colour alone — through its own slot in the gate, and
reviewed work still returns to each role through the shared result. The gate
is a frame of four charcoal posts carrying the reviewer's seal.

## Workflows: an ordered process track

ADR 0008 describes Workflows as "a concertina whose last panel threads a
ribbon back". The reviewer asked for a standard process with a decision
(#139): the drawing is now five numbered step-cards joined as a chain — brief
/ operating problem → tailored design and build → test and review → team
deployment → review in customer context — with a review diamond ("does it
still fit the work?") on the path, and the iteration ribbon running back into
tailored design and build. Both compositions show the same chain; the narrow
one's return ends at the design step, not the brief.

## Automations: an ordered line with a stamp

ADR 0008 describes Automations as "a stamp". The reviewer asked for the same
ordered reading while keeping the stamp and the approved-output idea (#140):
the drawing is now a five-station line — repetitive work, system handoffs,
human direction (the red stamp), human review (sealed), usable output — with
the two unnamed outputs kept. Review marks approval; nothing implies
unattended automation.

## Executive cards: fictional sample lines

ADR 0009's timeline keeps its four cards; each now also carries one short
fictional placeholder line ("Sample: …"), within ADR 0009 and issue #80's
authorization of one or two placeholder lines per card, and #136's request
for recognizable sample output. No real people, companies or figures appear;
the illustrative, no-live-integrations disclosure stays prominent.

## Builder labels: whole words only

The builders scene's stage labels wrap only at word boundaries at every
supported width, including enlarged text (#138), by widening the label boxes
in the drawing and scoping a word-boundary wrapping rule to that scene. Type
stays at least 13px; the reviewer's smaller-type suggestion was treated as a
hypothesis, not a requirement.

## Consequences

- The diagram inventory keeps its by-hand revision rule; every word,
  connection, mark and annotation above is recorded in
  `tests/fixtures/diagram-inventory.json` and asserted against the rendered
  drawings.
- The accessible descriptions name the lanes, the chain and its iteration,
  and the ordered approval line, so the drawings do not depend on arrows
  alone.
