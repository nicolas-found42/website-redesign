# The approachable business-site visual voice

**Status:** accepted (2026-09-23)

The website now presents a calm, approachable business-site voice while retaining
the drawing systems accepted in [ADR 0002](0002-working-system-drawing.md),
[ADR 0003](0003-audience-scenes.md) and
[ADR 0004](0004-narrow-services-sequence.md). Those decisions remain in force
for geometry, behaviour and delivery: each composition is still authored for
wide and narrow layouts; a complete still composition is still the resting
state; draw state is still released; signals, pointer depth and transitions
remain pausable under reduced motion; orientation changes, focus behavior,
keyboard controls, no-script rendering and disposal remain intact.

This revision changes presentation rather than the drawing architecture:

- The sans-serif type family is the dominant interface face. Monospaced type
  is reserved for small machine-like labels and diagram annotations, never for
  the main reading voice.
- Section indexes, repeated `Fig.` captions and document-outline furniture are
  removed from visitor-facing journeys. Useful hierarchy, comparison structure
  and contextual labels remain.
- The printed background grid and paper grain are removed. Section boundaries
  and content grouping rely on spacing, surface tone and a small number of
  purposeful dividers.
- Service and audience drawings keep their routed-node language, but their copy
  and accessible descriptions describe the customer journey: input, Found42's
  work, human review or participation, and usable result.
- The executive audience illustration is a hypothetical executive operating
  view, explicitly labelled as illustrative, rather than a daily-planner
  metaphor or an implied client implementation.

The active routes and offering destinations are maintained in
`src/content.ts`. Unavailable offerings remain visibly unavailable; a local
email form is not a fulfillment route. External destinations still require an
owner-approved check before release, and production indexing/domain routing
remain outside this decision.
