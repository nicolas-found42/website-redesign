# Website validation

The project now covers seven pages, superseding the former homepage-only scope. The current evidence and precise limits are in [the migration validation report](../artifacts/lovable-migration/2026-09-16/validation.md); source-derived coverage is in [the manifest](../artifacts/lovable-migration/2026-09-16/manifest.json). Historical design evidence remains under `docs/preview/working-drawings/` and in Git history.

Run `npm run build` and `npm test`. The build typechecks, bundles and prerenders seven directory index files plus a real 404. Playwright runs unit assertions and Chromium, Firefox and WebKit checks against both development and strict static production servers. Latest local run: **117 passed (39.0s)**.

Coverage includes 215 source-derived text records, assessment scoring/branches, form validation and truthful unavailable-delivery states, navigation and dialog keyboard behavior, axe accessibility, mobile/intermediate/desktop reflow, motion pause/reduced motion, no-JavaScript readable content, and GitHub Pages direct entry, refresh, assets, links, back/forward and 404 handling. Static tests use `/website-redesign/`; a development-server fallback is not accepted as route verification.

Review screenshots separately for visual consistency. `scripts/capture-evidence.mjs` records 390px/1440px source and destination evidence plus the original baseline served on port 4181. It is an audit utility and is never included in the published site. Full setup and remaining fulfillment dependencies are documented in the audit report and [launch backlog](LAUNCH-BACKLOG.md).

A passing suite establishes local content and behavior, not working email delivery, resource fulfillment, authentic testimonials, live external submissions or a public deployment. Retain noindex until a separately authorized launch.
