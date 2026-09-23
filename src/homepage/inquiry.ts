import { arrow } from "../icons";
import { accentSvg } from "../schematic";
import { inquirySteps } from "../content";

/** What follows an inquiry, for the closing band and the inquiry dialog. */
export const inquiryNext = () =>
  `<div class="inquiry-next"><p class="note">What happens next</p><ol class="inquiry-steps">${inquirySteps.map((step) => `<li>${step}</li>`).join("")}</ol></div>`;

export function inquirySection(
  title = "Want this built for your team?",
  body = "Bring us the messy workflow. We’ll turn it into a tested, repeatable Claude skill.",
) {
  return `<section id="contact" class="contact band" data-ground="red" aria-labelledby="contact-title">${accentSvg("invitation", "contact-accent")}<div class="wrap contact-grid"><div class="contact-open"><p class="note section-label">Let’s put it to work</p><h2 id="contact-title" class="display" data-reveal-lines>${title}</h2></div><div class="contact-copy"><p class="body contact-body">${body}</p><button class="action contact-action" data-dialog="contact">Talk to us ${arrow}</button><p class="note--plain inquiry-note">Start with one responsibility, one workflow and your quality standard.</p>${inquiryNext()}</div></div></section>`;
}
