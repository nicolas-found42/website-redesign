# Learning: workshop and toolkit evidence

Observations checked September 9, 2026. [CONTEXT.md](CONTEXT.md) defines the learning vocabulary. This inventory separates a public learning asset from a working enrollment or complete course experience.

## Program and availability

The homepage presents C-Level AI as a four-hour executive sequence: a hands-on workshop, AI Readiness Scorecard, and one-to-one discovery conversation. Workshop topics are communication-style personalization, adapting ChatGPT to the executive's voice, a simulated Board of Advisors, and a mock case. The displayed course signup URL still redirects to an inactive-account screen with HTTP 402. Neither the underlying cause nor an alternative enrollment mechanism was established. [Sources: homepage](https://www.found42.com/), [course destination](https://clevelai.found42.com/).

The separate [toolkit page](https://www.found42.com/toolkit) is public and contains substantial materials. It was absent from the observed Free Resources navigation, which instead promotes the inactive signup route. This makes the toolkit a candidate for restoring an immediate-value journey, subject to content review and confirmation that broad promotion is intended.

## Materials inventory

| Material | Evidence inspected | Limits and next action |
|---|---|---|
| Workshop recording | Toolkit embeds a Wistia player titled C-Level AI Workshop Oct 16, 2025; retrieval reports approximately 59:55 duration. | Player presence and title are established; complete playback and transcript were not reviewed. A one-hour recording does not verify the full four-hour sequence. |
| Workshop slides | Toolkit embeds a published Google Slides presentation titled C-Level AI – Personalizing ChatGPT for Executive Leadership. | Extraction contained partial/loading/error text. This may be an extraction limitation, not a persistent user-visible defect; verify full slide rendering before promotion. |
| Personalization GPT | Toolkit link resolves to a landing whose metadata names C-Level AI Personalization GPT and describes personalization configuration plus a Board of Advisors prompt. | Landing metadata only; generated outputs, account requirements, and current capabilities untested. |
| Board of Advisors GPT | Public landing displays the name, Richard Achee attribution, description, and example prompts. | No conversation was started. Landing presence does not establish output quality or suitability. |
| Negotiator GPT | Linked landing metadata names C-Level AI – Negotiator GPT and describes negotiation coaching. | Interactive use untested. |
| M&A mock case and two personality profiles | All three linked PDFs returned HTTP 200 and their text was extracted. | These are fictional practice assets with content corrections needed, detailed below. |

Primary source: [toolkit](https://www.found42.com/toolkit). Destination references: [Personalization GPT](https://chatgpt.com/g/g-68b13edcd36c819198f8c75baa0056bc-c-level-ai-personalization-gpt), [Board of Advisors](https://chatgpt.com/g/g-68b09c8e00748191ae27ea0d8c4ef192-c-level-ai-board-of-advisors), [Negotiator GPT](https://chatgpt.com/g/g-689e10510cf08191b5adce9746d0460c-c-level-ai-negotiator-gpt).

## Exercise content and quality

The [M&A Mock Case Study](https://www.found42.com/s/1-MA-Mock-Business-Case_-LexyAI-Acquisition-of-DocuWise-AI.pdf) describes LexyAI considering DocuWyze AI to expand into the US. It supplies an illustrative strategic rationale, a $6 million ARR target, a $40 million asking valuation, three fictional lawsuits, integration risks, synergies, and a negotiation recommendation. These are exercise premises, not real companies' verified commercial or legal facts.

The worksheet says 20% annual growth turns $6 million into $10.4 million in two years. Direct calculation gives `$6m × 1.2 × 1.2 = $8.64m`. Adding its separate $2.5 million cross-sell assumption gives $11.14 million, not approximately $13 million. This is an internal arithmetic inconsistency in teaching material; resolve the assumptions and dependent totals before reuse. Its connection between ARR and a total-revenue goal also needs clearer definitions. This audit evaluates the worksheet's consistency, not an actual investment.

The [Alexis Myers profile](https://www.found42.com/s/CEOAlexisMyersDocuWyzeAIpdfcopy.pdf) is labeled as the fictional CEO and uses a Driver/Di description. The [James Briggs profile](https://www.found42.com/s/CFO-James-Briggs-DocuWyze-AIpdf.pdf) is labeled as the fictional CFO and uses a Questioner/CD description. Extracted CFO prose refers to “Joshua” despite the James Briggs title. Company spelling varies between page text and filenames, and the case extraction contains a repeated “AI” suffix. Review the rendered originals when correcting names and typography; extraction artifacts should not automatically become design defects. The toolkit explicitly identifies the profiles as fictional. [Source: toolkit descriptions](https://www.found42.com/toolkit).

## Negotiation article and tool distinction

The [negotiation article](https://www.found42.com/blog/csuite-ai-series-how-to-use-ai-for-culturally-sensitive-negotiations) links a separate [VossGPT](https://chatgpt.com/g/g-684867f3faa4819184d8bf92afcb24dc-vossgpt-culturally-responsive-negotiation-expert), with a different GPT identifier from the toolkit's Negotiator GPT. Similar purpose is insufficient to call them the same product or a verified successor. Record both until their intended relationship is confirmed.

The article discusses asking for missing context before generating advice, accounting for user/persona/personal bias, and having a local human review the preparation. Its 90% rule is a teaching heuristic. Do not turn it into a measured automation rate, a product capability guarantee, or instructions to upload confidential customer information.

The Board of Advisors is a simulated learning/advisory tool, not a roster of real corporate directors. The toolkit's AI Chief of Staff phrase describes a personalization use case; it does not establish a separate Found42 product or a connection to another repository's project.

## Recommended next decisions

Confirm the relationship among live workshops, the inactive mini-course, and this public toolkit. Review the recording and slides, correct the exercise calculation and names, and determine which GPT links should be retained. Preserve a clear distinction between viewing materials, using an external GPT, requesting a resource, enrolling in a course, and requesting tailored training. Those are separate visitor commitments with different access requirements.
