import { animate, stagger, type AnimationPlaybackControls } from "motion";
import {
  fieldMarkup,
  labelMarkup,
  markerMarkup,
  routeMarkup,
  type Layout,
  type Orientation,
  type Schematic,
} from "./schematic";
import type { MotionPreference } from "./motion-preference";

/**
 * The live working-system drawing.
 *
 * One drawing shows one composition at a time. It can be revealed (routes draw
 * themselves), switched (the same nodes travel to their new places while the
 * old routes retract and the new ones draw), and it carries signals — red dots
 * running the routes, which is what makes the system read as *working*.
 *
 * Every state is reachable without animation. A still composition is always the
 * resting state, so an interrupted, reduced-motion or script-free drawing shows
 * the same complete picture as a finished one.
 */

export type SystemOptions = {
  motionPreference: MotionPreference;
  /** The compositions this drawing can show, in the order a visitor meets them. */
  compositions: readonly Schematic[];
  /** Index of the composition to show first. */
  initial?: number;
  /** Signals and pointer depth belong to the flagship drawing, not the small ones. */
  live?: boolean;
  /**
   * A drawing composed for one shape keeps it at every width. The services
   * articles carry portrait drawings for as long as their layout is narrow,
   * which is wider than the viewport query that turns other drawings portrait.
   */
  orientation?: Orientation;
  /**
   * Whether the routes draw themselves in on first view. A drawing that is
   * brought on screen by a transition from another composition skips it: the
   * transition is its entrance.
   */
  drawIn?: boolean;
};

type Signal = { route: number; phase: number };

const PORTRAIT = "(max-width: 860px)";
/** Route speed in field units a second: the same apparent pace on every route. */
const SIGNAL_SPEED = 190;

const orientationOf = (matches: boolean): Orientation =>
  matches ? "portrait" : "landscape";

/**
 * Mounts a live drawing in `host`, replacing whatever still markup was there
 * with the same composition, and returns its controls: `select` to change
 * composition, `settle` to rest on one at once, and `dispose`.
 */
