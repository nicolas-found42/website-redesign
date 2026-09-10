# Found42 — resource-led homepage prototype for GitHub Pages

Status: product decisions and rendered-browser testing seam approved by Nicolas after the specification interview. Implementation has not started. Two hero directions will be reviewed before completing one homepage.

> The expanded [live-site audit](docs/contexts/SITE-AUDIT.md) adds verified article content, public toolkit assets, assessment entry requirements, and policy/navigation findings. Consult it and the linked context audits before implementing this plan; new recommendations there do not automatically approve changes to commercial offers or production integrations.

## Problem Statement

Found42 needs a visually compelling homepage that helps business executives understand how to move from experimenting with AI to applying it to real work. Executives responsible for operating results, including portfolio-company executives, are the primary audience; PE operating partners are secondary. Existing messaging spans executives, startups, service businesses, and SaaS, without a clear hierarchy.

The September 9, 2026 audit found usable services, public articles, resources, testimonials, and founder assets. It also found an oversized opening graphic relative to the brand mark, no homepage H1, an unavailable course destination, resource gates that need clearer descriptions, and consultation wording that leads to an inquiry form rather than scheduling. Public numerical claims do not have inspected supporting evidence.

Nicolas needs a compact, polished, shareable prototype that demonstrates a coherent visitor experience before a production redesign. It must deploy completely to GitHub Pages and be maintainable by editing source and pushing changes. Maximum visual fidelity matters: adding animation libraries is acceptable, but broken effects, distracting layout behavior, and bloated presentation are not.

## Solution

Deliver one complete responsive homepage, a supporting site map with page purposes, and a documented verification and handoff package. Qualified consultation inquiries are the commercial objective. Useful resources are the primary entry for exploring visitors, with a prominent direct inquiry route for visitors ready to discuss tailored help.

Use bold editorial design with executive credibility: strong typography, generous space, black/red identity, supporting neutrals, and a custom lightly interactive business-workflow composition. Explore two desktop/mobile hero treatments, obtain Nicolas's selection, and complete one homepage. Preserve the current services' substance while improving their language and hierarchy.

Bundle everything needed to render the homepage into the GitHub Pages deployment. Existing articles, resource access gates, assessment, About, Contact, and policies remain intentional outbound destinations. Nicolas owns implementation decisions, source editing, and final acceptance; production migration is a later milestone.

## User Stories

