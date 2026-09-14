# Art Direction Research — Found42 Homepage Redesign

Brand: red `#B70611`, ink `#20201F`, paper `#FAF9F6`, Space Grotesk (display) + Manrope (text). Direction: "light editorial." Stack: Vite + vanilla TS + CSS, static GitHub Pages.

## 1. Curated "awesome" lists reviewed

- **terkelg/awesome-creative-coding** — https://github.com/terkelg/awesome-creative-coding. 407 resources across Processing/p5.js/openFrameworks, web libraries (Pixi.js, Paper.js, Three.js), and showcase platforms (Shadertoy, CodePen, OpenProcessing, Chrome Experiments, CreativeApplications.Net). Confirms "interaction design + generative art + information visualization" as one continuum — useful for thinking about Found42's bespoke diagrams as small generative/interactive pieces rather than static illustrations.
- **Jolg42/awesome-typography** — https://github.com/Jolg42/awesome-typography. 341 resources, strong on variable-font tooling (Axis-Praxis, Wakamai Fondue, Type Network TypeTools) and OpenType feature testing. Reinforces that Space Grotesk/Manrope both ship as variable fonts — worth loading variable weight axes for fine-grained hero/body contrast instead of only 2–3 static cuts.
- **awesomelistsio/awesome-web-design** — https://github.com/awesomelistsio/awesome-web-design. Organizes Typography / Color / Layout & Grids / Inspiration / Design Systems. Points at Awwwards, Land-book as inspiration galleries and "Type Scale" as a sizing tool — validates using a modular type-scale ratio rather than ad hoc sizes.
- **brandonhimpfen/awesome-design** — https://github.com/brandonhimpfen/awesome-design. Broader UI/UX list; notably links Mobbin and UX Archive ("UI patterns from real apps") for interaction-pattern reference, and Material/Carbon as enterprise design-system exemplars for how systems document type/color tokens.
- **uhub/awesome-css** — https://github.com/uhub/awesome-css. CSS frameworks/animation/layout list (animate.css, Bulma, normalize.css). Less directly useful for art direction, more a checklist of baseline tooling; confirms CSS Grid + custom animation libraries as the default toolkit for this kind of build (no need for a framework given the vanilla TS/CSS stack).

These lists mostly function as **directories into implementations** — the real signal came from following them into live sites, below.

## 2. Site studies (11 real, live sites inspected — screenshots + computed styles pulled directly from the DOM)

### Linear — linear.app

Near-black bg `rgb(8,9,10)`. H1 56px/`Inter Variable`, weight 510, line-height 61.6px (1.1×), **letter-spacing -1.232px (-2.2%)**. H2 40px/-0.88px, body copy only 15px/24px. Left-aligned hero, no centering; headline sits flush left against a huge left gutter, with a live product screenshot (issue detail view, sidebar included) bleeding in immediately below the fold — the marketing page shows the _actual UI chrome_, not an illustration. Small "New · Loops →" changelog tag sits between subhead and screenshot as a low-key credibility/freshness signal. Footer is a dense 5-column sitemap (Product/Company/Resources/Connect/Legal) — 40+ links, no visual flourish, pure information density signaling maturity.

### Stripe — stripe.com

White bg, hero headline in **sohne-var, weight 300 (light)**, 46px/-0.9216px letter-spacing. Key move: **within one sentence**, "Financial infrastructure to grow your revenue" renders near-black/high-contrast while the continuation "Accept payments, offer financial services..." renders in a lighter blue-gray — color used to separate the _claim_ from the _elaboration_ inside a single paragraph, not just between blocks. Full-bleed diagonal mesh-gradient (violet→orange→pink) behind the hero only, gone by the second section. Logo wall (OpenAI, Amazon, Nvidia, Ford) directly under the CTA, no divider, small grayscale-ish logos in a single row.

### Vercel — vercel.com

Pure black `rgb(0,0,0)`. H1 "Agentic Infrastructure" 64px, weight 400, **letter-spacing -3.84px (-6%, extremely tight)**. Composition is asymmetric/grid-breaking: headline lower-left, a single glowing 3D triangle (radial white glow behind a black solid shape) dead-center as the entire "hero image," and three short right-aligned lines ("For coding agents / To ship apps and agents / Automated by agents") acting as an annotation/legend rather than body copy. Logo wall sits immediately under, tiny, monochrome-on-black.

### Resend — resend.com

