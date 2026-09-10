# Homepage source and access inventory

Source of truth: `SPEC-PLAN.md`, `research/site-audit-2026-09-09.md`, and its linked expanded domain audit. Entry pages re-fetched with Firecrawl on September 9, 2026 (local date). No personal details were entered and no production forms were submitted.

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
- Andrew Miller: “Richard’s C-Level AI workshop went beyond theory.” Attribution: Former Co-Founder and CEO, Cameyo (acquired by Google).

They appear in block quotations under an explicit workshop heading and link to their publication source. They are neither evidence of automation/product delivery nor employer endorsements. The inactive mini-course has no signup link.

Richard Achée’s introduction is based on the [published About biography](https://www.found42.com/about). Career context is explicitly presented as the published biography, not independent verification. No years-of-experience totals or employer logos are introduced.

## Bundled assets

Both actual brand assets are listed on [Found42 media assets](https://www.found42.com/mediaassets), rechecked during implementation:

- Logo: https://images.squarespace-cdn.com/content/v1/68488bfd173fc83bd35b3d01/1752714805616-YV4IUTIG9C7M5XJA6CXV/Found42+logo+transparent.png → `public/assets/found42-logo.png`. Original bytes preserved; CSS crops transparent padding without changing artwork proportions.
- Richard portrait: https://images.squarespace-cdn.com/content/v1/68488bfd173fc83bd35b3d01/c62c93d1-8a52-40fd-b6d8-c72fa10f56cc/687860b5affe67f038ffe50b-HeadshotPro+%281%29.png?format=750w → `public/assets/richard-achee.png`.
- Manrope and Space Grotesk variable fonts: bundled from Fontsource npm packages, SIL Open Font License. The dependency lockfile pins the delivered versions.

Public availability alone does not establish an independent asset license; Found42’s assets are used for its requested redesign. External resource fulfillment, biography verification, policy adequacy and live-site fixes remain outside prototype scope.
