import { proofSource, testimonials } from "../content";
import { arrow } from "../icons";

/** Founder biography and the attributed workshop excerpts. */
export function credibilitySection() {
  return `<section class="section wrap proof" aria-labelledby="proof-title">
 <div class="proof-heading"><p class="eyebrow">03 / People behind the possibilities</p><h2 id="proof-title">Business experience.<br><span>A teacher’s mindset.</span></h2></div>
 <div class="proof-grid">
  <div id="about" class="founder reveal"><div class="portrait"><img src="./assets/richard-achee.png" alt="Richard Achée, founder of Found42" width="750" height="750" loading="lazy"><div class="portrait-label"><span>Meet the founder</span><span>Found42</span></div></div><div class="founder-copy"><h3>Richard Achée</h3><p class="founder-name">Founder &amp; CEO, Found42</p><p>Richard brings a love of coaching and mentoring to helping people apply AI to their most pressing business challenges.</p><p>His published biography describes enterprise leadership, business development and M&amp;A work at Google, including Cameyo and Neverware. Today, his focus is helping teams turn business expertise into practical AI use.</p><a class="text-link" href="https://www.found42.com/about">More about Richard ${arrow}</a></div></div>
  <div class="workshop-proof"><p class="eyebrow">The workshop experience</p><h3>From the workshop,<br>in their words.</h3><div class="testimonials">${testimonials.map((testimonial) => `<figure class="testimonial reveal"><span class="quote-mark" aria-hidden="true">“</span><blockquote><p>“${testimonial.quote}”</p></blockquote><figcaption><strong>${testimonial.name}</strong><span>${testimonial.role}</span></figcaption></figure>`).join("")}</div><p class="proof-note">Selected excerpts about the C-Level AI workshop. <a href="${proofSource}">Published on Found42</a>.</p></div>
 </div>
</section>`;
}
