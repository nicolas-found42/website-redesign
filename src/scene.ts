import { animate, type AnimationPlaybackControls } from "motion";
import {
  sceneFieldMarkup,
  sceneFrameMarkup,
  sceneLabelMarkup,
  sceneMarkerMarkup,
  sceneRouteMarkup,
  type Scene,
  type SceneLayout,
  type SceneOrientation,
} from "./audiences";
import type { MotionPreference } from "./motion-preference";

/**
 * A live audience scene.
 *
 * The drawing tells its story in beats: the elements of beat 0 appear, then
 * beat 1, and so on — routes draw themselves, frames and markers fade and
 * settle, annotations rise into place. Once told, the carrying routes run
 * signals for as long as the scene is on screen, so the picture keeps working
 * rather than freezing on its last frame.
 *
 * The rules are the working-system drawing's own. The still composition is the
 * resting state: a reduced-motion, paused, interrupted or script-free scene is
 * the complete picture. A draw is released when it finishes, so no dash
 * attribute outlives it. One animation frame loop per scene, and only while
 * the scene is visible.
 */

export type SceneOptions = {
  motionPreference: MotionPreference;
  scene: Scene;
};

type Signal = { route: number; phase: number };

const PORTRAIT = "(max-width: 860px)";
const SIGNAL_SPEED = 170;
/** Time between one beat and the next, in seconds. */
const BEAT = 0.42;

const orientationOf = (matches: boolean): SceneOrientation =>
  matches ? "portrait" : "landscape";