1. As a business executive, I want the opening to explain practical AI value, so that I can quickly recognize its relevance to my work.
2. As a portfolio-company executive, I want operating-results language, so that I can identify relevant help without a separate PE product being implied.
3. As a PE operating partner, I want to understand Found42's services, so that I can assess their relevance to portfolio-company leaders.
4. As an exploring visitor, I want a prominent resource action, so that I can experience useful value before making an inquiry.
5. As a ready buyer, I want a direct consultation inquiry action, so that I do not have to follow a learning sequence first.
6. As a resource seeker, I want a small set of distinct starting points, so that I can choose without scanning a large catalog.
7. As a reader, I want an ungated article, so that I can learn without submitting personal details.
8. As a prompt-pack visitor, I want the access gate disclosed, so that I understand that free access requires details.
9. As an assessment visitor, I want the external destination and details requirement disclosed, so that the next step is predictable.
10. As a playbook visitor, I want an accurate secondary link, so that I can find the guide without invented descriptions of its contents.
11. As a visitor, I want unavailable offerings excluded, so that prominent actions do not lead to known dead ends.
12. As a team leader, I want training explained plainly, so that I can identify help with my people's use of AI.
13. As an operations leader, I want automation distinguished from training, so that I can identify help implementing workflows.
14. As a B2B SaaS leader, I want product differentiation described accurately, so that I can assess the existing offering.
15. As a prospective customer, I want supportable claims, so that I can evaluate services without unsupported numerical promises.
16. As a prospective customer, I want workshop testimonials identified as workshop experiences, so that I do not mistake them for evidence of every service.
17. As a prospective customer, I want concise founder context and an About link, so that I can investigate the experience behind Found42.
18. As a visitor requesting help, I want an honestly labeled consultation inquiry, so that I do not mistake a request for a scheduled appointment.
19. As a visitor, I want clear navigation to sections and existing destinations, so that I can follow my own interests.
20. As a first-time visitor, I want an eye-catching composition, so that Found42 makes a memorable and credible impression.
21. As a returning visitor, I want the recognizable Found42 logo and black/red identity, so that the redesign retains brand continuity.
22. As a visitor, I want an illustrative workflow visual, so that the service idea is tangible without fabricated metrics or a pretend software product.
23. As a visitor, I want immediate access to the headline and actions, so that animation does not delay my next step.
24. As a visitor, I want normal scrolling and restrained content length, so that I can scan the page comfortably.
25. As a mobile visitor, I want legible branding and a clear opening action, so that decorative visuals do not dominate the first screen.
26. As a touch user, I want interactions adapted to touch, so that I receive the purpose and visual quality of the desktop experience.
27. As a keyboard user, I want usable controls and visible focus, so that I can complete the same journeys.
28. As a screen-reader user, I want meaningful headings, link names, and image alternatives, so that I can understand and navigate the homepage.
29. As a visitor with reduced motion enabled, I want creative effects that honor my preferences, so that the experience remains visually rich and comfortable.
30. As a visitor using a supported browser, I want all selected effects to work as intended, so that I receive the designed experience.
31. As a narrow-screen visitor, I want readable content without horizontal overflow, so that the page remains usable.
32. As a visitor, I want stable layout and responsive interaction, so that effects do not interrupt reading or navigation.
33. As a preview recipient, I want a complete hosted homepage, so that I can review it without running development tools.
34. As a preview recipient, I want the prototype identified discreetly, so that I understand its status.
35. As Nicolas, I want two desktop/mobile hero directions, so that I can choose the visual direction before full implementation.
36. As Nicolas, I want library choices delegated within the agreed constraints, so that implementation can pursue visual quality without unnecessary dependency limits.
37. As Nicolas, I want all homepage assets included in the deployment, so that its rendering does not depend on the current site's asset hosting or runtime content retrieval.
38. As Nicolas, I want source-based editing and automated deployment after merge, so that I can maintain the prototype through the repository workflow.
39. As Nicolas, I want source-linked content records, so that resource labels, quotations, and claims remain reviewable.
40. As Nicolas, I want a supporting site map, so that later work can extend the homepage coherently.
41. As Nicolas, I want browser versions and verification gaps recorded, so that acceptance is based on actual evidence.
42. As Nicolas, I want performance measurements and visible defects addressed, so that visual ambition results in a usable page.
43. As Nicolas, I want final visual and content approval, so that the finished homepage reflects the selected direction.
44. As Nicolas, I want a separate launch backlog, so that prototype delivery is not mistaken for production migration or verified resource fulfillment.

## Implementation Decisions

### Scope, ownership, and architecture

- Implement one homepage and document supporting-page purposes. Use section anchors or real existing destinations; do not create empty routes.
- GitHub Pages is the prototype platform. Nicolas edits source; no CMS or production-platform comparison is required.
- Produce a complete static deployment containing homepage text, logo, portrait, fonts, images, decorative assets, scripts, and styles. Homepage rendering must not depend on the existing site's asset hosting, a runtime CMS, secret credentials, or a backend.
- Resource requests, the external assessment, public articles, About, Contact, and legal policies remain outbound journeys. Bundled homepage content does not mean rebuilding or copying every linked destination.
- Account for the GitHub Pages repository URL when resolving assets and navigation. Automate building and deploying after merges to main. Changes use feature branches and pull requests; direct commits or pushes to main are prohibited.
- Use the repository's GitHub Pages URL, a discreet “Design prototype” footer label, and a noindex directive. The preview is publicly accessible; noindex is not access control. Production domain changes remain later work.
- Nicolas independently owns research, implementation decisions, source editing, and acceptance. Richard and Adejoke are eventual recipients, not required reviewers. There is no Google pipeline or Chief of Staff dependency, imposed deadline, or budget ceiling.

### Message, navigation, and composition

