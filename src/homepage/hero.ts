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
   <h1 id="hero-title" class="display" data-reveal-lines>Put AI to work on what <span class="signal">moves your business.</span></h1>
   <p class="lead hero-lead" data-reveal><strong>Help your people apply AI.</strong> Improve the workflows that slow them down. Build new value from what your business knows.</p>
   <div class="hero-actions" data-reveal>
    <a class="action" href="#resources">Explore free resources ${arrow}</a>
    <a class="action action--ghost" href="https://www.found42.com/contact">Request a consultation ${arrow}</a>
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
