# The working-system drawing

**Status:** accepted (2026-09-14)

The homepage's illustration is a **composition** of the working-system
schematic: labelled nodes joined by routes that run horizontally, vertically or
at 45°. `src/schematic.ts` owns the geometry and knows nothing about the DOM
beyond producing markup; `src/system.ts` owns a _live_ drawing — reveal,
transition, signals, pointer depth — and takes the compositions it may show as
an argument rather than importing them. That is what lets the opening spread
show a master composition the service rail never offers, and lets a band that
only needs a still picture render one from the same module without a script.

Consequences and rejected alternatives worth knowing:

- **Every composition is authored twice**, as a wide `landscape` layout and a
  `portrait` layout with its own node placement, routes and label anchors.
  Rejected: one layout scaled down, which at 390px either drops annotations
  below the readable minimum or sets them across each other. The duplication is
  the point — a phone gets a drawing composed for a phone.
- **The still composition is the resting state, always.** `fieldMarkup()`
  produces a complete drawing with no script; the live drawing starts from
  exactly that markup and takes over its layers. A still figure is therefore
  never a second implementation of the same picture, and an interrupted,
  reduced-motion or script-free drawing shows what a finished one shows.
- **Nothing that animates may also position.** A node marker is placed by an
  SVG `transform` attribute and any tween moves an inner group; an annotation is
  placed by its anchor class and any tween moves the text inside it. Motion
  writes `style.transform`, which wins over both — early builds collapsed every
  marker onto the drawing's origin and anchored every label from its node's
  top-left. The two-element split is not decoration; it is the invariant.
- **A draw must be released when it finishes.** A `pathLength` tween writes
  `stroke-dasharray` and `stroke-dashoffset` as presentation _attributes_, which
  outlive the animation and override the stylesheet. `clearDrawing()` removes
  them, which is also what lets the feedback loop keep its own dash.
- Signals run in **one** `requestAnimationFrame` loop per drawing, moving points
  along cached path lengths, paused by an intersection observer when the drawing
  is off screen and by the motion preference. Rejected: a CSS `offset-path`
  animation per signal, which cannot be paused as one thing or re-timed when a
  composition changes.
- Rejected: WebGL. `research/motion-libraries-2026-09-14.md` evaluated OGL,
  Three.js and `@paper-design/shaders`. An animated gradient field is decoration
  unrelated to what the page argues, and the brief's own standard — build the
  spectacle around the story — rules it out here rather than any cost concern.

Supersedes two bullet points of
[0001](0001-homepage-module-seams.md), whose module-seam decision otherwise
stands and is extended by this one: `mountWorkflow()` and `src/artwork.ts` are
gone. The ribbon geometry, its asset generator, its two committed SVGs and
`svgo` were removed with them, because the drawing is now rendered inline from
one module and nothing referenced the generated files.
