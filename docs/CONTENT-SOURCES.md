# Content authority and migration provenance

This is the dated September 16 migration record. Its descriptions of the
opening, forms and eight-hour claims are historical; issue #43 changed those
visitor journeys and removed the unsupported Private Equity target. See
[current design](DESIGN.md), [validation](VALIDATION.md) and `src/content.ts`
for the active preview.

The migration content baseline is https://found42-claude-lab.lovable.app/, captured
September 16, 2026. The existing redesign supplies visual and engineering
conventions. The CEO positioning brief supplies the distinction: role-, industry-
and company-specific customization, with usable systems for executives and
practical training for domain experts. It does not authorize new offers or prices.

The complete source record, editorial replacements and validation references are
in `artifacts/lovable-migration/2026-09-16/manifest.json`. Companion `source/`
files include full markdown, browser text, public route/interaction bundles,
metadata and screenshots. No private source repository access is assumed.

215 captured visible/interaction text records are mapped to implementation.
The original source strings remain in the manifest; editorial replacements now
include the September 16 meeting changes. The complete biography is retained.
Sample quotations were replaced with faithful, attributed excerpts from the
original site’s C-Level AI workshop accounts. New audience
and customization explanations connect the existing offerings to actual work;
no packages, prices, endorsements or performance evidence were invented.

The homepage's absolute eight-hour claim is qualified as a target dependent on
workflow fit. The CEO's 80% ambition is not published as a universal guarantee.
The source's eight-hour service target and qualified PE target remain visible.

## Access and proof boundaries

- AI Readiness Scorecard: answered on the page since the stand-up follow-up.
  Questions from Found42's Plan B draft; stages and advice are drafts awaiting
  Found42 review ([Resources ADR 0001](contexts/resources/docs/adr/0001-native-scorecard.md)).
  No details required; nothing sent. The original ScoreApp assessment (details
  required, PDF report) is linked, no longer embedded. The separate local
  workflow preview retains prototype scoring (1–3, >=9 strong / >=6 promising).
- Failure Mode Playbook: 12 checks advertised; email gate preserved. No file or
  delivery integration supplied.
- Skills Starter Library: four patterns advertised; email gate preserved. No
  files or fulfillment integration supplied.
- Strategic Advisor Mini-Course: five daily lessons advertised; all modal
  descriptions and content-list items retained. Lessons and enrollment absent.
- Newsletter: form and validation preserved; no subscription integration.
- Inquiry: source fields and constraints retained. Local validation is a preview,
  never a received-request confirmation. Existing live contact form is the fallback.
- Blog: three titles, descriptions, estimated reading times and Coming soon
  labels retained. No article bodies exist in the discovered public source.
- Testimonials: attributed workshop excerpts rechecked on found42.com; not
  generalized evidence for new automation engagements.

Public source form handlers merely change local state; their “sent” and
“received” confirmations do not establish delivery. The migration replaces those
messages with explicit unavailability. No source form was submitted with real
contact details; no external test inquiry or subscription was sent.

The existing bundled Found42 logo and Richard Achée portrait represent the same
brand/person imagery found in the source. Existing asset/license notices remain.
No temporary Lovable asset URLs are used at runtime. Lovable editor chrome and
its platform badge are deliberately excluded.

External contact, privacy and terms pages returned HTTP 200 on September 16.
Reachability does not prove submission routing or legal suitability. Earlier
found42.com research is retained as dated history, not the new content baseline.

See [meeting coverage](MEETING-COVERAGE.md) for current source checks, editorial
choices, transcript interpretation and remaining dependencies, and
[STANDUP-CONVERGENCE.md](STANDUP-CONVERGENCE.md) for the later stand-up: the
opening headline now uses Richard's clarity benchmark ("Hands-on Claude skills
and training for your business."), the course dialog's "no fluff" line is
replaced with what the course provides, and the audience scenes draw only
roles, skills and steps already present in the site's content. The manifest
keeps the original strings (`home-002`, `course-7`) as provenance.

## Organization marks (September 29)

The homepage row "Teams we have worked with" shows 15 marks under
`public/assets/logos/`, retrieved September 29, 2026 from each organization's
own site or official LinkedIn company page. The owner confirmed the 15 relationships and, in chat on September
29, that every mark's use is approved with the organizations concerned. The site
does not verify that approval; it is recorded here as the owner's attestation.

| Mark                                     | File                          | Official source                                                                                | Notes                                                                                                                                                                                                                          |
| ---------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Google                                   | `google.svg`                  | Google's hosted logo, `gstatic.com/images/branding/googlelogo/svg/googlelogo_clr_74x24px.svg`  | [Google brand guidance](https://about.google/brand-resource-center/guidance/) asks partners to request internal review before using the logo to imply a business relationship; that approval is the owner's attestation above. |
| Edgescale AI                             | `edgescale-ai.svg`            | `edgescaleai.com/wp-content/uploads/2025/12/EdgescaleAI-Logo.svg`, the mark in the site header | The company publishes only this mark, in off-white for its dark ground, so it is shown unaltered on a charcoal tile. No wordmark lockup was found; the accessible name carries the name.                                       |
| Millsapps, Ballinger & Associates (MB&A) | `mba.jpg`                     | `mbaoutcome.com/wp-content/uploads/2023/04/MBA-Logo-color.jpg`, the site's own logo image      | A 400 × 215 JPEG on white, so it is shown on the row's white cell. A vector or larger file would sharpen it.                                                                                                                   |
| Seidler Equity Partners (SEP)            | `seidler-equity-partners.svg` | `sepfunds.com/wp-content/uploads/Seidler-logo-color.svg`, the mark in the site header          | Bundled byte for byte, in its own navy `#093a80` and grey `#474747` fills, on the row's white cell.                                                                                                                            |
| PeakSpan Capital                         | `peakspan-capital.svg`        | The header mark on `peakspancapital.com`, copied from the page markup                          | The site draws it in `currentColor`; it is filled with the color the header renders it in, `#05304a`.                                                                                                                          |

