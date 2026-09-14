import { mountSystem } from "../system";
import { schematics } from "../schematic";
import type { MotionPreference } from "../motion-preference";

/**
 * The scroll-linked services sequence.
 *
 * Reading is the control. Whichever article is crossing the middle of the
 * viewport is the current one, and the sticky drawing reconfigures to match it;
 * the choice rail reports that state and lets anyone jump straight to a service
 * instead of scrolling to it.
 *
 * The narrow layout has no sticky pane and no live drawing — each article
 * carries its own still one — so this only ever drives what is on screen.
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
      articles[index].scrollIntoView({
        behavior: motionPreference.matches ? "auto" : "smooth",
        block: "center",
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

  return () => {
    reader.disconnect();
    choices.forEach((choice, index) =>
      choice.removeEventListener("click", handlers[index]),
    );
    drawing.dispose();
  };
}
