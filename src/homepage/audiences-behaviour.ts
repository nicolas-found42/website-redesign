import { audiences, sceneById } from "../audiences";
import { mountScene, type SceneDrawing } from "../scene";
import type { MotionPreference } from "../motion-preference";
import { mountReadingSequence } from "./reading-sequence";

/** The audience drawing and rail accompany reading; nothing hides an article. */
export function mountAudiences(
  root: ParentNode,
  { motionPreference }: { motionPreference: MotionPreference },
) {
  const drawings = new Map<HTMLElement, SceneDrawing>();
  for (const host of root.querySelectorAll<HTMLElement>("[data-scene-host]")) {
    const orientation = host.closest(".audience-figure")
      ? "portrait"
      : host.closest(".audience-art")
        ? "landscape"
        : undefined;
    drawings.set(
      host,
      mountScene(host, {
        motionPreference,
        scene: sceneById(host.dataset.scene ?? ""),
        orientation,
      }),
    );
  }
  const section = root.querySelector<HTMLElement>("#audiences");
  if (!section) return () => drawings.forEach((drawing) => drawing.dispose());
  const stage = section.querySelector<HTMLElement>(".audience-stage")!;
  stage.classList.add("is-sequence");
  const articles = [
    ...section.querySelectorAll<HTMLElement>("[data-audience-panel]"),
  ];
  const choices = [
    ...section.querySelectorAll<HTMLButtonElement>("[data-audience]"),
  ];
  const scenes = [
    ...section.querySelectorAll<HTMLElement>("[data-audience-scene]"),
  ];
  const caption = section.querySelector<HTMLElement>(
    ".audience-pinned-caption",
  )!;
  const aside = section.querySelector<HTMLElement>(".audience-aside")!;
  const disposeReading = mountReadingSequence({
    section,
    articles,
    choices,
    aside,
    railProperty: "--audience-rail",
    motionPreference,
    onSelect(index) {
      scenes.forEach((scene, i) => {
        scene.hidden = i !== index;
      });
      const host =
        scenes[index]?.querySelector<HTMLElement>("[data-scene-host]");
      if (host) drawings.get(host)?.play();
      caption.textContent = audiences[index].caption;
    },
  });
  return () => {
    disposeReading();
    drawings.forEach((drawing) => drawing.dispose());
    stage.classList.remove("is-sequence");
  };
}
