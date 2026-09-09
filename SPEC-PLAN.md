# Found42 website redesign — resource-led homepage and site structure

Status: updated from the live-site audit on September 9, 2026; implementation not started. Website-specific rendered-browser testing proposal sent to Nicolas; confirmation pending.

## Problem Statement

Found42 needs a homepage that catches the eye immediately, explains practical AI value to business leaders and private-equity/portfolio-company decision-makers, and offers useful material before asking visitors to inquire about tailored work.

The verified site is https://www.found42.com/. Its opening promotes a four-hour executive AI system and a workshop → readiness scorecard → discovery sequence. Existing assets include resources, articles, three service categories, founder context, and five attributed testimonials. The redesign should organize that material rather than assume everything must be created.

The current opening devotes substantial space to a C-Level AI graphic and introductory steps without a direct hero action. Mobile inspection showed a small-looking logo, a large illustration, and a cookie banner occupying valuable opening-screen space. The inspected homepage has no H1; its opening heading is an H3. Consultation links lead to a contact form, not a booking calendar. Resource destinations have different access requirements, and the mini-course currently leads to an inactive-account page.

Executive positioning, startup-oriented metadata, and strong ROI claims also need a coherent editorial treatment. Nicolas's business/PE audience direction does not establish existing PE case studies or a specialized portfolio-company product.

## Solution

Deliver a documented site structure and a working responsive homepage prototype. Preserve the actual logo's black-and-red palette while improving composition, typography, hierarchy, resource discovery, and inquiry navigation. Full migration and production launch remain later work.

Recommended opening: concise business outcome and audience messaging, a purposeful visual, a primary action to explore resources, and a secondary action to request a consultation. These labels and hierarchy are starting recommendations for prototype evaluation. Resources may be a homepage section; the existing contact page is a valid inquiry destination.

Distinguish immediately readable public content from free resources requiring a form. Use accurately attributed proof and plain explanations of tailored services. Exclude the inactive course from active conversion paths unless a working replacement is verified.

Nicolas independently owns research, design, implementation, and acceptance. Richard and Adejoke are eventual recipients of published results, not contributors or required reviewers. This project is completely separate from the Google pipeline and Chief of Staff, with equal priority and no cross-project dependency. No deadline, budget ceiling, vendor, or migration choice is set.

## User Stories

1. As a business leader, I want the opening to explain Found42's practical value, so that I can quickly judge its relevance.
2. As a PE or portfolio-company decision-maker, I want business-outcome language, so that I can identify relevant help without invented sector credentials.
3. As a first-time visitor, I want a distinctive first screen, so that the site makes a memorable and credible impression.
4. As a returning visitor, I want the recognizable logo and palette, so that the redesign retains brand continuity.
5. As a mobile visitor, I want the message and next action to be prominent, so that a large illustration does not dominate my arrival.
6. As a visitor, I want an obvious route to free resources, so that I can experience useful value before making contact.
7. As a resource seeker, I want purpose and access requirements explained, so that I can choose without unexpected forms.
8. As a visitor seeking immediate value, I want public reading available, so that I can learn without submitting information first.
9. As a prompt-pack visitor, I want an accurate description of the offering and form gate, so that I understand the next step.
10. As a guide visitor, I want the failure-modes playbook described without fabricated contents, so that I can decide whether to request it.
11. As an assessment visitor, I want a clear route to the external scorecard, so that I understand I am leaving the main site.
12. As a prospective learner, I want unavailable training excluded from active calls to action, so that I avoid known dead ends.
13. As a visitor, I want training, automation, and product differentiation clearly distinguished, so that I can identify the appropriate service.
14. As an executive, I want workshop concepts translated into concise benefits, so that the offer is understandable.
15. As a prospective customer, I want accurately attributed testimonials, so that I can assess real evidence.
16. As a prospective customer, I want founder context available, so that I can understand the experience behind Found42.
17. As a visitor, I want supportable service claims, so that numerical promises do not mislead me.
18. As a prospective customer, I want an honestly labeled consultation inquiry, so that I do not mistake a form for a confirmed booking.
19. As a keyboard user, I want usable navigation and visible focus, so that I can complete the same journeys.
20. As a screen-reader user, I want meaningful headings and link names, so that I can understand and navigate the page.
21. As a visitor with motion sensitivity, I want motion to respect my preference, so that the experience remains comfortable.
22. As a narrow-screen visitor, I want readable content without accidental overflow, so that the page works on my device.
23. As a visitor, I want usable privacy controls that do not permanently obscure key actions, so that I can make my choice and continue.
24. As a visitor following existing links, I want useful destinations retained or accounted for, so that the redesign preserves working journeys.
25. As Nicolas, I want a source-linked inventory, so that I can distinguish usable content from unresolved inputs.
26. As Nicolas, I want a site map with page purposes, so that the homepage can extend into a coherent site.
27. As Nicolas, I want platform options compared, so that a migration is justified rather than assumed.
28. As Nicolas, I want unverified claims and unavailable assets identified in review notes, so that they cannot silently become published promises.
29. As Nicolas, I want a working preview and verification record, so that I can evaluate actual behavior and appearance.
30. As Nicolas, I want next-stage launch work separated from this milestone, so that a prototype is not confused with a completed public launch.

