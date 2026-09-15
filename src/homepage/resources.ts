import { article, playbook, resources } from "../content";
import { arrow, icon } from "../icons";
import { accentSvg } from "../schematic";

/**
 * Free resources.
 *
 * The four routes in are genuinely different things — an article you can read
 * now, two forms that ask for your details, and an assessment that continues on
 * someone else's site — so they are not four identical cards. Each one carries
 * the same three-part access note in the same place: what it costs, how it is
 * reached, and exactly what it asks for before you get it.
 */

const access = (kind: string, gate: string) =>
  `<div class="access"><p class="access-kind note">${kind}</p><p class="access-gate note--plain">${gate}</p></div>`;

const link = (label: string, href: string) =>
  `<a class="link" href="${href}">${label} <span class="signal-dot"></span>${arrow}</a>`;

export function resourcesSection() {
  const supporting = resources
    .map(
      (resource, index) => `<article class="resource" data-reveal>
  <div class="resource-top"><p class="note resource-category">${resource.category}</p><span class="resource-icon" aria-hidden="true">${icon(index === 0 ? "prompts" : "scan")}</span></div>
  <h3>${resource.title}</h3>
  <p class="body">${resource.description}</p>
  ${access(resource.kind, resource.gate)}
  ${link(resource.action, resource.url)}
 </article>`,
    )
    .join("");

  return `<section id="resources" class="band wrap resources" aria-labelledby="resources-title">
 <div class="section-head">
  <div>
   <p class="index"><b>01</b><span class="rule"></span><span class="note">Free resources</span></p>
   <h2 id="resources-title" class="display" data-reveal-lines>A useful place to start.</h2>
  </div>
  <p class="lead" data-reveal>Get a fresh perspective, try a more relevant prompt, or take stock of your AI readiness. Choose what’s useful to you. Each one says up front what it asks for before you get it.</p>
 </div>

 <div class="resource-grid">
  <article class="feature on-ink" data-reveal>
   ${accentSvg("reading", "feature-accent")}
   <div class="feature-cover">
    <p class="note feature-kicker">Read it now — no form</p>
    <p class="feature-type">Think<br>like a <em>CxO.</em></p>
    <p class="note feature-foot">Human expertise <i>×</i> AI possibility</p>
   </div>
   <div class="feature-copy">
    <h3>${article.title}</h3>
    <p class="body">${article.description}</p>
    ${access("Free · Public reading", article.gate)}
    ${link("Read the article", article.url)}
   </div>
  </article>
  <div class="resource-column">${supporting}</div>
 </div>

 <div class="resource-strip" data-reveal>
  <span class="resource-strip-icon" aria-hidden="true">${icon("book")}</span>
  <div>
   <p class="note">Also worth exploring</p>
   <h3>${playbook.title}</h3>
   <p class="body">${playbook.description}</p>
   ${access("Free · Request form", playbook.gate)}
  </div>
  ${link("Request the playbook", playbook.url)}
 </div>

 <div class="resource-foot">
  ${link("More perspectives on the blog", "https://www.found42.com/blog")}
 </div>
</section>`;
}
