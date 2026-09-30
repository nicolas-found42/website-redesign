# Multi-page preview site map

All seven publicly discovered Lovable pages are implemented. Paths are preserved
and receive a trailing slash for static directory-index hosting.

| Source path                  | Destination under `/website-redesign/` | Purpose and next steps                                                                                                                                                                                             |
| ---------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/`                          | `/`                                    | Direct opening, free resources (the playbook entry with its review figure), three audience articles with its own scenes, services with an industries strip, attributed workshop accounts                           |
| `/resources`                 | `/resources/`                          | AI Readiness Scorecard answered on the page (original ScoreApp linked), separate workflow preview, failure-mode review figure, four original skill downloads and Strategic Advisor setup with its published lesson |
| `/services`                  | `/services/`                           | What an engagement looks like (`#engagements`), audience articles, Workshops, Workflows, Automations; scope lists and free/bespoke boundary                                                                        |
| `/industries/private-equity` | `/industries/private-equity/`          | Deal screening, diligence, portfolio operations and firm-specific criteria; founder band; a first-pass screen example without an unapproved savings figure                                                         |
| `/industries/b2b-saas`       | `/industries/b2b-saas/`                | Customer success, feedback triage, GTM enablement and team adoption                                                                                                                                                |
| `/about`                     | `/about/`                              | Complete founder biography and operating principles                                                                                                                                                                |
| `/blog`                      | `/blog/`                               | Three readable draft excerpts from existing essay material; honest newsletter availability                                                                                                                         |

Header, industry disclosure, mobile menu, footer and contextual links stay within
the deployment prefix. Resource links reach `#scorecard`, `#playbook`, `#library`
and `#course`, with `#toolkit` also available. Existing homepage anchors remain;
`#audiences` is the audience sequence
and `#audience-executives`, `#audience-contributors` and `#audience-builders`
its articles. Service schematic identifiers
(`training`, `automation`, `product`) remain stable internal geometry keys; the
visible offering names are Workshops, Workflows and Automations.

Talk to us opens a shared inquiry dialog that leads with the live Found42 contact
form; a service's Discuss button names that service in it. Strategic Advisor
links to the original downloadable skill and the verified Maven lesson, with
setup instructions on the page. The scorecard's questions and result, and the
workflow preview's result, are in-page states. The early-days scorecard result
links to the public Toolkit; the workflow preview offers an inquiry handoff.
These are client states, not extra page routes.

The three Blog excerpts expand in native disclosure elements on `/blog/`;
there are no separate article-body routes. The four original `.skill` ZIP
packages are static files under `resources/skills/`, with direct download links
on Resources. [Resource sources](resource-sources.md) records their provenance.
Legal and live inquiry links retain the existing external found42.com
destinations; those are not additional migrated pages. `/404.html` is an
additional implementation utility page.

See the migration manifest for the closed discovery queue and all source links.
