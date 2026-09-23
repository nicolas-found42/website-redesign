# Site audit and remediation — 2026-09-22

Branch `fix/site-audit-remediation`, from `main` at `6baad73`. Coverage matrix,
engines and sampling: [coverage.md](coverage.md). Evidence: `before/`, `after/`
and `logs/` beside this file. Regression checks: `tests/audit-remediation.spec.ts`
(one test per finding group; 10 of 11 fail on the pre-fix source, and the 11th
guards against over-correction).

## Summary

| ID | Severity | Area | Finding | Status |
| --- | --- | --- | --- | --- |
| F01 | High | Interaction | Wheel/trackpad cannot scroll the inquiry and course dialogs or the open mobile menu; the page behind scrolls instead | Verified |
| F02 | Medium | Forms | Closing the inquiry dialog discards everything typed | Verified |
| F03 | Medium | Forms / a11y | Inquiry validation is one generic message, not tied to or specific to the failing field | Verified |
| F04 | Medium | Navigation | Industries dropdown stays open after an outside press or when focus leaves it | Verified |
| F05 | Medium | Navigation | Open mobile menu still reads "Menu ☰"; no visible close affordance | Verified |
| F06 | Low | Interaction | Dialog does not close on a backdrop click | Verified |
| F07 | Low | a11y (2.4.11) | Reverse-tabbed controls can come to rest partly under the sticky header | Verified |
| F08 | Low | Visual | Executive scene: pill covers "Your operating problem" (landscape); planner rule strikes the caption (≤430px portrait) | Verified |
| F09 | Low | Visual | Routes strike through drawing labels ("Your workflows", "Human direction", "Useful prompts", "Human review") | Verified |
| F10 | Low | Layout | Homepage resources foot is at the page gutter, not the centred 980px column above it | Verified |
| F11 | Low | Layout | Resources closing band has no vertical rhythm; an in-sentence link inflates one line | Verified |
| F12 | Low | Layout | Industry pages draw two parallel rules with an empty gap between head and grid | Verified |
| F13 | Low | Typography | Footer supporting note is overridden into a second display-size tagline | Verified |
| F14 | Low | Typography | Mobile menu "Industries" is lighter and differently tracked than its sibling links | Verified |
| F15 | Low | a11y (best practice) | Page-opening asides skip from h1 to h3 on four routes | Verified |
| F16 | Low | Typography | Trailing "→" wraps onto a line alone at phone widths | Verified |
| F17 | Low | Forms | Neutral outcomes ("Nothing was sent") are shown in error red | Verified |

No Critical findings. Nothing blocked. Product and brand decisions that were
recorded rather than changed are listed under **Open decisions** below.

## Findings

### F01 — High — Dialogs and the mobile menu ignore the wheel

- **Where:** shared dialog (`src/interactions.ts`) on every route; `#navigation` at ≤960px. Chromium, Firefox and WebKit.
- **Reproduce:** 1280×560. `/resources/` → Talk to us → wheel over the dialog. Also 900×360 → Menu → wheel.
- **Expected:** the dialog/menu scrolls. **Actual:** `dialog.scrollTop` stays 0 while `scrollY` moves 0→399 behind the modal. The menu stays at 0 while the page scrolls to 799.
- **Impact:** the inquiry dialog is ~980px tall, taller than a typical laptop viewport (1440×900 minus browser chrome). Its lower fields and the submit button can't be reached by wheel or trackpad, so mouse users can't complete the primary journey. In a short landscape window, "Talk to us" in the menu is unreachable the same way.
- **Root cause:** Lenis (`src/scroll.ts`) smooths every wheel event on the window. It was created without `prevent`/`allowNestedScroll`, so it swallowed wheel events aimed at nested scrollers and scrolled the document — even under `body { overflow: hidden }`.
- **Fix:** `prevent` lets any `<dialog>` and the open `#navigation` scroll natively (`src/scroll.ts`).
- **Evidence:** `before/F01-dialog-after-wheel-1280x560.png`, `before/menu-landscape-900x360-chromium.png`; `after/F01-dialog-wheel-scrolled-1280x560.png`, `after/F01-menu-landscape-scrolled-900x360.png`.
- **Verification:** passed in all three engines. The dialog reaches its submit button, the menu reaches "Talk to us", and `scrollY` stays 0. Two tests.

