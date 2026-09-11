import { arrow } from "../icons";

/** The closing invitation: an inquiry starts a conversation, it does not book. */
export function inquirySection() {
  return `<section id="contact" class="contact-section" aria-labelledby="contact-title"><img class="contact-ribbon" src="./assets/contact-connections.svg" alt="" width="600" height="430"><div class="wrap contact-grid"><div><p class="eyebrow">04 / Let’s put it to work</p><h2 id="contact-title">Bring a challenge.<br><span>Find a way forward.</span></h2></div><div class="contact-copy"><p>A team learning to use AI. A workflow ready for a rethink. A product with untapped potential. Tell us what you’re working on and where you’d like to go.</p><a class="button primary" href="https://www.found42.com/contact">Open the inquiry form ${arrow}</a><p class="inquiry-note">Continues to Found42’s contact form to request a consultation. Your inquiry starts a conversation; it does not book an appointment.</p></div></div></section>`;
}
