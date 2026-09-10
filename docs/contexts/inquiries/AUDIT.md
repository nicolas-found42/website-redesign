# Inquiries: conversion and consent journeys

Observations checked September 9, 2026. [CONTEXT.md](CONTEXT.md) defines inquiry terms. This is a UX and content audit; it does not determine legal compliance.

## Inquiry versus discovery versus booking

The homepage's discovery link and free-consultation CTA both lead to `/contact`. That page contains a HubSpot inquiry form, not a date/time selector. The separately indexed `/appointments` route returned a real 404 with a page-not-found message. Its indexed booking description is stale discovery evidence, not a working booking journey. [Sources: homepage](https://www.found42.com/), [contact](https://www.found42.com/contact), [appointments](https://www.found42.com/appointments).

The C-Level AI Discovery Session is described as using the workshop and scorecard to identify relevant AI opportunities and a practical action plan. The site does not establish that completing those steps is a technically enforced prerequisite to contacting Found42. Recommendation: use inquiry language for the current route and explain discovery as the possible next conversation, without promising an appointment or response deadline. [Source: discovery section](https://www.found42.com/).

## Contact form inventory

The embedded form was inspected after it loaded. Required markers and defaults below describe the UI, not submission validation. [Source: contact form](https://www.found42.com/contact).

| Control | Observed state |
|---|---|
| First name, last name, organization name | Present; not marked required |
| Email | Marked required |
| News and updates | Yes/No radio choice; **Yes initially selected** |
| Service interests | Multiple checkboxes: Training, Automation, Growth Platform |
| Message | Text area; not marked required |
| Further communications | Separate unchecked agreement, marked required |
| Storage and processing | Separate unchecked agreement, marked required |
| Human verification | reCAPTCHA present |
| Submission | Submit button; success, error, routing, and delivery not tested |

Selecting No for news while being asked for mandatory agreement to other communications could be confusing. The wording does not clearly explain how those preferences differ. Review the fields together and confirm intended behavior before migrating them. This finding is about observable presentation, not whether a particular law is satisfied.

Training and Automation broadly correspond to homepage service categories. Growth Platform does not exactly match AI Product Differentiation for B2B SaaS and should not silently be relabeled during form migration. The [Services audit](../services/AUDIT.md) describes the wider offering behind that older term.

## Contact channels and policy navigation

The footer publishes `richard@found42.com` and `(646) 300-1247`; the privacy page publishes `privacy@found42.com`, and the terms page publishes `legal@found42.com`. These are displayed contact channels; mailbox operation and response handling were not tested. [Sources: contact](https://www.found42.com/contact), [privacy](https://www.found42.com/privacy-policy), [terms](https://www.found42.com/terms-of-use).

The Terms page has a concrete navigation defect: its introductory Privacy Policy link points to a `chatgpt.com/c/…` conversation URL. The footer's Privacy Policy link correctly points to the site's privacy page. The incorrect destination was verified from the link target without opening the conversation. Replace the introductory link with the public policy destination in subsequent site work. The opening also contains drafting-style introductory copy that should be removed. [Source: Terms of Use](https://www.found42.com/terms-of-use).

The privacy policy covers the `.com` and `.io` sites and describes information collection, inquiries, marketing, tracking, and third-party providers. Its effective-date text misspells April. The terms describe site use as personal and non-commercial, while the resources are marketed for business work; the intended policy and resource-use terms need owner/legal review. This audit does not infer the agreement's enforceability or draft replacement legal language. [Sources: privacy](https://www.found42.com/privacy-policy), [terms](https://www.found42.com/terms-of-use), [prompt packs](https://www.found42.com/industryprompts).

## Boundaries for implementation

Resource-request forms and assessment entry are cataloged in [Resources](../resources/AUDIT.md); they are not consultation requests. Review any later integration against the intended recipient, confirmation experience, retries, and preference handling. Form presence cannot establish email delivery, CRM workflow correctness, or booking availability. All production submissions remain untested.

Prioritize the incorrect policy link, clarity of inquiry labels, and consent-choice presentation. Preserve working contact and policy destinations while planning changes to the underlying forms.