No brand-use terms were found for Edgescale AI, MB&A, SEP or PeakSpan Capital
beyond their public sites; the search was not exhaustive. The ten additions in #80 were fetched again from the chosen files on September 29. Marajá, Ruruka and MINDSi Sports Performance are the official anonymous
LinkedIn 200 × 200 JPEGs, so their resolution is limited. ParaVet.live's header
SVG is extracted intact; the XML namespace is added so it is a standalone SVG
image document. No paths, colours or proportions are changed. Marks are never
recolored, cropped or stretched; each keeps its own proportions.

### Additional official files for #80

| File                             | Source                                                                                                                                                                                           | Notes                                                                           |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `palladium-security.png`         | https://cdn.prod.website-files.com/66d33e9163dc6e8af2d2c1a9/66e16873d430486db926f74a_logo.png                                                                                                    | Official shield symbol; no wordmark supplied.                                   |
| `crown-point-advisory-group.svg` | https://crownpointadvisorygroup.com/favicon.svg                                                                                                                                                  | Official favicon mark on its own navy square; the site wordmark is live text.   |
| `idc.png`                        | https://cdn.prod.website-files.com/608074cd49c3ef489d9d98b4/654288cdaa31333aead63621_IDC_LogoType_Horizontal_FullColor_Red%20website%20bottom.png                                                | Original official file, bundled unchanged.                                      |
| `mobile-club.svg`                | https://www.mobile.club/images/logo/logo-default.svg                                                                                                                                             | Original official file, bundled unchanged.                                      |
| `prelude-solutions.avif`         | https://preludesolutions.com/wp-content/uploads/2025/05/Prelude-Solutions-Logo_Tagline-2025.avif                                                                                                 | Official 2025 wordmark with tagline, avoiding the dated anniversary lockup.     |
| `maraja.jpg`                     | https://media.licdn.com/dms/image/v2/D4D0BAQGwaq-XvMH2pg/company-logo_200_200/company-logo_200_200/0/1720753753570?e=2147483647&v=beta&t=lyONwMwlDaucSJKpqc_qtJXB_pBK5wzJnLnMjfXqxdk             | Original official file, bundled unchanged.                                      |
| `ruruka.jpg`                     | https://media.licdn.com/dms/image/v2/D4D0BAQGhUafJtcMh3A/company-logo_200_200/company-logo_200_200/0/1720753589394/ruruka_logo?e=2147483647&v=beta&t=iv04FCyWedjS9zduFhS3d4oBA6e0pocxEwx2HjTxpNU | Original official file, bundled unchanged.                                      |
| `mindsi-sports-performance.jpg`  | https://media.licdn.com/dms/image/v2/C4E0BAQHjhqU5OFV0RA/company-logo_200_200/company-logo_200_200/0/1631303694175?e=2147483647&v=beta&t=zbqMaZQPWIgbKqX9lDkT-08uI94yRLf-cPDShJChERI             | Original official file, bundled unchanged.                                      |
| `paravet-live.svg`               | https://paravet.live/ (unaltered header inline SVG)                                                                                                                                              | White/orange header artwork on a charcoal tile; standalone XML namespace added. |

The official company pages were checked again on September 29, 2026:
[Marajá](https://www.linkedin.com/company/maraja/),
[Ruruka](https://www.linkedin.com/company/ruruka/) and
[MINDSi Sports Performance](https://www.linkedin.com/company/mindsi/).
The source URLs above identify their published 200px LinkedIn files.

### Mindsight correction (#163, October 9)

The owner corrected the MINDS-i Education entry to **Mindsight**, identified by
its [official LinkedIn page](https://www.linkedin.com/company/mindsighters/).
MINDSi Sports Performance remains a separate, independently approved entry.
`public/assets/logos/mindsight.jpg` replaces the unused Education image;
its original 200 × 200 JPEG bytes, blue ground and proportions are preserved.
The visible caption and accessible name are both Mindsight.

The logo was retrieved October 9, 2026 from the official company page's primary
image, whose alt text is `mindsight`. The page links to
[Mindsight's website](https://www.mindsight.inc/). The published file is
[the official LinkedIn company image](https://media.licdn.com/dms/image/v2/D560BAQGud2XWbl3QPQ/company-logo_200_200/company-logo_200_200/0/1697808229215/mindsighters_logo?e=2147483647&v=beta&t=3F8DDlZlS8dV7XsV3lWXb2SDY7jHKN6-T9V1zzBrRGA).
The earlier Education asset references in dated migration material are
superseded identity evidence, not the current relationship list.

## Portfolio companies page and navigation (#169, October 9)

The owner-approved review separates Private equity and Portfolio companies and
renames the B2B SaaS navigation label to Software companies. The portfolio page
reuses the existing Portfolio operations and Custom skills descriptions from
`src/content.ts`, the Individual Contributors and Teams role-training copy from
`src/audiences.ts`, and the existing Team adoption wording. Private equity keeps
deal screening, diligence and the firm's criteria. No new offer, price,
relationship, measured result or integration claim is introduced.
