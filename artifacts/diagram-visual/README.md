# Homepage diagram visual evidence

These captures show the production build served at `/website-redesign/` on
September 28, 2026. Desktop captures use a 1440 × 900 viewport; phone captures
use a 390 × 844 viewport. The still captures use the site's **Pause motion**
control, which settles each diagram on its last step. The animation capture
shows the live hero cycling through all three stages.

The comparable baseline is the merged [diagram-motion evidence](../diagram-motion/)
from PR #63. The original baseline files remain in that directory.

| Diagram group   | Earlier state                                               | New state                                                                                                                                                            |
| --------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero            | [Desktop baseline](../diagram-motion/hero-after.png)        | [Desktop](hero-desktop.png) · [Phone](hero-phone.png) · [Motion](hero-motion.gif)                                                                                    |
| Three audiences | [Desktop baseline](../diagram-motion/audiences-after.png)   | [Desktop group](audiences-desktop.png) · [Executive phone](executives-phone.png) · [Contributor phone](contributors-phone.png) · [Builder phone](builders-phone.png) |
| Services        | [Phone baseline](../diagram-motion/service-phone-after.png) | [Workshops phone](workshops-phone.png) · [Workflows phone](workflows-phone.png) · [Automations phone](automations-phone.png)                                         |

Individual desktop captures are also available for
[executives](executives-desktop.png),
[contributors](contributors-desktop.png),
[builders](builders-desktop.png),
[workshops](workshops-desktop.png),
[workflows](workflows-desktop.png), and
[automations](automations-desktop.png).

The screenshots and motion capture show the rendered result. Content, keyboard,
pause, reduced motion, no-script, reflow, and GitHub Pages path behavior were
checked separately in the browser test suite.
