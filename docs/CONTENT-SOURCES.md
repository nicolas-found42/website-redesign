# Homepage source and access inventory

Source of truth: `research/site-audit-2026-09-09.md`, its linked expanded domain audit, and the [Found42 website prototype map](https://github.com/nicolas-found42/website-redesign/issues/9), which supersedes the removed `SPEC-PLAN.md`. Entry pages re-fetched with Firecrawl on September 9, 2026 (local date). No personal details were entered and no production forms were submitted.

| Selected item                                 | Purpose / source and destination                                                                                      | Provider / access gate                                                                                              | Observed state                                        | Delivered content inspected                                     |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------- |
| Industry-specific prompt packs                | Role/industry-relevant prompts; https://www.found42.com/industryprompts                                               | Found42 / HubSpot; first and last name, email, job title, industry, company website required; company name optional | 200; rendered form fields retrieved in fresh scrape   | No                                                              |
| AI Readiness Scorecard                        | Reflect on current tools, data, workflows and readiness; https://found42.scoreapp.com/                                | ScoreApp; first name, last name, email, company name and country before questions                                   | 200; live landing and rendered details gate rechecked | No questionnaire, results or PDF                                |
| AI Failure Modes Playbook                     | Stated purpose: identify/prevent common AI implementation failures; https://www.found42.com/ai-failure-modes-playbook | Found42 / ActiveCampaign; email, LinkedIn profile, CAPTCHA required                                                 | 200; guide-request form rechecked                     | No                                                              |
| Think Like a CxO with AI Agents and Workflows | Employee empowerment and AI Insourcing; https://www.found42.com/blog/choosing-to-inspire                              | Found42; public reading, no form                                                                                    | 200; full article body rechecked                      | Yes, article only; editorial examples are not measured outcomes |
| Blog                                          | Ungated article discovery; https://www.found42.com/blog                                                               | Found42; no details gate                                                                                            | Reachable in September 9 audit                        | Selected article inspected                                      |
| Consultation inquiry                          | https://www.found42.com/contact                                                                                       | Found42 / HubSpot; inquiry form with contact details, interests, message and consent fields                         | 200; form rechecked                                   | No submission, routing or appointment confirmation tested       |

The resource records in `src/content.ts` preserve title, purpose, destination/provider, access gate, observed state, check date and inspection status. No inventory totals, duration guarantees, instant delivery promises or ROI metrics are repeated.

## Services and proof

The three service names and substantive scope come from the [existing homepage](https://www.found42.com/) and approved services context. Training teaches people to use AI; automation implements business workflows; product differentiation applies to B2B SaaS. No broader Growth Platform offer is silently substituted.

The same homepage was rechecked for these exact short excerpts:

- Paul Keely: “What stood out in the C-Level AI workshop was how practical it was.” Attribution: Co-founder / Managing Director, Palladium Security LLC.
- Andrew Miller: “It’s already changing how I approach client conversations.” Attribution: Former Co-Founder and CEO, Cameyo (acquired by Google).

They appear in block quotations under an explicit workshop heading and link to their publication source. They are neither evidence of automation/product delivery nor employer endorsements. The inactive mini-course has no signup link.

Richard Achée’s introduction is based on the [published About biography](https://www.found42.com/about). Career context is explicitly presented as the published biography, not independent verification. No years-of-experience totals or employer logos are introduced.

## Bundled assets

Both actual brand assets are listed on [Found42 media assets](https://www.found42.com/mediaassets), rechecked during implementation:

- Logo: https://images.squarespace-cdn.com/content/v1/68488bfd173fc83bd35b3d01/1752714805616-YV4IUTIG9C7M5XJA6CXV/Found42+logo+transparent.png → `public/assets/found42-logo.png`. Original bytes preserved; CSS crops transparent padding without changing artwork proportions.
- Richard portrait: https://images.squarespace-cdn.com/content/v1/68488bfd173fc83bd35b3d01/c62c93d1-8a52-40fd-b6d8-c72fa10f56cc/687860b5affe67f038ffe50b-HeadshotPro+%281%29.png?format=750w → `public/assets/richard-achee.png`.
- Manrope, Space Grotesk and JetBrains Mono variable fonts: bundled from Fontsource npm packages, SIL Open Font License. Each face is declared individually in `src/styles/fonts.css`, so only the three Latin weight-axis files are published. The dependency lockfile pins the delivered versions, and the three OFL texts travel with the built assets.

Public availability alone does not establish an independent asset license; Found42’s assets are used for its requested redesign. External resource fulfillment, biography verification, policy adequacy and live-site fixes remain outside prototype scope.

## Library attribution

Licence notices for every bundled runtime dependency accompany the built assets
in `public/assets/`: Motion (MIT), Lucide (ISC, with Feather's MIT notice),
Lenis (MIT), the three OFL font licences, and an attribution notice for
SplitType, whose npm package declares ISC but ships no licence file — the notice
points to the repository that holds the canonical text rather than asserting a
copyright line on the author's behalf. No third-party source was copied into
this project; all four libraries are used through their public APIs.

## Working Drawings pass

The drawing that replaced the ribbon motif is original geometry generated in
`src/schematic.ts`. Its node labels are the page's own vocabulary — people,
workflows, what the business knows, human direction, practical AI at work, and
the four labelled steps already carried by each service illustration. They are
presented as an illustration of the possibilities and captioned as one; none of
them names a product, an integration, a customer system or a measured result.

The reference sites studied for this direction are listed in
`research/art-direction-2026-09-14.md`. They informed technique — type scale and
tracking, grid structure, how a section index is set, where credibility sits —
and nothing else. No imagery, client logo, wording or commercial claim was
reused from any of them.

Section, service and resource copy is unchanged from the records above, with two
exceptions, both rewrites of the page's own connecting sentences rather than of
any sourced claim: the free-resources introduction now says that each route
states what it asks for before you get it, which is what the four access notes
show; and the founder introduction no longer summarises a career outside the
sentence that attributes that career to the published biography.

## Expressive design pass

The rendered entry pages for all four resources, the blog, About, Contact and the testimonial homepage returned HTTP 200 during the September 9 follow-up (local date). Andrew Miller’s client-conversations excerpt was found in the rendered homepage. See `preview/expressive/destination-checks.json`. Entry-page checks do not verify resource fulfillment or inquiry routing. Resource descriptions were shortened for mobile without changing their purposes, fields or destinations.

The two connection drawings of that iteration were original SVG artwork generated from `src/workflow.ts` and optimized with SVGO through `npm run artwork`. All three were removed with the ribbon motif; the drawing that replaced it is rendered inline. No reference-site artwork or React Bits code was copied.
