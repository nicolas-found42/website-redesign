# Next-stage backlog

- Obtain visual and content acceptance for the Working Drawings direction; the previous light editorial selection is superseded by it, and complete-page approval is separate.
- Confirm the opening drawing's node labels read as intended to an outside reader: "what your business knows" and "practical AI at work" are illustrative vocabulary, not named capabilities.
- Verify the merged GitHub Pages deployment and its repository-relative assets, then share the hosted URL. Do not equate the local preview with a published preview.
- Finish the required stable branded-browser and real-device matrix (see VALIDATION.md), including how the sticky services sequence and the pointer-depth drawing behave on a real touch device and on a low-powered phone.
- Review the page's length on a phone: it is 37% longer than the design it replaces, which buys a labelled drawing for every service. Decide whether that trade holds after outside-reader testing.
- Resolve production Contact service-interest wording: “Growth Platform” does not exactly match B2B SaaS product differentiation.
- Review separate news preference, communications consent and processing consent; do not silently change production form behavior.
- Verify prompt-pack and playbook fulfillment, assessment questions/results/report delivery and inquiry routing in an appropriately authorized test environment. No forms were submitted during this prototype work.
- Restore or replace the inactive C-Level AI mini-course before promotion. Verify toolkit media and exercise corrections separately.
- Substantiate any numerical/ROI claims before reintroducing them; obtain any needed asset rights and higher-resolution brand masters.
- Correct the live Terms page’s Privacy Policy target and review legal adequacy with the appropriate owner.
- Consider pre-rendering the page's markup into `index.html` at build time. The page is composed by a pure function, so the markup could be emitted by the build and the script left to enhance it; today the document is empty until the script runs, which is the architecture this prototype has always had. That would give the page content without JavaScript and paint real content before the bundle arrives, at the cost of a build-time render step.
- Plan production migration, domain/redirect changes, analytics and conversion baselines as separate work.
- Collect field Core Web Vitals once hosted. The recorded loading and frame figures are one local unthrottled run, not field data.
