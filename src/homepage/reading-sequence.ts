import type { MotionPreference } from "../motion-preference";

const NARROW = "(max-width: 960px)";

/** Reading, rail jumps and keyboard navigation share one landing lifecycle. */
export function mountReadingSequence({
  section,
  articles,
  choices,
  aside,
  railProperty,
  motionPreference,
  onSelect,
}: {
  section: HTMLElement;
  articles: HTMLElement[];
  choices: HTMLButtonElement[];
  aside: HTMLElement;
  railProperty: string;
  motionPreference: MotionPreference;
  onSelect: (index: number) => void;
}) {
  const narrow = matchMedia(NARROW);
  const updateRail = () =>
    section.style.setProperty(railProperty, `${aside.offsetHeight}px`);
  let current = 0;
  /** The latest rail choice stays authoritative until its jump finishes. */
  let expecting: number | undefined;
  /** A narrow explicit choice remains selected until the visitor navigates on. */
  let chosen = false;
  let chosenIndex = 0;
  let jumpRetried = false;
  let jumpStarted = false;

  /**
   * Makes `index` the article being read: the drawing, caption, rail and rule
   * follow it. With `scroll`, the visitor asked for it, so it is brought into
   * view too.
   */
  function show(index: number, options: { scroll?: boolean } = {}) {
    if (index !== current) {
      current = index;
      onSelect(index);
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
        // Explicitly cancel a native smooth scroll when motion is reduced.
        // WebKit can leave an interrupted jump short of its target with auto.
        behavior: motionPreference.matches ? "instant" : "smooth",
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
        const index = articles.indexOf(entry.target as HTMLElement);
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
    if (!narrow.matches && box.top <= middle && box.bottom >= middle)
      return true;
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
  // A late anchor landing can interrupt a smooth jump without a scrollend.
  // Treat an idle scroll as settled too, so the latest pill remains authoritative.
  let scrollIdle = 0;
  const onScroll = () => {
    clearTimeout(scrollIdle);
    scrollIdle = window.setTimeout(onScrollEnd, 160);
  };
  addEventListener("scroll", onScroll, { passive: true });
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
  // Mouse-driven scrolling (including a scrollbar drag) has no wheel event.
  addEventListener("mousedown", onManualScroll, { passive: true });
  addEventListener("wheel", onManualScroll, { passive: true });
  addEventListener("touchstart", onManualScroll, { passive: true });
  addEventListener("keydown", onManualKey);
  // Moving keyboard focus into an article is navigation too: release a pill's
  // landing hold before the browser scrolls the newly focused link into view.
  const onFocus = (event: FocusEvent) => {
    const index = articles.findIndex((article) =>
      article.contains(event.target as Node),
    );
    if (index < 0) return;
    onManualScroll();
    show(index);
  };
  section.addEventListener("focusin", onFocus);
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
      chosenIndex = index;
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

  const measureRail = new ResizeObserver(updateRail);
  measureRail.observe(aside);
  updateRail();
  const holdLanding = new ResizeObserver(() => {
    if (!narrow.matches || !chosen || !jumpStarted) return;
    if (expecting !== undefined || atRequestedArticle(current)) return;
    articles[current].scrollIntoView({ behavior: "auto", block: "start" });
  });
  holdLanding.observe(document.body);
  const onPreference = () => {
    if (!motionPreference.matches) return;
    // A scrollend can release or give up on the pending jump while native
    // scrolling is still moving. Keep the last explicit choice available until
    // manual navigation, and hold it again once it is re-requested.
    const requested = expecting ?? (jumpStarted ? chosenIndex : undefined);
    if (requested === undefined) return;
    updateRail();
    cancelAnimationFrame(jumpFrame);
    chosen = true;
    jumpRetried = false;
    jumpStarted = false;
    expecting = requested;
    show(requested);
    // Later motion subscribers restore headings and stop smooth scrolling.
    // Land after those layout changes, rather than releasing a stale target.
    jumpFrame = requestAnimationFrame(() => {
      if (expecting !== requested || !motionPreference.matches) {
        if (expecting === requested && !motionPreference.matches) expecting = undefined;
        return;
      }
      updateRail();
      jumpStarted = true;
      show(requested, { scroll: true });
      expecting = atRequestedArticle(requested) ? undefined : requested;
    });
  };
  motionPreference.addEventListener("change", onPreference);
  return () => {
    cancelAnimationFrame(jumpFrame);
    removeEventListener("scrollend", onScrollEnd);
    removeEventListener("scroll", onScroll);
    clearTimeout(scrollIdle);
    removeEventListener("mousedown", onManualScroll);
    removeEventListener("wheel", onManualScroll);
    removeEventListener("touchstart", onManualScroll);
    removeEventListener("keydown", onManualKey);
    removeEventListener("hashchange", onHashChange);
    reader.disconnect();
    measureRail.disconnect();
    holdLanding.disconnect();
    motionPreference.removeEventListener("change", onPreference);
    choices.forEach((choice, index) =>
      choice.removeEventListener("click", handlers[index]),
    );
    section.removeEventListener("focusin", onFocus);
  };
}
