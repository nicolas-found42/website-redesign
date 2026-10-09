# Launch dependencies

The original seven-page content migration and the Portfolio companies page
added in #169 are implemented as a noindex preview. These
items remain incomplete and must not be represented as delivered:

1. Supply the 12-check Failure Mode Playbook. Four original Claude skill packages
   from Drive are now downloadable. The Strategic Advisor resource offers its
   published lesson and original skill package; a five-day lesson sequence was
   not found and is not advertised. See [resource sources](resource-sources.md).
2. Connect approved inquiry and newsletter processing, consent requirements,
   error/retry behavior and delivery confirmation. The present source only
   simulates success. Existing external contact is a fallback, not proof of routing.
3. Review the three existing essay drafts before publishing complete articles.
   Selected method excerpts are readable on the Blog page. Unverified numerical
   claims and case studies are omitted, with no invented author, publication date
   or reading time. See [resource sources](resource-sources.md).
4. Workshop excerpts now have original-site attribution. Substantiate numerical
   savings before treating targets as achieved results; obtain offering-specific
   evidence for automation work.
5. Review policy applicability, resource-use rights and any production consent
   requirements with the business owner. Existing legal destinations are preserved.
6. Review the PR, merge through the normal workflow, then verify the public
   GitHub Pages deployment. Domain changes and removing noindex need separate
   production-launch authorization.

7. Supply the Executive Communications Mini-Course content, destination and launch
   status before inserting it after Strategic Advisor. Confirm the relationship
   between the published AI Failure Modes Playbook and prototype 12-check edition.
8. Connect optional scorecard email delivery at launch, with approved consent,
   delivery confirmation and retry behavior. The full on-page report and local
   PDF download already work without contact details; no email is collected now.
9. Publish approved destinations and availability for the source report's
   bundled starter kit, Communication Intelligence package, Go-to-Market
   Saturday intensive and Advanced waitlist before advertising enrollment.
   Current report links use existing resources/training tracks or inquiry
   handoffs, and state when those specific packages are unavailable. See
   [Resources ADR 0002](contexts/resources/docs/adr/0002-native-readiness-report.md).
10. Decide the services section's direction; nothing new was invented there.
11. Reconfigure the live HubSpot inquiry form (issue #37): start the news and
    updates preference unselected, and make the further-communications
    agreement optional so an inquiry needs only processing consent. The consent
    wording is the business owner's decision (item 5). Once it changes, remove
    the inquiry dialog's note describing the current defaults
    (`src/interactions.ts`, `liveInquiry`).

No credentials or paid service configuration were created during migration.
Physical-device, screen-reader and field-performance validation remain separate
from the recorded browser-engine checks. See the migration validation report for
exact local coverage.
