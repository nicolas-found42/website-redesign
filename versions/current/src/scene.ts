import { mountLive, type LiveDrawing } from "./art/live";
import {
  sceneArt,
  sceneFieldMarkup,
  type Scene,
  type SceneOrientation,
} from "./audiences";
import type { MotionPreference } from "./motion-preference";

/**
 * A live audience scene.
 *
 * The drawing tells its story in beats: the pieces of beat 0 are placed, then
 * beat 1, and so on — a sheet drops, a roller slides in, a clip snaps on — and
 * the words of each beat arrive with them. Once told, the scene is still.
 *
 * The rules are the working-system drawing's own, and both live drawings share
 * one lifecycle in `art/live.ts`. The still composition is the resting state:
 * a reduced-motion, paused, interrupted or script-free scene is the complete
 * picture. An entrance leaves nothing behind when it finishes or is cancelled,
 * and nothing runs while the scene is off screen.
 */

export type SceneOptions = {
  motionPreference: MotionPreference;
  scene: Scene;
  /** A sequence article retains its authored composition across viewport widths. */
  orientation?: SceneOrientation;
};

export function mountScene(
  host: HTMLElement,
  options: SceneOptions,
): SceneDrawing {
  return mountLive(host, {
    motionPreference: options.motionPreference,
    states: [options.scene],
    orientation: options.orientation,
    settleWhenHidden: true,
    markup: (scene, orientation) => sceneFieldMarkup(scene, orientation),
    frame: (scene, orientation) => ({
      art: sceneArt(scene, orientation),
      labels: scene.labels,
      description: scene.description,
    }),
  });
}

export type SceneDrawing = LiveDrawing;
