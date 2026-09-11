# Context Map

This map organizes the Found42 website's domain vocabulary. The contexts describe distinct visitor needs and offerings; their documentation locations do not prescribe application packages or a technology stack.

## Contexts

- [Resources](docs/contexts/resources/CONTEXT.md): free materials, public reading, assessments, requests, and fulfillment. [Inventory and access audit](docs/contexts/resources/AUDIT.md).
- [Learning](docs/contexts/learning/CONTEXT.md): C-Level AI workshops, toolkit, advisory tools, and fictional practice exercises. [Learning audit](docs/contexts/learning/AUDIT.md).
- [Services](docs/contexts/services/CONTEXT.md): tailored training, workflow automation, product differentiation, and growth platforms. [Offer and claim audit](docs/contexts/services/AUDIT.md).
- [Inquiries](docs/contexts/inquiries/CONTEXT.md): consultation requests, discovery, service interests, and communication choices. [Journey audit](docs/contexts/inquiries/AUDIT.md).
- [Credibility](docs/contexts/credibility/CONTEXT.md): founder identity, testimonials, reported outcomes, and brand assets. [Evidence audit](docs/contexts/credibility/AUDIT.md).

## Relationships

- **Resources → Services**: visitors can explore useful material before considering tailored help. Requesting a resource is distinct from requesting a consultation.
- **Services → Inquiries**: a visitor may express interest in a service through a consultation inquiry. Service names and form interest labels are separate vocabularies; their current mismatch is recorded in the specification.
- **Resources → Inquiries**: resource discovery and consultation are separate visitor journeys. A resource access form does not establish a consultation booking.
- **Learning ↔ Resources**: Resources owns discovery, access, and fulfillment vocabulary; Learning owns workshop/toolkit content and exercises. A publicly accessible toolkit does not prove course enrollment works.
- **Learning → Inquiries**: the C-Level AI sequence promotes discovery after workshop and scorecard activity. That narrative does not establish an enforced prerequisite for making an inquiry.
- **Learning ↔ Services**: a free workshop can introduce tailored team training, but the C-Level AI sequence and the 3-Step ROI Accelerator describe different engagements.
- **Credibility → Learning / Services / Resources**: biography, testimonials, and reported results support specific accounts. Fictional exercises and promotional examples are not customer outcome evidence.

## Supporting documents

- [Found42 website prototype map](https://github.com/nicolas-found42/website-redesign/issues/9) (issue tracker): destination, settled direction, open decisions and scope. Supersedes the removed `SPEC-PLAN.md`.
- [Deep site audit](docs/contexts/SITE-AUDIT.md): current findings, priorities, coverage, and evidence limits; read before proposing navigation, content, or journey changes.
- [Source register](research/deep-audit-sources-2026-09-09.json): requested and final URLs, response status, and page titles for 28 retrieved sources.
- [Earlier site audit](research/site-audit-2026-09-09.md): historical baseline; expanded and qualified by the deep audit.
- [Domain documentation rules](docs/agents/domain.md): glossary consumption and ADR locations.
