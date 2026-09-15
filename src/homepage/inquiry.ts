import { arrow } from "../icons";
import { accentSvg } from "../schematic";

/**
 * The closing invitation.
 *
 * It says plainly what happens next: this continues to Found42's existing
 * contact form, and sending it starts a conversation rather than booking an
 * appointment. The three lines above the action are the three ways in, named
 * once more in the visitor's own terms.
 */
export function inquirySection() {
  const step = (index: string, text: string) =>
    `<li><span class="note step-index">${index}</span><span>${text}</span></li>`;

  return `<section id="contact" class="contact band" data-ground="red" aria-labelledby="contact-title">
 ${accentSvg("invitation", "contact-accent")}
 <div class="wrap contact-grid">
  <div class="contact-open">
   <p class="index"><b>04</b><span class="rule"></span><span class="note">Let’s put it to work</span></p>
   <h2 id="contact-title" class="display" data-reveal-lines><span class="sentence">Bring a challenge.</span> <span class="sentence">Find a way forward.</span></h2>
  </div>
  <div class="contact-copy">
   <ul class="contact-list">
    ${step("A", "A team learning to use AI.")}
    ${step("B", "A workflow ready for a rethink.")}
    ${step("C", "A product with untapped potential.")}
   </ul>
   <p class="body contact-body" data-reveal>Tell us what you’re working on and where you’d like to go.</p>
   <a class="action contact-action" href="https://www.found42.com/contact">Open the inquiry form ${arrow}</a>
   <p class="note--plain inquiry-note">Continues to Found42’s contact form to request a consultation. Your inquiry starts a conversation; it does not book an appointment.</p>
  </div>
 </div>
</section>`;
}
