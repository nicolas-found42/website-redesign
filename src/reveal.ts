import SplitType from "split-type";
import type { MotionPreference } from "./motion-preference";

/**
 * The page's entrance choreography.
 *
 * One rule governs it: content is never hidden by anything that might not
 * finish. The starting states live behind `html[data-motion="on"]`, which is
 * only set here, and every path out of this module ends with the finished
 * state applied — the reduced-motion path, a failed split, and disposal
 * part-way through.
 *
 * A headline is split into line masks only for as long as its entrance lasts.
 * Once it has played, the split is reverted and the heading is ordinary text
 * again: it re-wraps natively at any width, it can be selected and read
 * normally, and a later resize has nothing left to re-animate.
 *
 * Elements entering together are staggered by where they are rather than by
 * their order in the markup, so a row reads left to right and a column reads
 * top to bottom regardless of how it was written.
 */

const STAGGER = 70;
const WORD_STAGGER = 26;
const WORD_TRAVEL = 640;

type Options = { motionPreference: MotionPreference };

/** What a headline's entrance needs: the parts that move, and how to undo it. */
type Parts = { count: number; revert: () => void };

const settle = (element: Element) => element.classList.add("is-in");

export function mountReveals(root: ParentNode, { motionPreference }: Options) {
  const targets = () => [
    ...root.querySelectorAll<HTMLElement>("[data-reveal],[data-draw]"),
  ];
  const headlines = () => [
    ...root.querySelectorAll<HTMLElement>("[data-reveal-lines]"),
  ];

  /** A headline is in this map only while its split is live. */
  const splits = new Map<HTMLElement, Parts>();
  const played = new WeakSet<HTMLElement>();
  const timers = new Set<number>();
  let resizeTimer = 0;
  let disposed = false;

  function unsplit(headline: HTMLElement) {
    splits.get(headline)?.revert();
    splits.delete(headline);
  }

  /** Everything visible, immediately and permanently. */
  function showEverything() {
    for (const headline of [...splits.keys()]) unsplit(headline);
    document.documentElement.removeAttribute("data-motion");
    [...targets(), ...headlines()].forEach(settle);
  }

  if (motionPreference.matches) {
    showEverything();
    return () => {};
  }

  document.documentElement.dataset.motion = "on";

  const observer = new IntersectionObserver(
    (entries) => {
      const arrived = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => {
          const first = a.boundingClientRect;
          const second = b.boundingClientRect;
          return first.top - second.top || first.left - second.left;
        });
      arrived.forEach((entry, index) => {
        const element = entry.target as HTMLElement;
        observer.unobserve(element);
        if (element.hasAttribute("data-reveal-lines")) {
          play(element);
          return;
        }
        element.style.setProperty("--reveal-delay", `${index * STAGGER}ms`);
        settle(element);
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -8% 0px" },
  );
  targets().forEach((element) => observer.observe(element));

  /**
   * Line masks need the real line boxes, so the split waits for the fonts —
   * but not indefinitely. If they are slow the headline plays unsplit, which
   * still reads correctly.
   */
  const fontsSettled = Promise.race([
    document.fonts.ready,
    new Promise((resolve) => setTimeout(resolve, 1200)),
  ]);

  /**
   * A headline written as sentences already says where its lines go, so it is
   * masked exactly there. Measuring it instead would re-break it: the measuring
   * pass lays every word out as an inline block, which does not always group
   * the same way the finished text does — and the heading then stood a line
   * deeper for the length of its own entrance.
   */
  function maskSentences(headline: HTMLElement): Parts | undefined {
    const sentences = [
      ...headline.querySelectorAll<HTMLElement>(":scope > .sentence"),
    ];
    if (!sentences.length) return undefined;
    const original = headline.innerHTML;
    sentences.forEach((sentence, index) => {
      const mask = document.createElement("span");
      mask.className = "line";
      sentence.replaceWith(mask);
      mask.append(sentence);
      sentence.classList.add("line-move");
      sentence.style.setProperty(
        "--word-delay",
        `${index * WORD_STAGGER * 3}ms`,
      );
    });
    return {
      count: sentences.length,
      revert: () => {
        headline.innerHTML = original;
      },
    };
  }

  function split(headline: HTMLElement) {
    if (played.has(headline) || splits.has(headline)) return;
    try {
      const sentences = maskSentences(headline);
      if (sentences) {
        splits.set(headline, sentences);
        return;
      }
      const parts = new SplitType(headline, {
        types: "lines,words",
        tagName: "span",
      });
      (parts.words ?? []).forEach((word, index) =>
        word.style.setProperty("--word-delay", `${index * WORD_STAGGER}ms`),
      );
      splits.set(headline, {
        count: parts.words?.length ?? 0,
        revert: () => parts.revert(),
      });
    } catch {
      // A headline that cannot be split still has to be readable.
      played.add(headline);
      settle(headline);
    }
  }

  function play(headline: HTMLElement) {
    if (played.has(headline)) return;
    played.add(headline);
    settle(headline);
    const words = splits.get(headline)?.count ?? 0;
    if (!words) return;
    // Hand the heading back to the browser as plain text once it has arrived.
    const timer = window.setTimeout(
      () => {
        timers.delete(timer);
        if (!disposed) unsplit(headline);
      },
      WORD_TRAVEL + words * WORD_STAGGER * 3 + 120,
    );
    timers.add(timer);
  }

  function prepare() {
    for (const headline of headlines()) {
      if (played.has(headline)) continue;
      split(headline);
      if (headline.getBoundingClientRect().top < innerHeight * 0.92) {
        play(headline);
      } else {
        observer.observe(headline);
      }
    }
  }

  /**
   * Split and play straight away, then do it again with the real line boxes
   * once the fonts have settled.
   *
   * Both halves matter. Splitting before the fonts avoids painting the
   * headings, then taking them away to animate them in — a flash on a warm
   * cache. Playing before the fonts is what stops a slow font load from
   * holding a heading that is already on screen invisible for as long as the
   * font takes; a heading still waiting its turn is off screen, and is
   * re-split with the correct line boxes before it plays.
   */
  prepare();
  void fontsSettled.then(() => {
    if (disposed) return;
    for (const headline of headlines()) {
      if (played.has(headline)) continue;
      unsplit(headline);
    }
    prepare();
  });

  // Only headlines that have not played yet need their line boxes rebuilt;
  // the ones already shown are plain text and re-wrap on their own.
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (disposed) return;
      for (const headline of headlines()) {
        if (played.has(headline)) continue;
        unsplit(headline);
        split(headline);
      }
    }, 220);
  };
  addEventListener("resize", onResize);

  const onPreference = () => {
    if (motionPreference.matches) showEverything();
  };
  motionPreference.addEventListener("change", onPreference);

  return () => {
    disposed = true;
    clearTimeout(resizeTimer);
    timers.forEach((timer) => clearTimeout(timer));
    timers.clear();
    removeEventListener("resize", onResize);
    motionPreference.removeEventListener("change", onPreference);
    observer.disconnect();
    showEverything();
  };
}
