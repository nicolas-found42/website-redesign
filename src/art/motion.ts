import type { Entrance } from "./kit";

/**
 * How a drawing is assembled in front of the visitor.
 *
 * Nothing draws itself and nothing runs along anything. Pieces are *placed*:
 * a strand slides in, a sheet drops, a fold opens, a tag swings on its hole, a
 * stamp comes down — in the order the drawing tells its story, one beat after
 * another — and then everything is still.
 *
 * Every entrance is a Web Animation on a part's inner body with
 * `fill: "backwards"`: it holds its first frame while it waits for its beat,
 * and when it finishes it leaves nothing behind, because the resting state is
 * the element's own style. Cancelling one therefore *is* settling it — there is
 * no inline style or attribute to clear.
 */

/** Time between one beat and the next, in seconds. */
export const BEAT = 0.42;
/** Within a beat, each further piece follows the one before by this much. */
const ORDER = 0.09;

const OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
const SETTLE = "cubic-bezier(0.34, 1.36, 0.64, 1)";
const PRESS = "cubic-bezier(0.2, 0.9, 0.3, 1)";

type Motion = { frames: Keyframe[]; duration: number; easing: string };

const entrances: Record<Entrance, Motion> = {
  rise: {
    frames: [
      { opacity: 0, transform: "translateY(22px)" },
      { opacity: 1, offset: 0.4 },
      { opacity: 1, transform: "none" },
    ],
    duration: 560,
    easing: OUT,
  },
  drop: {
    frames: [
      { opacity: 0, transform: "translateY(-46px) rotate(-3deg)" },
      { opacity: 1, offset: 0.35 },
      { opacity: 1, transform: "none" },
    ],
    duration: 620,
    easing: SETTLE,
  },
  "slide-right": {
    frames: [
      { opacity: 0, transform: "translateX(-64px)" },
      { opacity: 1, offset: 0.3 },
      { opacity: 1, transform: "none" },
    ],
    duration: 640,
    easing: OUT,
  },
  "slide-left": {
    frames: [
      { opacity: 0, transform: "translateX(64px)" },
      { opacity: 1, offset: 0.3 },
      { opacity: 1, transform: "none" },
    ],
    duration: 640,
    easing: OUT,
  },
  "slide-down": {
    frames: [
      { opacity: 0, transform: "translateY(-56px)" },
      { opacity: 1, offset: 0.3 },
      { opacity: 1, transform: "none" },
    ],
    duration: 640,
    easing: OUT,
  },
  "slide-up": {
    frames: [
      { opacity: 0, transform: "translateY(56px)" },
      { opacity: 1, offset: 0.3 },
      { opacity: 1, transform: "none" },
    ],
    duration: 640,
    easing: OUT,
  },
  // A fold opening: the piece is pressed flat against its hinge, then opens.
  "unfold-x": {
    frames: [
      { opacity: 0, transform: "scaleX(0.04)" },
      { opacity: 1, offset: 0.18 },
      { opacity: 1, transform: "none" },
    ],
    duration: 700,
    easing: OUT,
  },
  "unfold-y": {
    frames: [
      { opacity: 0, transform: "scaleY(0.04)" },
      { opacity: 1, offset: 0.18 },
      { opacity: 1, transform: "none" },
    ],
    duration: 700,
    easing: OUT,
  },
  // A tag on its hole: it swings in past its rest and back.
  swing: {
    frames: [
      { opacity: 0, transform: "rotate(-26deg)" },
      { opacity: 1, transform: "rotate(7deg)", offset: 0.55 },
      { transform: "rotate(-2deg)", offset: 0.8 },
      { opacity: 1, transform: "none" },
    ],
    duration: 820,
    easing: "ease-out",
  },
  // A stamp: lifted and turned, it comes down, presses, and rests.
  stamp: {
    frames: [
      { opacity: 0, transform: "translateY(-34px) scale(1.18) rotate(-7deg)" },
      { opacity: 1, transform: "translateY(3px) scale(0.97)", offset: 0.62 },
      { opacity: 1, transform: "none" },
    ],
    duration: 560,
    easing: PRESS,
  },
  pop: {
    frames: [
      { opacity: 0, transform: "scale(0.5)" },
      { opacity: 1, offset: 0.4 },
      { opacity: 1, transform: "none" },
    ],
    duration: 520,
    easing: SETTLE,
  },
  // A band drawn tight round what it holds.
  wrap: {
    frames: [
      { opacity: 0, transform: "scale(1.5, 0.3)" },
      { opacity: 1, offset: 0.35 },
      { opacity: 1, transform: "none" },
    ],
    duration: 600,
    easing: SETTLE,
  },
  fade: {
    frames: [{ opacity: 0 }, { opacity: 1 }],
    duration: 480,
    easing: "ease-out",
  },
};

const beatOf = (el: Element) => Number((el as HTMLElement).dataset.beat ?? 0);
const orderOf = (el: Element) => Number((el as HTMLElement).dataset.order ?? 0);

/**
 * Assembles every part and label under `root`, beat by beat. `beat` is the
 * time between beats — shorter for a transition, where the visitor has already
 * seen the story once.
 */
export function assemble(
  root: ParentNode,
  { beat = BEAT, start = 0 }: { beat?: number; start?: number } = {},
): Animation[] {
  const animations: Animation[] = [];
  const pace = beat / BEAT;
  for (const piece of root.querySelectorAll<SVGGElement>(".part")) {
    const body = piece.querySelector<SVGGElement>(".part-body");
    if (!body) continue;
    const motion = entrances[(piece.dataset.enter as Entrance) ?? "fade"];
    const delay = start + beatOf(piece) * beat + orderOf(piece) * ORDER * pace;
    animations.push(
      body.animate(motion.frames, {
        duration: motion.duration * Math.max(0.6, pace),
        delay: delay * 1000,
        easing: motion.easing,
        fill: "backwards",
      }),
    );
  }
  for (const label of root.querySelectorAll<HTMLElement>(".system-label")) {
    const text = label.querySelector<HTMLElement>(".system-label-text");
    if (!text) continue;
    const delay = start + beatOf(label) * beat + 0.22 * pace;
    animations.push(
      text.animate(
        [
          { opacity: 0, transform: "translateY(8px)" },
          { opacity: 1, transform: "none" },
        ],
        {
          duration: 460,
          delay: delay * 1000,
          easing: OUT,
          fill: "backwards",
        },
      ),
    );
  }
  return animations;
}

/**
 * Lifts every part under `root` off the sheet, for a drawing that is about to
 * be rebuilt as something else. These hold their last frame: the pieces stay
 * lifted until the rebuild replaces them.
 */
export function clear(root: ParentNode, duration = 300): Animation[] {
  const pieces = [...root.querySelectorAll<SVGGElement>(".part-body")];
  return pieces.map((body, index) =>
    body.animate(
      [
        { opacity: 1, transform: "none" },
        { opacity: 0, transform: "translateY(-14px) scale(0.98)" },
      ],
      {
        duration,
        delay: Math.min(index, 8) * 18,
        easing: "cubic-bezier(0.65, 0, 0.35, 1)",
        fill: "forwards",
      },
    ),
  );
}

/** Settles `animations` at once: a cancelled entrance is already at rest. */
export const cancelAll = (animations: Animation[]) => {
  animations.forEach((animation) => animation.cancel());
  animations.length = 0;
};

/** Resolves when every animation has finished; never rejects on cancel. */
export const whenDone = (animations: readonly Animation[]) =>
  Promise.all(
    animations.map((animation) => animation.finished.catch(() => undefined)),
  );
