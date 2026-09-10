# Validation record

Checked September 9, 2026, macOS, Node 26.8.1. User selected the light editorial hero; final complete-page acceptance remains pending. This is a functional local prototype, not a verified public deployment.

## Automated checks

- `npm run typecheck`: pass (strict TypeScript application source).
- `npm run build`: pass; static `dist` output, relative Vite base.
- `npm test`: **27 passed** across Chromium, Firefox and WebKit. Nine public-browser tests per engine cover opening actions; resource gates and outbound destinations; offers, proof and inquiry; mobile menu/keyboard/focus; reduced motion and workflow selection; axe at 390, 768 and 1440px; local assets with external requests blocked.
- `git diff --check`: pass.
- TDD evidence: the opening test failed on the missing H1, resource test on missing gate/card, service/proof test on missing service heading, and mobile keyboard test on focus loss before each implementation slice. The mobile focus issue was fixed with explicit section-heading focus after closing navigation.
- macOS WebKit uses Option-Tab to reach links in its default keyboard configuration; the test accommodates that OS behavior. Tests use ordinary Tab elsewhere.

## Render checks and actual coverage

| Browser                 | Version       | Checked                                                                                                                  |
| ----------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Playwright Chromium     | 153.0.8010.12 | 27-test suite share; desktop/mobile production renders; 768px automated layout                                           |
| Playwright Firefox      | 155.0         | Same public journeys and accessibility; desktop/mobile production renders                                                |
| Playwright WebKit       | 26.6          | Same public journeys and accessibility; desktop/mobile production renders                                                |
| Installed Google Chrome | 152.0.7977.83 | Production renders at 1440×900 and 390×900; local assets, anchors, motion presence, overflow and performance spot checks |

These are local browser builds, not a claim that every supported environment is current stable. **Unperformed:** branded Edge and Safari, branded stable Firefox, actual iOS Safari and Android Chrome, assistive-technology/screen-reader testing and outside-reader comprehension testing. Mobile viewport emulation is not actual-device coverage.

Both initial light/dark heroes were rendered at 1440 and 390px before Nicolas chose light. The finished page was visually inspected at desktop and 390px; 768px and a narrow 320px layout were also checked for overflow. Logo proportions, headline/actions, resource disclosures, portrait crop, service hierarchy and footer were inspected. Mobile detail screenshots support reading the gate and founder copy without shrinking a full-page screenshot. No scroll-lock overlays or empty routes exist.

The menu opens and closes, Escape restores focus, selecting a section closes it and moves focus into the destination, and resizing resets it. The workflow’s three buttons update an announced description and remain usable with reduced motion. The initial connector animation is present in each engine and ends after four seconds. Content is never hidden pending an effect. Entrances translate visible sections briefly; the reduced-motion test confirms zero running animations. The source cancels active animations when the preference changes.

## Production build and performance

Served `dist` beneath a local `/website-redesign/` directory at port 4174, mirroring the expected Pages subpath. All four tested browser builds loaded local fonts/images/styles/scripts, rendered without JS or failed-resource errors, and followed the resource anchor within that subpath. All image natural dimensions were nonzero. The independent test blocks external requests and confirms the homepage still renders. Noindex and the prototype footer are present.

Final build: JavaScript about **14.0 kB / 5.2 kB gzip**; CSS about **23.3 kB / 8.0 kB gzip**. Original logo 87.9 kB; portrait 382 kB. Fontsource fonts and OFL license files are bundled. Initial browser resource transfer including the lazy portrait after scrolling was approximately 556 kB in Chromium; not all bundled font subsets are requested.

A separate installed-Chrome, fresh-context, unthrottled localhost spot check measured initial LCP **52 ms desktop / 44 ms mobile**, CLS **0.053 / 0**, and workflow click-to-two-animation-frames **15.5 / 25.1 ms**. These are single synthetic observations on a local server, not field Core Web Vitals, guaranteed loading time or an INP score. The desktop font swap produces a small recorded layout shift; no obscured actions or disruptive movement was observed. See `preview/performance.json` for the samples. `browser-metrics.json` also includes scrolling/QA activity, so its LCP values must not be used as a controlled initial-load comparison.

## Destinations and review

Fresh Firecrawl retrievals confirmed prompt-pack and playbook form fields, public article content, Contact inquiry fields, current service/testimonial publication and media assets. A rendered ScoreApp check opened its entry gate: first name, last name, email, company name and country required before starting. No details were entered or forms submitted. Reachable entry points do not establish fulfillment, scoring or email delivery.

Two sequential self-review passes are saved in `reviews/standards.md` and `reviews/spec.md`. Standards: no remaining actionable findings. Spec: hosted deployment, complete browser/device coverage and final visual/content acceptance remain open. Prior audit/spec commits included by the fixed-point comparison are explicitly separated from this implementation.

## Deployment status

The branch includes a GitHub Actions workflow that verifies PRs and deploys on main after merge. The expected URL is https://nicolas-found42.github.io/website-redesign/, **not yet verified as this implementation**. No main merge, production domain change or production form update was performed. Run the documented preview locally while the PR is reviewed; verify actual Pages publication after approval and merge.
