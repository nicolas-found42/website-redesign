# Design decisions

The multi-page preview extends a direction called **Working Drawings**. It replaces
the ribbon motif and the flat band rhythm that preceded it; the earlier light
editorial selection, the black/red identity, the original logo and Richard
Achée's portrait are carried forward. Screenshots of the previous iteration are
kept under `preview/expressive/` and `preview/` as historical record.

## Art direction: the working system, drawn

Found42's argument is that a business already has the expertise, and the work is
connecting it into something people actually use. The page makes that argument
with one graphic idea used at three scales rather than with decoration.

A **composition** is a transit-map drawing of one way a business works: labelled
nodes joined by routes that only ever run horizontally, vertically or at 45°,
with rounded corners. Five node identities recur in every composition — four
labelled steps and the human anchor that sits in the middle of the work — so
switching between compositions rearranges the same cast rather than replacing
one picture with another.

The drawing is an ink technical plan. **Red is signal**: it marks the human
direction node and the dots running the routes, and nothing else inside the
drawing. That discipline is what keeps red meaningful when it reappears on a
button, a section index or an access note. Nothing depicts a product interface,
a customer system or a measured result.

Four compositions exist. The **master** drawing opens the page: people,
workflows and what the business knows, connected through human direction into
practical AI at work. The original **training**, **automation** and **product value** geometry now
supports Workshops, Workflows and Automations, respectively, with source-aligned
labels and descriptions. Each keeps the geometry its own argument needs — a loop that
returns, three functions converging on one spine, and inputs combining then
reaching a customer more than one way.

Every composition is drawn twice. The landscape layout is the wide editorial
one; the portrait layout is a _separate composition_ for narrow screens, not the
wide drawing scaled down — different node placement, different routes, labels
anchored where they will not cross a route at that shape.

## Composition and type

The page sits on a drawing surface: a 96px printed grid and a fine grain, both
painted once and never animated. Full-bleed ink and red bands interrupt the
paper so the rhythm is not five variations of the same pale sheet.

Space Grotesk carries display type with tracking that tightens as the type grows
(−0.04em at the opening, −0.02em at subheads, normal in body copy). Manrope
carries body copy. **JetBrains Mono** is new: every label, section index, access
note, gate, caption and call to action speaks in the drawing's annotation voice,
which is what ties the schematic's own labels to the rest of the page. All three
are declared face by face in `styles/fonts.css`, so the build publishes three
Latin weight-axis files rather than every subset the packages ship.

Two-sentence headlines set one sentence to a line, declared in the markup. Both
automatic modes were wrong here: `pretty` leaves a one-word line, and `balance`
grouped the opening headline differently while it was split for its entrance
than after it.

The resources band is one editorial feature and a column of compact entries
rather than a row of equal cards: the ungated article is the only thing on the
page a visitor can use without giving anything, so it is the one with weight.
Each of the four routes in carries the same access note in the same place — what
it costs, how it is reached, and exactly what it asks for first.

## Motion

Entrances share one easing family and one rule: content is never hidden by
anything that might not finish. Every starting state lives behind
`html[data-motion="on"]`, which only the reveal module sets, and every path out
of that module ends with the finished state applied.

The **opening drawing** draws itself in — routes first, then markers, then
annotations — and then runs continuously: red dots travel every carrying route
at a constant pace, and on a fine pointer three layers lean by different amounts
so the drawing has depth without leaving its coordinates.

The **flagship** is `02 / How we help`. On a wide screen one drawing holds still
beside three articles that scroll past it and reconfigures to whichever article
is being read: the outgoing routes retract, the nodes travel to their new
places, the labels change their words at the midpoint of their own travel, and
the new routes draw in. The choice rail reports that state and lets anyone jump
straight to a service. Scrolling is never intercepted — the pane is `sticky`, so
the page scrolls natively throughout. On a narrow screen the sticky split is
abandoned and each article carries its own still portrait drawing.

All three services are on the page in full at every width. Nothing is behind an
interaction, and the article being read is marked by a rule filling red rather
than by fading the other two, which would drop live body copy under the contrast
minimum for anyone reading ahead.

Smaller recurrences of the same signal motif: a dot travels the rule under a
text link, a fill sweeps a button, a rule draws under a navigation item.

### Stopping it

The travelling signals are movement presented alongside other content and they
do not stop on their own, so the page carries a **pause control** in the opening
rail (WCAG 2.2.2). It is a genuine page-wide switch: pausing settles every
drawing into its still composition, stops the signal loop, ends smooth scrolling
and disables pointer depth. The operating system's reduced-motion setting does
the same thing, and the control hides itself when that setting is already on.

Reduced motion is a designed still page, not a disabled one: the same
compositions, the same annotations, the signals placed at rest along their
routes rather than hidden, no smooth scrolling, no entrance states.

## Libraries

Vite and strict TypeScript remain the foundation. `motion` remains the single
animation engine — GSAP is genuinely free since 3.13, but a second full engine
would duplicate work `motion` already does. Two dependencies are new:

- **Lenis** (MIT) smooths wheel scrolling without taking the scrollbar, the
  keyboard or touch physics. It is never instantiated under reduced motion and
  is destroyed the moment that preference arrives.
- **SplitType** (ISC) measures line boxes for headings that are a single run of
  text. Headings written as sentences skip it entirely.

**No WebGL.** The research surveyed OGL, Three.js and `@paper-design/shaders`,
and an animated gradient field was rejected as decoration unrelated to the
argument the page makes. The same judgement rejected Rive and Lottie (each a
second binary runtime for content authored elsewhere) and CountUp/text-scramble
packages (~20 lines of `motion` each). `research/motion-libraries-2026-09-14.md`
records the candidates, licences and reasoning; `research/art-direction-2026-09-14.md`
records the reference study. Lucide and Motion licence notices travel with the
built assets in `public/assets/`.

The retired ribbon artwork, its generator, its two static SVGs and `svgo` were
removed: the drawing is rendered inline from one module, and nothing referenced
the generated files.

## Multi-page extension and content

The September 16 Lovable migration supersedes the previous homepage-only content
baseline. `CONTENT-SOURCES.md` and the migration manifest record the current
seven-page scope and every editorial replacement. Typography, colors, spacing
tokens, grid, original assets, schematic geometry and the single motion engine
are retained. `pages.css` extends the visual vocabulary with indexed industry
rows, a readable biography, a resource assessment and forthcoming essay entries.

Executives are directed toward usable systems; domain experts toward training
around their actual role, industry and company. Workshops, Workflows and
Automations replace the older offer names. The third drawing keeps its geometry
but describes company context, human review and repeatable work rather than a
new product promise. Internal geometry identifiers remain stable.

The full founder biography remains faithful to the source. Source samples stay
labeled as samples. Eight-hour savings remain a qualified target. Unconnected
forms state their limits and never claim delivery. Shared chrome and native
modal dialogs use the existing paper/ink surfaces, annotation font and focus
rules. Normal links preserve browser navigation and history across generated
static pages. Page-specific headers become opaque early enough to keep scrolled
copy clear, and mobile menus retain paper contrast over dark sections.