### F02 — Medium — Closing the dialog discards the inquiry

- **Reproduce:** open Talk to our team, type a name and a description, press Escape (or Close), reopen. **Actual:** empty fields.
- **Impact:** a stray Escape or backdrop click loses a visitor's written inquiry.
- **Root cause:** `openDialog` rebuilds the dialog's `innerHTML` on every open.
- **Fix:** values are saved per dialog type on `close` and restored on open. They're held in memory for the page only; nothing is stored or sent, consistent with the preview's no-send disclosure.
- **Verification:** passed (test `F02, F06`).

### F03 — Medium — Validation does not say which field is wrong

- **Reproduce:** submit with only the email invalid. **Actual:** "Complete every field with a valid work email. Name and company need at least 2 characters; describe the work in at least 10 characters." Focus goes to the email field, but the field has no description.
- **Impact:** visitors (and screen-reader users, who hear only the field label on focus) have to work out which rule they broke. See WCAG 3.3.1/3.3.3.
- **Fix:** each field is a `label[for]` + control + `.field-error`, linked by `aria-describedby`. A field-specific message appears only for failing fields. The summary keeps its "Complete every field" wording and counts the fields that need attention.
- **Evidence:** `before/F03-dialog-errors-1280.png` → `after/F03-dialog-field-errors-1280.png`.
- **Verification:** passed. The test asserts accessible descriptions, focus and the count. Axe is clean on the dialog in its error state.

### F04 — Medium — Industries dropdown does not dismiss

- **Reproduce:** 1280px. Open Industries, click the page, or Tab past it to About. **Actual:** stays open over the content (`before/industries-open-after-tab-1280.png`).
- **Fix:** at ≥961px, a press outside or focus leaving the `<details>` closes it. The narrow menu's inline list is deliberately left as the visitor set it.
- **Verification:** passed. Wide and narrow behaviour are each tested; the narrow test guards against over-correction.

### F05 — Medium — No visible way out of the mobile menu

- **Actual:** the full-screen menu's only control still reads "MENU ☰" (`before/F05-F14-menu-open-390.png`).
- **Fix:** the label becomes "Close menu" with an × icon while open. The accessible name contains the visible text (2.5.3), and `aria-expanded` is unchanged.
- **Verification:** passed (`after/F05-menu-open-390.png`). The existing keyboard and focus-trap tests still pass.

### F06 — Low — Backdrop click does not close the dialog

- **Fix:** a click on the dialog element outside its own box closes it; focus returns to the trigger. **Verification:** passed.

### F07 — Low — Focus can rest under the sticky header

- **Reproduce:** 1280×800 `/resources/`, Shift+Tab upward from the contact band. **Actual:** "Load the scorecard here" rested at top=41 with the header bottom at 72 — partly covered.
- **Root cause:** clearance was per element (`scroll-margin-top` on a few ids and on `[id]`), so controls without an id got none.
- **Fix:** one `html { scroll-padding-top }` replaces the scattered margins, so anchors and focus scrolling get the same clearance. Anchor tests still pass.
- **Verification:** passed in all three engines. Firefox brings focus into view a frame late, so the test asserts where the control comes to rest.

### F08 — Low — Executive scene labels covered

- **Actual:** at 1440px the "Install a system" pill covers "problem"; at 320–430px a planner rule runs through "Daily planner · illustrative" (`before/F08-*`).
- **Root cause:** the landscape label starts at x=120 and runs ~260 units right, into the pill at x=300. The portrait caption wraps to two lines above a rule at y=384.
- **Fix (`src/audiences.ts`, `src/styles/system.css`):** the landscape source node moves to x=70 and its label wraps within 220 units (`under` labels now honour `width`). The portrait planner rules move to y=430–670 inside the same panel.
- **Verification:** passed at 1440/390/320 (`after/F08-*`), measured in one pass relative to the field.

### F09 — Low — Routes strike through annotations

- **Fix:** `.system-label-text` gets a text halo in the band's own `--paper`, so routes break around letters and stay visible either side. It applies to paper and ink bands and is removed automatically in forced-colours mode.
- **Evidence:** `before/F09-industry-drawing-labels-1440.png` → `after/F09-industry-labels-zoom-1440.png`. **Verification:** visual inspection passed; no automated check (a halo has no reliable DOM assertion).

### F10–F14 — Low — Layout and typography

