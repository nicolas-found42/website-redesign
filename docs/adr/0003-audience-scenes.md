# The audience scenes

**Status:** accepted (stand-up convergence)

The three audiences are drawn as **scenes**: pictures in the working-system's
hand — ink routes, ringed markers, red for what is human or live, monospaced
annotations — that are nonetheless three different compositions rather than
the transit map with new words on it. `src/audiences.ts` owns the audience
copy, the scene geometry (frames, routes, markers, labels, each with a `beat`)
and the still markup; `src/scene.ts` owns a _live_ scene — telling it in beat
order, running signals on its carrying routes, settling it — and takes the
scene as an argument. `src/homepage/audiences-behaviour.ts` owns the gallery:
which panel is shown, how it is chosen, and when a scene is told.

Consequences and rejected alternatives worth knowing:

- **A second small engine, not an extension of the first.** The schematic's
  engine (`src/system.ts`, [ADR 0002](0002-working-system-drawing.md)) moves a
  fixed cast of five nodes between compositions. The scenes need rectangles, a
  drawn control, people, review checks and a narrative order, and never travel
  nodes between pictures. Extending the schematic would have loosened the
  invariants that engine depends on. The scene engine keeps the same rules —
  the still composition is the resting state, draws are released when they
  finish, one animation frame loop per drawing and only while visible, an
  orientation listener, full disposal — so the two behave alike.
- **Told again on every choice.** A scene's sequence is the point of the
  picture (install, then use; roles one by one; step by reviewed step), so a
  visitor's choice plays it from its first beat. The first shown scene waits
  until it comes into view. Under reduced motion or the page's pause, a choice
  shows the complete still scene.
- **Every scene is authored twice**, landscape and portrait, and the portrait
  compositions are sparser and taller: at 320px an annotation cannot shrink
  below the readable minimum, so the picture gives it room instead.
- **The review scene has one composition.** A checklist reads down the page at
  every width; the horizontal version could not hold its labels in the
  resources column.
- **Gallery rather than tabs.** All three audiences stay discoverable in the
  rail (name and proposition), the shown panel restates its audience, the
  arrows and arrow keys move the choice without moving focus into the panel,
  and without a script the three panels read one after another with their
  still scenes.
- Rejected: reusing the services band's scroll-linked sequence for audiences.
  It would have duplicated the flagship interaction and implied the one-to-one
  audience-to-method mapping the meeting explicitly avoided.
