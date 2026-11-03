import { animate, type AnimationPlaybackControls } from "motion";
import { artInner, labelsHtml, type LabelContent } from "./field";
import type { Art, Orientation } from "./kit";
import { assemble, BEAT, cancelAll, clear, whenDone } from "./motion";
import type { MotionPreference } from "../motion-preference";

/** The still composition of one state: artwork, placed words, description. */
export interface LiveFrame {
  art: Art;
  labels: readonly LabelContent[];
  description: string;
}

/** A label's destination, as a share of the next field. */
export interface LiveTravel {
  key: string;
  x: number;
  y: number;
}

export interface LiveOptions<State> {
  motionPreference: MotionPreference;
  /** Every composition this drawing can show, in visitor order. */
  states: readonly State[];
  initial?: number;
  /** A drawing composed for one shape keeps it at every width. */
  orientation?: Orientation;
  /** The viewport query that turns this drawing portrait. */
  portrait?: string;
  /** Pointer depth belongs to the flagship drawings. */
  live?: boolean;
  /** Whether the drawing assembles in front of the visitor on first view. */
  drawIn?: boolean;
  /**
   * A scene rests on its complete picture when it leaves the viewport; the
   * working-system drawing keeps its state and only pauses pointer depth.
   */
  settleWhenHidden?: boolean;
  /** The initial markup: whatever a still, script-free page shows. */
  markup: (state: State, orientation: Orientation) => string;
  frame: (state: State, orientation: Orientation) => LiveFrame;
  /** The labels that move when switching to `next`, and where they land. */
  travel?: (next: State, art: Art) => readonly LiveTravel[];
}

const PORTRAIT = "(max-width: 860px)";
/** The beat of a transition: the same story, told briskly. */
const QUICK = 0.14;
/** How long the lifted pieces take to leave before the new ones arrive. */
const LIFT = 300;
/** How long the named pieces' words take to reach their new places. */
const TRAVEL = 0.78;

const orientationOf = (matches: boolean): Orientation =>
  matches ? "portrait" : "landscape";

/**
 * The lifecycle both live drawings share: one still composition as the
 * resting state, assembled from the first beat when it comes into view,
 * switched composition when asked, and rebuilt complete whenever motion is
 * refused, interrupted or off screen. The caller supplies only the content of
 * each state and how to draw it.
 */
