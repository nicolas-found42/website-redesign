# Review mode

Review mode lets the team point at the exact thing on a preview page and say
precisely what should change. Each item records the page, section, element,
its current text and what the reviewer saw, so nobody has to reconstruct intent
from a meeting.

## For reviewers

1. Open the review link: `https://nicolas-found42.github.io/website-redesign/?review`.
   It stays on while you move between pages in that tab. The site owner — or
   whoever is running the review round — sends this link to reviewers out of
   band (chat or email), because the site deliberately does not advertise review
   mode to visitors. Lost the link? Open the site normally: if this browser
   already holds unsent drafts, a bar at the bottom offers **Resume review**,
   which reopens the same page with the link. With no saved drafts there is
   nothing to resume, so the page stays plain.
2. Choose **Add feedback**, then click the thing you want to change: a heading,
   a paragraph, a button, a picture, a whole section. **Larger area** and
   **Smaller area** adjust what you picked.
3. Optionally choose a kind of change, or choose **Not sure yet** and write a
   plain comment. For a classified change, answer what it asks:
   - **Wording**: edit the current text into exactly what it should say.
   - **Content**: add, remove or replace information, written out.
   - **Visual**: what looks wrong, and what it should look or feel like.
   - **Layout**: move, remove, combine or reorder, relative to a named section.

   Every item also asks **why** and **how important** it is. Tick **Change this
   everywhere** when one example stands for a site-wide pattern.

4. Optionally attach a real PNG screenshot or choose **Capture this tab** where
   supported. Inspect its preview, remove it or replace it before saving. Images
   will be public when you Send. Capture/upload failures leave written feedback
   available; the receipt offers an explicit text-only fallback. See
   [screenshots, browser support and limits](REVIEW-SCREENSHOTS.md).
5. Choose **Save feedback** to keep a local draft. **My feedback** lets you edit
   or delete drafts, across pages and visits.
6. When you're ready, choose **Send N feedback items** once. Saving does not
   publish; Send posts each saved item as a separate public GitHub issue, without
   a login or confirmation dialog. The notice explains: **Your feedback, name and any screenshots
   will be posted publicly on GitHub.** Your name is self-reported, not verified.
7. Keep the page open while sending. The receipt shows progress, each item's
   result, and links to created issues. Confirmed submitted versions leave the
   draft list. Failed or uncertain items stay saved; reconnect or retry later
   when sending is temporarily limited. A revision made during sending stays
   saved as new feedback. Discussion and editing published issues happen on
   GitHub. **Last receipt** reopens the receipt after a refresh.

**Exit** turns review mode off; unsent feedback and receipts stay in this browser.
If storage is refused, the tool warns that drafts only live on the current page.
When hosted sending is unavailable, the receipt says so on the spot — “Sending
isn’t set up on this site yet” — and keeps your words saved. **My feedback →
Download a copy…** opens the export panel (**Copy my feedback as text** or
**Download file**) so you can keep your own recovery copy; the preview under
**What the file contains** shows exactly what would be saved. Feedback for the
team is tracked in GitHub
Issues; retry hosted sending or use the issue tracker directly. Nothing leaves
the browser until a **Send** is confirmed.

## Running a review round

Review mode is invited, not advertised: the site owner (or the person who
collects the feedback) sends each reviewer their own link,
`https://nicolas-found42.github.io/website-redesign/?review`, by chat or email,
and tells them what to do once it opens:

1. **Add feedback**, then click the thing that should change.
2. Answer what the form asks and **Save feedback** — that is a local draft.
3. Repeat for every item, from any page.
4. **Send N feedback items** once when done; each item becomes a public GitHub
   issue. See **For whoever acts on it** below for the triage side.

A reviewer who loses the link before sending is not stuck: the site notices the
drafts already saved in their browser and offers **Resume review**. A reviewer
who never had the link sees the plain site and no dead controls.

Reviewers can choose **Not sure yet** and save a plain comment without choosing
kind-specific answers. Those records carry optional `kindUncertain: true`, so a
suggested category remains provisional through editing and issue formatting.
An unclassified comment uses `change.kind: "comment"` with its text in `detail`;
existing classified drafts keep their shape. Display glosses do not change stored
section identifiers or selectors.

## For whoever acts on it

Review feedback always comes through GitHub Issues. Before reading or acting on
it, follow [the issue-tracker conventions](agents/issue-tracker.md) and read the
issue's discussion and labels. Hosted submissions create issues with `needs-triage` and
`review-feedback`, and no assignee. Publication requests triage; it does not
authorize implementation.

For an uncertain hosted submission, recover the existing receipt before creating
another issue for the same feedback. See [hosted setup and recovery](REVIEW-SUBMISSION.md).

Each item's `target.selector` finds the element while the markup holds. When it
no longer resolves, find the element by `target.page`, `target.section` and
`target.text`. The feedback records what a reviewer wants, not an approved
commercial promise: read `docs/agents/domain.md` before changing copy, offers
or journeys an item touches.

## How it's built

`src/review/activation.ts` is the only part in the main bundle: it reads
`?review` and loads `src/review/review.ts` on demand, so visitors never fetch
the tools. It also renders the drafts-aware **Resume review** bar in the site's
own DOM (not the review shadow root) — plain markup and one `<style>`, with no
review code imported — so the nudge costs a first-time visitor nothing. The UI
lives in a shadow root, which keeps it out of the site's
styles and the site's styles out of it. `src/review/export.ts` owns the
exported file's text format and its parser.
`src/review/submission.ts` sends versioned snapshots to the Worker;
`worker/index.ts` owns validation, limits and durable recovery.
`src/review/issue.ts` formats the published GitHub issues.
`tests/review-mode.spec.ts` covers the browser journeys, and
`tests/submission-service.spec.ts` covers the service boundary with local D1.
