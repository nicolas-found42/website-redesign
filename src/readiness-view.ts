import { destinationRegister } from "./content";
import { sitePath } from "./paths";
import { scorecardResult, type ReadinessReport } from "./readiness";
import {
  MAX_TOTAL,
  readinessAreas,
  readinessOffers,
  readinessRoles,
  scorecardQuestions,
} from "./readiness-content";
export const escapeReadinessText = (text: string) =>
  text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
type OfferKey = keyof typeof readinessOffers;
/** Source recommendations use real routes; unpublished offers have an inquiry fallback. */
export function reportOffer(key: OfferKey) {
  const offer = readinessOffers[key];
  const title = "title" in offer ? offer.title : offer.short[0];
  const body = "body" in offer ? offer.body : offer.short[1];
  const list: readonly string[] = "list" in offer ? offer.list : [];
  const routes: Record<
    OfferKey,
    { href: string; label: string; note?: string; contact?: string }
  > = {
    starter: {
      href: sitePath("resources/#library"),
      label: "Explore the free resources",
      note: "The bundled starter kit and Communication Intelligence package are not published here. The current Skills Starter Library offers four downloads; Strategic Advisor offers a skill and published lesson. The Playbook has its own request route.",
    },
    clevel: {
      href: sitePath("services/#track-c-level-ai"),
      label: "Explore C-Level AI",
    },
    builder: {
      href: sitePath("services/#track-ai-builders"),
      label: "Explore AI Builders training",
      note: "Enrollment for this specific Saturday intensive, eight-plugin package and badge is not available on this site. Explore the current training track or inquire about availability.",
    },
    workflows: {
      href: destinationRegister.liveInquiry,
      label: "Inquire about workflows",
      contact: "workflows",
    },
    automations: {
      href: destinationRegister.liveInquiry,
      label: "Inquire about automations",
      contact: "automations",
    },
    advanced: {
      href: destinationRegister.liveInquiry,
      label: "Inquire about advanced training",
      contact: "ai-builders",
      note: "The Advanced waitlist is not available here. Ask Found42 about advanced training; an inquiry does not enroll you.",
    },
    talk: {
      href: destinationRegister.liveInquiry,
      label: "Talk to us",
      note: "Send an inquiry to arrange a conversation.",
    },
  };
  return { key, title, body, list, ...routes[key] };
}
const offerHtml = (key: OfferKey) => {
  const offer = reportOffer(key);
  return `<article class="readiness-offer"><h5>${offer.title}</h5><p>${offer.body}</p>${offer.list.length ? `<ul>${offer.list.map((t) => `<li>${t}</li>`).join("")}</ul>` : ""}${offer.note ? `<p class="note--plain">${offer.note}</p>` : ""}<a class="link" href="${offer.href}"${offer.contact || key === "talk" ? ` data-dialog="contact" data-contact="${offer.contact ?? ""}"` : ""}>${offer.label}&nbsp;→</a></article>`;
};
export const scoreMethod =
  "How this is scored: each of the 17 scored questions is worth up to 3 points, 51 in total. Your overall score is your points as a share of 51, rounded to the nearest whole percent. Area scores use the same method within each area. Your stage comes from the rounded overall score.";
