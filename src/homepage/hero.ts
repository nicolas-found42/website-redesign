import { claudeGloss, destinationRegister } from "../content";
import { arrow, icon } from "../icons";
import { sitePath } from "../paths";

/**
 * The opening spread. The headline says what Found42 does in plain words —
 * training teams, building useful skills and automating repeatable work. The
 * two actions give consultation and self-serve visitors clear routes: the
 * consultation action opens the existing dialog; the resource action opens
 * the full resource page. The attributed
 * workshop account sits under the actions, in the same column.
 *
 * The opening is text alone: the headline, lead, actions and quote share the
 * whole width, with no drawing and no space held back for one.
 */
export function hero() {
  return `<section id="hero" class="hero" aria-labelledby="hero-title">
 <div class="wrap hero-inner">
  <div class="hero-copy">
   <p class="note section-label hero-eyebrow">Claude skills and training for business</p>
   <h1 id="hero-title" class="display" data-reveal-lines><span class="sentence">Train teams.</span> <span class="sentence">Build useful skills.</span> <span class="sentence"><span class="signal">Automate the work.</span></span></h1>
   <p class="lead hero-lead" data-reveal>Found42 helps non-technical teams use AI in the work they already own. We train people how to create and use Claude Skills tailored to their roles, and automate repeatable work while judgment stays with your team.</p>
   <p class="note--plain hero-gloss" data-reveal>${claudeGloss}</p>
   <div class="hero-actions" data-reveal>
    <a class="action" href="${destinationRegister.liveInquiry}" data-dialog="contact">Talk to us ${icon("right")}</a>
    <a class="action action--ghost" href="${sitePath("resources/")}">Explore free resources ${arrow}</a>
   </div>
  </div>
  <figure class="hero-proof" aria-labelledby="hero-proof-title">
   <p class="note" id="hero-proof-title">What a participant said</p>
   <blockquote><p>“What stood out in the C-Level AI workshop was how practical it was.”</p></blockquote>
   <figcaption>Paul Keely · Co-founder and Managing Director, Palladium Security LLC</figcaption>
  </figure>
 </div>
</section>`;
}
