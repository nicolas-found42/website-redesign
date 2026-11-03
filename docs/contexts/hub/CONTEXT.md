# Redesign hub

This context defines how the repository holds many iterations of the Found42 website so the team can choose which to review, test and decide on. It is about the iterations themselves, not about Found42's offering, which the other contexts describe.

## Language

**Hub**:
The index page at the site root. It lists every version with a preview, its status and links, and is itself a neutral tool page with no Found42 design.
_Avoid_: Gallery, dashboard, portal

**Version**:
A complete, separately built redesign of the Found42 website, living in one folder under `versions/` and published at its own address. A version is distinct from a page, a review round and a feedback item.
_Avoid_: Iteration, variant, option, theme (when naming the thing itself)

**Slug**:
A version's permanent name: its folder name, URL segment and feedback label. Slugs other than `current` are generated, readable and never reused.
_Avoid_: ID, key

**Baseline**:
The `current` version: today's site, kept as the comparison point for every other version. It is a folder like any other with a fixed role; choosing a winner never changes what the baseline is.
_Avoid_: Production, live site, main

**Status**:
Where a version stands in the decision: draft, in review, shortlisted, chosen or archived. Recorded in the version's own `version.json`, so changing it is a reviewed edit.
_Avoid_: Stage, state, phase

**Chosen**:
A status meaning the team picked this version. It does not ship anything; making a version the real found42.com site is a separate decision outside the hub.

**Version contract**:
The small set of checks every version must pass whatever its design: it builds, is `noindex`, reads with scripts off, shows the hub strip, has no broken internal links, passes an accessibility smoke test, and loads review mode and sends feedback scoped to itself. Its `version.json` also declares `prerender` truthfully, so the build never infers it from whether a file happens to exist.

**Shared facts**:
The structured content about Found42's offering that every version draws from one place: destinations, contact details, biography, principles, resource inventory and testimonials with their attribution. A version changes how facts are presented, not what they say, unless its `version.json` declares `changesFacts`.
_Avoid_: Content (when the shared authority is meant)

**Hub strip**:
A neutral dark bar the build adds at the top of every page of every version. It names the version being viewed, shows its status, and links back to the hub. A version never includes it itself and cannot omit it.

**Preview**:
A screenshot of a version's home page, generated at build time at desktop and phone widths, shown on the hub card.

**Review link**:
A version's address with `?review`, which turns on review mode for that version. Feedback and drafts are scoped to the version they were made on.

## Relationships

- A **Version** has exactly one **Slug** and one **Status**, both discoverable only from its own folder.
- The **Hub** shows one card per **Version**; deleting a version's folder removes its card, preview, build output and tests, and leaves only its feedback issues on GitHub as history.
- **Shared facts** feed every **Version**; Credibility, Services and Resources own the meaning of what they contain.
- **Review link** feedback becomes a GitHub issue labelled with the **Version**'s slug.

## Example dialogue

> **Reviewer:** I'd like to try the new layout.
> **Team:** Open `amber-heron` from the **Hub**, or use its **Review link** to leave feedback on it. Anything you send is filed against that version.
> **Reviewer:** And if we like it?
> **Team:** We mark it **Shortlisted**, later **Chosen**. Making it the live site is a separate step.
