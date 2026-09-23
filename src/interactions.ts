import { questions, results, scorecard } from "./content";
import { emailForm } from "./pages";
import { sitePath } from "./paths";
/** Source scoring preserved: four 1–3 answers, thresholds 6 and 9. */
export const readinessResult = (answers: number[]) =>
  results[
    answers.reduce((a, b) => a + b, 0) >= 9
      ? 2
      : answers.reduce((a, b) => a + b, 0) >= 6
        ? 1
        : 0
  ];
/** Every yes-or-no question in the order asked: the areas, then what held the business back. */
export const scorecardQuestions = [
  ...scorecard.areas.flatMap((area) =>
    area.questions.map((text) => ({ text, group: area.name })),
  ),
  ...scorecard.barriers.map((barrier) => ({
    text: barrier.question,
    group: "What has held you back",
  })),
];

export type AreaStatus = "In place" | "Partly in place" | "Next to build";

/**
 * Reads a completed scorecard. `answers` holds true for yes, in the order of
 * `scorecardQuestions`. The stage follows the area answers only; the areas not
 * yet in place, weakest first, become at most three places to start, and a
 * yes to either barrier question adds the advice that answers it.
 */
export function scorecardResult(answers: readonly boolean[]) {
  let at = 0;
  const areas = scorecard.areas.map((area) => {
    const yes = answers
      .slice(at, at + area.questions.length)
      .filter(Boolean).length;
    at += area.questions.length;
    const share = yes / area.questions.length;
    const status: AreaStatus =
      share === 1 ? "In place" : yes > 0 ? "Partly in place" : "Next to build";
    return { area, yes, share, status };
  });
  const total = areas.reduce((sum, area) => sum + area.yes, 0);
  const stage = scorecard.stages.reduce((found, stage) =>
    total >= stage.from ? stage : found,
  );
  const next = areas
    .filter((area) => area.share < 1)
    .sort((a, b) => a.share - b.share)
    .slice(0, 3);
  const barriers = scorecard.barriers.filter((_, index) => answers[at + index]);
  return { stage, areas, next, barriers };
}

/**
 * Found42's own inquiry form. The preview cannot send an inquiry, so every
 * way to talk to the team ends here.
 */
const liveInquiry = "https://www.found42.com/contact";

/** Makes a visitor's own words safe to show as text inside markup. */
const escapeText = (text: string) =>
  text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

