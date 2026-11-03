import { mountLive, type LiveDrawing } from "./art/live";
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
 * the same complete picture as a finished one. The lifecycle lives in
 * `art/live.ts`, shared with the audience scenes.
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

/**
 * Mounts a live drawing in `host`, replacing whatever still markup was there
 * with the same composition, and returns its controls: `select` to change
 * composition, `settle` to rest on one at once, and `dispose`.
 */
export function mountSystem(
  host: HTMLElement,
  options: SystemOptions,
): SystemDrawing {
  return mountLive(host, {
    motionPreference: options.motionPreference,
    states: options.compositions,
    initial: options.initial,
    orientation: options.orientation,
    portrait: options.portrait,
    live: options.live ?? true,
    drawIn: options.drawIn,
    markup: (schematic, orientation) =>
      `<div class="system" data-system>${fieldMarkup(schematic, orientation)}</div>`,
    frame: (schematic, orientation) => {
      const art = schematicArt(schematic, orientation);
      return {
        art,
        labels: schematicLabels(schematic, art),
        description: schematic.description,
      };
    },
    travel: (next, art) =>
      next.nodes.map((node) => ({
        key: node.id,
        x: (art.labels[node.id].at[0] / art.width) * 100,
        y: (art.labels[node.id].at[1] / art.height) * 100,
      })),
  });
}

export type SystemDrawing = LiveDrawing;
