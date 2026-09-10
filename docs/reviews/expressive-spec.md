# Spec review — expressive homepage

Second sequential self-review, using `git diff d3592fa5596c0acb4ecd6ef0ffa535cd46fec7cf` in working-tree mode. Sources: the user's request to implement all recommendations creatively, `research/visual-design-critique-2026-09-09.md`, and the existing `SPEC-PLAN.md`. The Standards report was saved before this pass.

All six proposed visual priorities are implemented: original open-field SVG artwork; a featured resource and compact supporting entries; larger informational type; integrated founder/workshop composition; three visibly different animated states; consistent SVG icons and stationary controls with focus/hover feedback. Motion is the selected engine; GSAP/Anime.js are alternatives in the research, not requirements to install. The former review-only dark direction is retired in favor of the user's selected light page.

The 390px resource section is approximately 20% shorter, and services start approximately 520px earlier than the measured research baseline. Every resource gate and destination remains. Three service scopes, workshop-specific attribution, published biography, the ungated blog, immediate resource/inquiry actions and truthful contact wording remain intact. The selected Andrew Miller excerpt was rechecked against the rendered source. No numerical/ROI promises, inactive-course signup or fabricated product interface was found. Approximately 620 main-content words remain within the specification's intended range.

Remaining acceptance/coverage findings:

1. **Real devices and full branded-browser matrix remain unverified.** The research asks to “check ... real-device behavior”; the original spec explicitly says emulation does not establish it. Playwright Chromium, Firefox and WebKit plus installed Chrome were tested/rendered. Physical iOS/Android, branded Edge/Safari/Firefox and screen-reader sessions were unavailable and are not claimed as passes.
2. **Public hosting remains pending.** “Deliver the hosted preview” / “Verify the deployed GitHub Pages build” require a deployment after merge. The production build works locally at `/website-redesign/`; this does not prove a hosted deployment.
3. **Final visual/content acceptance remains Nicolas's decision.** The prior hero choice is approved; this more expressive completed version is ready for review. No outside-reader study was performed.

**Spec: 3 acceptance/coverage findings; no remaining local implementation defect.** The broadest verification gap is the actual-device/browser matrix. These findings preserve the original acceptance boundaries rather than assuming them complete.