export function mountLive<State>(
  host: HTMLElement,
  options: LiveOptions<State>,
): LiveDrawing {
  const { motionPreference, states, drawIn = true, live = false } = options;
  const portrait = matchMedia(options.portrait ?? PORTRAIT);

  let active = options.initial ?? 0;
  let orientation = options.orientation ?? orientationOf(portrait.matches);
  let animations: Animation[] = [];
  let travel: AnimationPlaybackControls | undefined;
  let frame = 0;
  let visible = false;
  let revealed = !drawIn;
  let disposed = false;
  /** Bumped by every settle, so a transition's late steps know they are stale. */
  let generation = 0;
  let pointer = { x: 0, y: 0 };
  const eased = { x: 0, y: 0 };
  const timers = new Set<number>();

  const state = () => states[active];
  const still = () => motionPreference.matches;

  host.innerHTML = options.markup(state(), orientation);

  const frameEl = host.querySelector<HTMLElement>(".system-field")!;
  const svg = host.querySelector<SVGSVGElement>(".system-svg")!;
  const labelsLayer = host.querySelector<HTMLElement>(".system-labels")!;

  /**
   * Stops everything in flight, including the timeout that swaps a
   * transition's pieces in. Left running, that timeout fires after a pause or
   * an orientation change and starts an entrance the drawing has already
   * settled out of.
   */
  function stopMotion() {
    cancelAll(animations);
    travel?.stop();
    travel = undefined;
    timers.forEach((timer) => clearTimeout(timer));
    timers.clear();
  }

  function paint(art: Art) {
    svg.setAttribute("viewBox", `0 0 ${art.width} ${art.height}`);
    frameEl.style.setProperty("--ratio", `${art.width} / ${art.height}`);
    svg.innerHTML = artInner(art);
  }

  /** Rebuilds every layer from the current composition, with nothing running. */
  function build(index = active) {
    const next = options.frame(states[index], orientation);
    paint(next.art);
    labelsLayer.innerHTML = labelsHtml(next.art, next.labels);
    frameEl.setAttribute("aria-label", next.description);
  }

  /* ── Pointer depth ── */
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  const depthEnabled = () => live && fine.matches && !still();

  function tick() {
    frame = requestAnimationFrame(tick);
    eased.x += (pointer.x - eased.x) * 0.08;
    eased.y += (pointer.y - eased.y) * 0.08;
    frameEl.style.setProperty("--lean-x", eased.x.toFixed(3));
    frameEl.style.setProperty("--lean-y", eased.y.toFixed(3));
  }
  function runLoop() {
    if (!depthEnabled() || !visible || frame) return;
    frame = requestAnimationFrame(tick);
  }
  function pauseLoop() {
    if (!frame) return;
    cancelAnimationFrame(frame);
    frame = 0;
  }
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

  /** Tells the current composition from its first beat. */
  function play() {
    if (disposed) return;
    // An explicit choice can precede its observer notification, or select a
    // desktop host hidden by the stacked/reduced-motion layout. Defer its
    // entrance until the drawing itself is actually on screen.
    const box = frameEl.getBoundingClientRect();
    if (
      !box.width ||
      !box.height ||
      box.bottom <= 0 ||
      box.top >= innerHeight ||
      box.right <= 0 ||
      box.left >= innerWidth
    ) {
      cancelAll(animations);
      build();
      revealed = false;
      return;
    }
    if (still()) {
      settle();
      return;
    }
    cancelAll(animations);
    build();
    revealed = true;
    animations = assemble(frameEl, { beat: BEAT });
  }

  /** Assembles the drawing, once, when it first comes into view. */
  function reveal() {
    if (revealed) return;
    revealed = true;
    if (still()) return;
    animations = assemble(frameEl, { beat: BEAT });
  }

  /** The complete still composition of `index`, with nothing left running. */
  function settle(index = active) {
    active = index;
    generation += 1;
    stopMotion();
    build();
    revealed = true;
    runLoop();
  }

  function select(index: number, choice: { animate?: boolean } = {}) {
    if (index === active) return;
    active = index;
    const nextState = state();
    const next = options.frame(nextState, orientation);

    if (still() || choice.animate === false || !revealed) {
      settle(index);
      return;
    }

    stopMotion();
    const mine = (generation += 1);
    // Only labels with a destination travel. Composition-specific
    // annotations have no place in another drawing.
    const destinations = new Map(
      (options.travel?.(nextState, next.art) ?? []).map((place) => [
        place.key,
        place,
      ]),
    );
    const labels = [...labelsLayer.children].filter((label) =>
      destinations.has((label as HTMLElement).dataset.node ?? ""),
    ) as HTMLElement[];
    [...labelsLayer.children].forEach((label) => {
      if (!labels.includes(label as HTMLElement)) label.remove();
    });
    // Start from the words actually on screen, including an interrupted
    // transition. Shares stay valid when the next artwork changes aspect ratio.
    const from = labels.map((label) => [
      Number(label.style.getPropertyValue("--x")),
      Number(label.style.getPropertyValue("--y")),
    ]);
    const to = labels.map((label) =>
      destinations.get(label.dataset.node ?? "")!,
    );

    // The old object is lifted off before the new one is laid, so the two
    // never overlap into one unreadable picture.
    animations = clear(svg, LIFT);

    // Words travel with their node and change at the midpoint of their own
    // travel, so no word is ever read in the wrong place.
    let swapped = false;
    travel = animate(0, 1, {
      duration: TRAVEL,
      ease: [0.65, 0, 0.35, 1],
      onUpdate(progress) {
        if (generation !== mine) return;
        for (let i = 0; i < labels.length; i += 1) {
          const x = from[i][0] + (to[i].x - from[i][0]) * progress;
          const y = from[i][1] + (to[i].y - from[i][1]) * progress;
          labels[i].style.setProperty("--x", x.toFixed(3));
          labels[i].style.setProperty("--y", y.toFixed(3));
        }
        if (!swapped && progress > 0.5) {
          swapped = true;
          const fresh = document.createElement("div");
          fresh.innerHTML = labelsHtml(next.art, next.labels);
          [...fresh.children].forEach((label) => {
            const source = label as HTMLElement;
            const target = labels.find(
              (candidate) => candidate.dataset.node === source.dataset.node,
            );
            if (!target) {
              labelsLayer.append(source);
              return;
            }
            target.className = source.className;
            target.dataset.node = source.dataset.node;
            target.dataset.beat = source.dataset.beat;
            target.style.setProperty(
              "--w",
              source.style.getPropertyValue("--w"),
            );
            target.querySelector("i")!.textContent = source.textContent;
          });
        }
      },
    });

    // Once the old pieces have gone, the new object is laid under the words.
    const swap = window.setTimeout(() => {
      timers.delete(swap);
      if (generation !== mine) return;
      if (still()) {
        settle(index);
        return;
      }
      cancelAll(animations);
      paint(next.art);
      animations = assemble(svg, { beat: QUICK });
      const entrance = [...animations];
      void Promise.all([whenDone(entrance), travel?.finished]).then(() => {
        if (generation === mine) settle(index);
      });
    }, LIFT);
    timers.add(swap);

    frameEl.setAttribute("aria-label", next.description);
  }

  build();

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        visible = entry.isIntersecting;
        if (visible) {
          if (options.settleWhenHidden) {
            if (!revealed) play();
          } else reveal();
          runLoop();
        } else if (options.settleWhenHidden && animations.length) {
          settle();
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
      frameEl.style.removeProperty("--lean-x");
      frameEl.style.removeProperty("--lean-y");
      settle();
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

  return {
    play,
    settle,
    select,
    get active() {
      return active;
    },
    /** Whether the drawing is on screen, for anyone deciding to tell it again. */
    get visible() {
      return visible;
    },
    dispose() {
      disposed = true;
      generation += 1;
      stopMotion();
      pauseLoop();
      observer.disconnect();
      motionPreference.removeEventListener("change", onPreference);
      portrait.removeEventListener("change", onOrientation);
      frameEl.removeEventListener("pointermove", onPointerMove);
      frameEl.removeEventListener("pointerleave", onPointerLeave);
    },
  };
}

export interface LiveDrawing {
  play(): void;
  settle(index?: number): void;
  select(index: number, choice?: { animate?: boolean }): void;
  readonly active: number;
  readonly visible: boolean;
  dispose(): void;
}
