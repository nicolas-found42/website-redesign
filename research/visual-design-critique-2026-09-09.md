# Found42 visual critique and improvement research

**Recommendation:** keep the approved light, black/red identity and the existing visitor journeys. Give the page a stronger visual composition, a workflow illustration whose geometry responds to the visitor, a more varied resource layout, and more prominent human credibility. Use **Motion for JavaScript** for the workflow if sequencing warrants a library, with **Lucide SVGs** and **SVGO** as small supporting tools. Most of the improvement should come from art direction and layout before animation.

Research date: September 9, 2026, America/New_York. This is research, not a new implementation or an approved redesign specification.

## Question and method

How can the current homepage become more distinctive and visually compelling for business executives while preserving truthful content, accessible interactions, the approved light direction, normal scrolling and static GitHub Pages deployment?

The requested five-agent critique was **simulated as five specialist lenses within one agent**. These are design judgments, not five independent reviewers, user interviews, conversion evidence or a vote. The evidence pass used the current rendered page, repository source, official documentation/source code, and rendered first-party design examples. Context Awesome and the Firecrawl developer index helped discovery; claims below were checked against the source that owns them. gh_grep located an actual React Bits implementation; GitHub's API confirmed its source and the Motion example.

Page under review: [homepage implementation at d3592fa](https://github.com/nicolas-found42/website-redesign/tree/d3592fa5596c0acb4ecd6ef0ffa535cd46fec7cf). The [spec](https://github.com/nicolas-found42/website-redesign/blob/52f91a6/SPEC-PLAN.md), [audit](https://github.com/nicolas-found42/website-redesign/blob/52f91a6/docs/contexts/SITE-AUDIT.md), and [design record](https://github.com/nicolas-found42/website-redesign/blob/d3592fa/docs/DESIGN.md) supply constraints. The active preview at `http://127.0.0.1:4173/` was inspected without changing it. A separate research branch from latest main preserves that running preview and its implementation branch.

## Observed evidence from the current page

At 1440px, the page has a split hero, three equal-width resource cards, text-led service rows, two short testimonials and a founder section. At 390px, the same major visual elements stack vertically. The existing H1, logo, red primary CTA, inquiry labeling, gates and keyboard support form a useful foundation. These observations are visible in the committed [desktop capture](https://github.com/nicolas-found42/website-redesign/blob/d3592fa/docs/preview/chromium-full-1440.png) and [mobile capture](https://github.com/nicolas-found42/website-redesign/blob/d3592fa/docs/preview/chromium-full-390.png).

Fresh DOM measurements after fonts loaded, using Playwright Chromium, 844px viewport height:

| Measurement                               | 1440px wide | 390px wide |
| ----------------------------------------- | ----------: | ---------: |
| Hero section height, excluding header     |       728px |    1,076px |
| Resources section height                  |     1,187px |    2,553px |
| Services start, from document top         |     2,023px |    3,707px |
| Proof section start, from document top    |     2,892px |    5,032px |
| Workflow button text                      |        11px |       11px |
| Workflow button dimensions, approximately |  167 × 53px |  96 × 51px |

These are layout observations, not universal browser dimensions or performance results. The mobile resource section alone spans about three 844px screens. The buttons are substantial hit areas; their small text is a readability/craft issue, not evidence of a target-size failure. In [main.ts](https://github.com/nicolas-found42/website-redesign/blob/d3592fa/src/main.ts), selecting a workflow button changes pressed state and descriptive text but not the task arrangement or connections. The [stylesheet](https://github.com/nicolas-found42/website-redesign/blob/d3592fa/src/style.css) contains many 10–12px labels and repeated pale, bordered surfaces.

## Five specialist critiques

### 1. Art director — recognizability and composition

**What works:** the brand is legible, the red headline emphasis is clear, and the restraint fits an executive audience.

**Critique:** the repeated pale boxes, hairline rules and evenly spaced sections give nearly everything the same visual weight. The tilted sticky-note diagram is understandable but could belong to many AI consultancies. The page needs a recognizable graphic idea that carries beyond the logo.

**Proposed response:** develop a red connection motif: business inputs become an orderly set of useful outputs. Let that graphic occupy an open field rather than another pale container. Repeat a small version in the service section and closing invitation. Preserve the original logo; this motif is supporting artwork, not a replacement identity. Use one larger editorial resource feature and more compact supporting entries to introduce asymmetry.

### 2. Executive communications editor — specificity and trust

**What works:** the page explains three real service categories and clearly separates free resources from consultation inquiries.

**Critique:** much of the strongest visual space contains generic phrases such as “Context. Challenge. Possibility.” The founder and meaningful evidence arrive late, particularly on mobile. The very short Andrew Miller excerpt conveys approval but little about what changed in his experience.

**Proposed response:** make the graphics explain the differences between learning, workflow implementation and SaaS product value. Bring the existing portrait, founder name and biography link into a more cohesive composition with the workshop excerpts. Consider a longer source-checked workshop excerpt about coaching or client conversations, with workshop attribution retained. Do not turn those experiences into proof of automation delivery, guaranteed results or employer endorsements. This is a recommendation for a later copy pass, not new approved copy.

### 3. Interaction designer — meaning and response

**What works:** the workflow buttons already work with mouse, keyboard and touch, and expose their selected state.

**Critique:** the visible response is too small for the prominence of the illustration. The numbered Empower/Automate/Differentiate choices may also suggest required sequential steps, although these are distinct ways to get help.

**Proposed response:** make the three controls select three visibly different arrangements. Training can show one task supported by prompts and human review; automation can connect work across roles; product differentiation can connect expertise to a customer workflow. Treat these as explicitly illustrative possibilities. Update the short accessible description with each state. Prefer labeled choices over numbered steps. Keep the CTA stationary and available during transitions.

### 4. Accessibility and mobile designer — readability and flow

**What works:** there is a meaningful heading structure, visible focus, motion preference support, generous main actions and truthful access information.

**Critique:** shrinking secondary text creates hierarchy at the expense of comfortable reading. Mobile stacks the full decorative treatment of all three resource cards, pushing service discovery far down the page. An automated accessibility pass does not establish visual comfort or full assistive-technology coverage.

**Proposed response:** use approximately 16px body copy and 14px information labels as design targets, expressed with relative units; these are proposed craft values, not WCAG minimum font sizes. Retain every gate but place it close to the relevant action. Make one resource visually featured and the other entries more compact on mobile. Aim for at least 44px comfortable controls while recognizing that WCAG 2.2 AA's target criterion is 24 × 24 CSS pixels with exceptions. Disable nonessential movement for reduced-motion users while retaining full content and clear selected states. [W3C target-size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), [W3C animation-from-interactions guidance, Level AAA](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html).

### 5. Frontend performance engineer — fidelity and maintainability

**What works:** the site is static, locally bundled and already small in application JavaScript. Its current rendering does not require React or WebGL. The original validation correctly identifies local timing samples as synthetic. [Package manifest](https://github.com/nicolas-found42/website-redesign/blob/d3592fa/package.json), [validation record](https://github.com/nicolas-found42/website-redesign/blob/d3592fa/docs/VALIDATION.md).

**Critique:** adopting several effect libraries would add integration work before resolving the visual problem. Inconsistent Unicode symbols also leave icon appearance to the platform. The most valuable future motion involves a specific diagram, so it should have a bounded implementation and lifecycle.

**Proposed response:** preserve Vite/TypeScript. Use CSS Grid, typography and SVG artwork for the composition; choose one motion engine for coordinated state transitions if needed. Use a small consistent SVG icon set. Check the actual built bundle and real-device behavior after implementation; vendor size claims are not a measurement of this application's cost.

## Synthesis and priorities

The simulated perspectives agree on three priorities: a more specific hero graphic, stronger variation in composition, and a shorter mobile resource sequence. Their tension is useful: more visual drama must not make the actions harder to find or the page longer. Resolve it with one signature graphic and better hierarchy, while keeping resource gates and service copy visible.

| Priority | Proposed change                                                       | Why it comes first                                                   | Future acceptance check                                                                                                         |
| -------- | --------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| P1       | Recompose the hero around an open, original SVG workflow              | Establishes a distinctive visual idea                                | Still recognizable and understandable in a motionless screenshot; H1/actions immediately visible at 390px                       |
| P1       | Featured resource plus compact supporting entries                     | Gives the section hierarchy and reduces repetitive mobile decoration | All four resource routes and gates remain; service discovery requires materially less scrolling than the measured 3,707px start |
| P1       | Increase small informational type and simplify ornamental labels      | Improves reading quality without a dependency                        | Review actual reading at 390px and browser zoom, with no clipped or hidden disclosures                                          |
| P2       | Compose portrait and workshop proof as one stronger editorial section | Adds human character using existing credible assets                  | Attribution stays adjacent; no implied employer/client endorsement                                                              |
| P2       | Animate the diagram's selected state, not just its caption            | Makes the interaction worth using                                    | Mouse, touch and keyboard change the same state; rapid toggles and reduced motion work                                          |
| P3       | Unify icons and refine short hover/focus responses                    | Finishes the visual system                                           | Consistent stroke/size, stationary target, distinct keyboard focus                                                              |

These are proposed implementation priorities. There is no evidence here that they will increase inquiries by a particular amount.

## First-party visual examples

All three sites were read and rendered at 1440px during this pass, including the opening and the next viewport. They are references for transferable techniques, not templates, sources of reusable media, or evidence of conversion performance. Their mobile behavior and complete accessibility were not audited.

| Example                                  | What was observed                                                                                                                        | Transfer to Found42                                                                                             | Boundary                                                                                                                                                     |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Work & Co](https://work.co/)            | White field, assertive black typography, a red brand accent, an offset editorial grid, a prominent attributed quotation and work imagery | Strongest reference for executive credibility and deliberate asymmetry; pair concise copy with visual evidence  | Use Found42's actual evidence; the reference's clients, press claims and cookie overlay do not transfer                                                      |
| [Red Antler](https://www.redantler.com/) | A large expressive moving image followed by a dark field and a varied visual project grid                                                | Borrow the commitment to one memorable visual idea and varied image/feature scale                               | Its artwork-first opening delays the proposition; Found42 should retain its immediate H1 and actions. Do not borrow its imagery or broaden Found42's palette |
| [Linear](https://linear.app/)            | Large deliberate type, quiet surfaces and a detailed interface narrative tied to the product message                                     | Borrow close alignment between the illustration and what the business does, plus precise typography and spacing | Found42 sells services; a simulated product dashboard or copied customer-logo strip would misrepresent it. The selected light direction remains              |

The practical direction is **Work & Co's editorial discipline, a more distinctive graphic commitment inspired by Red Antler, and Linear's relationship between message and illustration**, expressed through Found42's own content and black/red identity.

## Tools and libraries: evidence and fit

### Recommended: Motion for JavaScript, if the diagram needs sequencing

The official `animate` API works directly with HTML/SVG elements or selectors, without requiring React. Its hybrid build supports independent transforms, SVG path drawing and animation sequences; the mini build supports a narrower set of style animations through native APIs. The docs advertise approximate sizes of 2.3kb and 18kb respectively, but those are vendor figures, not a measured incremental bundle cost for this page. [Motion animate documentation](https://motion.dev/docs/animate).

**Application:** draw connections while task groups rearrange when a visitor selects an outcome. Hybrid is the relevant candidate if using its sequence/path APIs; do not choose mini and assume those same features are available. Preserve native `matchMedia` handling for the vanilla integration. The official [reduced-motion source example](https://github.com/motiondivision/motion/blob/e871ba7f175d0609cef84f416f984e8e84be8333/dev/react/src/examples/useReducedMotion.tsx) is React-specific: it illustrates adapting transitions, not a hook to paste into this vanilla page.

**Decision:** preferred single engine for the proposed modest interaction. Prototype one workflow transition and measure the result before adopting it page-wide. Do not add React to get this capability.

### Alternative: GSAP

`gsap.matchMedia()` scopes animation setup to media-query conditions and automatically reverts the animations and ScrollTriggers created in that context as conditions change. Its official page includes desktop/mobile and reduced-motion examples. [GSAP matchMedia documentation and demos](<https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/>).

**Application:** a more elaborate choreography with multiple breakpoint-specific sequences could benefit from this lifecycle management.

**Decision:** credible alternative if art direction demands more timeline control. Do not combine it with Motion for the same diagram. The existence of ScrollTrigger's pin/scrub features is not a reason to add pinned scenes or replace normal scrolling.

### Alternative: Anime.js

Official SVG utilities cover `morphTo`, `createDrawable` and `createMotionPath`, with standalone SVG imports available. [Anime.js SVG documentation](https://animejs.com/documentation/svg/).

**Application:** use if morphing between SVG shapes becomes the central creative requirement.

**Decision:** conditional alternative, not an additional dependency. The proposed task rearrangement and path drawing do not yet require SVG morphing.

### Selective inspiration: React Bits

The project supplies animated React components in JS/TS and CSS/Tailwind variants. Its first-party repository also lists Background Studio, Shape Magic and Texture Lab as creative tools with export options. [React Bits repository](https://github.com/DavidHDev/react-bits).

The inspected [TypeScript/CSS SpotlightCard source](https://github.com/DavidHDev/react-bits/blob/625f25025fed1c28e2de7d3ac5f12ee83542844d/src/ts-default/Components/SpotlightCard/SpotlightCard.tsx) updates CSS variables from a mouse-move handler; that variant contains no keyboard/touch/reduced-motion treatment. Other variants differ, so audit the exact component selected. This is not evidence that the whole library is inaccessible.

**Application:** optional inspiration for a bounded decorative highlight or for authoring texture assets. The published Magnet demo describes a hover-driven pull effect. [Magnet documentation](https://reactbits.dev/animations/magnet).

**Decision:** no framework migration to install decorative components; no magnetic CTA, scroll takeover, or shader background in this iteration. The current project license is **MIT plus a Commons Clause condition**, not plain MIT. Preserve the project's actual terms if source is adopted. [Pinned license](https://github.com/DavidHDev/react-bits/blob/625f25025fed1c28e2de7d3ac5f12ee83542844d/LICENSE.md).

### Supporting tools: Lucide and SVGO

Lucide provides SVG icons with static and vanilla-web options, and documents shipping only used icons through suitable imports. [Lucide guide](https://lucide.dev/guide/). Use a few consistent icons for the menu, arrows and resource categories; retain text labels and hide decorative SVGs from assistive technology. This replaces the mixed `⌘`, `◎`, `✳` and arrow glyph treatment without importing an entire UI framework.

SVGO is a Node.js tool for optimizing SVG assets, including redundant editor metadata and other unnecessary data. [SVGO introduction](https://svgo.dev/docs/introduction/). Use it during asset preparation, then inspect the result; preserve IDs needed by animation and relevant accessible names. It is build-time tooling, not a browser animation dependency.

### Native CSS remains the first tool

Use Grid to vary the resource layout, relative type sizes and `clamp()` for fluid scale, and test `text-wrap: balance` on short headings. MDN describes balance as improving line-length distribution and notes browser differences and line-count limits; it is not a guarantee of an identical line break in every browser. [MDN text-wrap](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-wrap).

Most of the proposed visual gain—stronger sections, a better portrait crop, improved proportions and readable type—does not need an animation library. No new font family is recommended until the existing Space Grotesk/Manrope hierarchy is improved.

## Suggested next implementation pass

1. Keep all approved content and destinations. Recompose the selected light page at 1440px and 390px before adding effects. Produce a stronger hero graphic, resource hierarchy and portrait/proof composition.
2. Author the workflow as layered SVG/HTML with three meaningful selectable states. Keep semantic controls and text in the DOM, and make the still states complete.
3. Add one short, interruptible state transition with Motion JS if native animation coordination becomes cumbersome. Reuse the same selected-state logic for mouse, keyboard and touch; reduced motion changes the transition, not the content.
4. Render-check all sections, keyboard focus, enlarged text, intermediate widths and 390px. Recheck the original content contracts and run the existing browser suite. Measure the actual bundle and real-device interaction; do not treat vendor demos or localhost timings as production validation.

## Evidence limits

No page source, live forms, dependencies or deployed site were changed in this research pass. No library was installed or benchmarked. Reference screenshots were temporary inspection material; only this Markdown report is proposed for the repository. Discovery results from secondary sites were not used as technical authority. Official docs can change; the pinned source links record the exact React Bits and Motion code inspected. Brand references remain subjective examples, and the five simulated lenses do not establish independent expert consensus.