## Implementation Decisions

### Scope and architecture

- Deliver one working homepage plus a supporting-page structure. Existing live pages can remain linked; implementing every destination is not required.
- The live site uses Squarespace assets and structure, with separate form and assessment providers. No prototype codebase, test suite, glossary, or architecture decision records were found in this website project. Compare retaining Squarespace with alternatives against design control, content editing, maintenance, hosting, migration implications, and costs before choosing tooling.
- Recommended navigation: services, free resources, insights/blog, about, and a visible consultation inquiry. Services/resources may be homepage anchors. Do not introduce empty routes merely to match the proposal.
- Recommended narrative: opening and actions; practical resources; tailored services; selected proof/founder credibility; inquiry. Adjust order for clarity while preserving the journeys.
- Preserve the substance of existing AI Empowerment Training, AI-Powered Automation, and AI Product Differentiation for B2B SaaS. Labels can improve without silently changing the offering.
- Existing workshop topics include communication preferences, ChatGPT voice setup, a Board of Advisors exercise, and a mock case. Use these as training context, not evidence that the linked course is accessible.
- Align title/description metadata with the selected business/executive positioning. Do not retain guaranteed ROI, greater-than-three-times returns, or other numerical outcomes without Nicolas locating supporting evidence and deciding to use them.

### Resource contracts and access

| Resource | Observed state | Required homepage behavior |
| --- | --- | --- |
| Industry-specific prompt packs | Reachable HubSpot form; required first/last name, email, job title, industry, company website; company name optional | Label as free but requiring details; no promise of an immediately open library |
| AI Failure Modes Playbook | Reachable ActiveCampaign form; email, LinkedIn profile, CAPTCHA required | Describe the stated purpose and form gate; do not invent document contents |
| AI Readiness Scorecard | Short domain redirects to reachable ScoreApp landing | Identify external assessment; advertised under-five-minute duration is an estimate, not a measured guarantee |
| C-Level AI mini-course | Destination redirected to an inactive page, HTTP 402 | Omit active CTA or clearly show unavailable; require verified usable destination before promotion |
| Public blog | Index has four article links | Provide an ungated reading route; inspect the selected article before quoting or describing its contents |
| Maven / Strategic Advisor lesson | Mentioned previously; exact destination not established | Optional candidate; Nicolas should locate URL in his notes/bookmarks or provider account and verify title/access before use |

- Record title, purpose, source/destination, provider, access gate, observed state, check date, and whether delivered content was actually inspected. Reachability alone does not establish fulfillment.
- Prompt-pack claims of 200 industries, 100 prompts each, and 20,000 prompts are existing marketing statements, not an independently inspected inventory. The industry form includes Venture Capital & Private Equity; this does not establish PE client evidence.
- ScoreApp advertises a PDF/recommendations; neither assessment completion nor delivery was tested. The playbook and prompt-pack contents were not obtained.
- At least one verified free-resource journey and one ungated public-reading path must be easy to find. Creating a new lead magnet is unnecessary. Missing optional course content should not block other work.