/**
 * Wires every in-page interaction the rendered pages carry: the scorecard,
 * the workflow preview, the shared dialogs and the no-send forms. Returns a
 * disposer that removes the dialog and every listener it added.
 */
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
  /* ── The AI Readiness Scorecard: yes-or-no questions, one open, a result ── */
  const scoreHost = root.querySelector<HTMLElement>("#scorecard-app");
  const asked = scorecardQuestions.length;
  let scoreStep = 0;
  let scoreAnswers: boolean[] = [];
  let openAnswer = "";
  /** The strip above every scorecard step: its name, and where the visitor is. */
  const scoreRail = (label: string) =>
    `<div class="assessment-rail note">AI Readiness Scorecard <span>${label}</span></div>`;
  const scoreBack =
    '<button class="link" type="button" data-scorecard-back>← Back</button>';
  /** The current yes-or-no question, under the area it belongs to. */
  function scorecardQuestion() {
    const question = scorecardQuestions[scoreStep];
    return `${scoreRail(`Question ${scoreStep + 1} of ${asked}`)}<div class="assessment-body"><p class="note scorecard-group">${question.group}</p><h3 tabindex="-1">${question.text}</h3><div class="answer-options answer-options--pair"><button class="answer" data-scorecard-answer="yes">Yes<span aria-hidden="true">→</span></button><button class="answer" data-scorecard-answer="no">No<span aria-hidden="true">→</span></button></div>${scoreStep > 0 ? scoreBack : ""}</div>`;
  }
  /** The optional open question that closes the scorecard. */
  function scorecardOpen() {
    return `${scoreRail("Last question")}<form class="assessment-body scorecard-open" data-scorecard-open><h3 tabindex="-1" id="scorecard-open-title">${scorecard.open}</h3><p class="note--plain" id="scorecard-open-hint">Optional. What you write stays in this browser.</p><textarea id="scorecard-open" name="open" rows="3" maxlength="500" aria-labelledby="scorecard-open-title" aria-describedby="scorecard-open-hint"></textarea><div class="form-actions"><button class="action" type="submit">See my result&nbsp;→</button>${scoreBack}</div></form>`;
  }
  /** The result: a stage, each area's status, and where to start. */
  function scorecardSummary() {
    const { stage, areas, next, barriers } = scorecardResult(scoreAnswers);
    const link = (target?: { label: string; href: string }) =>
      target
        ? ` <a class="link" href="${sitePath(target.href)}">${target.label}&nbsp;→</a>`
        : "";
    const steps = [
      ...next.map(
        ({ area }) =>
          `<li><b>${area.name}.</b> ${area.advice}${link("link" in area ? area.link : undefined)}</li>`,
      ),
      ...barriers.map(
        (barrier) =>
          `<li>${barrier.advice}${link("link" in barrier ? barrier.link : undefined)}</li>`,
      ),
    ];
    return `${scoreRail("Your result")}<div class="assessment-body scorecard-result"><p class="note">Your readiness stage</p><h3 tabindex="-1">${stage.title}</h3><p>${stage.body}</p><ul class="scorecard-areas" aria-label="Readiness by area">${areas.map(({ area, status }) => `<li data-status="${status === "In place" ? "done" : status === "Partly in place" ? "partial" : "next"}"><span>${area.name}</span><span class="note--plain">${status}</span></li>`).join("")}</ul>${steps.length ? `<h4>Where to start</h4><ol class="scorecard-next">${steps.join("")}</ol>` : ""}${openAnswer ? `<p class="scorecard-echo"><span class="note">You would like to automate</span> “${escapeText(openAnswer)}”</p>` : ""}<div class="form-actions"><button class="action" data-dialog="contact" data-scorecard-prefill>Plan the next step&nbsp;→</button><button class="link" data-scorecard-retake>Retake</button></div><p class="note--plain">A starting point for a conversation, not an audit or a certification. Nothing you answered was sent or stored.</p></div>`;
  }
  /**
   * Shows the current step. Focus moves to its heading only when the visitor
   * moved, so a screen reader announces the new step and nothing else.
   */
  function renderScorecard(focus = false) {
    if (!scoreHost) return;
    scoreHost.innerHTML =
      scoreStep < asked
        ? scorecardQuestion()
        : scoreStep === asked
          ? scorecardOpen()
          : scorecardSummary();
    const field = scoreHost.querySelector<HTMLTextAreaElement>("textarea");
    if (field) field.value = openAnswer;
    if (focus) scoreHost.querySelector("h3")?.focus({ preventScroll: true });
  }
  renderScorecard();
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
        : `<p class="note">Start with the bottleneck</p><h2 id="dialog-title">Talk to our team</h2><p>Tell us where work is slow, repetitive, or inconsistent.</p><a class="action" href="${liveInquiry}">Open the live inquiry form&nbsp;→</a><p class="note--plain">This preview cannot send inquiries. They go through Found42’s contact form.</p><form data-contact-form novalidate aria-labelledby="draft-title"><h3 id="draft-title">Or draft it here first</h3><p class="note--plain">All fields required. Your draft stays on this page, ready to copy into the live form.</p>${fields}<p class="form-status" role="status"></p><div class="draft-next" hidden><button class="link" type="button" data-copy-draft>Copy my message</button><a class="link" href="${liveInquiry}">Go to the live form&nbsp;→</a></div><button class="action action--ghost" type="submit">Check my draft&nbsp;→</button></form>`);
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
      if (target.hasAttribute("data-scorecard-answer")) {
        scoreAnswers = [
          ...scoreAnswers.slice(0, scoreStep),
          target.dataset.scorecardAnswer === "yes",
        ];
        scoreStep++;
        renderScorecard(true);
      } else if (target.hasAttribute("data-scorecard-back")) {
        const field = scoreHost?.querySelector<HTMLTextAreaElement>("textarea");
        if (field) openAnswer = field.value.trim();
        scoreStep--;
        renderScorecard(true);
      } else if (target.hasAttribute("data-scorecard-retake")) {
        scoreStep = 0;
        scoreAnswers = [];
        openAnswer = "";
        renderScorecard(true);
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
        // What the scorecard's visitor wants automated starts their inquiry,
        // unless they have already written one.
        if (target.hasAttribute("data-scorecard-prefill") && openAnswer) {
          const draft = drafts.get("contact") ?? {};
          if (!draft.challenge?.trim())
            drafts.set("contact", { ...draft, challenge: openAnswer });
        }
        openDialog(target.dataset.dialog, target);
      } else if (target.hasAttribute("data-copy-draft")) copyDraft();
      else if (target.hasAttribute("data-close")) close();
    },
    { signal },
  );
  /**
   * Copies what the visitor wrote about their work, the part worth keeping,
   * so it survives the move to the live form. Where the clipboard is refused
   * the status says how to copy it by hand.
   */
  const copyDraft = () => {
    const status = dialog.querySelector<HTMLElement>(".form-status");
    const message =
      dialog
        .querySelector<HTMLTextAreaElement>('[name="challenge"]')
        ?.value.trim() ?? "";
    const say = (text: string) => {
      if (status) status.textContent = text;
    };
    const copied = navigator.clipboard?.writeText(message);
    if (!copied) {
      say(
        "Copying is not available here. Select your message above and copy it.",
      );
      return;
    }
    copied.then(
      () => say("Copied. Paste it into the Message box on the live form."),
      () =>
        say(
          "Copying is not available here. Select your message above and copy it.",
        ),
    );
  };
  type Field = HTMLInputElement | HTMLTextAreaElement;
  /** Checks one field and shows, or clears, its own message. */
  const checkField = (form: HTMLFormElement, input: Field) => {
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
    return ok;
  };
  const invalidSummary = (form: HTMLFormElement, invalid: number) =>
    form.hasAttribute("data-email-form")
      ? "Enter a valid work email."
      : `Complete every field to check your draft: ${invalid === 1 ? "1 field needs" : `${invalid} fields need`} attention.`;
  root.addEventListener(
    "submit",
    (event) => {
      const form = event.target as HTMLFormElement;
      if (form.matches("[data-scorecard-open]")) {
        event.preventDefault();
        openAnswer =
          form.querySelector<HTMLTextAreaElement>("textarea")?.value.trim() ??
          "";
        scoreStep++;
        renderScorecard(true);
        return;
      }
      if (!form.matches("[data-email-form],[data-contact-form]")) return;
      event.preventDefault();
      form.dataset.checked = "";
      const invalid = [
        ...form.querySelectorAll<Field>("input,textarea"),
      ].filter((input) => !checkField(form, input)).length;
      const status = form.querySelector<HTMLElement>(".form-status")!;
      status.dataset.state = invalid ? "error" : "done";
      if (invalid) {
        status.textContent = invalidSummary(form, invalid);
        form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
        return;
      }
      if (form.hasAttribute("data-email-form")) {
        status.textContent =
          "Delivery is not connected in this preview. Nothing was sent, and you have not been subscribed.";
        return;
      }
      status.textContent =
        "Your draft is complete. Nothing was sent. Copy your message, then paste it into the live form.";
      form.querySelector<HTMLElement>(".draft-next")!.hidden = false;
    },
    { signal },
  );
  /**
   * Once a form has been checked, a field is re-checked as it is corrected, so
   * a fixed field stops showing and announcing its error. The summary follows
   * the count, and only changes when the count does, so the live region is not
   * read out on every keystroke.
   */
  root.addEventListener(
    "input",
    (event) => {
      const input = event.target as Field;
      const form = input.form;
      if (!form?.matches("[data-checked]")) return;
      const status = form.querySelector<HTMLElement>(".form-status")!;
      if (status.dataset.state === "done") return;
      checkField(form, input);
      const invalid = form.querySelectorAll('[aria-invalid="true"]').length;
      const summary = invalid ? invalidSummary(form, invalid) : "";
      if (status.textContent !== summary) status.textContent = summary;
    },
    { signal },
  );
  enableForms();
  return () => {
    controller.abort();
    dialog.remove();
    document.body.classList.remove("dialog-open");
  };
}
