# Review mode

Review mode lets the team point at the exact thing on a preview page and say
precisely what should change. Each item records the page, section, element,
its current text and what the reviewer saw, so nobody has to reconstruct intent
from a meeting.

## For reviewers

1. Open a review link: `https://nicolas-found42.github.io/website-redesign/?review`.
   It stays on while you move between pages in that tab.
2. Choose **Add feedback**, then click the thing you want to change: a heading,
   a paragraph, a button, a picture, a whole section. **Larger area** and
   **Smaller area** adjust what you picked.
3. Choose the kind of change and answer what it asks:
   - **Wording**: edit the current text into exactly what it should say.
   - **Content**: add, remove or replace information, written out.
   - **Visual**: what looks wrong, and what it should look or feel like.
   - **Layout**: move, remove, combine or reorder, relative to a named section.

   Every item also asks **why** and **how important** it is. Tick **Change this
   everywhere** when one example stands for a site-wide pattern.

4. Choose **Save feedback** to keep a local draft. **My feedback** lets you edit
   or delete drafts, across pages and visits.
5. When you're ready, choose **Send N feedback items** once. Saving does not
   publish; Send posts each saved item as a separate public GitHub issue, without
   a login or confirmation dialog. The notice explains: **Your feedback and name
   will be posted publicly on GitHub.** Your name is self-reported, not verified.
6. Keep the page open while sending. The receipt shows progress, each item's
   result, and links to created issues. Confirmed submitted versions leave the
   draft list. Failed or uncertain items stay saved; reconnect or retry later
   when sending is temporarily limited. A revision made during sending stays
   saved as new feedback. Discussion and editing published issues happen on
   GitHub. **Last receipt** reopens the receipt after a refresh.

**Exit** turns review mode off; unsent feedback and receipts stay in this browser.
If storage is refused, the tool warns that drafts only live on the current page.
**My feedback → Download backup…** is available when hosted sending is unavailable.

## For whoever acts on it

Hosted submissions already create issues with `needs-triage` and
`review-feedback`, and no assignee. Publication requests triage; it does not
authorize implementation.

For the manual backup fallback only, save files under `feedback/`, which is ignored by git because the files
name reviewers.

`npm run feedback:issues -- <file>` prints one issue per item: title, labels
(`needs-triage`, `review-feedback`) and a body carrying the readable item plus
its JSON record. Add `--create` to open them with `gh`. This repository is
public, so its issues are too; confirm with the site owner before `--create`.
Re-running checks existing feedback IDs. The manual importer does not share the
service’s durable claim: never use `--create` for an unresolved hosted
submission or run it concurrently with hosted sending for the same items.
Recover the hosted receipt first; see [hosted setup and recovery](REVIEW-SUBMISSION.md).

Each item's `target.selector` finds the element while the markup holds. When it
no longer resolves, find the element by `target.page`, `target.section` and
`target.text`. The feedback records what a reviewer wants, not an approved
commercial promise: read `docs/agents/domain.md` before changing copy, offers
or journeys an item touches.

## How it's built

`src/review/activation.ts` is the only part in the main bundle: it reads
`?review` and loads `src/review/review.ts` on demand, so visitors never fetch
the tools. The UI lives in a shadow root, which keeps it out of the site's
styles and the site's styles out of it. `src/review/export.ts` owns the file
format and its parser; the import script loads that same module through Vite.
`src/review/submission.ts` sends versioned snapshots to the Worker;
`worker/index.ts` owns validation, limits and durable recovery.
`src/review/issue.ts` formats hosted issues and the fallback importer consistently.
`tests/review-mode.spec.ts` covers the browser journeys, and
`tests/submission-service.spec.ts` covers the service boundary with local D1.
