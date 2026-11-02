import Lenis from "lenis";
import type { MotionPreference } from "./motion-preference";

/**
 * Scroll feel.
 *
 * Lenis smooths the wheel's steps without taking the scrollbar, the keyboard or
 * touch scrolling away — the page still scrolls natively, it just arrives more
 * evenly, which is what keeps the scroll-linked sequence from stepping. It is
 * never started under a reduced-motion preference, and it is destroyed the
 * moment that preference arrives.
 *
 * A dialog and the open mobile menu scroll on their own. Lenis would otherwise
 * take their wheel events and move the page behind them — past a modal, with
 * the dialog's own lower fields out of reach — so it lets those go natively.
 * The open menu's toggle sits above the panel rather than inside it, so it is
 * let go too; with the page locked, a wheel over it moves nothing behind.
 */
const scrollsOnItsOwn = (node: HTMLElement) =>
  node instanceof HTMLDialogElement ||
  (node.id === "navigation" && node.classList.contains("is-open")) ||
  (node.classList?.contains("menu-toggle") &&
    node.getAttribute("aria-expanded") === "true");

export function mountSmoothScroll({
  motionPreference,
}: {
  motionPreference: MotionPreference;
}) {
  let lenis: Lenis | undefined;
  let frame = 0;

  function start() {
    if (lenis || motionPreference.matches) return;
    lenis = new Lenis({
      autoRaf: false,
      lerp: 0.12,
      // Touch keeps the platform's own physics; only the wheel is smoothed.
      syncTouch: false,
      prevent: scrollsOnItsOwn,
    });
    const raf = (time: number) => {
      lenis?.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);
  }

  function stop() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    lenis?.destroy();
    lenis = undefined;
  }

  const onPreference = () => (motionPreference.matches ? stop() : start());
  motionPreference.addEventListener("change", onPreference);
  start();

  return () => {
    motionPreference.removeEventListener("change", onPreference);
    stop();
  };
}
