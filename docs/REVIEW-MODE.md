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

4. When you're done, choose **Send**, download the file (or copy it) and send
   it over Slack or email. Then **Clear my feedback** so the next round starts
   empty.

Feedback waits in your browser until you clear it, across pages and visits.
**Exit** turns review mode off; saved feedback stays.

## For whoever acts on it

Save sent files under `feedback/`, which is ignored by git because the files
name reviewers.

`npm run feedback:issues -- <file>` prints one issue per item: title, labels
(`needs-triage`, `review-feedback`) and a body carrying the readable item plus
its JSON record. Add `--create` to open them with `gh`. This repository is
public, so its issues are too; confirm with the site owner before `--create`.
Re-running skips items already opened, matched by their feedback id.

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
`tests/review-mode.spec.ts` covers the journeys.
