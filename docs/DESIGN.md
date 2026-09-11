# Design decisions

Nicolas selected **light editorial** after the original desktop/mobile hero review, then requested all recommendations from `research/visual-design-critique-2026-09-09.md`, with creative ambition. This iteration preserves that selection and replaces the initial visual system. The original light/dark captures are historical; the old `?direction=dark` switch is retired. The selected design is at `/`.

## Art direction: business expertise, connected

The signature artwork is an original family of red ribbon connections. Training uses an interconnected loop; automation draws a route across functions; product value combines inputs into a customer workflow. It is an illustrative visual language, with no fabricated metrics, software interface or client proof. The geometry appears at three scales: the interactive hero, service illustrations and oversized fragments in the editorial resource feature and closing invitation.

The page pairs an open, pale hero with assertive Space Grotesk typography, a featured black/red reading composition, quieter supporting resources, a dark services section, a portrait/workshop spread and a full red inquiry invitation. The original Found42 logo and portrait bytes are preserved; the portrait is shown in grayscale through CSS. The original Manrope/Space Grotesk families remain locally bundled. The palette uses provisional Found42 red `#B70611`, ink `#20201F`, paper `#FAF9F6`, supporting grays and blue keyboard focus.

At 390px the H1 and both primary journeys precede the illustration. Supporting resource decoration is reduced, and shorter descriptions preserve each resource's purpose and access contract. Information labels are at least 14px at default settings and body copy is 16px or larger. Controls remain stationary while their icons respond to hover/focus. Normal scrolling is preserved. Enlarged text wraps; container queries give the diagram a readable grid when its labels need more space.

## Motion and implementation

Vite and strict TypeScript remain the application foundation. Motion's JavaScript hybrid `animate` API coordinates a 600ms node transition with 750ms SVG path drawing. Training, Automation and Product value are separate choices, not numbered required steps. They share click, keyboard and touch behavior; pressed state, the illustration's accessible name and its live description update together.

Complete still states are present independently of animation. A generation guard prevents stale callbacks after rapid switching. On a reduced-motion change, the controller stops movement, applies final node positions and replaces paths so queued SVG updates cannot leave partial lines. A browser regression compares that result with a fresh motionless rendering. Section entrances briefly move already-visible content once. Reduced motion also disables these entrances, smooth scrolling and decorative hover movement. No effect blocks the headline or actions.

Selected Lucide SVG icons unify arrows, menu and resource categories. SVGO prepares two static artwork assets; `npm run artwork` regenerates them from the same path source as the interactive illustration. Motion and icon licenses accompany the built assets. React Bits informed the research but no source was copied; GSAP and Anime.js remain researched alternatives, not additional engines. This follows the report's recommendations to select one engine and preserve the existing framework.

## Evidence and content

Work & Co informed editorial hierarchy, Red Antler the commitment to original artwork, and Linear the relationship between message and illustration. Their imagery, client logos and commercial claims were not reused. These are design references, not evidence of improved conversion.

The portrait and published founder biography sit alongside two explicitly attributed workshop excerpts. Andrew Miller's excerpt now addresses client conversations; it remains a report of his workshop experience. All three service scopes, four resource routes and their different gates, the ungated blog, and the inquiry form wording remain intact. No inactive course signup or unsupported numerical/ROI claims were added.

Current captures and measurements are in `preview/expressive/`; `VALIDATION.md` records actual coverage and limits. Main content contains approximately 620 words, plus navigation/footer. The measured JavaScript bundle is about 81kB raw / 29kB gzip, including the new motion engine; this is an application measurement, not a vendor size estimate.
