# Animation & Creative-Coding Research for Found42 Homepage Redesign

Stack constraint: Vite + vanilla TypeScript + plain CSS, no React/framework, static
GitHub Pages deploy (`/website-redesign/` subpath). Already installed: `motion` v13,
`lucide`, Fontsource. Build: `tsc --noEmit && vite build`.

Method: awesome list → repo → live demo → source file → official docs → verdict.
Every claim below is sourced from an official doc, repo README, npm registry, or
caniuse/MDN — links inline.

## Awesome lists consulted

- https://github.com/terkelg/awesome-creative-coding (generative art / creative coding, most-starred of the family)
- https://github.com/streamich/awesome-css-animations
- https://github.com/willianjusten/awesome-svg (see `topics/Animation.md`)
- https://github.com/sjfricke/awesome-webgl
- https://github.com/AxiomeCG/awesome-threejs
- https://github.com/sergey-pimenov/awesome-web-animation

---

## Candidate matrix

| #   | Name                                                                         | Repo                                                                                                   | Demo                                                                        | License                                                                                | Last activity                                                                           | Bundle (real)                                                                                                                           | Verdict                                                                                                                                                                                                                                                 |
| --- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **motion** (motion.dev, ex-Motion One)                                       | github.com/motiondivision/motion                                                                       | motion.dev/docs                                                             | MIT                                                                                    | v13.3.0 on npm (registry, checked live)                                                 | already installed                                                                                                                       | **ADOPT** — already the core engine                                                                                                                                                                                                                     |
| 2   | **GSAP + ScrollTrigger/SplitText**                                           | github.com/greensock/GSAP                                                                              | gsap.com/docs                                                               | "100% free" per gsap.com/pricing (Webflow-sponsored, announced GSAP 3.13, Apr 29 2025) | active, Webflow-funded                                                                  | ~50-70KB core+plugins                                                                                                                   | **REJECT as dependency** — free now, but a second full animation engine duplicates `motion`. Note the free license for future reference (SplitText/MorphSVG are excellent) but don't add the package.                                                   |
| 3   | **Lenis**                                                                    | github.com/darkroomengineering/lenis (canonical site redirects lenis.darkroom.engineering → lenis.dev) | lenis.dev                                                                   | MIT (darkroom.engineering repos are MIT per org listing)                               | 16k★, actively maintained, canonical `lenis` npm pkg v1.3.26 (registry)                 | 457KB unpacked → few KB min+gzip per site's own "under 5kb" claim                                                                       | **ADOPT** — smooth-scroll wrapper that plays natively with `motion`'s `scroll()`                                                                                                                                                                        |
| 4   | **OGL**                                                                      | github.com/oframe/ogl                                                                                  | oframe.github.io/ogl (examples dir)                                         | Unlicense (public domain)                                                              | 4.6k★, ES6 modules, zero deps                                                           | Core 8KB + Math 6KB + Extras 15KB min+gz (README's own numbers), tree-shakes further                                                    | **ADAPT TECHNIQUE** — minimal WebGL for a shader background, lighter than three.js                                                                                                                                                                      |
| 5   | **Three.js**                                                                 | github.com/mrdoosis (mrdoob)/three.js                                                                  | threejs.org/examples                                                        | MIT                                                                                    | huge community, weekly releases                                                         | ~150KB+ min+gz for a basic scene                                                                                                        | **REJECT** — full 3D engine is overkill for a homepage background; OGL/paper-shaders cover the same visual need at a fraction of the cost                                                                                                               |
| 6   | **Rive** (`@rive-app/canvas-lite`)                                           | github.com/rive-app                                                                                    | rive.app/community                                                          | MIT (npm registry)                                                                     | v2.42.1 (registry)                                                                      | 2.86MB unpacked incl. wasm (registry `dist.unpackedSize`); actual network wasm payload is smaller but still hundreds of KB              | **REJECT** — needs the Rive editor to author content, ships a wasm runtime; too heavy for a marketing homepage unless a dedicated interactive character/icon is required                                                                                |
| 7   | **dotlottie-web** (`@lottiefiles/dotlottie-web`)                             | github.com/LottieFiles/dotlottie-web                                                                   | shaders.paper.design-style demo not applicable; see LottieFiles marketplace | MIT                                                                                    | 877★, active, Rust+WASM/ThorVG core, v0.80.0 (registry)                                 | 7.3MB unpacked (registry) incl. multi-target wasm; per-animation `.lottie` payload is what's actually downloaded, core JS glue is small | **ADAPT TECHNIQUE, conditionally** — only pull this in if an After-Effects-authored looping animation is actually needed (e.g. a logo mark); otherwise skip, it's a second binary runtime                                                               |
| 8   | **SplitType**                                                                | github.com/lukePeavey/SplitType                                                                        | (no dedicated live demo site; README examples)                              | ISC                                                                                    | 732★, actively maintained (7 open PRs, recent commits per repo page), v0.3.4 (registry) | 158KB unpacked → ~2KB min+gz class of size                                                                                              | **ADOPT** — kinetic-typography text splitting, framework-agnostic, pairs directly with `motion`'s `stagger()`                                                                                                                                           |
| 9   | **Splitting.js**                                                             | github.com/shshaw/Splitting                                                                            | splitting.js.org (site referenced in README)                                | MIT                                                                                    | 1.8k★                                                                                   | small, CSS-variable driven                                                                                                              | **REJECT (in favor of #8)** — same job as SplitType, SplitType has a simpler JS-object API that composes better with `motion.animate()`; Splitting.js leans on CSS custom properties which is a fine alternative but redundant to adopt both            |
| 10  | **CSS scroll-driven animations** (`animation-timeline: scroll()` / `view()`) | W3C spec                                                                                               | MDN: developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations  | spec, no license                                                                       | Baseline-track feature                                                                  | n/a (native CSS)                                                                                                                        | **ADOPT as progressive enhancement** — see support table below                                                                                                                                                                                          |
| 11  | **View Transitions API**                                                     | W3C/WHATWG spec                                                                                        | MDN: developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API          | spec, no license                                                                       | Baseline-track feature                                                                  | n/a (native API)                                                                                                                        | **ADAPT TECHNIQUE** — same-document transitions for section/route-like state changes                                                                                                                                                                    |
| 12  | **paper-design/shaders**                                                     | github.com/paper-design/shaders                                                                        | shaders.paper.design (e.g. /grain-gradient, /mesh-gradient)                 | Apache-2.0                                                                             | 3.4k★, active                                                                           | vanilla entry point `@paper-design/shaders` (canvas2d/webgl-backed, zero deps)                                                          | **ADOPT** — cheapest path to a premium animated-gradient/grain hero background                                                                                                                                                                          |
| 13  | **matter.js**                                                                | github.com/liabru/matter-js                                                                            | brm.io/matter-js/demo                                                       | MIT                                                                                    | 18.4k★, 1002 commits, active issues/PRs                                                 | ~90KB unpacked before minification is small for a physics engine but still adds a simulation loop                                       | **REJECT** — full rigid-body physics is a poor cost/benefit for homepage chrome; only reconsider for a dedicated playful Easter-egg page                                                                                                                |
| 14  | **canvas-sketch** (mattdesl)                                                 | github.com/mattdesl/canvas-sketch                                                                      | mattdesl.github.io/canvas-sketch                                            | MIT                                                                                    | mature, in maintenance mode                                                             | dev-time CLI/framework, not a runtime dep                                                                                               | **REJECT as dependency** — it's an authoring/export tool for generative art (PNG/SVG/plotter output), not something you ship in a Vite bundle. Useful only offline to _prototype_ a shader/pattern that you then hand-port into OGL/paper-shaders code. |
| 15  | **Flubber**                                                                  | github.com/veltman/flubber                                                                             | bram.us/2017/06/21/smooth-svg-path-morphing-with-flubber                    | MIT                                                                                    | v0.4.2, low churn (mature/stable, not actively released)                                | tiny (~10KB)                                                                                                                            | **ADAPT TECHNIQUE** — SVG path morphing (logo mark, icon transitions) when GSAP MorphSVG is intentionally avoided                                                                                                                                       |
| 16  | **CountUp.js**                                                               | github.com/inorganik/countUp.js                                                                        | effhave.github.io/CountUp                                                   | MIT                                                                                    | v2.10.1, active                                                                         | small                                                                                                                                   | **REJECT (DIY instead)** — a number-counter is ~15 lines with `motion.animate()`'s `onUpdate`; not worth a dependency                                                                                                                                   |
| 17  | **Text scramble/decode**                                                     | multiple small repos (e.g. twistezo/text-scramble, Recidvst/scrambling-letters)                        | —                                                                           | mixed MIT                                                                              | small hobby projects, inconsistent maintenance                                          | n/a                                                                                                                                     | **REJECT (DIY instead)** — the canonical pattern (character-set cycling via `setInterval`/`rAF`) is ~30 lines; no dependency justifies itself here                                                                                                      |

---

## Detail: ADOPT / ADAPT candidates

### 1. `motion` v13 — core engine (already installed)

- Docs: https://motion.dev/docs/scroll (scroll-linked animation), https://motion.dev/docs (index)
- Vanilla API confirmed directly from docs:

```ts
import { animate, scroll } from "motion";

const rotate = animate(
  "div.hero-mark",
  { transform: ["none", "rotate(90deg)"] },
  { ease: "linear" },
);

scroll(rotate, {
  target: document.querySelector("#hero"),
  offset: ["start end", "end start"], // enter → leave viewport
});
```

- Where the browser supports the native `ScrollTimeline` API, motion hands the
  animation off to it (hardware-accelerated, off main thread); otherwise it
  falls back to a JS rAF-driven implementation automatically — this is the
  built-in progressive-enhancement path for item #10 below (per motion.dev/docs/scroll).
- `inView()` (motion.dev docs index) is the vanilla equivalent of an intersection-observer
  trigger for entrance reveals — use for kinetic-type reveals and layered parallax triggers.

**Reduced motion / touch plan:** motion has no built-in global reduced-motion
switch for the vanilla API — wrap every `animate()`/`scroll()` call site behind
a single check:

```ts
const prefersReducedMotion = matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
if (!prefersReducedMotion) {
  /* register scroll()/animate() calls */
} else {
  /* set end-state styles directly, no animation */
}
```

Scroll-linked effects are pointer-agnostic (driven by scroll position), so no
separate touch handling is needed beyond normal scroll physics.

### 3. Lenis — smooth scroll

- Site: https://lenis.dev (canonical; the old `lenis.darkroom.engineering` 301-redirects here)
- Repo: https://github.com/darkroomengineering/lenis (org page confirms MIT, 16k★, "Smooth scroll as it should be")

```ts
import Lenis from "lenis";

const lenis = new Lenis({
  autoRaf: false, // drive it from motion's/our own rAF loop instead of Lenis's own
});

function raf(time: number) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
```

- Site explicitly states: "no CSS transforms, no hijacked scrollbars, no
  accessibility trade-offs" and works across wheel/trackpad/touch input uniformly.

**Reduced motion / touch plan:** Lenis smooths scroll physics, it does not
replace native scroll — under `prefers-reduced-motion: reduce`, skip
instantiating Lenis entirely and let the browser's native (instant) scroll
behavior stand; this is a one-line `if` at bootstrap. Touch scrolling is
supported out of the box (no separate touch driver needed per the docs).

### 4. OGL — cheap WebGL background

- Repo: https://github.com/oframe/ogl (4.6k★, Unlicense/public domain, ES6 modules, README states 8KB core / 6KB math / 15KB extras min+gz, "with tree-shaking applied ... final size ... much lighter")
- Examples directory in the repo ships a full-screen single-triangle shader example — the standard pattern for a fragment-shader-only gradient/noise background (no geometry cost beyond one triangle).

```ts
import { Renderer, Program, Mesh, Triangle } from "ogl";

const renderer = new Renderer({ dpr: Math.min(devicePixelRatio, 2) });
const gl = renderer.gl;
document.querySelector("#hero-canvas")!.appendChild(gl.canvas);

const geometry = new Triangle(gl);
const program = new Program(gl, {
  vertex: /* glsl full-screen triangle vert */ `...`,
  fragment: /* glsl noise/gradient frag */ `...`,
  uniforms: { uTime: { value: 0 } },
});
const mesh = new Mesh(gl, { geometry, program });

function update(t: number) {
  program.uniforms.uTime.value = t * 0.001;
  renderer.render({ scene: mesh });
  requestAnimationFrame(update);
}
requestAnimationFrame(update);
```

**Reduced motion / touch plan:** a static shader background costs nothing on
touch (no interaction needed); for `prefers-reduced-motion: reduce`, freeze
`uTime` (render one frame, stop the rAF loop) rather than removing the visual
entirely — keeps the premium look without perpetual motion. Cap DPR (as above)
and downscale canvas resolution on narrow/mobile viewports to control GPU cost.

### 8. SplitType — kinetic typography

- Repo: https://github.com/lukePeavey/SplitType (732★, ISC license, actively maintained per open PRs/commit history)
- README/usage (confirmed via repo fetch):

```ts
import SplitType from "split-type";
import { animate, stagger, inView } from "motion";

const text = new SplitType("h1.hero-headline", { types: "words,chars" });

inView("h1.hero-headline", () => {
  animate(
    text.chars!,
    { opacity: [0, 1], y: [20, 0] },
    { delay: stagger(0.03), duration: 0.6, easing: "ease-out" },
  );
});
```

- SplitType wraps each split unit in `<div>`s with inline styles; call
  `text.split()` again on a debounced `resize` to re-flow (its own recommended pattern for responsive text).

**Reduced motion / touch plan:** under reduced motion, skip the `animate()`
call and let the split spans render already-visible (opacity 1, no transform);
because splitting only changes DOM structure not visibility, this degrades
safely even if JS fails to load (progressive enhancement — plain text stays
readable). No touch-specific handling required (it's not interactive).

### 10. CSS scroll-driven animations (`animation-timeline`)

- MDN: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations
- caniuse (`mdn-css_properties_animation-timeline`, fetched live): **87.22%** global support —
  Chrome/Edge 115+, Firefox 158+, Safari 26.0+ (Safari's version jumped to
  "26" to match the 2025 OS numbering scheme — this is a _very recent_ addition), Samsung Internet 23+.
- Firefox and pre-26 Safari fail silently (the property is simply ignored), so
  this is safe to ship **without a JS polyfill** as long as it's used as
  progressive enhancement layered on top of `motion`'s `scroll()` (which
  already provides the identical visual effect via JS everywhere). Recommended
  pattern: prefer the CSS version when supported (`@supports (animation-timeline: scroll())`)
  for the free main-thread win, and let `motion.scroll()` be the actual
  cross-browser mechanism rather than building two parallel implementations —
  in practice, given `motion` already auto-upgrades to the native
  `ScrollTimeline` where present, **just use motion's `scroll()` everywhere**
  and skip hand-written CSS `animation-timeline` rules; it gives the same
  browser-native fast path without a second code path to maintain.

**Reduced motion / touch plan:** same as motion's own guidance above — gate
behind `prefers-reduced-motion`. Not touch-specific (scroll position, not gesture, driven).

### 11. View Transitions API

- MDN: https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API
- caniuse (`view-transitions`, fetched live): **91.75%** global support — Chrome 111+, Firefox 144+ (Firefox's support is extremely recent — v143 shipped it disabled by default), Safari 18.0+.
- Usage is same-document only for our static single-page-feeling site (no MPA nav needed):

```ts
function swapSection(render: () => void) {
  if (!document.startViewTransition || prefersReducedMotion) {
    render();
    return;
  }
  document.startViewTransition(render);
}
```

- Style the transition via `::view-transition-old(root)` / `::view-transition-new(root)`
  pseudo-elements in plain CSS (per MDN) — no JS animation library involved at all.

**Reduced motion / touch plan:** `prefers-reduced-motion` should skip
`startViewTransition` entirely and just run the DOM update synchronously (per
the guard above) — Chrome/MDN's own guidance is that the API does not
auto-respect the media query, so this check must be explicit. No touch
implications (triggered by any DOM state change, not gesture).

### 12. paper-design/shaders — animated gradient/grain background

- Repo: https://github.com/paper-design/shaders (3.4k★, Apache-2.0, active)
- Live gallery/demos: https://shaders.paper.design/mesh-gradient and https://shaders.paper.design/grain-gradient
- Vanilla entry point is `@paper-design/shaders` (the React package `@paper-design/shaders-react` is the one to avoid, per our no-React constraint):

```ts
import { MeshGradient } from "@paper-design/shaders";

new MeshGradient(document.querySelector("#hero-canvas")!, {
  colors: ["#5100ff", "#00ff80", "#ffcc00", "#ea00ff"],
  distortion: 1,
  swirl: 0.8,
  speed: prefersReducedMotion ? 0 : 0.2,
});
```

(Constructor signature approximated from the README's stated props; verify
exact constructor args against the installed package's `.d.ts` before wiring
up, since the fetched README excerpt showed the factory-style call but not the
full TS signature.)

- Zero runtime dependencies, described by the maintainers as built for
  performance so it "won't negatively impact device performance" — a stronger
  mobile story than hand-rolled OGL shaders since it's purpose-built for
  exactly this (gradient/grain/dot-orbit background) use case.

**Reduced motion / touch plan:** set `speed: 0` (freeze) under
`prefers-reduced-motion: reduce` rather than unmounting — keeps the textured
background without motion. On mobile, render at a capped device-pixel-ratio
and consider a lower canvas resolution scaled up via CSS to bound GPU cost;
not interactive, so no touch handling needed.

### 15. Flubber — SVG path morphing (situational)

- Repo: https://github.com/veltman/flubber (MIT, v0.4.2)
- Reference technique write-up: https://www.bram.us/2017/06/21/smooth-svg-path-morphing-with-flubber/

```ts
import { interpolate } from "flubber";
import { animate } from "motion";

const morph = interpolate(pathA_d, pathB_d, { maxSegmentLength: 2 });
animate((progress) => pathEl.setAttribute("d", morph(progress)), {
  duration: 0.8,
  easing: "ease-in-out",
});
```

- Only pull this in if the design actually calls for a logo-mark or icon that
  morphs between two arbitrary shapes; for simple path-drawing reveals (stroke
  animating in), no library is needed — plain CSS `stroke-dasharray`/`stroke-dashoffset`
  animated via `motion.animate()` covers that with zero extra bytes.

**Reduced motion / touch plan:** show the end-state path directly (skip
`animate`) under reduced motion; not touch-related.

---

## Reduced-motion & touch — cross-cutting plan

1. Single source of truth: read `matchMedia("(prefers-reduced-motion: reduce)")`
   once at bootstrap, expose as a small module (`prefersReducedMotion.ts`),
   and listen for `change` (the media query can flip at runtime on some OSes).
2. Every animated feature (scroll reveals, shader speed, view-transitions,
   kinetic type, magnetic buttons) must have an explicit reduced-motion branch
   that lands on the _finished_ visual state instantly — never just "shorter
   duration."
3. Touch: nothing above requires custom touch gesture handling except a
   cursor-reactive/magnetic button, which should be **disabled entirely on
   touch** (`matchMedia("(hover: hover) and (pointer: fine)")`) rather than
   adapted — magnetic-follow has no meaningful touch equivalent and forcing
   one (e.g. on `touchmove`) reads as broken, not premium.
4. Keyboard: anything driven by `inView`/scroll/View-Transitions is
   orthogonal to keyboard nav (it reacts to DOM/scroll state, not focus), so
   no extra keyboard work is implied by adopting them — just don't let any
   `overflow: hidden` clipping used for reveal-masks trap focus or hide
   focused elements off-screen without scrolling them into view.

---

## Recommended stack (final)

- **Engine:** `motion` v13 (already installed) for all JS-driven animation:
  `animate()`, `scroll()`, `inView()`, `stagger()`. Do not add GSAP — it's free
  now but duplicates `motion`'s job; keep one animation engine.
- **Scroll feel:** add `lenis` for the smooth-scroll wrapper under `motion`'s scroll-linked effects.
- **Kinetic type:** add `split-type` for word/char splitting into `motion` staggers.
- **Background:** add `@paper-design/shaders` for the hero's animated gradient/grain
  (cheaper and more mobile-friendly than hand-rolled OGL/Three.js); reach for
  `ogl` only if a bespoke shader effect `paper-design/shaders` doesn't offer is required.
- **Section/state transitions:** native View Transitions API (`document.startViewTransition`),
  no library.
- **Scroll-linked CSS:** rely on `motion`'s automatic native-`ScrollTimeline`
  upgrade rather than hand-writing `animation-timeline` CSS — one code path,
  same performance win.
- **Skip entirely:** Three.js, Rive, Lottie/dotlottie (unless an AE-authored
  asset shows up), matter.js, canvas-sketch (dev-time tool only), CountUp.js,
  text-scramble libraries, Splitting.js (redundant with SplitType), Flubber
  (situational — only if a real shape-morph is designed).

## New dependencies to add (net 3)

```
npm i lenis split-type @paper-design/shaders
```

All three are MIT/Apache-2.0, ESM-native, zero/near-zero peer dependencies,
and compatible with static Vite builds + GitHub Pages hosting (no SSR, no
Node-only APIs).
