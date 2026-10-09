# The supplied scorecard produces a full local readiness report

**Status:** accepted (October review issues #170–#173 and owner-provided
scorecard, 2026-10-09)

The owner supplied a replacement scorecard and requested its full report on
the page and a PDF download now, with email delivery deferred until launch.
This supersedes [ADR 0001](0001-native-scorecard.md)'s Plan B questions, four
editorial stages and external-provider fallback. The supplied source data is
preserved in `artifacts/review-tickets/170/source-data.json`.

The assessment has 18 questions: the assistant question supplies context;
17 questions award up to three points each, totaling 51. Overall and area
percentages round to whole numbers. The overall percentage determines
Foundations (0–40%), Ready to build (41–80%) or Ready to scale (81–100%).
The report preserves the five area recommendations, approved-access and
safeguard warnings, lowest-scoring quick wins with safeguards first on ties,
non-Claude note and stage/role routing. Warnings remain independent of a high
overall score. A perfect score has no invented quick wins.

Answers remain in page memory, with optional name and role used only for
personalization. Nothing is submitted, persisted or included in a URL. Every
visitor can read and download the report without contact details. The PDF is
created locally using dynamically loaded jsPDF and locally bundled Noto Sans
fonts, with readable text and explicit pagination. It contains all results,
recommendations, method and all 18 answers, including unscored context.

Source recommendations point to existing resource and training anchors or the
inquiry handoff. The bundled starter kit, Communication Intelligence package,
specific Saturday intensive and Advanced waitlist are disclosed as unpublished
where relevant. Their buttons neither simulate a destination nor enroll anyone.
The Strategic Advisor skill and published lesson remain the available resource.

Rejected: collecting email while delivery is unavailable, requiring contact
details to access a result, retaining the external provider, and exporting a
single report screenshot with clipped or unreadable text. The existing browser
report/download seam and pure scoring interface verify these decisions.
