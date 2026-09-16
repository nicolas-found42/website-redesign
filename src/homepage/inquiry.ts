import { arrow } from "../icons";
import { accentSvg } from "../schematic";
export function inquirySection(
  title = "Want this built for your team?",
  body = "Bring us the messy workflow. We’ll turn it into a tested, repeatable Claude skill.",
) {
  return `<section id="contact" class="contact band" data-ground="red" aria-labelledby="contact-title">${accentSvg("invitation", "contact-accent")}<div class="wrap contact-grid"><div class="contact-open"><p class="index"><b>F42</b><span class="rule"></span><span class="note">Let’s put it to work</span></p><h2 id="contact-title" class="display" data-reveal-lines>${title}</h2></div><div class="contact-copy"><p class="body contact-body">${body}</p><button class="action contact-action" data-dialog="contact">Talk to us ${arrow}</button><p class="note--plain inquiry-note">Start with one responsibility, one workflow and your quality standard. An inquiry starts a conversation; it does not book an appointment.</p></div></div></section>`;
}