- Working opening: “Put AI to work on what moves your business.” Supporting direction: help people apply AI, improve workflows that slow them down, and build new value from business expertise. Refine exact wording during copy/design review without changing the approved proposition.
- Keep the hero broadly executive-focused. Include one reference to leadership teams and portfolio-company operators further down; do not create a dedicated PE section or imply portfolio-wide delivery credentials.
- Use a primary resource-exploration action and a prominent direct “Request a consultation” action. Visitors do not need to complete resources, training, or an assessment before making an inquiry.
- Organize five main sections: hero; resources; three service summaries; selected proof and founder context; consultation invitation. Add navigation and a footer. Target approximately 600–800 words of homepage copy without repeated explanations.
- Navigation covers services, resources, insights/blog, About, and consultation through useful anchors or existing destinations.
- Preserve AI Empowerment Training, AI-Powered Automation, and AI Product Differentiation for B2B SaaS in substance. Improve labels and summaries without expanding, removing, or repackaging the offerings. The broader AI Growth Platform concept is not an exact synonym for the SaaS offering.
- Describe consultation fit as a leader with a real team, workflow, or product challenge who wants to apply AI with their team. Do not invent budget, company-size, response-time, or engagement-duration thresholds.

### Resource and inquiry contracts

| Homepage placement | Destination and purpose | Access and evidence treatment |
| --- | --- | --- |
| Featured public reading | “Think Like a CxO with AI Agents and Workflows” | Public reading about AI Insourcing and employee empowerment; do not treat editorial examples as measured outcomes. |
| Featured resource | Industry-specific prompt packs | Free resource request through a details form; do not promise an immediately browsable library or verified fulfillment. |
| Featured assessment | AI Readiness Scorecard | External assessment requiring personal/business details before questions. Any advertised duration is an estimate, not a measured guarantee. |
| Secondary resource | AI Failure Modes Playbook | Free guide request with a details gate; describe its stated purpose without inventing document contents. |
| Excluded active promotion | C-Level AI mini-course | The audit found an inactive destination. Do not include an active signup CTA. |
| Deferred | C-Level AI Toolkit | Public materials exist, but media checks and exercise corrections remain outside this milestone. |

- Record each selected resource's title, purpose, source, destination/provider, access gate, observed state, check date, and whether delivered content was inspected. Reachability does not establish resource fulfillment.
- Recheck destinations near delivery, including rendered content and redirects. If a featured destination breaks, replace it with an already approved working resource or omit it and record the change. Preserve a verified free-resource entry and public-reading path; inability to do so is an acceptance defect to resolve.
- Consultation links reach the existing contact page and describe an inquiry, not scheduling. Preserve relevant existing privacy and terms destinations. Do not rebuild forms or integrations or submit production inquiries as tests.
- Existing form interest labels and consent issues belong in the later backlog. Do not silently change communications or processing behavior.

### Proof, brand, and creative review

- Use short source-checked excerpts from Paul Keely and Andrew Miller, clearly identified as workshop experiences. Preserve meaning, names, and relevant attribution. Do not imply these validate automation implementation or product differentiation.
- Add a concise Richard Achée founder introduction, the existing portrait, and an About link. Attribute career context as published biography, not independently verified history or employer endorsement.
- Exclude unsupported numerical promises, inventory totals, guaranteed ROI, fabricated metrics, invented client logos, and PE case studies. A fictional mock case is learning material, not customer evidence.
- Use the existing transparent Found42 logo and portrait available through the public media-assets page. Preserve artwork proportions, account for transparent padding, and keep the brand legible. Better original assets can supersede these but are not a prototype dependency.
- Preserve black/red identity with supporting neutrals and checked contrast. The approximate raster sample #B70611 is provisional, not an official brand swatch.
- Explore two hero treatments at desktop and mobile sizes using the same content: a primarily light editorial treatment, and a darker dramatic hero followed by light content sections. Nicolas selects one before complete-homepage implementation.
- Use a custom lightly interactive workflow composition, such as scattered tasks resolving into a clear sequence. Its content must read as illustration, not a working Found42 software product or customer dashboard.
- Exact typography, effect implementation, excerpt wording, and other craft details are delegated to implementation judgment and evaluated through design review.

### Effects, fidelity, and accessibility

