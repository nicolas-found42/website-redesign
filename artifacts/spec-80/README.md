# Issue 80 implementation evidence

These screenshots show the executive timeline, audience sequence, organization
strip and approved service wording on the production prerendered preview.
The source of truth is [issue 80](https://github.com/nicolas-found42/website-redesign/issues/80).

## Screenshot review

Normal-width captures use Chromium at 1440×1000, 384×686 and 384×742.
Finite entrances are completed for section screenshots so every label can be
reviewed. Workflows and Automations article crops use reduced motion so each
article shows its own complete drawing rather than its arrival transition.

The phone executive composition stacks four cards. The wide composition uses
two rows with arrows in reading order. The final card carries the red
"You decide" mark; captions name the four items and disclose that they are
illustrative rather than client results or live integrations.

The organization strip crops show the moving viewport, and the reduced-motion
crops show all fifteen marks in wrapped rows. Official marks keep their original
proportions and colours, including dark-background tiles. Some official files
are symbol-only or include a tagline; asset provenance and source limits are
recorded in [CONTENT-SOURCES.md](../../docs/CONTENT-SOURCES.md).

| Section                   | Desktop                                            | Phone 384×686                                    | Phone 384×742                                    |
| ------------------------- | -------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------ |
| Organizations             | [Strip](organizations-1440x1000.png)               | [Strip](organizations-384x686.png)               | [Strip](organizations-384x742.png)               |
| All marks, reduced motion | [Wrapped row](organizations-reduced-1440x1000.png) | [Wrapped row](organizations-reduced-384x686.png) | [Wrapped row](organizations-reduced-384x742.png) |
| Executive and audiences   | [Home sequence](audiences-1440x1000.png)           | [Executive article](audiences-384x686.png)       | [Executive article](audiences-384x742.png)       |
| Workflows                 | [Article](workflows-1440x1000.png)                 | [Article](workflows-384x686.png)                 | [Article](workflows-384x742.png)                 |
| Automations               | [Article](automations-1440x1000.png)               | [Article](automations-384x686.png)               | [Article](automations-384x742.png)               |

Additional audience compositions: [contributors on desktop](audience-contributors-1440x1000.png),
[builders on desktop](audience-builders-1440x1000.png),
[contributors on phone](audience-contributors-384x742.png) and
[builders on phone](audience-builders-384x742.png).

[Services desktop audience sequence](services-audiences-1440x1000.png) uses the
same shared articles and scene content as Home.

Additional Home and Services captures cover reduced motion, scripting disabled
and 200% root text at 384×742. Full article crops omit sticky chrome so the entire
scene can be inspected; matching viewport captures retain the actual chrome and
rail. [Browser measurements](browser-checks.json) record all three audience
articles and their visible scenes on both routes and no horizontal overflow.

## Validation

- Full lint and production build passed, including TypeScript and prerendering.
- The integrated browser run covered 272 cases in Chromium, Firefox and WebKit:
  260 passed initially; the 12 failures passed when rerun with one worker.
  These included host-load timeouts and a rapid-navigation settling assertion
  corrected to wait for the actual rendered landing.
- Six additional browser regressions passed across all three engines for phone
  keyboard progression and hidden pinned-scene animation.
- True 200% text checks at 384, 1024 and 1440px passed twice in every engine.
  The test verifies a 32px computed root font size and the rendered resting
  composition, including decision-mark containment and disclosure spacing.
  Its corrected assertion failed before fix `ae67fa3`.
- Executive content, ordinary label fit and no-script phone compositions at
  384×686 and 384×742 passed across all three engines.
- Screenshot review covers desktop, both phone heights, reduced motion,
  no script and true 200% text on Home and Services. Browser measurements
  show all three articles and scenes and no horizontal overflow.

[Review findings and resolutions](REVIEW.md) record zero outstanding standards
or spec findings. The pull request records final GitHub CI results.