const levels = { low: "Needs work", mid: "Developing", high: "Strong" };
export function readinessReportHtml(
  report: ReadinessReport,
  name: string,
  role: string,
) {
  const esc = escapeReadinessText;
  return `<div class="assessment-body scorecard-result"><p class="note">Your AI Readiness Report</p><h3 tabindex="-1">${name ? `${esc(name)}, here's where you stand` : "Here’s where you stand"}</h3>${role ? `<p>For ${esc(role.toLowerCase())}, based on 17 scored answers about your own work.</p>` : ""}<div class="readiness-summary"><p class="readiness-percent">${report.pct}%</p><div><h4>Stage ${report.stage.n} of 3: ${report.stage.name}</h4><p>${report.total} of ${MAX_TOTAL} points</p></div></div><ol class="readiness-bands" aria-label="Readiness stages"><li${report.stageKey === "found" ? ' aria-current="step"' : ""}>Foundations <span>0–40%</span></li><li${report.stageKey === "build" ? ' aria-current="step"' : ""}>Ready to build <span>41–80%</span></li><li${report.stageKey === "scale" ? ' aria-current="step"' : ""}>Ready to scale <span>81–100%</span></li></ol><p>${report.stage.text}</p>${report.warnings.map((w) => `<aside class="readiness-warning"><h4>${w.title}</h4><p>${w.body}</p></aside>`).join("")}${report.toolNote ? `<p class="readiness-tool-note">${report.toolNote}</p>` : ""}<section><h4>Your five areas</h4><ul class="scorecard-areas" aria-label="Readiness by area">${report.areas.map((a) => `<li><div class="readiness-area-heading"><h5>${a.name}</h5><span>${a.pct}% · ${levels[a.level]} · ${a.got} of ${a.max} points</span></div><div class="readiness-bar" aria-hidden="true"><span style="width:${a.pct}%"></span></div><p>${a.recommendation}</p></li>`).join("")}</ul></section>${report.wins.length ? `<section><h4>Your ${report.wins.length === 3 ? "three" : report.wins.length} quickest wins</h4><ol class="scorecard-next">${report.wins.map((w) => `<li><h5>${w.q.text}</h5><p>You answered “${w.answer}”. ${w.q.low}</p><p><b>${w.q.fix}</b></p></li>`).join("")}</ol></section>` : `<p>Your answers show no remaining gaps in this scorecard.</p>`}<section><h4>Your recommended next step</h4><div class="readiness-recommendations">${report.route.map((key) => offerHtml(key)).join("")}</div></section><details class="readiness-answers"><summary>See all your answers</summary><ol>${report.answers.map((a) => `<li><h5>${a.question}</h5><p>${a.answer}</p><p class="note--plain">${a.points === null ? "Context only · not scored" : `${a.points} / ${a.max} points`}</p></li>`).join("")}</ol></details><p class="note--plain readiness-method">${scoreMethod}</p><p class="note--plain">A starting point for a conversation, not an audit or a certification. Your answers stay on this page. Nothing was sent or saved by the site.</p><div class="form-actions"><button class="action" type="button" data-readiness-pdf>Download my PDF report&nbsp;↓</button><button class="link" type="button" data-readiness-edit>Change my answers</button><button class="link" type="button" data-readiness-retake>Start again</button></div><p class="note--plain" role="status" data-pdf-status></p></div>`;
}
export function mountReadiness(host: HTMLElement, signal: AbortSignal) {
  let step = 0;
  const answers: number[] = [];
  let name = "";
  let role = "";
  const rail = (text: string) =>
    `<div class="assessment-rail note">AI Readiness Scorecard <span>${text}</span></div>`;
  const back =
    '<button class="link" type="button" data-readiness-back>← Back</button>';
  const savePersonalization = () => {
    const input = host.querySelector<HTMLInputElement>('[name="first-name"]');
    if (input) {
      name = input.value.trim();
      role = host.querySelector<HTMLSelectElement>("select")?.value ?? "";
    }
  };
  function render(focus = false) {
    host
      .closest(".scorecard-split")
      ?.classList.toggle("has-report", step > scorecardQuestions.length);
    if (step < scorecardQuestions.length) {
      const q = scorecardQuestions[step];
      host.innerHTML = `${rail(`Question ${step + 1} of 18`)}<div class="assessment-body"><p class="note scorecard-group">${q.cat === null ? "Your AI assistant · not scored" : readinessAreas[q.cat].name}</p><h3 tabindex="-1">${q.text}</h3><div class="answer-options">${q.opts.map((o, i) => `<button class="answer" type="button" data-readiness-answer="${i}" aria-pressed="${answers[step] === i}">${o.label}<span aria-hidden="true">→</span></button>`).join("")}</div>${step ? back : ""}</div>`;
    } else if (step === scorecardQuestions.length) {
      host.innerHTML = `${rail("Personalize your report")}<form class="assessment-body scorecard-open" data-readiness-personalize><h3 tabindex="-1">Make it yours</h3><p>Optional. Your name and role personalize this report and its recommendations. You can leave both blank. No email is required and nothing is sent.</p><label for="readiness-name">First name (optional)</label><input id="readiness-name" name="first-name" autocomplete="given-name" maxlength="80"><label for="readiness-role">Your role (optional)</label><select id="readiness-role" name="role"><option value="">Choose a role</option>${readinessRoles.map((r) => `<option>${r}</option>`).join("")}</select><div class="form-actions"><button class="action" type="submit">See my report&nbsp;→</button>${back}</div></form>`;
      host.querySelector<HTMLInputElement>("input")!.value = name;
      host.querySelector<HTMLSelectElement>("select")!.value = role;
    } else
      host.innerHTML = `${rail("Your report")}${readinessReportHtml(scorecardResult(answers, role), name, role)}`;
    if (focus) {
      host.querySelector("h3")?.focus({ preventScroll: true });
      host.scrollIntoView({ block: "start", behavior: "instant" });
    }
  }
  host.addEventListener(
    "click",
    (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
        "button",
      );
      if (!button) return;
      if (button.hasAttribute("data-readiness-answer")) {
        answers[step] = Number(button.dataset.readinessAnswer);
        step++;
        render(true);
      } else if (button.hasAttribute("data-readiness-back")) {
        savePersonalization();
        step--;
        render(true);
      } else if (button.hasAttribute("data-readiness-retake")) {
        answers.length = 0;
        step = 0;
        name = "";
        role = "";
        render(true);
      } else if (button.hasAttribute("data-readiness-edit")) {
        step = 0;
        render(true);
      } else if (button.hasAttribute("data-readiness-pdf")) {
        const report = scorecardResult(answers, role);
        const reportName = name;
        const reportRole = role;
        button.disabled = true;
        const status = host.querySelector<HTMLElement>("[data-pdf-status]")!;
        status.textContent = "Preparing your PDF…";
        void import("./readiness-pdf")
          .then(({ downloadReadinessPdf }) =>
            downloadReadinessPdf(report, reportName, reportRole),
          )
          .then(() => {
            status.textContent = "Your PDF is ready to save.";
          })
          .catch(() => {
            status.textContent =
              "The PDF could not be generated. Your full report is still available here. Please try again.";
          })
          .finally(() => {
            button.disabled = false;
          });
      }
    },
    { signal },
  );
  host.addEventListener(
    "submit",
    (event) => {
      if (
        !(event.target as HTMLElement).matches("[data-readiness-personalize]")
      )
        return;
      event.preventDefault();
      savePersonalization();
      step++;
      render(true);
    },
    { signal },
  );
  render();
}
