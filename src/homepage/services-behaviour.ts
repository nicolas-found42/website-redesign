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
  const aside = section.querySelector<HTMLElement>(".services-aside");
  const narrow = matchMedia(NARROW);
  const updateRail = () => {
    if (aside)
      section.style.setProperty("--services-rail", `${aside.offsetHeight}px`);
  };

  const drawing = mountSystem(host, {
    motionPreference,
    compositions: schematics,
    live: true,
  });

  let current = 0;
  /** The latest rail choice stays authoritative until its jump finishes. */
  let expecting: number | undefined;
  /** A narrow explicit choice remains selected until the visitor navigates on. */
  let chosen = false;
  let jumpRetried = false;
  let jumpStarted = false;

  /**
   * Makes `index` the service being read: the drawing, caption, rail and rule
   * follow it. With `scroll`, the visitor asked for it, so it is brought into
   * view too.
   */
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
      if (expecting !== undefined || (narrow.matches && chosen)) return;
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

  /** A narrow jump lands at its CSS scroll margin plus page scroll padding. */
  const atRequestedArticle = (index: number) => {
    const box = articles[index].getBoundingClientRect();
    const middle = innerHeight / 2;
    if (box.top <= middle && box.bottom >= middle) return true;
    if (!narrow.matches) return false;
    const margin = Number.parseFloat(
      getComputedStyle(articles[index]).scrollMarginTop,
    );
    const padding = Number.parseFloat(
      getComputedStyle(document.documentElement).scrollPaddingTop,
    );
    const landing = margin + padding;
    const atPageEnd =
      scrollY + innerHeight >= document.documentElement.scrollHeight - 2;
    return (
      Math.abs(box.top - landing) <= 4 ||
      (atPageEnd && box.top <= landing && box.bottom > 0)
    );
  };

  const articleAtMiddle = () => {
    const middle = innerHeight / 2;
    return articles.findIndex((article) => {
      const box = article.getBoundingClientRect();
      return box.top <= middle && box.bottom >= middle;
    });
  };

  /** A settled scroll also catches an article the observer crossed while locked. */
  const onScrollEnd = () => {
    if (expecting === undefined) {
      if (narrow.matches && chosen) return;
      const index = articleAtMiddle();
      if (index >= 0) show(index);
      return;
    }
    // Rapid jumps can emit scrollend for an interrupted earlier target. The
    // latest choice is still in flight until its article reaches the reader.
    if (!jumpStarted) return;
    if (!atRequestedArticle(expecting)) {
      if (!jumpRetried) {
        jumpRetried = true;
        updateRail();
        show(expecting, { scroll: true });
      } else {
        expecting = undefined;
        chosen = false;
      }
      return;
    }
    const requested = expecting;
    expecting = undefined;
    if (narrow.matches) {
      show(requested);
      return;
    }
    const index = articleAtMiddle();
    if (index >= 0) show(index);
  };
  addEventListener("scrollend", onScrollEnd);
  const onManualScroll = () => {
    expecting = undefined;
    chosen = false;
    jumpStarted = false;
  };
  const onManualKey = (event: KeyboardEvent) => {
    if (
      [
        "ArrowDown",
        "ArrowUp",
        "PageDown",
        "PageUp",
        "Home",
        "End",
        " ",
      ].includes(event.key)
    )
      onManualScroll();
  };
  addEventListener("wheel", onManualScroll, { passive: true });
  addEventListener("touchstart", onManualScroll, { passive: true });
  addEventListener("keydown", onManualKey);
  let previousHash = location.hash;
  const onHashChange = () => {
    if (location.hash === previousHash) return;
    previousHash = location.hash;
    onManualScroll();
  };
  addEventListener("hashchange", onHashChange);

  let jumpFrame = 0;
  const handlers = choices.map((choice, index) => {
    const onClick = () => {
      expecting = index;
      chosen = true;
      jumpRetried = false;
      jumpStarted = false;
      show(index);
      updateRail();
      cancelAnimationFrame(jumpFrame);
      // A touch browser may scroll the focused rail button after `click`.
      // Jump on the next frame so that default action cannot pull it back.
      jumpFrame = requestAnimationFrame(() => {
        if (expecting === index) {
          jumpStarted = true;
          show(index, { scroll: true });
        }
      });
    };
    choice.addEventListener("click", onClick);
    return onClick;
  });

  articles[0]?.classList.add("is-current");

  /**
   * A jump lands an article's start below the rail, whose height depends on
   * whether its choices fit one line at the visitor's text size.
   */
  const measureRail = new ResizeObserver(updateRail);
  if (aside) measureRail.observe(aside);

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
    if (expecting !== undefined) {
      // Cancel the old smooth jump at its requested article before the
      // reading observer is allowed to report the articles it passed.
      updateRail();
      jumpStarted = true;
      show(expecting, { scroll: true });
      if (atRequestedArticle(expecting)) expecting = undefined;
    }
    figures.forEach((_, index) => rest(index));
  };
  motionPreference.addEventListener("change", onPreference);

  return () => {
    cancelAnimationFrame(jumpFrame);
    removeEventListener("scrollend", onScrollEnd);
    removeEventListener("wheel", onManualScroll);
    removeEventListener("touchstart", onManualScroll);
    removeEventListener("keydown", onManualKey);
    removeEventListener("hashchange", onHashChange);
    reader.disconnect();
    measureRail.disconnect();
    arrival.disconnect();
    motionPreference.removeEventListener("change", onPreference);
    choices.forEach((choice, index) =>
      choice.removeEventListener("click", handlers[index]),
    );
    drawing.dispose();
    figureDrawings.forEach((figureDrawing) => figureDrawing?.dispose());
  };
}
