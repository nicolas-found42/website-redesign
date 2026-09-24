# Approved homepage composition

**Status:** accepted (2026-09-24)

Issue #58 replaces the homepage presentation with Adejoke's approved HTML mockup. The homepage keeps the existing `renderHomepage()` and `mountPage()` boundary, shared header, routes, inquiry handoff, and opt-in review mode. Its new renderer supplies the mockup's section order, copy, company row, counts, three audience cards, service selector, illustrative briefing, five attributed testimonials, founder strip, resources, and inquiry band.

The homepage uses simple static diagrams and card composition. This supersedes the **homepage presentation** portions of [ADR 0002](0002-working-system-drawing.md), [ADR 0003](0003-audience-scenes.md), [ADR 0004](0004-narrow-services-sequence.md), and [ADR 0005](0005-approachable-visual-voice.md). Their drawing systems remain available to other pages. The selector hides alternate panels only after JavaScript mounts; the prerendered page exposes all three without script. The testimonial cards remain in the document and scroll horizontally; with script, the arrow controls rotate their reading order so each selection comes to the front even when three cards fit on desktop. Homepage inquiry links point directly to the live form without script and open the shared contextual handoff when enhanced. Five published portraits are bundled locally. The briefing controls are visual labels because the example has no live integration.

Homepage tests now follow the page-level browser seam chosen in issue #56. Earlier tests that asserted the superseded homepage drawing engines or section markup are retired; browser checks cover the approved content and interactions instead.
