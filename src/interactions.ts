import {
  destinationRegister,
  inquiryInterests,
  questions,
  results,
  scorecard,
  type InquiryContext,
} from "./content";
import { inquiryNext } from "./homepage/inquiry";
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

/** The live inquiry route; see `src/content.ts` for the destination register. */
const liveInquiry = destinationRegister.liveInquiry;

/** The live form's own interest labels, kept separate from published service names. */
const inquiryContext = (context: InquiryContext) => {
  const entry = inquiryInterests[context];
  return `Choose ${entry.form} in the live form. Add “${entry.carry}” to your message so Found42 knows what to discuss.`;
};

/** Makes a visitor's own words safe to show as text inside markup. */
const escapeText = (text: string) =>
  text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

/**
 * Wires every in-page interaction the rendered pages carry: the scorecard,
 * the workflow preview and the shared inquiry handoff. Returns a disposer that
 * removes the dialog and every listener it added.
 */
export function mountInteractions(root: HTMLElement) {
  const controller = new AbortController();
  const { signal } = controller;
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
    const context = contact && contact in inquiryInterests
      ? inquiryContext(contact)
      : undefined;
    dialog.dataset.type = type;
    dialog.dataset.interest = interest;
    const carriedAnswer = escapeText(dialog.dataset.scorecardAnswer?.trim() ?? "");
    const carried = carriedAnswer
      ? `<div class="inquiry-draft"><p class="note">From your readiness check</p><p>${carriedAnswer}</p></div>`
      : "";
    const carriedContext = context
      ? `<p class="note--plain inquiry-context">${context}</p>`
      : "";
    dialog.innerHTML =
      `<button class="dialog-close" aria-label="Close dialog" data-close>Close ×</button>` +
      `<p class="note">${service ? `About ${service}` : "Start with the bottleneck"}</p><h2 id="dialog-title">Talk to our team</h2><p>You’re sending a consultation inquiry, not reserving a meeting. Tell us where work is slow, repetitive, or inconsistent.</p><a class="action" href="${liveInquiry}">Open the live inquiry form&nbsp;→</a>${carriedContext}<p class="note--plain">The live form currently starts news and updates at Yes: choose No if you only want a reply. It also asks you to agree to Found42 communications before it sends.</p>${carried}${inquiryNext()}`;
    delete dialog.dataset.scorecardAnswer;
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
        // The scorecard's open answer is local-only, so it is offered as text
        // the visitor can carry to the live form rather than prefilled here.
        if (target.hasAttribute("data-scorecard-prefill") && openAnswer)
          dialog.dataset.scorecardAnswer = openAnswer;
        openDialog(target.dataset.dialog, target);
      } else if (target.hasAttribute("data-close")) close();
    },
    { signal },
  );
  root.addEventListener(
    "submit",
    (event) => {
      const form = event.target as HTMLFormElement;
      if (!form.matches("[data-scorecard-open]")) return;
      event.preventDefault();
      openAnswer =
        form.querySelector<HTMLTextAreaElement>("textarea")?.value.trim() ?? "";
      scoreStep++;
      renderScorecard(true);
    },
    { signal },
  );
  return () => {
    controller.abort();
    dialog.remove();
    document.body.classList.remove("dialog-open");
  };
}
