import { sitePath } from "../paths";
import { arrow, icon } from "../icons";

/**
 * The opening spread. The headline and the working-system drawing are one
 * composition rather than two columns: the drawing fills the field and the type
 * sits over its open left side, lifted clear by a warm paper wash.
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
   <h1 id="hero-title" class="display" data-reveal-lines><span class="sentence">AI built around</span> <span class="sentence"><span class="signal">your work.</span></span></h1>
   <p class="lead hero-lead" data-reveal><strong>Your role. Your industry. Your company.</strong> Practical systems for executives to adopt, and hyper-specific training for the people who know the work. More room for judgment and human interaction.</p>
   <div class="hero-actions" data-reveal>
    <a class="action" href="#resources">Explore free resources ${arrow}</a>
    <a class="action action--ghost" href="${sitePath("services/")}">Find your pathway ${arrow}</a>
   <button class="link" data-dialog="course">Start free →</button>
   </div>
  </div>
 </div>
 <div class="wrap hero-rail">
  <span class="note">People <i>·</i> Workflows <i>·</i> Products</span>
  <span class="note hero-caption">Fig. 01 — an illustration of the possibilities</span>
  <button class="motion-toggle note" type="button" data-motion-toggle aria-pressed="false"><span class="motion-toggle-mark" aria-hidden="true"></span><span>Pause motion</span></button>
  <a class="hero-cue note" href="#resources">Find your starting point ${icon("down")}</a>
 </div>
</section>`;
}
