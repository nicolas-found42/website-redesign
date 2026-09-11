import { arrow, icon } from "../icons";

/** The opening band. The illustration itself is mounted into its own element. */
export function hero() {
  return `<section class="hero" aria-labelledby="hero-title">
 <div class="hero-grid wrap">
  <div class="hero-copy"><p class="eyebrow"><span class="red-rule"></span> Practical AI. Human ambition.</p><h1 id="hero-title">Put AI to work on what <em>moves your business.</em></h1><p class="hero-intro">Help your people apply AI. Improve the workflows that slow them down. Build new value from what your business knows.</p><div class="hero-actions"><a class="button primary" href="#resources">Explore free resources ${arrow}</a><a class="text-link" href="https://www.found42.com/contact">Request a consultation ${arrow}</a></div><p class="hero-note">Start exploring. Or bring us a challenge.</p></div>
  <div class="hero-illustration" data-illustration></div>
 </div>
 <div class="hero-bottom wrap"><span>People. Workflows. Products.</span><a href="#resources">Find your starting point ${icon("down")}</a></div>
</section>`;
}
