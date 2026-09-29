# Throwaway braid prototype

**Question:** On the industry pages, should the three inputs remain broad paper ribbons or become thin, clean pipelines while keeping the braid?

This branch compares two treatments in the existing Private Equity page layout. It does not change the production build.

Run `npm run dev`, then open:

- `http://127.0.0.1:5173/industries/private-equity/?variant=broad` — A, the current broad plait.
- `http://127.0.0.1:5173/industries/private-equity/?variant=thin` — B, a thin pipeline braid.

The bottom switcher and left/right arrow keys change variants and update the URL. The same switch works on the B2B SaaS industry page. The four PNGs in this directory capture both versions at 1440px and 390px.

The thin treatment is deliberately a visual question, not production art. Once a direction is chosen, rebuild it in the site's drawing system with separate wide and narrow compositions and remove this prototype from the implementation branch.

**Verdict (September 29):** Keep the current broad braid. The owner will address the industry drawing later; neither prototype variant should be merged into the production site now.
