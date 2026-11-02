import { sitePath } from "../paths";

export function founderSection() {
  return `<section id="founder" class="founder-strip wrap band" aria-label="About the founder">
   <img src="${sitePath("assets/richard-achee.png")}" alt="Richard Achée, Founder and CEO of Found42" width="110" height="110" loading="lazy">
   <div><h2>Led by Richard Achée, Founder and CEO</h2><p>Every engagement is shaped around your team's real work.</p></div>
   <a class="link" href="${sitePath("about/")}">Meet Richard&nbsp;→</a>
  </section>`;
}
