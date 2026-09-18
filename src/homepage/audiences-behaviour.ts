import { audiences, sceneById } from "../audiences";
import { mountScene, type SceneDrawing } from "../scene";
import type { MotionPreference } from "../motion-preference";

/**
 * The audience gallery, and any scene drawn on its own.
 *
 * Choosing is the control. The rail, the arrows and the arrow keys all set the
 * same selection; the chosen panel is shown, the others are hidden, and the
 * chosen scene tells its story from its first beat. Focus never moves on its
 * own: a choice from the rail keeps the rail, and a choice from the arrows
 * keeps the arrows, so a keyboard visitor is never dropped somewhere new.
 *
 * Each panel keeps its own scene, mounted once. A hidden panel's scene has
 * nothing on screen to animate and its loop stays paused, so only the visible
 * one ever runs. Scenes outside the gallery — the failure-mode review figure —
 * mount the same way and tell their story when they come into view.
 */
export function mountAudiences(
  root: ParentNode,
  { motionPreference }: { motionPreference: MotionPreference },
) {
  const disposers: (() => void)[] = [];
  const drawings = new Map<HTMLElement, SceneDrawing>();

  for (const host of root.querySelectorAll<HTMLElement>("[data-scene-host]")) {
    const scene = sceneById(host.dataset.scene ?? "");
    drawings.set(host, mountScene(host, { motionPreference, scene }));
  }
  disposers.push(() => drawings.forEach((drawing) => drawing.dispose()));

  const stage = root.querySelector<HTMLElement>(".audience-stage");
  if (!stage) return () => disposers.forEach((dispose) => dispose());

  const choices = [
    ...stage.querySelectorAll<HTMLButtonElement>("[data-audience]"),
  ];
  const panels = [
    ...stage.querySelectorAll<HTMLElement>("[data-audience-panel]"),
  ];
  const nav = stage.querySelector<HTMLElement>(".audience-nav");
  const count = stage.querySelector<HTMLElement>("[data-audience-count]");
  const total = audiences.length;

  let current = -1;

  function show(index: number, options: { play?: boolean } = {}) {
    const next = (index + total) % total;
    if (next === current) return;
    current = next;
    choices.forEach((choice, i) =>
      choice.setAttribute("aria-pressed", String(i === next)),
    );
    panels.forEach((panel, i) => {
      panel.hidden = i !== next;
    });
    if (count) count.textContent = `0${next + 1}`;
    if (!options.play) return;
    const host = panels[next].querySelector<HTMLElement>("[data-scene-host]");
    // Told again on every choice: the sequence is the point of the picture.
    // The first panel is left to tell its story when it comes into view.
    if (host) drawings.get(host)?.play();
  }

  /** A choice from the rail, or a step from the arrows. */
  const onClick = (event: Event) => {
    const target = event.target as HTMLElement;
    const choice = target.closest<HTMLElement>("[data-audience]");
    const step = target.closest<HTMLElement>("[data-audience-step]");
    if (choice) show(Number(choice.dataset.audience), { play: true });
    else if (step)
      show(current + Number(step.dataset.audienceStep), { play: true });
  };
  /** Arrow keys move the choice and the focus together along the rail. */
  const onKey = (event: KeyboardEvent) => {
    const onRail = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-audience]",
    );
    if (!onRail) return;
    const from = Number(onRail.dataset.audience);
    const to: Record<string, number> = {
      ArrowRight: from + 1,
      ArrowDown: from + 1,
      ArrowLeft: from - 1,
      ArrowUp: from - 1,
      Home: 0,
      End: total - 1,
    };
    const next = to[event.key];
    if (next === undefined) return;
    event.preventDefault();
    show(next, { play: true });
    choices[current]?.focus();
  };

  stage.classList.add("is-gallery");
  if (nav) nav.hidden = false;
  stage.addEventListener("click", onClick);
  stage.addEventListener("keydown", onKey);
  const initial = panels.findIndex(
    (panel) => `#${panel.id}` === window.location.hash,
  );
  show(initial >= 0 ? initial : 0);

  disposers.push(() => {
    stage.removeEventListener("click", onClick);
    stage.removeEventListener("keydown", onKey);
    stage.classList.remove("is-gallery");
    panels.forEach((panel) => {
      panel.hidden = false;
    });
    if (nav) nav.hidden = true;
  });

  return () => disposers.forEach((dispose) => dispose());
}