Black bg. H1 uses **domaine (a serif)** at 96px/400 weight, while H2 uses a different sans (aBCFavorit) and UI chrome uses Inter — a genuine **mixed-typeface system**: serif for the emotional headline, grotesque sans for secondary claims, and a third workhorse sans for body/UI. Hero art is a photoreal 3D-rendered sculptural object (interlocking cube forms, brushed/speckled material) lit by a single soft spotlight from behind, sitting on the right against a vignette — not a screenshot, not an abstract gradient, an actual "product as sculpture" render.

### Clerk — clerk.com

Light paper-like bg `rgb(247,247,248)`. H1 64px, **weight 700 (bold, unusual among this set)**, -1.6px letter-spacing. Background behind the whole hero is a faint technical blueprint/schematic — thin grid lines with small square "solder pad" nodes at intersections, evoking a circuit board without being literal. A bordered terminal-style card ("Add Clerk auth to my app: clerk.com/SKILL.md") sits inside the hero as a piece of _content_, not a decoration — turns a code snippet into proof-of-simplicity. Logo wall directly below ("Trusted by fast-growing companies").

### Attio — attio.com

White/near-white bg (`lab(99.99...)`). Centered composition (contrast to Linear/Stripe/Vercel's left/asymmetric hero) — small pill-shaped announcement chip above a big centered H1 (64px, weight 600, Inter Display, -1.28px), then a two-line centered subhead in visibly lower-contrast gray, then two centered buttons. A very faint diagonal gradient wash only in the bottom third of the hero, almost invisible — color as a whisper, not a statement.

### Framer — framer.com

Black bg, three-line stacked H1 (42px/500/-1.68px, GT Walsheim), each line a separate clause ("Framer is the AI design agent / for every step / from idea to launch"), left-aligned. Directly under: a product-UI screenshot (a chat panel) wrapped in an intense blue glow — the "glowing product artifact on black" hero pattern recurs across Framer/Resend/Vercel and reads as the current default for AI-product marketing sites.

### basement.studio — basement.studio

The most extreme reference in the set: full-viewport real-time WebGL wireframe 3D scene (a rendered "basement" interior, dithered/half-tone shading) as the entire hero, with the nav overlaid on top. Nav items carry parenthetical live counts ("Showcase (26)", "Blog (29)", "Online (6)" with a pulsing red dot), and a "HUMAN / MACHINE" toggle switches the rendering style. Too maximalist for Found42's editorial direction, but the **numeric-index-as-metadata** micro-pattern (small counts/indices next to labels) is directly reusable.

### Locomotive — locomotive.ca

Black bg. On load, the hero renders as scrambled/glitching characters (random glyphs cycling) that decode letter-by-letter into the real headline and a small italic-serif wordmark treatment — a "text-scramble reveal" loading animation rather than a fade/slide. Minimal top bar: wordmark + registered mark, "Menu" text link, nothing else.

### Active Theory — activetheory.net

Black bg, preloader shows a fractional counter ("/26") next to a thin hatched line, then resolves into a particle-based WebGL scene. Reinforces that heavy motion-agency sites treat the **loading state itself as designed content** (percentage/fraction counters, not spinners).

### Work & Co — work.co

White bg, red top bar (full-width `#`-red strip, structurally identical to how Found42's red could crown every page). Logo is a solid red square badge top-left. H1 in Helvetica Now Display, 38px/500/-0.76px — restrained size for an agency hero, because the real weight is carried by an italic **Adobe Garamond Pro serif pull-quote** (18px/27px, -0.18px) with an em-dash attribution ("— Fast Company") directly below the headline: a magazine-style testimonial used _in the hero_, not relegated to a testimonials section. Case-study tiles are black cards containing a live thumbnail grid plus an oversized rotated wordmark ("JW ANDERSON") running vertically along the tile's right edge — oversized type used as a graphic/textural element, not for reading.

## 3. Techniques worth stealing (12, with CSS-level specifics)

1. **Tight negative tracking on display type, loosening as size drops.** Across every site, `letter-spacing` scales roughly `-0.02em` to `-0.06em` at 56–96px, down to `normal` at body sizes (15–18px). CSS: define per-step tracking in a type-scale custom-property map, e.g. `--track-hero: -0.03em; --track-h2: -0.02em; --track-body: 0;` rather than one global negative value.
   **Found42:** Apply to Space Grotesk display sizes only; leave Manrope body text at normal/slightly positive tracking for long-form readability at small sizes.

2. **Mixed-typeface headline systems (serif + grotesque + workhorse sans).** Resend (serif hero / grotesque H2 / Inter body) and Work & Co (sans headline / serif pull-quote) both use a _second_ typeface deliberately, not as an accident of scope creep.
   **Found42:** Space Grotesk carries structural headlines/numerals; introduce a serif (or Space Grotesk's own italic axis) _only_ for the founder-voice pull-quotes/testimonials, so the "editorial" claim shows up as an actual typographic decision, not just a two-font pairing used uniformly everywhere.

3. **Color used to separate claim from elaboration inside one sentence.** Stripe darkens the core claim and lightens the supporting clause within a single `<h1>`/`<p>` by wrapping spans and giving the elaboration `color: var(--muted)`.
   **Found42:** In the hero headline ("We help you put AI to work" style copy), wrap the outcome-noun in `color: var(--ink)` full-strength and the qualifying clause in a 60–70%-opacity ink or a warm gray, so red stays reserved for CTAs/accents rather than being spent on body emphasis.

4. **Oversized numerals / rotated type as texture, not for reading.** Work & Co's vertical "JW ANDERSON" wordmark inside a case-study tile; basement.studio's parenthetical nav counts.
   **Found42:** Use large tabular-numeral section indices (`01 Empower`, `02 Automate`, `03 Differentiate`) set at 30–40% of section height in a low-contrast tint of ink or paper-on-paper, positioned absolutely behind the section heading — turns Found42's three service pillars into a numbered system instead of three equal cards.

5. **Glow-behind-product-artifact hero pattern (Vercel, Resend, Framer).** A radial `box-shadow`/`filter: blur()` gradient placed behind a centered 3D object or UI screenshot on a near-black section.
   **Found42:** Found42 is light-editorial, not dark-mode SaaS, so invert the technique: use a soft _warm_ radial wash (red at 4–6% opacity) behind a hero diagram/portrait on the paper background instead of a glow-on-black, to get the same "single focal object with atmosphere" effect without borrowing the dark-SaaS palette.

6. **Testimonial-in-the-hero, not testimonials-section.** Work & Co puts one italic serif pull-quote with em-dash attribution directly under the H1, before any other content.
   **Found42:** Put one short client/founder credibility line (Richard Achée's own credibility, or a named early client outcome) as an italic aside directly under the hero subhead, styled distinctly (serif italic or Manrope italic) so it reads as "someone else's voice" breaking into the copy.

7. **Logo/proof wall immediately below the CTA, no section break.** Stripe/Vercel/Clerk all place a trust-logo row right under the primary buttons with no heading, divider, or padding change — it reads as part of the hero, not a separate "As seen in" block.
   **Found42:** If/when Found42 has client or partner logos, place them inline directly beneath the hero CTA row in monochrome ink-on-paper, not in a boxed section further down.

8. **Technical/schematic texture behind a light hero (Clerk).** A near-invisible blueprint-grid-with-nodes background using `background-image` on repeating small SVG tiles at very low opacity (roughly 4–8%).
   **Found42:** A faint circuitry/workflow-diagram tile (nodes + connecting lines evoking automation/pipelines) behind the hero at ~5% ink opacity would visually assert "workflow automation" as a texture without needing literal iconography.

9. **Loading/reveal state treated as designed content.** Locomotive's character-scramble decode; Active Theory's fractional preloader counter.
   **Found42:** A brief (300–500ms) letter-scramble-to-real-word effect on the hero headline on first paint (CSS `@keyframes` swapping a data attribute's character set, or a tiny JS scramble) reinforces "AI making sense of things" thematically, as long as it's skippable/instant for reduced-motion users (`prefers-reduced-motion`).

10. **Centered vs. asymmetric hero as a deliberate choice, not a default.** Attio centers everything; Linear/Stripe/Vercel/Framer are all left-aligned/asymmetric.
    **Found42:** Because the brand wants "editorial" (magazine, not app-marketing), default to **asymmetric left-aligned** hero type with a large right-side gutter reserved for a diagram/portrait — closer to a magazine feature spread than a centered SaaS landing page.

11. **Dense, categorized sitemap footer over minimal footer.** Linear's footer is 5 labeled columns, 40+ links — signals maturity/substance even for a small company, versus a single-row minimal footer which can read as thin.
    **Found42:** Even with a small page count, organize the footer into 3–4 labeled groups (Services / Company / Contact / Legal) rather than one flat row, and consider small-caps Manrope column labels at 12–13px tracked wide (`letter-spacing: 0.08em; text-transform: uppercase;`) to match the editorial register.

12. **Grid-breaking single focal object instead of a 3-up feature grid.** Vercel's centered glowing triangle with an asymmetric annotation list beside it, rather than three equal icon+text cards.
    **Found42:** For the "three pillars" section (training / automation / differentiation), avoid a symmetric 3-column card grid by default — consider one dominant visual (a single diagram showing the three connected as a system) with the three labels positioned as call-outs at different scales/weights, echoing Vercel's "one object + annotation list" composition instead of three identical boxes.

## 4. Candidate creative directions for Found42

### A. "Field Notes" — editorial-technical hybrid

- **Type hierarchy:** Space Grotesk hero at 64–80px, `-0.03em` tracking, set in ink on paper; Manrope italic for the one credibility pull-quote; tabular Space Grotesk numerals (`01 / 02 / 03`) oversized and screened back to ~8% ink as section markers.
- **Composition:** Asymmetric, left-aligned headline with a generous right gutter; a single faint schematic/workflow-diagram texture (technique 8) sits behind the hero at low opacity.
- **Color:** Paper `#FAF9F6` base, ink `#20201F` text, red `#B70611` reserved for exactly three things — the CTA button, the section-index numerals' rule/underline, and one accent line per section. Red never fills a whole background.
- **Spacing:** Wide, magazine-like — hero occupies close to full viewport height with a large top/bottom margin (~120–160px) between sections; body columns capped at ~65–72ch for editorial readability.
- **Imagery:** No stock photography; one or two custom line-diagrams (in ink + red) explaining "how an AI workflow actually changes a team's day," treated as illustration, not screenshots.
- **Motion:** Subtle only — a 300ms scramble-reveal on the hero headline (technique 9), gentle scroll-triggered fade/slide on section entries, no parallax, respects `prefers-reduced-motion`.

### B. "Proof & Process" — credibility-forward, Work & Co-style

- **Type hierarchy:** Restrained hero size (~40–48px Space Grotesk, weight 500) so the founder pull-quote (technique 6, serif or Manrope italic at 18–20px) can visually compete with the headline rather than being a footnote.
- **Composition:** Red top bar (technique from Work & Co) as a permanent brand crown across every page; logo/wordmark badge top-left in solid red.
- **Color:** Structural use of red as an edge/rule element (top bar, card borders, section dividers) rather than fills — red becomes a wayfinding device the eye tracks down the page.
- **Spacing:** Tighter than direction A — case-study/service tiles are dense black-on-paper-inverted cards (ink background, paper text) with an oversized rotated index number in the corner (technique 4).
- **Imagery:** Client outcome tiles rendered as dark cards with a large screenshot/diagram and an oversized rotated label, echoing the JW Anderson tile.
- **Motion:** Minimal — this direction leans on typographic confidence and information density instead of animation; the only motion is a hover-state reveal on case-study cards.

### C. "Signal" — AI-native, glow-on-light hero

- **Type hierarchy:** Very tight tracking (`-0.04em` to `-0.06em`, technique 1) on an oversized Space Grotesk hero (72–96px), pushing toward the Vercel/Resend scale rather than staying conservative.
- **Composition:** Centered or near-centered single focal diagram (technique 12) — one abstract "signal becoming structure" line-art object (nodes resolving into an org-chart/workflow) sitting where Vercel puts its glowing triangle, but rendered as a red-line illustration on paper instead of white-on-black.
- **Color:** Inverts the dark-SaaS glow pattern (technique 5) into a warm paper equivalent — a soft radial red-tinted wash (4–6% opacity) behind the central diagram only, everywhere else flat paper.
- **Spacing:** Generous, centered vertical rhythm; short line lengths in the hero (3 stacked clauses, Framer-style) rather than one long headline.
- **Imagery:** A single bespoke generative/interactive diagram (technique from the creative-coding list — an SVG or small canvas piece that gently animates nodes connecting) as the entire hero visual, no photography at all.
- **Motion:** The diagram itself is the motion — nodes/lines draw in and settle on load and on scroll into view; rest of the page stays static to keep the one moving element meaningful rather than decorative.

**Recommendation:** Direction A ("Field Notes") most directly matches the stated "light editorial" brief while borrowing the strongest, most implementable techniques (asymmetric hero, restrained red, oversized numerals, editorial pull-quote) without importing dark-SaaS or maximalist-agency conventions that would fight the paper/ink palette.
