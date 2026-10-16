# Found42 website preview

An eight-page Found42 site built with Vite and TypeScript. The Lovable content
baseline is expressed through the existing **Working Drawings** visual system:
paper and ink, red signals, editorial typography, and responsive schematic
illustrations. The opening says it plainly: hands-on Claude skills and
training for your business — usable systems for executives, practical training
for the people doing the work, built around a specific role, industry and company.

This is a noindex design preview. Local resource delivery, newsletter
subscriptions, course enrollment and local inquiry submission are not
connected. The AI Readiness Scorecard asks 18 questions and generates its full
personalized report and PDF locally; it sends nothing, and email delivery is
deferred until launch. Each of the eight content pages opens with one preview
notice — “Design preview: nothing you type here is sent, and requested
resources are not delivered yet.” — above the opening, rather than each card
repeating it. Forms validate locally and state that nothing was sent. The
inquiry dialog leads with the established Found42 contact form; its local draft
can be checked and copied into that form.

## Review mode

Reviewers open the review link,
**https://nicolas-found42.github.io/website-redesign/?review**. The `?review`
parameter stays on while they move between pages in that tab; `?review=off` or
the toolbar's **Exit** ends it. The site deliberately does not advertise the
mode, so whoever runs a review round sends the link out of band. **Add
feedback** records the page, section, element and current text behind a precise
change request, **Save feedback** keeps a local draft, and **Send** posts each
saved item as a separate public GitHub issue through the hosted Worker. Drafts
and receipts stay in the reviewer's browser until Send.

`src/review/activation.ts` is the only review code in the main bundle: it reads
`?review` and loads the tool on demand, so ordinary visitors never fetch it.
Guide for reviewers and triage: [review mode](docs/REVIEW-MODE.md).

## Start here

- **Working on the code?** [CONTRIBUTING.md](CONTRIBUTING.md) — branching, the
  Node requirement, every npm script and the pre-commit hook.
- **Where things live and how they ship?** [Architecture and hosting](docs/ARCHITECTURE.md).
- **Running tests?** [Testing guide](docs/guides/testing.md).

## Documentation

- [Architecture and hosting](docs/ARCHITECTURE.md)
- [Site map](docs/SITE-MAP.md)
- [Content authority and access limits](docs/CONTENT-SOURCES.md)
- [Visual system](docs/DESIGN.md)
- [Validation status](docs/VALIDATION.md)
- [Launch dependencies](docs/LAUNCH-BACKLOG.md)
- [Review mode](docs/REVIEW-MODE.md): how the team sends exact feedback
- [Hosted submission](docs/REVIEW-SUBMISSION.md): Worker setup, receipts and
  release verification
- [Review screenshots](docs/REVIEW-SCREENSHOTS.md): optional image evidence,
  limits and retention
- [Teardown](artifacts/lovable-migration/2026-09-16/teardown.md)
- [Source-derived manifest](artifacts/lovable-migration/2026-09-16/manifest.json)

The earlier found42.com audits remain historical evidence. Their homepage-only
scope and older offer/resource taxonomy do not constrain this migration.

September 16 meeting implementation: [requirements and Adejoke handoff](docs/MEETING-COVERAGE.md).
Stand-up convergence (direct opening, audience scenes, failure-mode figure,
copy changes): [implementation record](docs/STANDUP-CONVERGENCE.md).
