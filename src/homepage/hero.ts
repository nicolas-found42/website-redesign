import { claudeGloss } from "../content";
import { arrow, icon } from "../icons";
import { sitePath } from "../paths";

/**
 * The opening spread. The headline says what Found42 does in plain words —
 * training teams, building useful skills and automating repeatable work. The
 * two actions give self-serve and consultation visitors equal, clear routes,
 * and the attributed workshop account sits beside the opening claim.
 * The headline and the working-system drawing are one composition rather than
 * two columns: the drawing fills the field and the type sits over its open
 * left side, lifted clear by a warm paper wash.
 *
 * The drawing mounts into the element this reserves; nothing in the headline,
 * the actions or the lead waits on it.
 */
export function hero() {
  return `<section class="hero" aria-labelledby="hero-title">
 <div class="hero-art" data-system-host></div>
 <div class="wrap hero-inner">
  <div class="hero-copy">
   <h1 id="hero-title" class="display" data-reveal-lines><span class="sentence">Train teams.</span> <span class="sentence">Build useful skills.</span> <span class="sentence"><span class="signal">Automate the work.</span></span></h1>
   <p class="lead hero-lead" data-reveal>Found42 helps non-technical teams use AI in the work they already own. We train people in their roles, build tailored skills and workflows, and automate repeatable work while judgment stays with your team.</p>
   <p class="note--plain hero-gloss" data-reveal>${claudeGloss}</p>
   <div class="hero-actions" data-reveal>
    <a class="action" href="${sitePath("resources/")}">Explore free resources ${arrow}</a>
    <button class="action" type="button" data-dialog="contact">Talk to our team ${arrow}</button>
   </div>
  </div>
  <figure class="hero-proof" aria-labelledby="hero-proof-title">
   <p class="note" id="hero-proof-title">What a participant said</p>
   <blockquote><p>“What stood out in the C-Level AI workshop was how practical it was.”</p></blockquote>
   <figcaption>Paul Keely · Co-founder / Managing Director, Palladium Security LLC</figcaption>
  </figure>
 </div>
 <div class="wrap hero-rail">
  <button class="motion-toggle note" type="button" data-motion-toggle aria-pressed="false"><span class="motion-toggle-mark" aria-hidden="true"></span><span>Pause motion</span></button>
  <a class="hero-cue note" href="#resources">Find your starting point ${icon("down")}</a>
 </div>
</section>`;
}
