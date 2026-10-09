# Native readiness report source and verification

The owner supplied `Found42 AI Readiness Scorecard.html` on October 9, 2026.
`source-data.json` preserves its static categories, questions, options, points,
stages, recommendations, routes and sample answers. Production code normalizes
these records; prototype controls and simulated destination toasts are excluded.

The attachment's email form is replaced by optional local name/role fields.
The owner's follow-up explicitly requires the full on-page report and downloadable
PDF now and defers email delivery until launch. Unpublished source offerings use
honest availability notes and real site destinations or inquiry handoffs.

PDF generation uses [jsPDF's documented client-side API](https://github.com/parallax/jsPDF)
and [font embedding](https://parallax.github.io/jsPDF/docs/module-vFS.html).
Noto Sans regular/bold are bundled from the
[official Noto repository](https://github.com/notofonts/noto-fonts/tree/main/hinted/ttf/NotoSans),
with their SIL Open Font License in `public/assets/fonts/OFL.txt`. Font loading
happens only when a visitor chooses PDF download, from the same site.

Independent attachment samples used for validation: Sam 5/51 = 10%, Ada and
Ngozi 23/51 = 45%, Tunde 49/51 = 96%. Their area percentages are asserted as
literal expected values, alongside both stage boundaries and safeguard tie order.

## Focused verification

- Red: the supplied Sam fixture failed against the previous yes/no scorer.
- Green: four public scoring tests pass for supplied examples, literal area
  percentages, source question/option equality, rounded stage boundaries,
  independent warnings and safeguard tie order.
- Seven Chromium journey checks pass for the 18-question flow, current resource
  destination, no external provider, optional personalization, accessibility and
  320px doubled-text reflow. Configurations cap workers at two.
- The download test also holds the lazy PDF chunk, resets all answers, then
  releases it: the clicked report still downloads as a valid PDF.
- Typecheck, focused ESLint, changed CSS Stylelint and changed documentation
  Markdownlint pass. Production build and prerender complete successfully.
- `after/` contains actual browser downloads and font-loaded report screenshots
  for Sam and Ada at 1440px, and Tunde at 390px. PDF destinations use the
  canonical published site; sections and initial items stay together.

The parent integration task owns the final full browser matrix, aggregate gates,
Jev completion judgment, pull request, merge and deployment verification.
