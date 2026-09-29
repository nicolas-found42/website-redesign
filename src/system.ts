import { animate, type AnimationPlaybackControls } from "motion";
import { artInner, labelsHtml } from "./art/field";
import type { Art } from "./art/kit";
import { assemble, BEAT, cancelAll, clear, whenDone } from "./art/motion";
import {
  fieldMarkup,
  schematicArt,
  schematicLabels,
  type Orientation,
  type Schematic,
} from "./schematic";
import type { MotionPreference } from "./motion-preference";

/**
 * The live working-system drawing.
 *
 * One drawing shows one composition at a time. It is assembled in front of the
 * visitor the first time it comes into view — each piece placed in the beat it
 * belongs to — and it can be switched: the pieces of the old composition are
 * lifted off, the five named pieces' words travel to their new places, and the
 * new object is assembled under them, quickly, because the visitor has already
 * seen how a drawing is made.
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
  /** Pointer depth belongs to the flagship drawings, not the small ones. */
  live?: boolean;
  /**
   * A drawing composed for one shape keeps it at every width. The services
   * articles carry portrait drawings for as long as their layout is narrow,
   * which is wider than the viewport query that turns other drawings portrait.
   */
  orientation?: Orientation;
  /** When the drawing turns portrait, if it follows the viewport. */
  portrait?: string;
  /**
   * Whether the drawing is assembled in front of the visitor on first view. A
   * drawing brought on screen by a transition from another composition skips
   * it: the transition is its entrance.
   */
  drawIn?: boolean;
};

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
  const portrait = matchMedia(options.portrait ?? PORTRAIT);

  let active = initial;
  let orientation = options.orientation ?? orientationOf(portrait.matches);
  let animations: Animation[] = [];
  let travel: AnimationPlaybackControls | undefined;
  let frame = 0;
  let visible = false;
  let revealed = !drawIn;
  /** Bumped by every settle, so a transition's late steps know they are stale. */
  let generation = 0;
  let pointer = { x: 0, y: 0 };
  const eased = { x: 0, y: 0 };
  const timers = new Set<number>();

  const schematic = () => compositions[active];
  const still = () => motionPreference.matches;
  const artOf = (index: number): Art =>
    schematicArt(compositions[index], orientation);

  host.innerHTML = `<div class="system" data-system>${fieldMarkup(schematic(), orientation)}</div>`;

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
  function build() {
    const art = artOf(active);
    paint(art);
    labelsLayer.innerHTML = labelsHtml(art, schematicLabels(schematic(), art));
    frameEl.setAttribute("aria-label", schematic().description);
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
    const previousArt = artOf(active);
    const previous = schematic();
    active = index;
    const next = schematic();
    const nextArt = artOf(index);

    if (still() || choice.animate === false || !revealed) {
      settle(index);
      return;
    }

    stopMotion();
    const mine = (generation += 1);
    const labels = [...labelsLayer.children] as HTMLElement[];
    const nextLabels = schematicLabels(next, nextArt);
    const at = (art: Art, key: string) => art.labels[key].at;
    const from = previous.nodes.map((node) => at(previousArt, node.id));
    const to = next.nodes.map((node) => at(nextArt, node.id));

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
          const x = from[i][0] + (to[i][0] - from[i][0]) * progress;
          const y = from[i][1] + (to[i][1] - from[i][1]) * progress;
          // A field changes shape only with orientation, never between
          // compositions, so one field's shares serve both ends.
          labels[i].style.setProperty(
            "--x",
            ((x / nextArt.width) * 100).toFixed(3),
          );
          labels[i].style.setProperty(
            "--y",
            ((y / nextArt.height) * 100).toFixed(3),
          );
        }
        if (!swapped && progress > 0.5) {
          swapped = true;
          const fresh = document.createElement("div");
          fresh.innerHTML = labelsHtml(nextArt, nextLabels);
          [...fresh.children].forEach((label, i) => {
            const target = labels[i];
            const source = label as HTMLElement;
            if (!target) return;
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
      paint(nextArt);
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
    select,
    settle,
    get active() {
      return active;
    },
    dispose() {
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

export type SystemDrawing = ReturnType<typeof mountSystem>;