- **F10:** `.resource-foot` takes the column's `max-width: 980px; margin-inline: auto`. Tested (edges within 1px).
- **F11:** `.closing-band` rhythm. In-sentence `p .link` is inline and underlined (WCAG 2.5.8 exempts inline links).
- **F12:** `.industry-grid` no longer draws its own top border and margin. Tested.
- **F13:** `.footer-mark p:not(.note--plain)` keeps the tagline rule off the note, which now reads in the annotation voice.
- **F14:** the mobile summary has the links' weight and tracking.
- Before/after pairs for each are under `before/F1x-*` and `after/F1x-*`.

### F15 — Low — Heading order

- The aside title on `/resources/`, both industry pages and `/blog/` was an `h3` directly under the `h1`. It's now `h2.heading-h3`, with no visual change. Axe best-practice is clean on all routes (`logs/after-axe.txt`). Tested.

### F16 — Low — Orphaned arrows

- " →" became "&nbsp;→" across the source templates. A text-node scan at 320/390px on six routes finds no arrow on a line alone. The pre-fix state is visible in the 390px capture of the homepage proof band (`before/F16-proof-arrows-390.png`).

### F17 — Low — Neutral outcomes shown as errors

- `.form-status[data-state="done"]` renders in ink. Errors stay red. Tested (`after/F17-dialog-done-state-1280.png`).

## Hypotheses investigated and rejected

- **Mobile menu trapped by the lifted header's `backdrop-filter`:** already handled by `.site-header:has(#navigation.is-open)`. Verified full-viewport in three engines.
- **Header stays transparent after a jump:** the IntersectionObserver misses only programmatic instant jumps. Hero CTA, End key, wheel, reload and Back all lift correctly in Chromium and Firefox. Playwright WebKit doesn't restore scroll, so restoration is unverified there.
- **Blank browser-pane frames, a grid edge at one viewport height, a visible skip link, a dash under the logo, a missing headline at 200% text:** these were capture artefacts (a compositor artefact during Lenis scrolling, a `position: fixed` layer in full-page captures, a locator screenshot, a mid-transition frame, a mid-entrance frame). Each was rechecked in a settled state.
- **Services rail shows a stale pressed state:** reproducible only with instant programmatic scrolling; real scrolling passes each article through the observer band.

## Open decisions (recorded, not changed)

- **D1 — CTA icon semantics:** internal CTAs use ↗ ("arrow-up-right"), which conventionally means "leaves the site", while several external links use →. Changing this is a brand-system call.
- **D2 — "Read the full workshop testimonials →"** points to the found42.com homepage (checked destination in `docs/preview/expressive/destination-checks.json`). A dedicated testimonials URL would better match the label.
- **D3 — Blog opening** has two equal-weight primary buttons (Talk to our team, Join the list). Which action leads is a product call.
- **D4 — Logo link height** is 19px (below 24px), but spacing satisfies the WCAG 2.5.8 exception. Unchanged.
- **Unchanged by design:** forms send nothing, and delivery, enrollment and ScoreApp report delivery remain unconnected, as the preview discloses. The ScoreApp failure path was simulated by aborting the request (`before/scorecard-aborted-1280.png`); the status and direct link remained.

## Checks

| Check | Result |
| --- | --- |
| Baseline `npm test` at `6baad73` | 150 passed (`logs/baseline-tests.txt`) |
| `npm run typecheck` | passed |
| `npm run build` | passed (`logs/after-build.txt`) |
| `npm test` after | **183 passed** (150 existing + 33 new = 11 × 3 engines) (`logs/after-tests.txt`) |
| New spec against pre-fix source (Chromium) | 10 failed, 1 passed (the over-correction guard) |
| New spec `--repeat-each=3` | 99 passed |
| Prettier on changed files, `git diff --check` | passed |
| Axe (WCAG 2.2 AA + best practice), 8 routes × 390/1440, menu, dialog error state | clean (`logs/after-axe.txt`) |
| After matrix, 8 routes × 6 widths × Chromium/WebKit/Firefox | 0 overflow, 0 page errors, 0 failed requests (`after/report.json`, `after/webkit/`, `after/firefox/`) |
| Browser pane (Claude desktop) primary journey on the static build | passed, no console errors |

Not run: physical devices, real Safari, screen readers (VoiceOver/NVDA), and
live external submissions. See [coverage.md](coverage.md).