export function mountScene(host: HTMLElement, options: SceneOptions) {
  const { motionPreference, scene } = options;
  const portrait = matchMedia(PORTRAIT);

  let orientation = orientationOf(portrait.matches);
  let tweens: AnimationPlaybackControls[] = [];
  /** The animation-frame handle of the signal loop; zero while paused. */
  let loop = 0;
  let started = 0;
  let visible = false;
  let told = false;
  let disposed = false;

  const layout = (): SceneLayout => scene[orientation];
  const still = () => motionPreference.matches;

  host.innerHTML = sceneFieldMarkup(scene, orientation);

  const frameEl = host.querySelector<HTMLElement>(".system-field")!;
  const svg = host.querySelector<SVGSVGElement>(".system-svg")!;
  const framesLayer = svg.querySelector<SVGGElement>(".frames")!;
  const routesLayer = svg.querySelector<SVGGElement>(".routes")!;
  const signalsLayer = svg.querySelector<SVGGElement>(".signals")!;
  const markersLayer = svg.querySelector<SVGGElement>(".markers")!;
  const labelsLayer = host.querySelector<HTMLElement>(".system-labels")!;

  let signals: Signal[] = [];
  let signalNodes: SVGCircleElement[] = [];
  let paths: SVGPathElement[] = [];
  let lengths: number[] = [];

  function stopTweens() {
    tweens.forEach((tween) => tween.stop());
    tweens = [];
  }

  /** Clears everything a draw or an entrance leaves behind on an element. */
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
    for (const el of entrances()) {
      el.getAnimations().forEach((animation) => animation.cancel());
      el.style.removeProperty("opacity");
      el.style.removeProperty("transform");
    }
  }

  const entrances = () => [
    ...framesLayer.querySelectorAll<SVGElement>(".frame"),
    ...markersLayer.querySelectorAll<SVGElement>(".marker-body"),
    ...labelsLayer.querySelectorAll<HTMLElement>(".system-label-text"),
  ];

  /**
   * A path inside a hidden panel measures as zero, so lengths are taken when
   * the scene is on screen rather than once at build.
   */
  function measure() {
    if (lengths.length && lengths.every((length) => length > 0)) return;
    lengths = paths.map((path) => path.getTotalLength());
  }

  /** Rebuilds every layer from the current layout, with no tween running. */
  function build() {
    const current = layout();
    svg.setAttribute("viewBox", `0 0 ${current.width} ${current.height}`);
    frameEl.style.setProperty(
      "--ratio",
      `${current.width} / ${current.height}`,
    );
    framesLayer.innerHTML = sceneFrameMarkup(current);
    routesLayer.innerHTML = sceneRouteMarkup(current);
    markersLayer.innerHTML = sceneMarkerMarkup(current);
    labelsLayer.innerHTML = sceneLabelMarkup(current);
    paths = [...routesLayer.querySelectorAll("path")];
    lengths = [];
    buildSignals(current);
  }

  function buildSignals(current: SceneLayout) {
    signals = [];
    current.routes.forEach((route, index) => {
      if (!route.carry) return;
      signals.push({ route: index, phase: (index * 0.37) % 1 });
    });
    signalsLayer.innerHTML = signals
      .map(() => '<circle class="signal" r="4.5"/>')
      .join("");
    signalNodes = [...signalsLayer.querySelectorAll("circle")];
    placeSignals(0);
  }

  function placeSignals(elapsed: number) {
    measure();
    for (let index = 0; index < signals.length; index += 1) {
      const signal = signals[index];
      const path = paths[signal.route];
      const length = lengths[signal.route];
      const node = signalNodes[index];
      if (!path || !length || !node) continue;
      const travelled =
        ((elapsed * SIGNAL_SPEED) / length + signal.phase) % 1 || 0;
      const point = path.getPointAtLength(travelled * length);
      node.setAttribute("cx", point.x.toFixed(2));
      node.setAttribute("cy", point.y.toFixed(2));
      const edge = Math.min(travelled, 1 - travelled) / 0.12;
      node.style.opacity = String(Math.min(1, edge));
    }
  }

  function tick(now: number) {
    loop = requestAnimationFrame(tick);
    if (!started) started = now;
    placeSignals((now - started) / 1000);
  }

  function runLoop() {
    if (still() || !visible || loop || !told) return;
    started = 0;
    loop = requestAnimationFrame(tick);
  }

  function pauseLoop() {
    if (!loop) return;
    cancelAnimationFrame(loop);
    loop = 0;
  }

  /** The complete still composition, with nothing left running. */
  function settle() {
    stopTweens();
    build();
    clearDrawing();
    told = true;
    signalsLayer.style.removeProperty("opacity");
    if (still()) placeSignals(0.6);
    runLoop();
  }

  /** Tells the scene from its first beat. Under reduced motion it is simply shown. */
  function play() {
    if (disposed) return;
    if (still()) {
      settle();
      return;
    }
    stopTweens();
    build();
    clearDrawing();
    told = false;
    pauseLoop();
    measure();

    const beatOf = (el: Element) => Number((el as HTMLElement).dataset.beat);
    const lastBeat = Math.max(
      0,
      ...[...routesLayer.children, ...framesLayer.children].map(beatOf),
    );

    // Signals wait until the whole story has been told.
    signalsLayer.style.opacity = "0";

    for (const path of paths) {
      tweens.push(
        animate(
          path,
          { pathLength: [0, 1] },
          {
            duration: 0.7,
            ease: [0.16, 1, 0.3, 1],
            delay: beatOf(path) * BEAT,
          },
        ),
      );
    }
    for (const el of framesLayer.querySelectorAll<SVGElement>(".frame")) {
      tweens.push(
        animate(
          el,
          { opacity: [0, 1] },
          { duration: 0.5, ease: "easeOut", delay: beatOf(el) * BEAT + 0.1 },
        ),
      );
    }
    for (const marker of markersLayer.querySelectorAll<SVGElement>(".marker")) {
      const body = marker.querySelector<SVGElement>(".marker-body")!;
      tweens.push(
        animate(
          body,
          { opacity: [0, 1], scale: [0.4, 1] },
          {
            duration: 0.5,
            ease: [0.34, 1.32, 0.64, 1],
            delay: beatOf(marker) * BEAT + 0.2,
          },
        ),
      );
    }
    for (const label of labelsLayer.querySelectorAll<HTMLElement>(
      ".system-label",
    )) {
      const text = label.querySelector<HTMLElement>(".system-label-text")!;
      tweens.push(
        animate(
          text,
          { opacity: [0, 1], y: [8, 0] },
          {
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
            delay: beatOf(label) * BEAT + 0.3,
          },
        ),
      );
    }
    tweens.push(
      animate(0, 1, {
        duration: lastBeat * BEAT + 0.9,
        onComplete() {
          if (disposed) return;
          clearDrawing();
          told = true;
          signalsLayer.style.removeProperty("opacity");
          runLoop();
        },
      }),
    );
  }

  build();

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        visible = entry.isIntersecting;
        if (visible) {
          if (!told && !tweens.length) play();
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
    } else {
      runLoop();
    }
  };
  const onOrientation = () => {
    const next = orientationOf(portrait.matches);
    if (next === orientation) return;
    orientation = next;
    settle();
  };
  motionPreference.addEventListener("change", onPreference);
  portrait.addEventListener("change", onOrientation);
  if (still()) placeSignals(0.6);

  return {
    play,
    settle,
    dispose() {
      disposed = true;
      stopTweens();
      pauseLoop();
      observer.disconnect();
      motionPreference.removeEventListener("change", onPreference);
      portrait.removeEventListener("change", onOrientation);
    },
  };
}

export type SceneDrawing = ReturnType<typeof mountScene>;
