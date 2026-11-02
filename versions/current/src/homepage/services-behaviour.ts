import { mountSystem } from "../system";
import { schematics } from "../schematic";
import type { MotionPreference } from "../motion-preference";
import { mountReadingSequence } from "./reading-sequence";

/** How much of an article's own drawing must be on screen before it arrives. */
const ARRIVAL = 0.55;

/**
 * The scroll-linked services sequence.
 *
 * Reading is the control. Whichever article is crossing the middle of the
 * viewport is the current one, and the sticky drawing reconfigures to match it;
 * the choice rail reports that state and lets anyone jump straight to a service
 * instead of scrolling to it.
 *
 * The narrow layout has no room for a sticky drawing beside the text, so each
 * article carries its own live one and the rail rides above them instead. The
 * reconfiguration still happens where the visitor is looking: an article's
 * drawing comes on screen as the service before it and changes into its own
 * once most of it is in view. At rest, off screen, paused or under reduced
 * motion, every article's drawing is its own composition.
 */
export function mountServices(
  root: ParentNode,
  { motionPreference }: { motionPreference: MotionPreference },
) {
  const section = root.querySelector<HTMLElement>("#services");
  const host = section?.querySelector<HTMLElement>(".services-art");
  if (!section || !host) return () => {};

  const articles = [
    ...section.querySelectorAll<HTMLElement>("[data-service-article]"),
  ];
  const choices = [...section.querySelectorAll<HTMLButtonElement>(".choice")];
  const caption = section.querySelector<HTMLElement>(".services-caption")!;
  const aside = section.querySelector<HTMLElement>(".services-aside");
  const drawing = mountSystem(host, {
    motionPreference,
    compositions: schematics,
    live: true,
  });

  const disposeReading = mountReadingSequence({
    section,
    articles,
    choices,
    aside: aside!,
    railProperty: "--services-rail",
    motionPreference,
    onSelect(index) {
      drawing.select(index);
      caption.textContent = schematics[index].detail;
    },
  });

  /* ── Narrow: each article's own drawing, brought on by the one before it ── */
  const figures = articles.map((article) =>
    article.querySelector<HTMLElement>(".service-figure"),
  );
  const figureDrawings = figures.map((figure, index) =>
    figure
      ? mountSystem(figure, {
          motionPreference,
          compositions: schematics,
          initial: index,
          live: true,
          orientation: "portrait",
          // The first has nothing before it, so it draws itself in.
          drawIn: index === 0,
        })
      : null,
  );
  const arrived = new Set<number>([0]);

  /** Returns a drawing that has not yet arrived to its own composition. */
  const rest = (index: number) => {
    const figureDrawing = figureDrawings[index];
    if (figureDrawing && figureDrawing.active !== index)
      figureDrawing.settle(index);
  };

  const arrival = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const index = figures.indexOf(entry.target as HTMLElement);
        const figureDrawing = figureDrawings[index];
        if (!figureDrawing || arrived.has(index)) continue;
        if (!entry.isIntersecting || motionPreference.matches) {
          rest(index);
        } else if (entry.intersectionRatio >= ARRIVAL) {
          // First seen already in view — opened at an anchor, or back from a
          // pause — it still arrives rather than simply appearing.
          if (figureDrawing.active === index) figureDrawing.settle(index - 1);
          arrived.add(index);
          figureDrawing.select(index);
        } else if (figureDrawing.active === index) {
          // Coming on screen: show the service before this one, so the change
          // into this one happens in view.
          figureDrawing.settle(index - 1);
        }
      }
    },
    { threshold: [0, ARRIVAL] },
  );
  figures.forEach((figure) => figure && arrival.observe(figure));

  /** Pausing mid-approach leaves each drawing as its own still composition. */
  const onPreference = () => {
    if (!motionPreference.matches) return;
    figures.forEach((_, index) => rest(index));
  };
  motionPreference.addEventListener("change", onPreference);

  return () => {
    disposeReading();
    arrival.disconnect();
    motionPreference.removeEventListener("change", onPreference);
    drawing.dispose();
    figureDrawings.forEach((figureDrawing) => figureDrawing?.dispose());
  };
}
