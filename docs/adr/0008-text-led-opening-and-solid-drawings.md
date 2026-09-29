# A text-led opening, solid drawings and revised scenes

**Status:** accepted (2026-09-29); supersedes the parts of
[ADR 0005](0005-approachable-visual-voice.md),
[ADR 0006](0006-drawings-made-of-material.md) and
[ADR 0007](0007-approved-layout-with-deployed-drawings.md) named below

The September 29 review of the preview (issue #74) is new owner direction after
issue #56 and ADRs 0005–0007, which had approved preserving the deployed
drawings and the homepage counts. Where the two conflict, this decision
governs; the owner's review is the source of truth and the earlier records are
history.

## What changes

- **The opening carries no drawing.** The plait is gone from the homepage
  opening along with the space held for it: the headline, the Claude
  explanation, the two actions and the attributed participant quote share the
  whole width. The plait remains beside the copy on the industry pages, drawn
  without patterns. This supersedes ADR 0006's opening drawing and the
  approved hero in ADR 0007.
- **The proof band is gone.** "Found42 in numbers" (20+ workshops, 500+ people,
  50+ skills and workflows) is removed. The owner judged the numbers not yet
  strong enough to lead with. This supersedes the approved counts in ADR 0007
  and issue #56's preservation of them.
- **Organizations are shown by their own marks.** "Teams we have worked with"
  shows five logos in the owner's order — Google, Edgescale AI, Millsapps,
  Ballinger & Associates (MB&A), Seidler Equity Partners (SEP) and PeakSpan
  Capital. Each is the organization's own mark from its official site, bundled
  locally and shown unaltered. The owner confirmed the relationships and that
  each mark's use is approved; the site does not verify that approval.
- **No decorative textures in any drawing.** The dots, stripes and rules that
  ADR 0006 gave the first three node identities, and every dashed or stitched
  detail, are removed from every visualization on every route. Strips and
  surfaces are solid fills with charcoal outlines; functional outlines and
  connections remain. This supersedes ADR 0006's print prescription.
- **The audience name is "Individual Contributors and Teams"** (superseding
  "Teams and individual contributors") in the choice, the selected scene, its
  accessible names, its Services link and the Services audience field. The shared
  introduction promises role-tailored workshops that "save you 4-8 hours every
  week"; the owner approved that numeric wording for display, and it is not to
  be extended into other measured-result claims.
- **Selection carries no leading bar.** The audience cards mark selection by a
  rule along their top, their ground and their edge at every width; the narrow
  leading bar is removed.

## Scenes

- **Individual Contributors and Teams** replaces the ring with a gate. Four
  role ribbons — alternating #c42323 red, charcoal and white — run through
  their skills, braid together and pass through a gate labelled "Human in the
  loop". This supersedes ADR 0006's ribbons through a ring.
- **Executives** shows an illustrative Claude Daily Brief in place of the
  operating view: Critical, Needle Movers, Calendar Intelligence, Pipeline &
  Revenue and Recommended Actions, with the executive's decision stamped on the
  recommendations. It is fictional and does not imply a live Claude, email,
  calendar or CRM integration. This supersedes ADR 0005's rejection of a
  daily-brief visual and ADR 0006's roller onto an operating view. The
  weekly-briefing band is unchanged.
- **AI builders** begins the stair at Design: Design → Test → Troubleshoot →
  Anticipate failures → Workflow in use, each reviewed. This supersedes ADR
  0006's three-step stair.
- **Workshops** shows people at a whiteboard with sticky notes and a diagram,
  then at a keyboard, then gathered for group review, leaving with a reusable
  skill they apply afterwards. This supersedes ADR 0006's folded loop.

## What stays

ADR 0006's architecture: content and artwork are separate modules, a part is
the unit of a drawing, pieces are placed and not drawn, words are real text over
the artwork, every composition is authored for wide and narrow fields, and the
still composition is the resting state under reduced motion and without script.
Workflows, Automations and the review scene keep their objects and only lose
their patterns. Routes, inquiry handoff, review mode, noindex and base-aware
paths are unchanged.

`tests/fixtures/diagram-inventory.json` remains the record of what each drawing
says, revised by hand — not regenerated, which would make the test agree with
the code by construction — for the words and sequences changed above.
