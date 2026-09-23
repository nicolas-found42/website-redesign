import { mountSystem } from "../system";
import { schematics } from "../schematic";
import type { MotionPreference } from "../motion-preference";

/** The width at which the services band gives up its sticky split. */
const NARROW = "(max-width: 960px)";
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
  const narrow = matchMedia(NARROW);

  const drawing = mountSystem(host, {
    motionPreference,
    compositions: schematics,
    live: true,
  });

  let current = 0;

  function show(index: number, options: { scroll?: boolean } = {}) {
    if (index !== current) {
      current = index;
      drawing.select(index);
      caption.textContent = schematics[index].detail;
      choices.forEach((choice, i) =>
        choice.setAttribute("aria-pressed", String(i === index)),
      );
      articles.forEach((article, i) =>
        article.classList.toggle("is-current", i === index),
      );
    }
    if (options.scroll) {
      // Stacked, an article is taller than the screen: its start, under the
      // rail, is where reading it begins.
      articles[index].scrollIntoView({
        behavior: motionPreference.matches ? "auto" : "smooth",
        block: narrow.matches ? "start" : "center",
      });
    }
  }

  /**
   * Only the article crossing the middle band of the viewport counts as being
   * read, so the drawing changes once per article rather than twice.
   */
  const reader = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const index = Number(
          (entry.target as HTMLElement).dataset.serviceArticle,
        );
        show(index);
      }
    },
    { rootMargin: "-46% 0px -46% 0px", threshold: 0 },
  );
  articles.forEach((article) => reader.observe(article));

  const handlers = choices.map((choice, index) => {
    const onClick = () => show(index, { scroll: true });
    choice.addEventListener("click", onClick);
    return onClick;
  });

  articles[0]?.classList.add("is-current");

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
    if (motionPreference.matches) figures.forEach((_, index) => rest(index));
  };
  motionPreference.addEventListener("change", onPreference);

  return () => {
    reader.disconnect();
    arrival.disconnect();
    motionPreference.removeEventListener("change", onPreference);
    choices.forEach((choice, index) =>
      choice.removeEventListener("click", handlers[index]),
    );
    drawing.dispose();
    figureDrawings.forEach((figureDrawing) => figureDrawing?.dispose());
  };
}
