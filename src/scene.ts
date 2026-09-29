import { artInner, labelsHtml } from "./art/field";
import { assemble, BEAT, cancelAll } from "./art/motion";
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
 * The rules are the working-system drawing's own. The still composition is the
 * resting state: a reduced-motion, paused, interrupted or script-free scene is
 * the complete picture. An entrance leaves nothing behind when it finishes or
 * is cancelled, and nothing runs while the scene is off screen.
 */

export type SceneOptions = {
  motionPreference: MotionPreference;
  scene: Scene;
};

const PORTRAIT = "(max-width: 860px)";

const orientationOf = (matches: boolean): SceneOrientation =>
  matches ? "portrait" : "landscape";

export function mountScene(host: HTMLElement, options: SceneOptions) {
  const { motionPreference, scene } = options;
  const portrait = matchMedia(PORTRAIT);

  let orientation = orientationOf(portrait.matches);
  let animations: Animation[] = [];
  let visible = false;
  let told = false;
  let disposed = false;

  const still = () => motionPreference.matches;

  host.innerHTML = sceneFieldMarkup(scene, orientation);

  const frameEl = host.querySelector<HTMLElement>(".system-field")!;
  const svg = host.querySelector<SVGSVGElement>(".system-svg")!;
  const labelsLayer = host.querySelector<HTMLElement>(".system-labels")!;

  /** Rebuilds every layer from the current layout, with nothing running. */
  function build() {
    const art = sceneArt(scene, orientation);
    svg.setAttribute("viewBox", `0 0 ${art.width} ${art.height}`);
    frameEl.style.setProperty("--ratio", `${art.width} / ${art.height}`);
    svg.innerHTML = artInner(art);
    labelsLayer.innerHTML = labelsHtml(art, scene.labels);
  }

  /** The complete still composition, with nothing left running. */
  function settle() {
    cancelAll(animations);
    build();
    told = true;
  }

  /** Tells the scene from its first beat. Under reduced motion it is simply shown. */
  function play() {
    if (disposed) return;
    if (still()) {
      settle();
      return;
    }
    cancelAll(animations);
    build();
    told = true;
    animations = assemble(frameEl, { beat: BEAT });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        visible = entry.isIntersecting;
        if (visible && !told) play();
      }
    },
    { threshold: 0.12 },
  );
  observer.observe(frameEl);

  const onPreference = () => {
    if (still()) settle();
  };
  const onOrientation = () => {
    const next = orientationOf(portrait.matches);
    if (next === orientation) return;
    orientation = next;
    settle();
  };
  motionPreference.addEventListener("change", onPreference);
  portrait.addEventListener("change", onOrientation);

  return {
    play,
    settle,
    /** Whether the scene is on screen, for anyone deciding to tell it again. */
    get visible() {
      return visible;
    },
    dispose() {
      disposed = true;
      cancelAll(animations);
      observer.disconnect();
      motionPreference.removeEventListener("change", onPreference);
      portrait.removeEventListener("change", onOrientation);
    },
  };
}

export type SceneDrawing = ReturnType<typeof mountScene>;
