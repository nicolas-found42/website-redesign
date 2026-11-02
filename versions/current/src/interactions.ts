import {
  destinationRegister,
  inquiryInterests,
  questions,
  results,
  type InquiryContext,
} from "./content";
import { directContactLinks, inquiryNext } from "./homepage/inquiry";
/** Source scoring preserved: four 1–3 answers, thresholds 6 and 9. */
export const readinessResult = (answers: number[]) =>
  results[
    answers.reduce((a, b) => a + b, 0) >= 9
      ? 2
      : answers.reduce((a, b) => a + b, 0) >= 6
        ? 1
        : 0
  ];
export { scorecardQuestions, scorecardResult } from "./readiness";
import { mountReadiness } from "./readiness-view";

/** The live inquiry route; see `src/content.ts` for the destination register. */
const liveInquiry = destinationRegister.liveInquiry;

/** The live form's own interest labels, kept separate from published service names. */
const inquiryContext = (context: InquiryContext) => {
  const entry = inquiryInterests[context];
  return `${entry.form ? `Choose ${entry.form} in the live form. ` : ""}Add “${entry.carry}” to your message so Found42 knows what to discuss.`;
};

/**
 * Wires every in-page interaction the rendered pages carry: the scorecard,
 * the workflow preview and the shared inquiry handoff. Returns a disposer that
 * removes the dialog and every listener it added.
 */
export function mountInteractions(root: HTMLElement) {
  const controller = new AbortController();
  const { signal } = controller;
  const scoreHost = root.querySelector<HTMLElement>("#scorecard-app");
  if (scoreHost) mountReadiness(scoreHost, signal);
  let step = 0;
  let answers: number[] = [];
  const host = root.querySelector<HTMLElement>("#assessment");
  function renderAssessment(focus = false) {
    if (!host) return;
    const done = step === questions.length;
    const result = readinessResult(answers);
    const q = questions[step];
    host.innerHTML = `<div class="assessment-rail note">Readiness check <span>${done ? "Result" : `${step + 1} / 4`}</span></div><div class="assessment-body">${done ? `<p class="note">Your result</p><h3 tabindex="-1">${result.title}</h3><p>${result.body}</p><div class="form-actions"><button class="action" data-dialog="contact">Plan the next step&nbsp;→</button><button class="link" data-retake>Retake</button></div>` : `<h3 tabindex="-1">${q.text}</h3><div class="answer-options">${q.options.map((t, i) => `<button class="answer" data-answer="${i + 1}">${t}<span aria-hidden="true">→</span></button>`).join("")}</div>${step > 0 ? '<button class="link" data-back>← Back</button>' : ""}`}</div>`;
    if (focus) host.querySelector("h3")?.focus({ preventScroll: true });
  }
  renderAssessment();
  const dialog = document.createElement("dialog");
  dialog.className = "site-dialog";
  dialog.setAttribute("aria-labelledby", "dialog-title");
  root.append(dialog);
  let trigger: HTMLElement | null = null;
  const close = () => dialog.close();
  /**
   * Opens the inquiry handoff. `data-service` keeps the published name visible
   * in the dialog; `data-interest` is reserved for the live form's domain
   * vocabulary, and `data-contact` maps that service to concrete instructions
   * for the visitor carrying context to the live form.
   */
  function openDialog(type: string, from: HTMLElement) {
    trigger = from;
    const service = from.dataset.service ?? "";
    const interest = from.dataset.interest ?? "";
    const contact = from.dataset.contact as InquiryContext | undefined;
    const context =
      contact && contact in inquiryInterests
        ? inquiryContext(contact)
        : undefined;
    dialog.dataset.type = type;
    dialog.dataset.interest = interest;
    const carriedContext = context
      ? `<p class="note--plain inquiry-context">${context}</p>`
      : "";
    dialog.innerHTML =
      `<button class="dialog-close" aria-label="Close dialog" data-close>Close ×</button>` +
      `<p class="note">${service ? `About ${service}` : "Start with the bottleneck"}</p><h2 id="dialog-title">Talk to our team</h2><p>You’re sending a consultation inquiry, not reserving a meeting. Tell us where work is slow, repetitive, or inconsistent.</p><a class="action" href="${liveInquiry}">Open the live inquiry form&nbsp;→</a>${directContactLinks()}${carriedContext}<p class="note--plain">The live form currently starts news and updates at Yes: choose No if you only want a reply. It also asks you to agree to Found42 communications before it sends.</p>${inquiryNext()}`;
    dialog.showModal();
    document.body.classList.add("dialog-open");
  }
  dialog.addEventListener(
    "close",
    () => {
      document.body.classList.remove("dialog-open");
      trigger?.focus();
    },
    { signal },
  );
  /** A click on the dimmed backdrop, outside the dialog's own box, dismisses it. */
  dialog.addEventListener(
    "click",
    (event) => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      const inside =
        event.clientX >= box.left &&
        event.clientX <= box.right &&
        event.clientY >= box.top &&
        event.clientY <= box.bottom;
      if (!inside) close();
    },
    { signal },
  );
  dialog.addEventListener(
    "keydown",
    (event) => {
      if (event.key !== "Tab") return;
      const controls = [
        ...dialog.querySelectorAll<HTMLElement>(
          "button:not(:disabled), a[href], input:not(:disabled), textarea",
        ),
      ].filter((el) => el.getClientRects().length);
      const first = controls[0],
        last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    },
    { signal },
  );
  root.addEventListener(
    "click",
    (event) => {
      const target = (event.target as HTMLElement).closest<HTMLElement>(
        "button, a[data-dialog]",
      );
      if (!target) return;
      if (target.hasAttribute("data-answer")) {
        answers = [...answers.slice(0, step), Number(target.dataset.answer)];
        step++;
        renderAssessment(true);
      } else if (target.hasAttribute("data-back")) {
        step--;
        renderAssessment(true);
      } else if (target.hasAttribute("data-retake")) {
        step = 0;
        answers = [];
        renderAssessment(true);
      } else if (target.dataset.dialog) {
        // A real contact link remains usable in the prerendered page when
        // scripts are unavailable. Ordinary clicks get the contextual handoff.
        if (
          target instanceof HTMLAnchorElement &&
          (event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            event.button !== 0)
        )
          return;
        event.preventDefault();
        openDialog(target.dataset.dialog, target);
      } else if (target.hasAttribute("data-close")) close();
    },
    { signal },
  );
  return () => {
    controller.abort();
    dialog.remove();
    document.body.classList.remove("dialog-open");
  };
}
