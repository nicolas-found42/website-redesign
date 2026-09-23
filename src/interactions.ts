import { questions, results } from "./content";
import { emailForm } from "./pages";
/** Source scoring preserved: four 1–3 answers, thresholds 6 and 9. */
export const readinessResult = (answers: number[]) =>
  results[
    answers.reduce((a, b) => a + b, 0) >= 9
      ? 2
      : answers.reduce((a, b) => a + b, 0) >= 6
        ? 1
        : 0
  ];
export function mountInteractions(root: HTMLElement) {
  const controller = new AbortController();
  const { signal } = controller;
  const enableForms = () =>
    root
      .querySelectorAll<HTMLInputElement | HTMLButtonElement>(
        "[data-await-script]",
      )
      .forEach((el) => {
        el.disabled = false;
      });
  let scorecardTimer: ReturnType<typeof setTimeout> | undefined;
  const loadScorecard = (button: HTMLButtonElement) => {
    const frameHost = root.querySelector<HTMLElement>("[data-scorecard-frame]");
    const status = root.querySelector<HTMLElement>("[data-scorecard-status]");
    if (!frameHost || !status) return;
    button.disabled = true;
    status.textContent =
      "Loading ScoreApp. You can also use the direct link above.";
    const frame = document.createElement("iframe");
    frame.title = "Found42 AI Readiness Scorecard on ScoreApp";
    frame.className = "scorecard-frame";
    frame.src = "https://found42.scoreapp.com/";
    frame.addEventListener(
      "load",
      () => {
        clearTimeout(scorecardTimer);
        status.textContent =
          "If the assessment is blank or unavailable, open it directly on ScoreApp using the link above.";
      },
      { signal, once: true },
    );
    scorecardTimer = setTimeout(() => {
      status.textContent =
        "ScoreApp is taking longer than expected. Open the scorecard directly using the link above.";
    }, 12000);
    frameHost.append(frame);
    frame.focus();
  };
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
  /** Each field carries its own message, read with the field when it is focused. */
  const field = (name: string, label: string, attributes: string) => {
    const id = `contact-${name}`;
    const shared = `id="${id}" name="${name}" aria-describedby="${id}-error" required ${attributes}`;
    const control =
      name === "challenge"
        ? `<textarea ${shared}></textarea>`
        : `<input ${shared}>`;
    return `<div class="field"><label for="${id}">${label}</label>${control}<p class="field-error" id="${id}-error"></p></div>`;
  };
  const fields =
    field(
      "name",
      "Your name",
      'autocomplete="name" minlength="2" maxlength="100"',
    ) +
    field(
      "email",
      "Work email",
      'type="email" autocomplete="email" maxlength="255"',
    ) +
    field(
      "company",
      "Company",
      'autocomplete="organization" minlength="2" maxlength="120"',
    ) +
    field(
      "challenge",
      "What should work better?",
      'minlength="10" maxlength="1000" rows="4"',
    );
  const fieldMessages: Record<string, string> = {
    name: "Enter your name, at least 2 characters.",
    email: "Enter a valid work email, like name@company.com.",
    company: "Enter your company, at least 2 characters.",
    challenge: "Describe the work in at least 10 characters.",
  };
  /**
   * What a visitor typed survives closing the dialog, so an Escape or a stray
   * close does not cost them their inquiry. Kept in memory for this page only.
   */
  const drafts = new Map<string, Record<string, string>>();
  const saveDraft = () => {
    const type = dialog.dataset.type;
    if (!type) return;
    const values: Record<string, string> = {};
    dialog
      .querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
        "input, textarea",
      )
      .forEach((input) => (values[input.name] = input.value));
    drafts.set(type, values);
  };
  function openDialog(type: string, from: HTMLElement) {
    trigger = from;
    dialog.dataset.type = type;
    dialog.innerHTML =
      `<button class="dialog-close" aria-label="Close dialog" data-close>Close ×</button>` +
      (type === "course"
        ? `<p class="note">Free 5-day mini-course</p><h2 id="dialog-title">Build your Strategic Advisor</h2><p>Five practical lessons to turn Claude into a rigorous thinking partner, not another chat window.</p><ul class="scope-list"><li>A reusable advisor skill</li><li>A quality-control checklist</li><li>A safe rollout pattern</li></ul>${emailForm("course-dialog", "Start the course")}<p class="note--plain">One short, practical lesson each day for five days. Unsubscribe anytime.</p><p class="note--plain">This describes the intended course. Enrollment and email delivery are not yet available.</p>`
        : `<p class="note">Start with the bottleneck</p><h2 id="dialog-title">Talk to our team</h2><p>Tell us where work is slow, repetitive, or inconsistent.</p><p class="note--plain">All fields required. This preview cannot send inquiries. Use the existing Found42 contact form to make a request; entries below stay in this page only.</p><a class="link" href="https://www.found42.com/contact">Open the live inquiry form&nbsp;→</a><form data-contact-form novalidate>${fields}<p class="form-status" role="status"></p><button class="action" type="submit">Review inquiry&nbsp;→</button></form>`);
    enableForms();
    const draft = drafts.get(type) ?? {};
    dialog
      .querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
        "input, textarea",
      )
      .forEach((input) => (input.value = draft[input.name] ?? ""));
    dialog.showModal();
    document.body.classList.add("dialog-open");
  }
  dialog.addEventListener(
    "close",
    () => {
      saveDraft();
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
        "button",
      );
      if (!target) return;
      if (target.hasAttribute("data-load-scorecard")) {
        loadScorecard(target as HTMLButtonElement);
      } else if (target.hasAttribute("data-answer")) {
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
        openDialog(target.dataset.dialog, target);
      } else if (target.hasAttribute("data-close")) close();
    },
    { signal },
  );
  root.addEventListener(
    "submit",
    (event) => {
      const form = event.target as HTMLFormElement;
      if (!form.matches("[data-email-form],[data-contact-form]")) return;
      event.preventDefault();
      let invalid = 0;
      for (const input of form.querySelectorAll<
        HTMLInputElement | HTMLTextAreaElement
      >("input,textarea")) {
        const value = input.value.trim();
        const min = input.minLength > 0 ? input.minLength : 1;
        const ok =
          input.checkValidity() &&
          value.length >= min &&
          (input.maxLength < 0 || value.length <= input.maxLength);
        input.setAttribute("aria-invalid", String(!ok));
        const message = form.querySelector(`#${input.id}-error.field-error`);
        if (message)
          message.textContent = ok ? "" : (fieldMessages[input.name] ?? "");
        if (!ok) invalid++;
      }
      const status = form.querySelector<HTMLElement>(".form-status")!;
      status.dataset.state = invalid ? "error" : "done";
      if (invalid) {
        status.textContent = form.hasAttribute("data-email-form")
          ? "Enter a valid work email."
          : `Complete every field before reviewing: ${invalid === 1 ? "1 field needs" : `${invalid} fields need`} attention.`;
        form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
        return;
      }
      status.textContent = form.hasAttribute("data-email-form")
        ? "Delivery is not connected in this preview. Nothing was sent, and you have not been subscribed."
        : "Your details are ready to review. Nothing was sent. Continue using the live inquiry form above to contact Found42.";
    },
    { signal },
  );
  enableForms();
  return () => {
    clearTimeout(scorecardTimer);
    controller.abort();
    dialog.remove();
    document.body.classList.remove("dialog-open");
  };
}
