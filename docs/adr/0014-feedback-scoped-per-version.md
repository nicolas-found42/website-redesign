# Review feedback is scoped to one version

Review mode serves many versions from one origin and one Worker.

## Decision

- Every feedback submission names its version through its `site`, which is the
  version's own URL (`https://…/website-redesign/<slug>/`). Contract version 2
  replaces version 1 with no compatibility layer.
- The Worker validates the slug by pattern, not by a list, and validates a page
  as a safe site-relative path, so adding or removing a version needs no Worker
  deployment. It still fixes the repository, labels and operation; the client
  cannot choose them.
- Each issue gets the usual `needs-triage` and `review-feedback` labels plus
  `version:<slug>`, a `[slug]` title prefix and a **Version** line in its body.
- Browser drafts, **My feedback**, **Resume review** and receipts are kept per
  version (`found42-review:feedback:<slug>`) and **Send** posts one version's
  items. Another version's drafts are never shown or sent.
- Feedback is about one version per item. Votes and comparative feedback are
  deferred until the single-version flow is proven.

## Consequences

- The Worker cannot reject a page that does not exist in a version; the page,
  selector and text are still recorded for whoever triages it.
- A reviewer who moves between versions keeps separate drafts for each.
- GitHub creates the `version:<slug>` label on first use; verify this in the
  synthetic release check described in `docs/REVIEW-SUBMISSION.md`.
