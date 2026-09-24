# The AI Readiness Scorecard is answered on the page

**Status:** accepted (stand-up follow-up, 2026-09-23); inquiry handoff updated
for issue #43; result wording awaits Found42 review

Richard asked on September 18 for the scorecard to be built into the site
rather than depend on the third-party tool. The resources page now asks the
questions itself (`src/interactions.ts`, content in `src/content.ts`) and
shows the result on the page. ScoreApp is no longer embedded; a link to it
remains for visitors who want its emailed PDF report.

- **Questions**: the Plan B assessment of Found42's "Scorecard Questions"
  draft (June 25–26), the separate-assessment structure the June 26 stand-up
  adopted. Ten questions fall under the five areas the ScoreApp landing
  advertises; two ask what has held the business back (cost, not being sure it
  would work); one open question asks what the visitor would automate
  instantly.
- **Result**: a readiness stage from the ten area answers, a status per area
  (in place, partly in place, next to build), up to three areas to start with,
  weakest first, and the advice for each barrier answered yes. Following the
  June 26 discussion there is no score and no number. The glossary's caution
  holds: this is a starting point for a conversation, not a certification or
  an audited measurement.
- **Privacy**: answers stay in the page. Nothing is sent, persistently stored
  or put in a URL. If the visitor chooses to plan a next step, the open answer
  is escaped and displayed as copyable context in the inquiry dialog. The
  visitor may carry it to Found42's live contact form; the page does not
  prefill or submit that external form.

Consequences worth knowing:

- The stages, thresholds, statuses and advice were written for this change and
  are not yet Found42's own outcome logic. Replacing them is a content edit in
  `src/content.ts` (`scorecard.stages`, each area's `advice`, each barrier's
  `advice`); `tests/render.spec.ts` checks all 4,096 answer sets against the
  thresholds.
- The live ScoreApp question set sits behind its lead gate and was not seen,
  so the two versions may differ. A **Readiness report** (the PDF) remains a
  ScoreApp deliverable; the page produces a readiness result, not that report.
- Rejected: keeping the iframe beside the native scorecard. Two assessments
  with the same name on one page, one of them collecting personal details
  first, is the confusion the request was meant to end.
- Rejected: collecting an email for the result. Plan B keeps the assessment
  broad and closed; intake belongs to a visitor ready to talk, who can open
  the live inquiry form through the dialog.
