# Coverage — 2026-09-22 audit

Environment: macOS, Node 26.9, Playwright 1.63 with bundled Chromium, Firefox
and WebKit, against the strict static server (`npm run preview:pages`,
`http://127.0.0.1:4179/website-redesign/`) and the Vite dev server (port 4173).
Plus one pass in the Claude desktop browser pane (Chromium-based). Playwright
WebKit is not Safari, and mobile emulation is not a physical phone.

## Inventory

**Routes (all eight tested):** `/`, `/resources/`, `/services/`,
`/industries/private-equity/`, `/industries/b2b-saas/`, `/about/`, `/blog/`,
and an unknown path (real 404 page). There are no generated collections; each
route is its own template. The two industry pages share one template, and both
were tested.

**Shared layout:** skip link, sticky header (lift and ground switching),
desktop nav with the Industries `<details>`, mobile full-screen menu, footer,
inquiry band, motion toggle.

**Interactive states:** inquiry dialog (empty, partly invalid, valid, long
input, close/reopen, Escape, backdrop, focus trap), course dialog, four email
gates (invalid/valid), workflow-preview assessment (all answers → result, Back,
Retake), ScoreApp on-demand embed (normal load and a simulated network failure
via request abort — no details entered), audience gallery (rail, arrows, keys),
services rail, motion pause.

**Primary journeys:** home → Explore free resources → a resource; home/any
page → Talk to us → inquiry → the live-form link (not followed); nav →
industry page → its CTA; mobile menu → each destination.

**Not reachable / not tested:** the external found42.com, ScoreApp and
toolkit destinations beyond their links; ScoreApp report delivery; any real
submission (none exists in the preview).

## Matrix

| Mode | Widths / condition | Routes | Engines | Evidence |
| --- | --- | --- | --- | --- |
| Default | 320×640, 390×844, 430×932, 768×1024, 1024×768, 1440×900 | all 8 | Chromium (before + after), WebKit, Firefox (after) | `*/report.json`, top captures at 390/1440 |
| Reviewed by eye | full pages at 390 and 1440; top of page at 320, 768, 1024 | all 8 at 390/1440; 4–6 routes at 320/768/1024 | Chromium | full pages inspected then pruned (reproducible with the script) |
| Breakpoint edges | 961 (desktop nav at 200% text), 960/961 menu switch, 900×360 menu | home, all for overflow | Chromium, WebKit, Firefox | logs, tests |
| Landscape / short | 844×390 (touch), 900×360, 1280×560 | all for overflow; menu and dialog | Chromium, WebKit, Firefox | `before/`, `after/F01-*` |
| Enlarged text | root 200% at 768, 961, 1024, 1440 (plus the existing 320–1024 test) | all 7 content routes | Chromium, WebKit | no overflow |
| Reduced motion | 390, 1440 | all 7 | Chromium, WebKit | no hidden content |
| Keyboard | Tab/Shift+Tab through `/resources/`, menu trap, dialog trap, dropdown | resources, home | all three (tests) | F07/F04 tests |
| Touch | 390 touch gallery (existing test), 844×390 `hasTouch` | home | Chromium, WebKit | — |
| Axe | 390, 1440 + menu + dialog error state | all 8 | Chromium | `logs/*-axe.txt` |

## Not run

- Physical iPhone/Android, real Safari, Edge.
- Screen readers. Accessible names and descriptions were checked
  programmatically, which is not the same as a VoiceOver or NVDA run.
- Browser zoom via the UI. It was approximated by width changes and root font
  scaling.
- On-screen keyboard overlap. It isn't emulable in Playwright.
- Slow-network throttling. Only the ScoreApp failure was simulated; fonts are
  self-hosted, and a slow font is covered by the existing test.
