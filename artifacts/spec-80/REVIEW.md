# Branch review

The full implementation was reviewed against main commit `a812da9` and
[issue 80](https://github.com/nicolas-found42/website-redesign/issues/80).
The initial review found one standards breach, one duplication heuristic and
one spec issue. Fix `2cd9d6e`, integrated as `85ebb24`, resolves all three.

## Standards

Rechecked integration `85ebb24`, including fix `2cd9d6e` against `cf8ebd7`.

**Documented standards: no remaining findings.** The hidden-scene issue is resolved in `src/scene.ts`: `play()` checks the drawing's dimensions and viewport intersection before assembling animation; hidden/offscreen requests leave a complete still and defer entrance. The intersection observer now settles a running scene when it leaves view. This satisfies ADR 0003's visibility invariant without changing the separate landscape/portrait compositions.

**Smell baseline: no remaining findings.** `src/homepage/reading-sequence.ts` owns the shared reading selection, pressed-pill state, jump retry and landing lifecycle. Both audience and service controllers mount it with a selection callback; their scene/schematic engines remain separate, respecting ADR 0003. The duplicated-controller finding is resolved.

Lifecycle inspection confirms disposal removes all shared scroll, scrollend, wheel, touch, key, hash and focus listeners; clears the idle timer and animation-frame request; disconnects reading and resize observers; and unregisters motion preference listeners. Audience disposal still disposes every scene, and Services disposal retains its arrival observer, drawing and preference cleanup.

The fix includes regression coverage for invisible phone scene animation and keyboard reading beyond a chosen audience pill. Those regressions passed across Chromium, Firefox and WebKit.

Final count: **0 documented-standard breaches; 0 baseline smells.**

## Spec

No outstanding Spec findings in integration `85ebb24` after reviewing fix `2cd9d6e` against `cf8ebd7`.

The previous P2 keyboard finding is resolved. The shared reading sequence's `focusin` handler releases the pill landing lock when focus enters an article and updates the selected article, including `aria-pressed`, scene and caption. Independently repeated the original Chromium reproduction at 384×742 with reduced motion on both Home and Services: choose C-level executives, Tab to the contributors link, then Tab to the builders link. The pressed audience correctly changes to Individual Contributors and Teams, then AI builders. This satisfies the spec's requirement that “The pill rail under the scene reports the current audience with `aria-pressed`” and its keyboard-navigation requirement.

The shared sequence extraction keeps existing scroll, jump and reduced-motion behavior together without adding a new visitor flow. The scene visibility guard and off-screen settling reinforce the existing requirement: “At rest, off screen, when paused, under reduced motion and without script, each article's scene is its own complete still composition.” No new scope creep or contradictory copy introduced by the fix.

Approved service strings, executive sequence/disclosure, organization order and accessible duplication, source register, glossary and superseding ADR remain as assessed in the initial review. Final browser validation and screenshot review are recorded in the accompanying evidence.

**Spec: 0 outstanding findings; previous P2 resolved.**

## Regression evidence

Before the fixes, the phone keyboard reproduction left the executive pill
pressed while focus moved to the contributors article, and the hidden phone
pinned drawing had 23 active animations. Rendered-page regressions now cover
keyboard progression on Home and Services and motion in the hidden scene.
Final execution results are recorded in [validation evidence](README.md).

## Final visual correction

The final screenshot review revealed that the original enlarged-text test's
stylesheet did not override the root font-size rule. At a verified 32px root
size, the decision label wrapped outside the red mark and crowded the
illustrative caption. Fix `ae67fa3` gives the mark and composition enough room;
the corrected test checks actual root size, settled rendering, mark containment,
caption containment and nonoverlapping labels. It failed before the artwork
change, then passed twice in every engine at 384, 1024 and 1440px.
The refreshed enlarged-text screenshots were visually reviewed after the fix.