- Use a signature hero effect, short section entrances, and polished hover/focus responses. Keep normal scrolling and immediately available headline and actions.
- Research suitable libraries using Context Awesome, Firecrawl, and gh_grep. React Bits and Motion are initial candidates, not mandatory commitments. There is no dependency-count limit; choose libraries for the intended visual result, behavior, static deployment compatibility, and actual performance.
- Every selected effect must run with its intended appearance and behavior in supported environments. Fix failures through implementation changes that preserve fidelity. Do not remove an effect, lower its fidelity, or substitute a static fallback to hide a failure or pass a check.
- Reduced motion is an intentional creative accessibility requirement. Work within the visitor's restrictions while pursuing maximum visual richness and fidelity through suitable effects, composition, and interaction. Preserve content and usable interactions. A rendering failure must never silently trigger a reduced-motion treatment.
- Adapt hover-driven behavior for touch while preserving purpose and visual quality. Keep keyboard access, visible focus, meaningful link names, logical headings with an H1, appropriate image alternatives, readable contrast, and usable responsive navigation. Render testimonials as quotations rather than structural headings.
- Do not introduce tracking just to reproduce the live cookie banner. If privacy controls are needed, they must remain usable and must not permanently obscure important actions.
- Support current stable desktop Chrome, Edge, Firefox, and Safari, plus iOS Safari and Android Chrome, across desktop, tablet, and mobile layouts. Browser configurations with required graphics capabilities disabled or unavailable are outside the supported scope; do not introduce a static failure fallback for them.

### Delivery package

- Deliver the hosted preview, source/run and editing instructions, deployment instructions, site map with page purposes, source-linked copy/resource inventory, palette rationale, library rationale, validation record, and next-stage backlog.
- Nicolas approves visual design and content. Assess whether an unfamiliar visitor could identify the audience, offering, and next step after a brief look. Outside-reader participation is optional; do not claim it occurred if it did not.

## Testing Decisions

- The approved main seam is the rendered homepage in a browser. Inputs are homepage content/resource records and visitor interaction; outputs are the visible experience and navigation journeys. There is no existing prototype implementation or website test suite to extend in the inspected repository.
- Test external behavior, not component internals or brittle exact-layout snapshots. Cover the opening, navigation, resource entries, services, proof, founder context, inquiry, and deployed asset loading through this seam.
- View both hero treatments at desktop/mobile sizes before selection; inspect the complete selected homepage at approximately 1440-pixel desktop and 390-pixel mobile widths plus intermediate widths. These examples do not limit responsive support.
- Verify legible branding, immediate message/action availability, normal scrolling, no accidental horizontal overflow, no disruptive layout shifts, no obscured essential actions, and responsive touch/keyboard behavior.
- Verify intended effect behavior and visual fidelity across the supported browser matrix. Record browser versions, actual-device tests versus emulation, and untested required environments. Emulation alone does not establish real-device behavior. Missing required coverage remains a verification gap rather than an assumed pass.
- Exercise reduced-motion preferences and verify that creative treatments honor those restrictions while retaining visual richness, content, and interactions. Fix ordinary effect failures rather than accepting a static substitute or reduced fidelity.
- Combine automated accessibility checks with manual keyboard/focus, headings, link names, image alternatives, contrast, and motion review. Resolve defects that prevent equivalent access to journeys.
- Recheck external destination content, access requirements, and redirects near delivery. An inactive destination fails regardless of HTTP status. Acceptance covers accurately labeled navigation to intended entry points, not third-party resource fulfillment, assessment completion, or inquiry email delivery.
- Check testimonial excerpts, names, attribution, resource descriptions, and service claims against the source inventory. Distinguish workshop experiences, published biography, editorial examples, and verified facts.
- Measure loading and interaction performance, record the conditions, and fix impairments to the experience. No exact performance-score or dependency-count threshold was agreed. Performance fixes must preserve the intended effects and fidelity.
- Verify the deployed GitHub Pages build, including repository-relative asset resolution, complete local asset availability, section navigation, outbound links, prototype identification, and noindex. Do not treat a successful local development server as deployment verification.
- Acceptance requires Nicolas's visual/content approval and the delivery package alongside verified responsive behavior, intended effects, accessibility, truthful content, and working entry journeys. Record unperformed checks explicitly. Outside-reader comprehension testing is optional and must be marked unperformed when absent; no production conversion target is required without a baseline and measurement plan.

