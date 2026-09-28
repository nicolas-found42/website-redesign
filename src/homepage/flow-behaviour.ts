import type { PageMotion } from "../motion-preference";

const STEP_MS = 1150;

/** Adds a guided path to the complete, readable diagrams in the page markup. */
export function mountFlows(root: HTMLElement, motionPreference: PageMotion) {
  const flows = [
    ...root.querySelectorAll<HTMLElement>(".approved-homepage .ah-flow"),
  ];
  const disposers: (() => void)[] = [];
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const flow = entry.target as HTMLElement;
        flow.dispatchEvent(
          new CustomEvent("flow-visibility", {
            detail: entry.isIntersecting && entry.intersectionRatio >= 0.25,
          }),
        );
      });
    },
    { threshold: [0, 0.25, 0.75] },
  );

  flows.forEach((flow) => {
    const steps = [...flow.querySelectorAll<HTMLElement>(".ah-flow-step")].map(
      (step) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = step.className;
        button.textContent = step.textContent;
        step.replaceWith(button);
        return button;
      },
    );
    let active = steps.length - 1;
    let visible = false;
    let timer: number | undefined;
    let manualUntil = 0;

    const show = (index: number) => {
      active = index;
      flow.dataset.activeStep = String(index);
      steps.forEach((step, i) => {
        step.dataset.state =
          i < index ? "complete" : i === index ? "active" : "upcoming";
        step.tabIndex = i === index ? 0 : -1;
      });
    };
    const stop = () => {
      if (timer !== undefined) window.clearTimeout(timer);
      timer = undefined;
    };
    const schedule = (delay = STEP_MS) => {
      stop();
      if (
        !visible ||
        motionPreference.matches ||
        flow.closest("[hidden]") ||
        flow.contains(document.activeElement)
      )
        return;
      timer = window.setTimeout(() => {
        show((active + 1) % steps.length);
        schedule();
      }, delay);
    };
    const sync = () => {
      stop();
      if (motionPreference.matches) {
        flow.dataset.motion = "paused";
        show(steps.length - 1);
      } else if (visible && !flow.closest("[hidden]")) {
        flow.dataset.motion = "running";
        const remaining = manualUntil - performance.now();
        if (remaining > 0) schedule(remaining);
        else {
          show(0);
          schedule();
        }
      } else {
        flow.dataset.motion = "idle";
        show(steps.length - 1);
      }
    };
    const choose = (index: number) => {
      manualUntil = performance.now() + STEP_MS * 3;
      show(index);
      schedule(STEP_MS * 3);
    };
    const onClick = (event: Event) => {
      const index = steps.indexOf(event.target as HTMLButtonElement);
      if (index !== -1) choose(index);
    };
    const onFocus = (event: FocusEvent) => {
      const index = steps.indexOf(event.target as HTMLButtonElement);
      if (index !== -1) choose(index);
    };
    const onBlur = (event: FocusEvent) => {
      if (!flow.contains(event.relatedTarget as Node | null))
        schedule(STEP_MS * 3);
    };
    const onKey = (event: KeyboardEvent) => {
      const index = steps.indexOf(event.target as HTMLButtonElement);
      if (index === -1) return;
      const next =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? steps.length - 1
            : event.key === "ArrowRight" || event.key === "ArrowDown"
              ? (index + 1) % steps.length
              : event.key === "ArrowLeft" || event.key === "ArrowUp"
                ? (index - 1 + steps.length) % steps.length
                : -1;
      if (next === -1) return;
      event.preventDefault();
      choose(next);
      steps[next].focus();
    };
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType === "mouse" || event.pointerType === "pen") {
        const index = steps.indexOf(event.currentTarget as HTMLButtonElement);
        choose(index);
      }
    };
    const onVisibility = (event: Event) => {
      const next = (event as CustomEvent<boolean>).detail;
      if (next === visible) return;
      visible = next;
      sync();
    };

    flow.addEventListener("click", onClick);
    flow.addEventListener("focusin", onFocus);
    flow.addEventListener("focusout", onBlur);
    flow.addEventListener("keydown", onKey);
    flow.addEventListener("flow-visibility", onVisibility);
    steps.forEach((step) => step.addEventListener("pointerenter", onPointer));
    motionPreference.addEventListener("change", sync);
    sync();
    observer.observe(flow);
    disposers.push(() => {
      stop();
      flow.removeEventListener("click", onClick);
      flow.removeEventListener("focusin", onFocus);
      flow.removeEventListener("focusout", onBlur);
      flow.removeEventListener("keydown", onKey);
      flow.removeEventListener("flow-visibility", onVisibility);
      steps.forEach((step) =>
        step.removeEventListener("pointerenter", onPointer),
      );
      motionPreference.removeEventListener("change", sync);
    });
  });

  return () => {
    observer.disconnect();
    disposers.forEach((dispose) => dispose());
  };
}
