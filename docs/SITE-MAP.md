# Multi-page preview site map

All seven publicly discovered Lovable pages are implemented. Paths are preserved
and receive a trailing slash for static directory-index hosting.

| Source path | Destination under `/website-redesign/` | Purpose and next steps |
| --- | --- | --- |
| `/` | `/` | Two audience pathways, four resources, services, sample proof, inquiry |
| `/resources` | `/resources/` | Four-question assessment, resource access forms and course dialog |
| `/services` | `/services/` | Workshops, Workflows, Automations; scope lists and free/bespoke boundary |
| `/industries/private-equity` | `/industries/private-equity/` | Deal screening, diligence, portfolio operations and firm-specific criteria |
| `/industries/b2b-saas` | `/industries/b2b-saas/` | Customer success, feedback triage, GTM enablement and team adoption |
| `/about` | `/about/` | Complete founder biography and operating principles |
| `/blog` | `/blog/` | Three forthcoming essay descriptions and newsletter preview |

Header, industry disclosure, mobile menu, footer and contextual links stay within
the deployment prefix. Resource links reach `#scorecard`, `#playbook`, `#library`
and `#course`. Existing homepage anchors remain. Service schematic identifiers
(`training`, `automation`, `product`) remain stable internal geometry keys; the
visible offering names are Workshops, Workflows and Automations.

Talk to us opens a shared inquiry dialog. Start free opens the Strategic Advisor
Mini-Course dialog. The assessment result opens the inquiry dialog. These are
client states, not extra page routes.

The source has no article-body routes, legal routes, downloadable-file links,
service-detail routes or confirmation pages in its public route registry. The
three essays remain explicitly Coming soon. Legal and live inquiry links retain
the existing external found42.com destinations; those are not additional
migrated pages. `/404.html` is an additional implementation utility page.

See the migration manifest for the closed discovery queue and all source links.