export function mountSystem(host: HTMLElement, options: SystemOptions) {
  const {
    motionPreference,
    compositions,
    initial = 0,
    live = true,
    drawIn = true,
  } = options;
  const portrait = matchMedia(PORTRAIT);

  let active = initial;
  let orientation = options.orientation ?? orientationOf(portrait.matches);
  let tweens: AnimationPlaybackControls[] = [];
  let frame = 0;
  let started = 0;
  let visible = false;
  let revealed = !drawIn;
  let pointer = { x: 0, y: 0 };
  let eased = { x: 0, y: 0 };
  const timers = new Set<number>();

  const schematic = () => compositions[active];
  const layout = (): Layout => schematic()[orientation];
  const still = () => motionPreference.matches;

  host.innerHTML = `<div class="system" data-system>${fieldMarkup(schematic(), orientation)}</div>`;

  const frameEl = host.querySelector<HTMLElement>(".system-field")!;
  const svg = host.querySelector<SVGSVGElement>(".system-svg")!;
  const routesLayer = svg.querySelector<SVGGElement>(".routes")!;
  const signalsLayer = svg.querySelector<SVGGElement>(".signals")!;
  const markersLayer = svg.querySelector<SVGGElement>(".markers")!;
  const labelsLayer = host.querySelector<HTMLElement>(".system-labels")!;

  let signals: Signal[] = [];
  let signalNodes: SVGCircleElement[] = [];
  let paths: SVGPathElement[] = [];
  let lengths: number[] = [];

  /**
   * Stops everything in flight, including the timeout that swaps a transition's
   * routes in. Left running, that timeout fires after a pause or an orientation
   * change and starts a route draw the drawing has already settled out of.
   */
  function stopTweens() {
    tweens.forEach((tween) => tween.stop());
    tweens = [];
    timers.forEach((timer) => clearTimeout(timer));
    timers.clear();
  }

  /**
   * Clears everything a draw leaves on a path.
   *
   * A `pathLength` tween draws a route by writing `stroke-dasharray` and
   * `stroke-dashoffset` as presentation *attributes*. Left behind, they hold
   * every route at a one-unit dash pattern — a solid line rendered as dots —
   * and they override the stylesheet's own dash on the feedback route. The
   * geometry underneath is already complete, so clearing them is all a
   * finished draw needs.
   */
  function clearDrawing() {
    for (const path of paths) {
      path.getAnimations().forEach((animation) => animation.cancel());
      for (const name of [
        "stroke-dasharray",
        "stroke-dashoffset",
        "pathLength",
      ]) {
        path.removeAttribute(name);
        path.style.removeProperty(name);
      }
    }
  }

  /** Rebuilds every layer from the current composition, with no tween running. */
  function build() {
    const current = schematic();
    const current_layout = layout();
    svg.setAttribute(
      "viewBox",
      `0 0 ${current_layout.width} ${current_layout.height}`,
    );
    frameEl.style.setProperty(
      "--ratio",
      `${current_layout.width} / ${current_layout.height}`,
    );
    routesLayer.innerHTML = routeMarkup(current_layout);
    markersLayer.innerHTML = markerMarkup(current, current_layout);
    labelsLayer.innerHTML = labelMarkup(current, current_layout);
    frameEl.setAttribute("aria-label", current.description);
    paths = [...routesLayer.querySelectorAll("path")];
    lengths = paths.map((path) => path.getTotalLength());
    buildSignals(current_layout);
  }

  function buildSignals(current_layout: Layout) {
    if (!live) {
      signalsLayer.innerHTML = "";
      signals = [];
      signalNodes = [];
      return;
    }
    // A signal per carrying route, and a second one on the trunks, so the
    // busiest part of the drawing is visibly the busiest.
    signals = [];
    current_layout.routes.forEach((route, index) => {
      if (route.weight === "return") return;
      signals.push({ route: index, phase: (index * 0.37) % 1 });
      if (route.weight === "trunk") {
        signals.push({ route: index, phase: (index * 0.37 + 0.55) % 1 });
      }
    });
    signalsLayer.innerHTML = signals
      .map(() => '<circle class="signal" r="4.5"/>')
      .join("");
    signalNodes = [...signalsLayer.querySelectorAll("circle")];
    placeSignals(0);
  }

  function placeSignals(elapsed: number) {
    for (let index = 0; index < signals.length; index += 1) {
      const signal = signals[index];
      const path = paths[signal.route];
      const length = lengths[signal.route];
      if (!path || !length) continue;
      const travelled =
        ((elapsed * SIGNAL_SPEED) / length + signal.phase) % 1 || 0;
      const point = path.getPointAtLength(travelled * length);
      const node = signalNodes[index];
      node.setAttribute("cx", point.x.toFixed(2));
      node.setAttribute("cy", point.y.toFixed(2));
      // Signals fade in and out at the ends of their route rather than popping.
      const edge = Math.min(travelled, 1 - travelled) / 0.12;
      node.style.opacity = String(Math.min(1, edge));
    }
  }

  function tick(now: number) {
    frame = requestAnimationFrame(tick);
    if (!started) started = now;
    placeSignals((now - started) / 1000);
    if (depthEnabled()) {
      eased.x += (pointer.x - eased.x) * 0.08;
      eased.y += (pointer.y - eased.y) * 0.08;
      frameEl.style.setProperty("--lean-x", eased.x.toFixed(3));
      frameEl.style.setProperty("--lean-y", eased.y.toFixed(3));
    }
  }

  function runLoop() {
    if (!live || still() || !visible || frame) return;
    started = 0;
    frame = requestAnimationFrame(tick);
  }

  function pauseLoop() {
    if (!frame) return;
    cancelAnimationFrame(frame);
    frame = 0;
  }

  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  const depthEnabled = () => live && fine.matches && !still();

  function onPointerMove(event: PointerEvent) {
    if (!depthEnabled()) return;
    const box = frameEl.getBoundingClientRect();
    pointer = {
      x: (event.clientX - box.left) / box.width - 0.5,
      y: (event.clientY - box.top) / box.height - 0.5,
    };
  }
  function onPointerLeave() {
    pointer = { x: 0, y: 0 };
  }

  /** Draws the routes in, once, when the drawing first comes into view. */
  function reveal() {
    if (revealed) return;
    revealed = true;
    if (still()) {
      runLoop();
      return;
    }
    tweens.push(
      animate(
        paths,
        { pathLength: [0, 1] },
        {
          duration: 1.1,
          ease: [0.16, 1, 0.3, 1],
          delay: stagger(0.08),
          onComplete: clearDrawing,
        },
      ),
    );
    tweens.push(
      animate(
        [...markersLayer.querySelectorAll(".marker-body")],
        { opacity: [0, 1], scale: [0.4, 1] },
        {
          duration: 0.5,
          ease: [0.34, 1.32, 0.64, 1],
          delay: stagger(0.06, { startDelay: 0.45 }),
        },
      ),
    );
    tweens.push(
      animate(
        [...labelsLayer.querySelectorAll(".system-label-text")],
        { opacity: [0, 1], y: [8, 0] },
        {
          duration: 0.5,
          ease: [0.16, 1, 0.3, 1],
          delay: stagger(0.06, { startDelay: 0.6 }),
        },
      ),
    );
    runLoop();
  }

  /** The complete still composition of `index`, with nothing left running. */
  function settle(index = active) {
    active = index;
    stopTweens();
    build();
    clearDrawing();
    revealed = true;
    runLoop();
  }

  function select(index: number, options: { animate?: boolean } = {}) {
    if (index === active) return;
    const previous = layout();
    const previousNodes = schematic().nodes;
    active = index;
    const next = schematic();
    const nextLayout = layout();

    if (still() || options.animate === false || !revealed) {
      settle(index);
      return;
    }

    stopTweens();
    const markers = [...markersLayer.children] as SVGGElement[];
    const labels = [...labelsLayer.children] as HTMLElement[];
    const from = previousNodes.map((node) => previous.nodes[node.id].at);
    const to = next.nodes.map((node) => nextLayout.nodes[node.id].at);

    // The outgoing routes retract before the incoming ones draw, so the two
    // never overlap into an unreadable tangle.
    const outgoing = paths;
    tweens.push(
      animate(
        outgoing,
        { pathLength: [1, 0] },
        { duration: 0.34, ease: [0.65, 0, 0.35, 1], delay: stagger(0.03) },
      ),
    );

    // Labels change their words at the midpoint of their own travel, so no word
    // is ever read in the wrong place.
    let swapped = false;
    tweens.push(
      animate(0, 1, {
        duration: 0.78,
        ease: [0.65, 0, 0.35, 1],
        onUpdate(progress) {
          if (active !== index) return;
          for (let i = 0; i < markers.length; i += 1) {
            const x = from[i][0] + (to[i][0] - from[i][0]) * progress;
            const y = from[i][1] + (to[i][1] - from[i][1]) * progress;
            markers[i].setAttribute("transform", `translate(${x} ${y})`);
            labels[i].style.setProperty(
              "--x",
              ((x / nextLayout.width) * 100).toFixed(3),
            );
            labels[i].style.setProperty(
              "--y",
              ((y / nextLayout.height) * 100).toFixed(3),
            );
          }
          if (!swapped && progress > 0.5) {
            swapped = true;
            applyLabels(next, nextLayout, labels);
          }
        },
        onComplete() {
          if (active !== index) return;
          settle(index);
        },
      }),
    );

    // Swap in the new routes once the old ones have gone, then draw them.
    const drawIn = window.setTimeout(() => {
      timers.delete(drawIn);
      if (active !== index) return;
      routesLayer.innerHTML = routeMarkup(nextLayout);
      paths = [...routesLayer.querySelectorAll("path")];
      lengths = paths.map((path) => path.getTotalLength());
      buildSignals(nextLayout);
      tweens.push(
        animate(
          paths,
          { pathLength: [0, 1] },
          {
            duration: 0.75,
            ease: [0.16, 1, 0.3, 1],
            delay: stagger(0.05),
            onComplete: clearDrawing,
          },
        ),
      );
    }, 300);
    timers.add(drawIn);

    frameEl.setAttribute("aria-label", next.description);
  }

  function applyLabels(
    current: Schematic,
    current_layout: Layout,
    labels: HTMLElement[],
  ) {
    current.nodes.forEach((node, index) => {
      const label = labels[index];
      if (!label) return;
      label.querySelector("i")!.textContent = node.label;
      label.className = `system-label system-label--${current_layout.nodes[node.id].anchor} system-label--${node.kind}`;
      label.dataset.node = node.id;
    });
  }

  build();

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        visible = entry.isIntersecting;
        if (visible) {
          reveal();
          runLoop();
        } else {
          pauseLoop();
        }
      }
    },
    { threshold: 0.12 },
  );
  observer.observe(frameEl);

  const onPreference = () => {
    if (still()) {
      pauseLoop();
      settle();
      placeSignals(0.6);
    } else {
      runLoop();
    }
  };
  /** Recomposes for the new shape, unless the drawing was given a fixed one. */
  const onOrientation = () => {
    if (options.orientation) return;
    const next = orientationOf(portrait.matches);
    if (next === orientation) return;
    orientation = next;
    settle();
  };

  motionPreference.addEventListener("change", onPreference);
  portrait.addEventListener("change", onOrientation);
  if (live) {
    frameEl.addEventListener("pointermove", onPointerMove);
    frameEl.addEventListener("pointerleave", onPointerLeave);
  }
  if (still()) placeSignals(0.6);

  return {
    select,
    settle,
    get active() {
      return active;
    },
    dispose() {
      stopTweens();
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
      pauseLoop();
      observer.disconnect();
      motionPreference.removeEventListener("change", onPreference);
      portrait.removeEventListener("change", onOrientation);
      frameEl.removeEventListener("pointermove", onPointerMove);
      frameEl.removeEventListener("pointerleave", onPointerLeave);
    },
  };
}

export type SystemDrawing = ReturnType<typeof mountSystem>;
