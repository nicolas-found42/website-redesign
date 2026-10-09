# Contributor text-size evidence correction

The earlier `final-fonts-628-100.png` and `final-fonts-628-150.png` captures outside
the repository are byte-identical. The capture script injected an `html` rule,
which lost to the site's more-specific `:root` font-size rule. Those images show
the default text size; the filename `150` does not establish enlargement.

The corrected captures here set an inline root font size before page load. Both
use a 628 × 878 Chromium viewport, reduced motion and loaded local webfonts:

- `contributors-628-100.png`: root font 16px, drawing labels 13px.
- `contributors-628-150.png`: root font 24px, drawing labels 19.5px.

The measured state is retained in
`/Users/Nicolas/Documents/found42/remaining-ticket-evidence/163-169/capture-state.json`.
These captures demonstrate the rendered size change. They do not replace the
text-fit assertions or the full integration validation.