### Visual and accessibility requirements

- Use the actual live header logo as the baseline: a padded transparent raster with black lettering and red “42,” including gradients/shadows. A sampled representative opaque red is approximately #B70611; black is #000000. This is a provisional raster sample, not a verified official swatch. Nicolas's original/vector artwork or brand guide should supersede the sample if available.
- Preserve the black/red identity with supporting neutrals and checked contrast combinations. Achieve a striking opening through typography, composition, and a purposeful visual; do not require animation or repeat the oversized existing graphic.
- Ensure the logo is legible, accounting for transparent padding while preserving artwork proportions. Obtain a better source asset if available before finalizing production treatment.
- Provide a meaningful H1, logical heading hierarchy, appropriate image alternatives, keyboard operation, visible focus, responsive navigation, readable contrast, and reduced-motion behavior where needed. Testimonials should be quotations rather than structural headings.
- Privacy controls, if included, must remain usable without permanently obscuring key actions. Do not add tracking solely to reproduce the existing cookie banner.

### Proof and inquiry

- Five public testimonials are available: Robb Henshaw, Paul Keely, Carmen Paredes Ramirez, Andrew Miller, and Neville Louison. Preserve meaning, name, and relevant attribution when selecting excerpts; record each source. Do not invent PE case studies, client logos, or imply Google endorsement from a person's company having been acquired by Google.
- The About page provides founder/CEO Richard Achée's biography. Use it accurately as published context, not as independent verification of every career statement. Nicolas decides what to feature; external review is not a dependency.
- Default inquiry behavior links to the existing contact page, labeled as a request for consultation. It is not instant scheduling and carries no invented response-time guarantee.
- The existing contact form includes identity/organization, email, interests, message, consent controls, and CAPTCHA. Interest labels Training, Automation, and Growth Platform do not exactly match current service headings. Record the mismatch and the required communications/processing consent treatment for later review; do not silently rebuild integrations or draw legal conclusions.
- If new form behavior is later chosen, define recipient, success confirmation, failure/retry behavior, and test environment first. Never silently discard input. Retain relevant privacy/terms links; rewriting legal policies is separate work.

### Execution and deliverables

1. Use this completed audit and resolve inputs needed for selected content. Platform comparison, copy/site-map drafting, and visual exploration can run in parallel.
2. Establish the opening at desktop and mobile sizes, then implement the complete homepage with verified destinations. Omit unsupported claims and unavailable optional assets.
3. Verify the rendered experience and package the working preview/run instructions, page-purpose/site-map proposal, source-linked copy/resource inventory, palette rationale, platform recommendation, validation record, and next-stage backlog.
4. Nicolas evaluates the prototype. Production publication, migration, redirects, and live-form changes require subsequent implementation planning.

## Testing Decisions

- Proposed main seam: the rendered homepage in a browser. Inputs are homepage content/resource records and user interaction; observable outputs are the visible experience and navigation journeys. This proposal was sent to Nicolas for confirmation; no website-specific answer had been received when this revision was written. Approval of Google-pipeline testing does not automatically approve this separate project's seam.
- Test the opening, navigation, resources, proof, and inquiry route through externally visible behavior. Avoid tests tied to component internals or exact layout snapshots. No existing website-project test suite was found to extend.
- Inspect approximately 1440-pixel desktop and 390-pixel mobile views plus intermediate widths. Confirm legible branding, clear message/action, usable menu, no accidental overflow, and no essential content trapped under overlays. These are review examples, not restrictions on supported devices.
- Check keyboard navigation, focus, headings, link names, image alternatives, contrast, and reduced motion. Combine automated accessibility checks with manual interaction.
- Verify destination content and redirects, not only HTTP status. An inactive course screen fails the resource journey regardless of status code. Recheck external destinations near delivery and compare gate labels against actual forms.
- Confirm the consultation CTA reaches the intended contact page and accurately describes an inquiry. Read-only navigation does not verify email delivery. If new form behavior enters scope, test success/failure through controlled submissions in a test environment; do not send production inquiries as a test.
- Review claims, testimonial excerpts, names, and attribution against the inventory. Unsupported guarantees and unavailable offerings must not appear as established facts.
- Evaluate visual quality by viewing the prototype. Record loading/layout problems and resolve those impairing the experience; no exact performance-score target is agreed.
- Acceptance requires a distinctive, understandable opening; retained palette; verified free-resource and ungated-reading paths; truthful service/proof copy; functional and honestly labeled inquiry navigation; accessible responsive behavior; and the complete delivery package. Report unperformed checks as unverified.

