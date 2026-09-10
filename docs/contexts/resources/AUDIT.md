# Resources: inventory and access journeys

Observations checked September 9, 2026. This file records dated evidence; [CONTEXT.md](CONTEXT.md) defines stable vocabulary. Learning materials have their detailed inventory in [Learning](../learning/AUDIT.md).

## Resource catalog

| Resource | Purpose and access observed | Delivery evidence | Redesign treatment |
|---|---|---|---|
| [Industry-Specific Prompt Packs](https://www.found42.com/industryprompts) | Role-specific work prompts; HubSpot form before access. First name, last name, email, job title, industry, and company website are marked required; company name is optional. | Landing and form inspected; submitted delivery and pack contents unverified. | Describe as free with details required. Avoid implying an immediately browsable library. |
| [AI Failure Modes Playbook](https://www.found42.com/ai-failure-modes-playbook) | Guide for identifying and preventing AI implementation failures; ActiveCampaign form. Email, LinkedIn profile, and human verification are marked required; first and last name are not marked required. | Landing and access gate inspected; document not obtained. | Describe the stated purpose, without inventing chapters, templates, or download fulfillment. |
| [AI Readiness Scorecard](https://found42.io/) | Redirects to [ScoreApp](https://found42.scoreapp.com/). A details form precedes the assessment. | Landing and entry modal inspected; questionnaire, scoring, results, and PDF delivery unverified. | Identify an external assessment requiring details, with an advertised completion estimate. |
| [C-Level AI mini-course signup](https://clevelai.found42.com/) | Redirects to an inactive-account page; HTTP 402. | Unavailable destination confirmed again. Cause not established. | Omit the active signup CTA until a usable destination is verified. |
| [C-Level AI Toolkit](https://www.found42.com/toolkit) | Public page with workshop media, three GPT links, and three exercise PDFs. | Page and PDF text inspected; GPT landing evidence is partial; full media content unreviewed. | Candidate for immediate value; distinguish toolkit access from course enrollment. |
| [Blog](https://www.found42.com/blog) | Four public article links, all four article bodies retrieved without submitting details. | Article content inspected. | Offers an established ungated reading path; select copy with the evidence cautions below. |

## Prompt-pack vocabulary and inventory limits

The prompt-pack page describes a gap between generic AI use and useful work outputs as the **Depth Deficit**. It advertises 200 industry packs, 100 prompts per industry, 20,000 prompts overall, and coverage of 20 job functions. These are published inventory claims, not counts of inspected files. The extracted form contains **148 industry options**; a form taxonomy is not the delivered pack inventory, so that discrepancy is a question to resolve rather than proof that packs are missing. The form includes Venture Capital & Private Equity, which establishes an audience option, not a PE customer relationship. [Source: prompt-pack page](https://www.found42.com/industryprompts).

“AI deployment kit” is used as a description of the prompt offering. There is no evidence here that it names the same collection as the C-Level AI Toolkit. Keep those offerings distinct unless their relationship is confirmed. [Sources: prompt packs](https://www.found42.com/industryprompts), [toolkit](https://www.found42.com/toolkit).

## Assessment journey

Selecting **Take the Scorecard** opens a details modal. First name, last name, email, company name, and country have required markers; United States was the initial country selection in the inspected session. No details were entered. This is a meaningful correction to describing the scorecard merely as an externally hosted resource. [Source: assessment entry](https://found42.scoreapp.com/).

The landing describes yes/no questions across current tools usage, data management practices, workflow efficiency, AI integration readiness, and automation goals. These are advertised subject areas, not verified scoring dimensions or weights. It promises a personalized PDF and recommendations in under five minutes. The scorecard graphic and its example percentage are promotional examples, not a visitor result. [Source: assessment landing](https://found42.scoreapp.com/).

The entry disclosure refers to consent checkboxes “above,” but no checkboxes appeared in the inspected modal's DOM/accessibility snapshot. Record this as a disclosure/control mismatch for review, not a legal determination or a tested submission failure. The [Inquiries audit](../inquiries/AUDIT.md) covers the separate contact-form choices.

## Public reading inventory

All four articles are attributed to Richard Achee. Dates below come from the blog index, which supplies the year. [Source: blog index](https://www.found42.com/blog).

| Article | Published | Useful substance | Boundary on reuse |
|---|---|---|---|
| [CSuite AI: Using AI for Culturally-Sensitive Negotiations (Part 1)](https://www.found42.com/blog/csuite-ai-series-how-to-use-ai-for-culturally-sensitive-negotiations) | August 4, 2025 | Account of negotiation preparation with Rama Zomaletho of IntinereCloud; discusses user, persona, and personal bias, contextual prompting, and local human review. Links VossGPT. | The sales-cycle reduction and account win are author-reported outcomes. Cultural generalizations and cited frameworks were not independently checked in this site audit. |
| [What are AI Growth Platforms?](https://www.found42.com/blog/blog-post-title-three-ecr97) | June 19, 2025 | Explains productizing professional-service firms' IP and know-how into new offerings. Links the scorecard. | Broader than the homepage's SaaS-specific third service; examples are not documented client implementations. |
| [Think Like a CxO with AI Agents and Workflows](https://www.found42.com/blog/choosing-to-inspire) | April 29, 2025 | Explains AI Insourcing and an employee-empowerment narrative, using marketing as an example. | Editorial positioning, not measured staffing, profit, or productivity evidence. |
| [Introducing Found42](https://www.found42.com/blog/blog-post-title-two-cep4t) | April 14, 2025 | Describes personal-workflow training, cross-system automation, growth platforms, and the 3-Step ROI Accelerator. | Contains substantial guarantees and numerical claims requiring owner review; see [Services](../services/AUDIT.md). |

Recommendation: use the AI Insourcing or Growth Platforms article as a concise public-reading entry, depending on the selected audience. The negotiation article offers a deeper practical example but requires more careful outcome attribution. The introductory article needs the most commercial-claim review before being a prominent conversion destination.

## Discovery and open questions

The Free Resources navigation exposes the packs, playbook, scorecard, and mini-course. The toolkit was discovered through the URL inventory, not that navigation. Directly requesting `/free-tools` redirects to the prompt-pack page; in the mobile menu the Free Resources control instead opens a submenu. A future resource hub should make those two meanings intentional. [Sources: homepage navigation](https://www.found42.com/), [folder URL](https://www.found42.com/free-tools).

Before production reuse, establish how the gated packs and playbook are fulfilled, how form industries map to packs, whether the toolkit is intended for broad promotion, and which resource details actually need to be collected. Recheck external destinations near publication. A successful page load alone does not complete a resource journey.
