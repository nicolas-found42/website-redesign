import { proofSource, testimonials } from "../content";
import { arrow } from "../icons";

/**
 * Who is behind the work.
 *
 * The biography is presented as a published biography, and the two excerpts are
 * presented as what they are: short quotations about one workshop, attributed,
 * and linked to where they are published. Neither stands as evidence that
 * automation or product work was delivered.
 */
export function credibilitySection() {
  const quotes = testimonials
    .map(
      (testimonial) => `<figure class="quote" data-reveal>
   <blockquote><p>“${testimonial.quote}”</p></blockquote>
   <figcaption><strong>${testimonial.name}</strong><span>${testimonial.role}</span></figcaption>
  </figure>`,
    )
    .join("");

  return `<section class="band wrap proof" aria-labelledby="proof-title">
 <div class="section-head">
  <div>
   <p class="index"><b>03</b><span class="rule"></span><span class="note">People behind the possibilities</span></p>
   <h2 id="proof-title" class="display" data-reveal-lines>Business experience. <span class="signal">A teacher’s mindset.</span></h2>
  </div>
  <p class="lead" data-reveal>Found42 is Richard Achée — a career in enterprise technology, now spent helping teams turn what they already know into practical AI use.</p>
 </div>

 <div class="proof-grid">
  <div id="about" class="founder">
   <figure class="portrait" data-reveal>
    <img src="./assets/richard-achee.png" alt="Richard Achée, founder of Found42" width="750" height="750" loading="lazy" decoding="async">
    <figcaption class="note"><span>Richard Achée</span><span>Founder &amp; CEO</span></figcaption>
   </figure>
   <div class="founder-copy">
    <p class="body">Richard brings a love of coaching and mentoring to helping people apply AI to their most pressing business challenges.</p>
    <p class="body">His published biography describes enterprise leadership, business development and M&amp;A work at Google, including Cameyo and Neverware. Today, his focus is helping teams turn business expertise into practical AI use.</p>
    <a class="link" href="https://www.found42.com/about">More about Richard <span class="signal-dot"></span>${arrow}</a>
   </div>
  </div>

  <div class="workshop">
   <p class="note workshop-kicker">The workshop experience</p>
   <h3>From the workshop,<br>in their words.</h3>
   <div class="quotes">${quotes}</div>
   <p class="note--plain proof-note">Selected excerpts about the C-Level AI workshop. <a href="${proofSource}">Published on Found42</a>.</p>
  </div>
 </div>
</section>`;
}
