# Design decisions

Nicolas selected **light editorial** in this implementation conversation, after the light and dark alternatives were rendered at 1440px and 390px. Initial hero comparisons remain in `preview/hero-*.png`; `?direction=dark` is a review-only alternative, and `/` is the selected homepage.

Space Grotesk supplies an editorial headline with distinctive shapes; Manrope supports readable body copy. The original black/red logo anchors a pale neutral canvas. `#B70611` is the provisional red sampled by the audit, not an official brand standard. Black `#181818`, paper `#FAFAF8`, and restrained gray surfaces provide contrast and section rhythm. Red carries primary actions and emphasis; a blue outline distinguishes keyboard focus. Automated contrast checks cover the rendered page at three widths.

The opening shows the message and both actions before the decorative composition on mobile. Desktop pairs the headline with a task-to-workflow diagram. The task labels, flowing connectors and three selectable outcomes illustrate possibilities, with no metrics, fake dashboard or implied Found42 software. The three buttons work with click, touch, Enter and Space and announce a concise result.

The signature line animation stops after four seconds. Short section entrances run once and only translate already-visible content; headline and actions never wait for animation. Reduced-motion visitors get the same full composition and interactive states with no animation or smooth scrolling. A preference change cancels in-flight animations.

The specification’s prior research established React Bits and Motion as candidates. This composition uses native CSS, IntersectionObserver and Web Animations rather than adding either library: the required geometry, short entrances and accessible buttons fit those browser primitives without a framework. No 3D/WebGL capability or fallback mode is needed. This is a deliberate implementation choice; broad new library research was unnecessary for the selected effect. Actual effect validation is recorded separately.

Vite and strict TypeScript produce a small static bundle. Fonts and the actual logo/portrait are bundled. System fonts remain available while font files load. Dimensions reserve image space; normal document scrolling is preserved. The page has roughly 700 words including navigation and footer.
