/**
 * Whether the page may move.
 *
 * Two things can stop it: the operating system's reduced-motion setting, and
 * the visitor pausing it here. The page's signals run continuously alongside
 * the rest of the content, so WCAG 2.2.2 asks for a control that stops them —
 * the system setting alone is not that control.
 *
 * The shape deliberately matches `MediaQueryList`, so every module that already
 * takes one keeps working and none of them needs to know a visitor override
 * exists.
 */
export interface MotionPreference {
  /** True when the page should rest in its still state. */
  readonly matches: boolean;
  addEventListener(type: "change", listener: () => void): void;
  removeEventListener(type: "change", listener: () => void): void;
}

export interface PageMotion extends MotionPreference {
  /** True when the operating system asked for reduced motion. */
  readonly bySystem: boolean;
  /** True when the visitor pressed pause. */
  readonly byVisitor: boolean;
  setPaused(paused: boolean): void;
  dispose(): void;
}

export function createPageMotion(query: MediaQueryList): PageMotion {
  const listeners = new Set<() => void>();
  let paused = false;

  const notify = () => listeners.forEach((listener) => listener());
  query.addEventListener("change", notify);

  return {
    get matches() {
      return paused || query.matches;
    },
    get bySystem() {
      return query.matches;
    },
    get byVisitor() {
      return paused;
    },
    setPaused(next) {
      if (next === paused) return;
      paused = next;
      notify();
    },
    addEventListener(_type, listener) {
      listeners.add(listener);
    },
    removeEventListener(_type, listener) {
      listeners.delete(listener);
    },
    dispose() {
      query.removeEventListener("change", notify);
      listeners.clear();
    },
  };
}