## Out of Scope

Full supporting-page implementation; public-site changes during planning; production-domain cutover; DNS/CMS migration; restoring or paying for third-party accounts; production lead submissions; new assessment engines or resource-delivery automation; CRM/booking replacements; legal-policy rewriting; analytics/advertising campaigns; fabricated proof or a new reference-collection campaign; Google pipeline or Chief of Staff changes; external reviewer assignments; invented deadlines or spending limits.

## Further Notes

### Source inventory and audit limits

Audit date: September 9, 2026. Firecrawl was used to read public pages; the homepage was also inspected in a rendered browser at desktop/mobile sizes. No forms were submitted. Resource fulfillment, ROI outcomes, career history, and legal compliance were not independently verified.

| Source | Established information | Limits |
| --- | --- | --- |
| [Homepage](https://www.found42.com/) | Executive opening, services, resource links, testimonials, logo | Marketing outcomes/counts remain claims |
| [Contact](https://www.found42.com/contact) | Inquiry form, interests, consent/CAPTCHA | No delivery or booking verified |
| [Prompt packs](https://www.found42.com/industryprompts) | Reachable gated resource request | Delivered contents not inspected |
| [Failure-modes guide](https://www.found42.com/ai-failure-modes-playbook) | Reachable gated guide request | Document/fulfillment not inspected |
| [Readiness entry](https://found42.io/) → [ScoreApp](https://found42.scoreapp.com/) | Reachable external assessment landing | No completed assessment/PDF inspected |
| [Mini-course](https://clevelai.found42.com/) | Redirect to inactive page, observed HTTP 402 | Cause unknown; exclude active CTA until verified usable |
| [About](https://www.found42.com/about) | Richard Achée founder/CEO biography | Published context |
| [Blog](https://www.found42.com/blog) | Four articles: negotiations, growth platforms, agents/workflows, introduction | Individual contents need review before reuse |

The footer currently supplies richard@found42.com, +1 (646) 300-1247, and a Manhattan mailing address. Preserve or reconfirm relevant contact details when used rather than inventing a new recipient. Privacy and terms destinations were observed as links, not audited for legal adequacy.

### Remaining decisions

| Question | Best source / owner | Needed when |
| --- | --- | --- |
| Does the rendered-browser test seam match expectations? | Nicolas; question already sent | Before finalizing implementation testing commitments |
| Which platform best supports the design? | Nicolas's comparison against Squarespace baseline | Before substantial implementation |
| Is original/vector logo artwork or a brand guide available? | Nicolas's brand assets | Before final production treatment; raster supports exploration |
| Which public article/example supplies immediate value? | Nicolas and selected article | During copy selection |
| Is a working course or Strategic Advisor replacement available? | Nicolas's notes/provider account and actual destination | Only if featuring it; otherwise omit |
| Which numerical claims have usable support? | Nicolas's underlying results/service material | Before retaining each claim; otherwise omit |
| Should contact fields, consent, service labels, or scheduling change? | Nicolas and existing form configuration | Later form/launch scope; link-only prototype can proceed |

Original stand-up anchors: 06:18–07:06 (redesign, clarity, free materials, references); 53:57–54:18 (Squarespace and rethink); 54:18–55:54 (value up front, Strategic Advisor, tailored help); 01:04:20–01:04:44 (intentional design before building). Nicolas clarified Wednesday, September 9, 2026, 8 a.m.; timezone is unconfirmed and no meeting deadline constrains this project.

This local specification is the planning artifact. No website-project issue tracker or triage configuration was found. To configure external publication, invoke `$setup-matt-pocock-skills`. The exact issue title, body, `ready-for-agent` label, and relationships must be presented for confirmation before an external write. No issue has been published.
