# Found42 website audit

Found42 has more usable learning material than its primary navigation reveals, while several prominent promises and destinations need correction. The most consequential opportunity is to connect visitors to the public toolkit and readable articles with accurate access labels. The most urgent defects are the inactive course signup and the incorrect Privacy Policy link in the Terms page. Commercial positioning also differs across the homepage, historical articles, contact form, and assessment landing. [Sources: homepage](https://www.found42.com/), [toolkit](https://www.found42.com/toolkit), [blog](https://www.found42.com/blog), [terms](https://www.found42.com/terms-of-use).

## Coverage and evidence standard

Checked September 9, 2026. The [source register](../../research/deep-audit-sources-2026-09-09.json) records 28 live retrievals: 19 main-site routes, three linked PDF exercises, the scorecard and course destinations, and four GPT destinations. The main-site count includes both `/` and `/clevelai`, plus `/free-tools`; these are not 19 distinct offerings. Browser inspection covered the homepage, desktop resource navigation, mobile navigation, a service accordion, cookie preferences, toolkit embeds, loaded contact form, assessment entry modal, and Terms link target.

An **observation** is directly visible page content, a link destination, or a retrieval result. A **published claim** is something the site asserts, with its truth beyond that publication unverified. A **recommendation** is a proposed redesign action. A reachable landing is not evidence of successful delivery, and an indexed URL is not evidence that the page still exists.

## Priority findings

Priorities express recommended order for subsequent site work, not completed fixes or newly authorized changes to the live site.

| Priority | Finding and consequence | Recommended action | Detailed evidence |
|---|---|---|---|
| High | Primary mini-course signup ends at an inactive account page, HTTP 402. | Restore/replace the destination or remove active signup promotion. | [Resources](resources/AUDIT.md) |
| High | Terms introductory Privacy Policy link points to a ChatGPT conversation URL. | Point it to the public policy page and remove drafting-style introductory copy. | [Inquiries](inquiries/AUDIT.md) |
| High | Guarantees and numerical promises differ across site surfaces and lack inspected substantiation. | Review the commercial claim register before reusing copy. | [Services](services/AUDIT.md) |
| High | A public toolkit exists despite the unavailable signup path, but is absent from observed resource navigation. | Review and surface the usable materials with clear limitations. | [Learning](learning/AUDIT.md) |
| Medium | Scorecard requires personal/business details before questions; the homepage only advertises free/fast results. | Explain the gate and external destination before the visitor leaves. | [Resources](resources/AUDIT.md) |
| Medium | Contact news preference defaults to Yes alongside a separate required communications checkbox; scorecard disclosure references checkboxes absent from its inspected modal. | Reconcile choices, wording, and intended handling with the owner. | [Inquiries](inquiries/AUDIT.md), [Resources](resources/AUDIT.md) |
| Medium | Homepage consultation wording suggests booking but reaches an inquiry form; indexed appointments route is 404. | Use inquiry language and only advertise scheduling once a real booking flow is verified. | [Inquiries](inquiries/AUDIT.md) |
| Medium | Public member-template content and an empty route remain reachable. | Decide whether to remove, redirect, restrict, or retain each during migration planning. | [Credibility](credibility/AUDIT.md) |
| Medium | The fictional exercise has an arithmetic inconsistency and a CFO name mismatch in extracted text. | Correct the teaching materials and verify the rendered PDFs before promotion. | [Learning](learning/AUDIT.md) |
| Medium | The homepage has no H1; long testimonial quotes are H2s. | Use a meaningful page heading and treat testimonial text as quotations. | Browser observations below |
| Medium | Metadata targets startups while the hero targets executives and other pages target service SMBs. | Choose a coherent audience and align metadata, offers, and form labels. | [Services](services/AUDIT.md) |

## Information architecture and routes

The observed main navigation contains C-Level AI, Free Resources, Blog, About, and Contact. The resource menu lists prompt packs, playbook, scorecard, and mini-course. There is no dedicated Services destination in that menu; the service descriptions are homepage accordions. The toolkit and media-assets pages were found through URL discovery. A direct request to `/free-tools` resolves to the prompt-pack page, whereas the mobile Free Resources control opens its own submenu. [Sources: homepage](https://www.found42.com/), [folder route](https://www.found42.com/free-tools), [toolkit](https://www.found42.com/toolkit), [media assets](https://www.found42.com/mediaassets).

| Route group | Observed result | Planning implication |
|---|---|---|
| `/`, `/clevelai` | Both return the C-Level AI homepage content; `/clevelai` remains a separate URL in retrieval. | Review canonical/redirect strategy before migration; content similarity alone does not prove a search penalty. |
| `/industryprompts`, `/ai-failure-modes-playbook`, `/contact` | Embedded forms load. | Preserve access and inquiry distinctions; keep integration testing separate from page reachability. |
| `/blog` and four linked articles | Public content is readable. | Reuse with accurate subjects, dates, attribution, and claim review. |
| `/about`, `/mediaassets`, `/toolkit` | Biography, identity assets, and workshop material available. | Existing content inventory can support the redesign. |
| `/privacy-policy`, `/terms-of-use` | Both available; policy navigation/content issues described above. | Review and preserve intended policy destinations. |
| `/appointments` | HTTP 404. | Do not infer booking from indexed metadata. |
| `/member-site-homepage-2` | HTTP 200 with generic community/store/event template content. | Treat as an unresolved public route, not a genuine product requirement. |
| `/new-page-2` | HTTP 200 with no meaningful extracted main content. | Verify intended use before migration; not a useful destination as observed. |

Sources and final destinations for every row are listed in the [retrieval register](../../research/deep-audit-sources-2026-09-09.json). This is the discovered scope, not a claim to have enumerated every private, unlinked, or dynamically generated URL.

## Visual, navigation, and accessibility observations

The homepage was inspected at a verified 1440×1000 desktop viewport and 390×844 mobile viewport. Document scroll width equaled viewport width in each check, so **horizontal overflow was not observed at those sizes**. Desktop screenshot capture clipped the displayed browser surface; that capture limitation was not classified as website overflow. Initial render animations also produced transient partially visible text; persistent text loss was not established.

The black/red C-Level AI graphic dominates the opening while the header Found42 mark appears very small. The hero describes the three-step progression, but its numbered steps are plain text rather than direct actions; the workshop CTA sits further down the page. On mobile, the cookie banner occupies a substantial part of the opening screen. Recommendation: give the value statement and a useful next action greater prominence, improve logo legibility, and retain usable preference controls. [Source: live homepage](https://www.found42.com/).

The desktop resource menu opened. The mobile menu and resource submenu opened, and the focused mobile menu button responded to Enter for opening and closing. The automation accordion expanded and exposed its service description. These checks establish those sampled interactions, not complete keyboard or screen-reader conformance.

Cookie preferences exposed Necessary as always on, with Performance and Analytics and Advertising unchecked in the inspected session. Preferences were inspected without saving a new choice. No network/cookie-storage audit was performed, so the controls do not establish whether tracking scripts honor them.

The homepage DOM contains no H1 and begins with an H3. Service headings are H4s, and the five full testimonial quotations are H2s. Several footer links to Squarespace have no useful accessible name. The contact page's main content relies on an image and embedded form; the toolkit has several H1s and an embedded slide frame with no title. These are targeted semantic review findings, not a full accessibility certification. Contrast ratios, focus visibility across all controls, reduced-motion behavior, media captions, and full form validation remain unchecked.

## Metadata caution

The homepage's top-level description explicitly promises guaranteed ROI for startups. The blog index's retrieved title is “Blog 3 — Found42,” and mediaassets has a generic title. Improve these when aligning positioning. [Sources: homepage](https://www.found42.com/), [blog](https://www.found42.com/blog), [media assets](https://www.found42.com/mediaassets).

Combined extraction metadata included `noindex` values on contact and toolkit, alongside embedded-provider fields. Direct browser inspection of each parent page's head found a canonical and description but **no robots meta tag**. Therefore the combined metadata cannot establish that those Found42 pages are intentionally excluded from indexing. HTTP robots headers, robots.txt, sitemap directives, and actual search indexing were not audited. Preserve this qualification rather than reporting a false SEO defect.

## Domain changes

The expanded model adds **Learning**, because workshop content, simulated advisors, and fictional exercises have meanings beyond resource access; and **Credibility**, because people, testimonials, identity assets, and reported results need shared evidence rules across offerings. Resources owns resource requests and fulfillment. Inquiries owns consultation intent and communication preferences. Services distinguishes broad Growth Platforms from the SaaS-specific homepage service and distinguishes the Accelerator from the learning sequence.

The map deliberately does not create Membership, Events, or Commerce contexts from template content and a cart link. Nor does it create a PE product from a form option or fictional acquisition exercise. Glossaries hold definitions; sibling audits hold dated facts, recommendations, and unresolved commercial decisions. [Context map](../../CONTEXT-MAP.md).

## Limits and next verification

No production form was submitted, assessment completed, GPT conversation started, or live site content changed. Gated pack/playbook delivery, CRM/email routing, appointment confirmation, full workshop playback, slide completeness, and current GPT output behavior remain unverified. The exercise PDFs were text-inspected; rendered visual QA remains necessary before editing them.

This audit does not verify legal adequacy, career histories, return-on-investment claims, the authenticity of testimonials, third-party contractual relationships, or live traffic/conversion performance. No authenticated analytics, CMS settings, performance benchmark, exhaustive crawler, or complete accessibility suite was available in the inspected scope. Website claims are documented with their attribution rather than adopted as business facts.

For subsequent implementation, first resolve the broken routes and claim ownership, then select the public resource journey, align service/inquiry naming, and verify the rendered homepage. Preserve the current source URLs until an intentional migration/redirect plan exists. The [earlier audit](../../research/site-audit-2026-09-09.md) remains a historical baseline; this expanded audit supersedes its coverage limits concerning articles, toolkit materials, policy content, and assessment entry.
