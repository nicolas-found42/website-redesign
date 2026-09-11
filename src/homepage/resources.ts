import { article, playbook, resources } from "../content";
import { arrow, icon } from "../icons";

/** Free resources: the public reading, the gated requests and the playbook. */
export function resourcesSection() {
  return `<section id="resources" class="section wrap" aria-labelledby="resources-title">
 <div class="section-top"><div><p class="eyebrow">01 / Free resources</p><h2 id="resources-title">A useful place to start.</h2></div><p class="section-intro">Get a fresh perspective, try a more relevant prompt, or take stock of your AI readiness. Choose what’s useful to you.</p></div>
 <div class="resource-grid">
  <article class="resource-card reading-card reveal"><div class="reading-graphic" aria-hidden="true"><span class="feature-kicker">A different way to think.</span><span class="reading-type">Think<br>like a <em>CxO.</em></span><img class="reading-ribbon" src="./assets/reading-connections.svg" alt="" width="600" height="430"><span class="feature-footer">Human expertise × AI possibility</span></div><div class="reading-copy"><span class="badge">Public reading · No form</span><h3>${article.title}</h3><p>${article.description}</p><div class="resource-access"><p class="gate">${article.gate}</p><a class="card-link" href="${article.url}">Read the article ${arrow}</a></div></div></article>
  ${resources.map((resource, index) => `<article class="resource-card supporting-card reveal"><div class="resource-meta"><span>${resource.category}</span>${icon(index === 0 ? "prompts" : "scan")}</div><h3>${resource.title}</h3><p>${resource.description}</p><div class="resource-access"><span class="badge">${resource.kind}</span><p class="gate">${resource.gate}</p><a class="card-link" href="${resource.url}">${resource.action} ${arrow}</a></div></article>`).join("")}
 </div>
 <div class="playbook-row reveal"><span class="playbook-icon">${icon("book")}</span><div><span class="eyebrow">Also worth exploring</span><h3>${playbook.title}</h3><p>${playbook.description} ${playbook.gate}</p></div><a class="text-link" href="${playbook.url}">Request the playbook ${arrow}</a></div>
 <a class="text-link blog-link" href="https://www.found42.com/blog">More perspectives on the blog ${arrow}</a>
</section>`;
}