## Out of Scope

Full supporting-page implementation; copying all outbound destinations into the prototype; a CMS or production-platform comparison; production-domain cutover, DNS changes, migration, or redirects; live-site repairs; restoring third-party accounts or promoting the unavailable course; toolkit media verification or exercise correction; new resource creation, resource-delivery automation, assessment engines, CRM replacements, scheduling, or form rebuilding; production form submissions and fulfillment/email-delivery verification; legal-policy rewriting; analytics or advertising campaigns; new commercial packages, unsupported numerical guarantees, fabricated proof, or a testimonial collection campaign; portfolio-wide products or specialized PE credentials; Google pipeline and Chief of Staff work; mandatory external reviewers; guarantees for configurations with required browser graphics capabilities disabled or unavailable.

## Further Notes

### Sources and evidence limits

The September 9, 2026 expanded audit inspected all four public article bodies and discovered the public toolkit, logo, and portrait. It also observed the scorecard's details gate. Earlier descriptions that articles were uninspected or that the toolkit did not exist are superseded.

The expanded evidence is preserved in [audit PR #2](https://github.com/nicolas-found42/website-redesign/pull/2) and its [committed audit](https://github.com/nicolas-found42/website-redesign/blob/a97e5cb/docs/contexts/SITE-AUDIT.md). This specification is self-contained and links committed evidence because that audit PR was still open when this specification branch was created from main.

| Primary source | Use and limits |
| --- | --- |
| [Homepage](https://www.found42.com/) | Existing services, testimonials, and branding; promotional claims are not independent evidence. |
| [Selected public article](https://www.found42.com/blog/choosing-to-inspire) | AI Insourcing and employee empowerment; examples are editorial, not measured outcomes. |
| [Prompt packs](https://www.found42.com/industryprompts) | Reachable details gate at audit time; delivered packs and inventory totals unverified. |
| [Scorecard](https://found42.scoreapp.com/) | External assessment entry requires details; questionnaire, scoring, results, and PDF fulfillment unverified. |
| [Playbook](https://www.found42.com/ai-failure-modes-playbook) | Reachable guide-request gate at audit time; document contents and delivery unverified. |
| [Contact](https://www.found42.com/contact) | Consultation inquiry entry; no scheduling or email delivery established. |
| [About](https://www.found42.com/about) and [media assets](https://www.found42.com/mediaassets) | Published founder context, portrait, and transparent logo; no official vector master or brand standard established. |
| [Toolkit](https://www.found42.com/toolkit) | Public learning materials exist; full media review and exercise corrections are deferred. |

No production forms were submitted, assessment completed, or resource fulfillment verified during the audit. Public testimonials, biography, and commercial statements remain attributed source material. Recheck volatile destinations near implementation delivery.

### Library research starting points

Context Awesome identified [React Bits](https://github.com/DavidHDev/react-bits); Firecrawl retrieved its component documentation and [Motion accessibility guidance](https://motion.dev/docs/react-accessibility). gh_grep found [Motion's reduced-motion example](https://github.com/motiondivision/motion/blob/main/dev/react/src/examples/useReducedMotion.tsx). These establish candidates and implementation references, not proof that a particular final composition meets the fidelity, accessibility, or performance requirements. Select and verify actual components during visual exploration.

### Decision closure and tracker handoff

Nicolas approved the consolidated product agreement and requested specification synthesis. The browser seam is already approved; no repeat interview is needed. Visual selection and final acceptance are planned review stages, not unresolved scope decisions. Implementation craft choices are delegated; production work is explicitly deferred.

The proposed implementation issue uses this specification as its exact body and the ready-for-agent triage label. It has no parent, child, dependency, assignee, milestone, or project assignment. The audit is supporting evidence, not a required issue dependency. Present the exact issue title, body, label, and relationships for the issue-publication confirmation required by the invoked to-spec skill; do not imply the implementation issue is closed by the documentation PR.
