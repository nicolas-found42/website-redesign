# Lovable migration teardown — 2026-09-16

## Baseline before implementation

Clean main and origin/main: `46fa96c168e8218ac8d55deb04fb4fb7d8102c8c`. Feature branch: `feat/lovable-complete-migration`. Existing 70 tests passed (26.4s). Local and public redesign show the same content, schematic compositions, navigation and visual system; no material divergence observed. Captures in baseline/. Desktop 1440×1000 and mobile 390×844; initial incorrectly sized captures were replaced. In-app full-page stitching also duplicated fixed/sticky content; final full-page evidence uses native Playwright capture. The unchanged local baseline was recaptured from a detached worktree at the recorded commit on port 4181, preserving the pre-edit reference. Principal bands and still motion state captured. Existing detailed motion evidence also remains in docs/preview/working-drawings/.

Preserve paper/ink/red tokens, Space Grotesk/Manrope/JetBrains Mono, 96px printed grid, hairline rules, editorial resource feature, full-bleed service/inquiry bands, responsive schematic geometry, native scrolling, fail-visible reveals, motion pause and reduced-motion presentation. Extend plain TypeScript render/mount seams; no second component or animation framework.

## Discovery and scope

Seven routes corroborated by browser navigation, all page link graphs, Firecrawl map and publicly served JavaScript route registry (`source/index.js`). No extra first-party destinations on second graph pass. `robots.txt` supplied no additional route list; `/sitemap.xml` returned an HTML not-found page, not an XML sitemap. No source repository access assumed: bundled public scripts were inspected only to corroborate routes and client behavior.

Routes: /, /resources, /services, /industries/private-equity, /industries/b2b-saas, /about, /blog. Preserve each path with directory index files under the GitHub Pages base path. No article routes: three essays are explicitly Coming soon, with no bodies or links. No source legal pages, downloads, service-detail pages, pagination, filters, carousels or content-bearing query/hash routes were found. Lovable badge is hosting chrome and excluded. Linked Lovable editor project is not a Found42 destination.

## Content and journeys

Source JSON captures preserve full markdown, metadata, links. Browser JSON preserves main-page text, individual semantic items, links and image alternatives. Source screenshots cover all seven routes at both widths. Source uses Workshops, Workflows and Automations, superseding the older site's Training/Automation/Product Differentiation taxonomy. Four resources: assessment, Failure Mode Playbook, Skills Starter Library, Strategic Advisor Mini-Course. Preserve all descriptions and advertised inventories, with access limitations stated.

Assessment: four questions, three choices scored 1–3 each, advance on choice, Back from steps 2–4, sum >=9 strong, >=6 promising, otherwise clarify. Retake clears answers. Choosing after Back truncates later answers. Result action opens inquiry. Browser observed all three result branches and restart; public bundle corroborates scoring thresholds. No personal data gate for this preview.

Inquiry modal: name (2–100), email (valid, <=255), company (2–120), challenge (10–1000), trimmed validation. No consent checkbox or scheduling. Source uses one general error. Mini-course modal: email gate, five-day framing, reusable advisor skill, quality-control checklist, safe rollout pattern, one lesson daily/unsubscribe wording. Playbook/library/newsletter also ask email <=255. Desktop industry disclosure and mobile menu expose both industries.

**Source forms are simulations.** Public handlers prevent default, validate, then set local success state; no network or delivery integration. Source says “Check your inbox. Your resource is on its way.” and “Request received.” without submitting. Do not replicate false success. Preserve input and error interactions, disclose unavailable fulfillment, offer existing found42.com/contact inquiry fallback. No real inquiry, signup or email sent. Mini-course lessons, playbook checks and library files are not accessible in the public source, and cannot be fabricated.

## Editorial and design translation

Preserve all biography wording and both sample quotations, with sample labels adjacent. Reframe absolute eight-hour savings as a target dependent on workflow fit; CEO 80% is an ambition, never a guarantee. Position executives around adopting usable systems, experts around training tied to their role/industry/company, decisions/documents/quality bar. Keep actual three offerings, resource distinction and Claude specificity. Record every replacement in manifest, retain source copy alongside it. No new prices, packages, proof or products.

Homepage retains animated opening, editorial resource hierarchy, service drawing sequence and red inquiry band. Supporting pages use the same typography, rules, indexed sections and drawing vocabulary; industry scope rows, resource assessment/forms, full biography and forthcoming essay list get content-appropriate layouts. Current noindex prototype posture remains. Existing external legal/contact destinations are compatible supporting fallbacks, not newly discovered Lovable pages.

## Limits

Discovery covers public reachable pages, indexed map and public route registry, not private or unpublished material. Three essay bodies, delivered resources, email integration and authentic replacement proof are business dependencies. Historical issue #9 linked in repo documentation returned “could not resolve”; user brief supersedes its homepage-only scope. No access to source CMS or authenticated delivery configuration.
