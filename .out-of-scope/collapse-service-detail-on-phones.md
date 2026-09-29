# Collapse service detail on phones

This site does not collapse each service's detail behind its summary on narrow
screens to shorten the phone page. Every service stays on the page in full at
every width, and the Services page carries the same audience and services
sections as the homepage.

## Why this is out of scope

[ADR 0004](../docs/adr/0004-narrow-services-sequence.md) records the rule and
rejects the nearest alternative: a horizontal swipe gallery "would hide two
services behind an interaction; every service stays on the page in full at
every width." Collapsing detail behind a summary hides the same content behind
an interaction, so it contradicts that decision.

The Services page repeating the homepage's audience and services sections is
also deliberate. It is recorded as the owner's call in
[STANDUP-CONVERGENCE](../docs/STANDUP-CONVERGENCE.md) (D1) and noted in #41.

If shorter phone pages become a goal, revisit ADR 0004 and D1 first, then
reopen this concept. Nothing is decided by measuring length alone: at 390px the
homepage was about 10,600px and `/services/` about 10,500px when #48 was written
on 2026-09-23.

## Prior requests

- #48: "The pages are very long on a phone" (one item of a low-priority
  catch-all; closed as `wontfix` on 2026-09-29)
