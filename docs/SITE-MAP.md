# Multi-page preview site map

All seven publicly discovered Lovable pages are implemented. Paths are preserved
and receive a trailing slash for static directory-index hosting.

| Source path | Destination under `/website-redesign/` | Purpose and next steps |
| --- | --- | --- |
| `/` | `/` | Direct opening, free resources (the playbook entry with its review figure), three-audience gallery with its own scenes, services with an industries strip, attributed workshop accounts |
| `/resources` | `/resources/` | AI Readiness Scorecard answered on the page (original ScoreApp linked), separate workflow preview, failure-mode review figure, resource access and course dialog |
| `/services` | `/services/` | Service catalog: training tracks (`#tracks`), formats and starting prices (`#formats`), beyond training (`#beyond-training`), two free sessions (`#start-free`), attributed client quotes |
| `/industries/private-equity` | `/industries/private-equity/` | Deal screening, diligence, portfolio operations and firm-specific criteria; founder band; a first-pass screen example without an unapproved savings figure |
| `/industries/b2b-saas` | `/industries/b2b-saas/` | Customer success, feedback triage, GTM enablement and team adoption |
| `/about` | `/about/` | Complete founder biography and operating principles |
| `/blog` | `/blog/` | Three forthcoming essay descriptions and newsletter preview |

Header, industry disclosure, mobile menu, footer and contextual links stay within
the deployment prefix. Resource links reach `#scorecard`, `#playbook`, `#library`
and `#course`. Existing homepage anchors remain; `#audiences` is the gallery
and `#audience-executives`, `#audience-contributors` and `#audience-builders`
its panels. Service schematic identifiers
(`training`, `automation`, `product`) remain stable internal geometry keys; the
visible offering names are Workshops, Workflows and Automations.

Talk to us opens a shared inquiry dialog that leads with the live Found42 contact
form; a service's Discuss button names that service in it. The course entry opens the Strategic Advisor
Mini-Course dialog. The scorecard's questions and result, and the workflow
preview's result, are in-page states; each result opens the inquiry dialog. These are
client states, not extra page routes.

The source has no article-body routes, legal routes, downloadable-file links,
service-detail routes or confirmation pages in its public route registry. The
three essays remain explicitly Coming soon. Legal and live inquiry links retain
the existing external found42.com destinations; those are not additional
migrated pages. `/404.html` is an additional implementation utility page.

See the migration manifest for the closed discovery queue and all source links.
