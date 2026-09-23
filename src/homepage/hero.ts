import { claudeGloss } from "../content";
import { arrow, icon } from "../icons";

/**
 * The opening spread. The headline says what Found42 does in plain words —
 * hands-on Claude skills and training for a business — and the lead says whom
 * it is for and how: usable systems for executives, practical training for the
 * people doing the work, both built around a role, an industry and a company.
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
   <p class="index"><span class="rule"></span><span class="note">Practical AI. Human ambition.</span></p>
   <h1 id="hero-title" class="display" data-reveal-lines><span class="sentence">Hands-on Claude skills</span> <span class="sentence">and training for</span> <span class="sentence"><span class="signal">your business.</span></span></h1>
   <p class="lead hero-lead" data-reveal>Usable AI systems for executives. Practical training for the people who do the work. Both built around your role, your industry and your company, so less attention goes to repetitive work and more to judgment.</p>
   <p class="note--plain hero-gloss" data-reveal>${claudeGloss}</p>
   <div class="hero-actions" data-reveal>
    <a class="action" href="#resources">Explore free resources ${arrow}</a>
   </div>
  </div>
 </div>
 <div class="wrap hero-rail">
  <span class="note">Workshops <i>·</i> Workflows <i>·</i> Automations</span>
  <span class="note hero-caption">Fig. 01 — your context, with human direction</span>
  <button class="motion-toggle note" type="button" data-motion-toggle aria-pressed="false"><span class="motion-toggle-mark" aria-hidden="true"></span><span>Pause motion</span></button>
  <a class="hero-cue note" href="#resources">Find your starting point ${icon("down")}</a>
 </div>
</section>`;
}
