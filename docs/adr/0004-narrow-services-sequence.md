# The services sequence on a narrow screen

**Status:** accepted (stand-up follow-up, 2026-09-23)

Below 960px the services band has no sticky drawing beside its articles, and
until now it had no motion either: each article carried a still portrait
drawing. Each article's drawing is now a live one
(`src/homepage/services-behaviour.ts`). The second and third come on screen
as the service before them and change into their own once 55% of the drawing
is in view, which is the transition the wide screen shows, moved to where a
phone visitor is looking. The choice rail rides under the header while the
articles pass, reports the article being read and jumps to one.

Consequences and rejected alternatives worth knowing:

- **Two options on the live drawing, no new engine.** `mountSystem()` gains
  `orientation` (a drawing composed for one shape keeps it; the article layout
  is narrow up to 960px, wider than the 860px query that turns other drawings
  portrait) and `drawIn` (a drawing whose entrance is a transition skips the
  route draw). The invariants of [ADR 0002](0002-working-system-drawing.md)
  stand.
- **Its own composition at rest, always.** A drawing shows the previous
  service only while it is on screen and approaching; it returns to its own
  when it leaves the viewport before arriving, when motion is paused, and
  under reduced motion. Script-free and prerendered pages show each article's
  own still drawing, as before.
- **The arrival happens once.** Scrolling back up does not replay it; the
  sticky wide-screen drawing is the one that follows reading in both
  directions.
- **The rail rides only with height to spare** (`min-height: 560px`), under a
  header height measured as `--header-height`, because the header wraps with
  the text size. A jump from the rail lands the article's start below the rail.
- Rejected: a pinned drawing above the text. A portrait composition is about
  440px tall at 390px wide, and the landscape one scaled to fit drops its
  annotations under the readable minimum, which ADR 0002 rules out.
- Rejected: a horizontal swipe gallery of the three drawings. It would hide two
  services behind an interaction; every service stays on the page in full at
  every width.
