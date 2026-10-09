# Removed briefing band (#168)

`briefing-before.png` captures the complete former briefing section from
`fea4a9c` at a 1440 × 1000 browser viewport. `briefing-after.png` uses the same
viewport and captures the service footer followed directly by testimonials
from the built Pages output at `f852982`. All three bundled fonts returned
HTTP 200. Reduced motion is enabled in both captures.

The after capture removes the sticky header only from the capture DOM so it
cannot obscure the section boundary. The rendered page itself retains it.
The built output also passed a JavaScript-disabled check: no briefing section,
services immediately followed by testimonials, and all five testimonial cards.
