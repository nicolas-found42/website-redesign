# Design decisions

The seven-page preview uses a calm business-site voice around the **Working Drawings** system. [ADR 0005](adr/0005-approachable-visual-voice.md) governs the current presentation; [ADRs 0002–0004](adr/0002-working-system-drawing.md) retain the drawing, scene and narrow-layout behavior. Earlier expressive and technical treatments remain in `preview/expressive/`, `preview/` and Git history as historical design evidence.

## Visual language

Space Grotesk carries display headings and Manrope carries the main reading and interface text. JetBrains Mono remains for small machine-like labels inside diagrams. The former printed grid, paper grain, section numbers and repeated figure captions have been removed from visitor-facing pages. Paper, ink and restrained red surfaces establish hierarchy through spacing, tone and a few purposeful dividers. Red identifies human direction and moving signals in the drawings, then marks selected controls and important actions elsewhere.

The working-system schematic still uses five recurring node identities and routed lines. It is a visual explanation of work moving through people, Found42's contribution, review and a usable result. The homepage opens with a master composition; Workshops, Workflows and Automations each have a distinct service composition. Landscape and portrait layouts are separately authored so labels remain readable on narrow screens. The diagrams describe a possible customer journey, not a product interface, a deployed customer system or a measured outcome. [ADR 0002](adr/0002-working-system-drawing.md) records the drawing architecture.

## Homepage journeys

The opening headline is “Train teams. Build useful skills. Automate the work.” Its supporting copy explains Claude, says in half a sentence what a skill is, and keeps judgment with the customer's team. **Explore free resources** opens the full Resources page; the outlined **Talk to our team** opens the inquiry dialog, whose live-form handoff sits beside the published email and phone number. A published, attributed workshop quote sits beside the opening claim.

**How we deliver our services** sits on the paper ground (ADR 0005) and opens with one hypothetical, plain-language example: an emailed purchase order, a skill that drafts the order entry, and the order desk approving it.

**Start Here** previews the native AI Readiness Scorecard and the public C-Level AI Toolkit. The full Resources page owns the five-item inventory and its access and availability details. The scorecard runs in the browser and gives a readiness stage and next steps; its external ScoreApp report is a separate, gated experience. The Toolkit opens its public page. The published playbook opens its existing request route. The Skills Starter Library and five-day Strategic Advisor Mini-Course remain visibly unavailable, grouped under **Coming later** after the resources a visitor can use today; the verified Maven lesson is identified separately from that course. No local resource form claims to send or fulfill a request.

**Who Found42 helps** presents three audience scenes and contextual actions. Executives see a hypothetical operating view and an interim C-Level AI route pending owner approval. Individual contributors receive a recommendation tied to the current catalog. AI builders receive an inquiry route for support, with the unavailable course state visible beside it. The selected panel, rail and accessible scene description agree; without script, every panel and still scene remains readable. The executive example is illustrative, not a client artifact. [ADR 0003](adr/0003-audience-scenes.md) records the scene behavior.

**How we deliver our services** keeps Workshops, Workflows and Automations fully readable. Each article explains the customer's starting material, Found42's work, participation or review, and the result. Its **Discuss…** action names the published service in the dialog. The live contact form uses its own Training/Automation interest vocabulary, so the handoff also gives visitors the service name to carry into that form. An inquiry requests a conversation; it is not a booked meeting. The Services page adds a comparison of what each engagement starts with, asks from the customer and gives back, without inventing a fixed fee or term.

## Motion and interaction

On wide screens the service drawing stays beside articles as they scroll, following the article crossing the viewport's middle band. The choice rail jumps directly to an article; the latest choice remains authoritative while its jump settles. On narrow screens each article has its own portrait drawing and the rail remains available above the sequence. All article copy is present independently of the drawing. [ADR 0004](adr/0004-narrow-services-sequence.md) records the responsive interaction.

Drawings arrive in stages, then rest as complete compositions. The pause control and the operating system's reduced-motion setting settle transitions, stop travelling signals and pointer depth, and end smooth scrolling. A preference change during a service jump lands on the chosen article and leaves a complete drawing. No content depends on an animation finishing. The scene gallery supports pointer, arrow-button and keyboard choices while preserving focus.

## Pages, handoffs and release

The September 16 migration established the seven routes; [the content sources](CONTENT-SOURCES.md) and [site map](SITE-MAP.md) record their provenance and structure. The September 23 revision changes copy, journeys and presentation across those routes while preserving base-aware static navigation, direct entry and no-script content. Public resources, learning offerings, services and inquiries remain separate concepts in the [context map](../CONTEXT-MAP.md).

The shared dialog explains what the existing live contact form asks and what happens after an inquiry. It never reports a local submission as sent. Service names and the form's interest labels are intentionally distinct; the external HubSpot fields, consent defaults and routing remain owner decisions. Resource requests likewise remain separate from consultations. External destinations and fulfillment need owner-approved verification before release. The preview retains noindex until the separate production launch decision.
