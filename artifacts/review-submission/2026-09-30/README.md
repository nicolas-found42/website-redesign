# Review submission evidence

Comparable Chromium captures use the same synthetic saved wording draft on the
home page, with reduced motion, at 1440 × 1000 and 390 × 844.

- **Before**: main commit `c3420032fc007f5638b5c98892a3aa41d22488ee`; Send opens
  the download/copy handoff.
- **After**: the #108 implementation; the bar shows the count and public notice,
  and one Send opens a receipt and removes the confirmed submitted draft.
- **Receipt boundary**: the service response is controlled locally. The issue
  link in these captures is a rendering fixture pointing to #108, not a newly
  created feedback issue. Live hosted verification is recorded separately in
  the implementation PR.

| Scenario      | Before                          | After                         |
| ------------- | ------------------------------- | ----------------------------- |
| Desktop draft | [Before](before-1440-draft.png) | [After](after-1440-draft.png) |
| Desktop Send  | [Before](before-1440-send.png)  | [After](after-1440-send.png)  |
| Phone draft   | [Before](before-390-draft.png)  | [After](after-390-draft.png)  |
| Phone Send    | [Before](before-390-send.png)   | [After](after-390-send.png)   |

Validation: `npm test -- --workers=4` passed all 563 tests across the three
browser engines and the unit/service project. The service tests use local D1
and controlled GitHub responses; routine tests create no live issues.
