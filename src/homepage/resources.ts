import { resources } from "../content";
import { arrow } from "../icons";
import { accentSvg } from "../schematic";
import { sitePath } from "../paths";
export function resourcesSection() {
  const [first, ...rest] = resources;
  const link = (r: typeof first) =>
    `<a class="link" href="${sitePath("resources/#" + r.id)}">${r.action} <span class="signal-dot"></span>${arrow}</a>`;
  return `<section id="resources" class="band wrap resources" aria-labelledby="resources-title"><div class="section-head"><div><p class="index"><b>01</b><span class="rule"></span><span class="note">Free resources</span></p><h2 id="resources-title" class="display" data-reveal-lines>Useful before the call.</h2></div><p class="lead" data-reveal>Practical tools your team can use today. Each one helps you identify where a tailored skill or workflow will earn its keep.</p></div><div class="resource-grid"><article class="feature on-ink" data-reveal>${accentSvg("reading", "feature-accent")}<div class="feature-cover"><p class="note feature-kicker">Free working set · Index / 04</p><p class="feature-type">Start with<br><em>real work.</em></p><p class="note feature-foot">Four ways to start with real work.</p></div><div class="feature-copy"><h3>${first.title}</h3><p class="body">${first.description}</p><div class="access"><p class="note">${first.outcome}</p><p class="note--plain">${first.gate}</p></div>${link(first)}</div></article><div class="resource-column">${rest.map((r, i) => `<article class="resource" data-reveal><p class="note resource-category">0${i + 2} / ${r.outcome}</p><h3>${r.title}</h3><p class="body">${r.description}</p><div class="access"><p class="note--plain">${r.gate}</p></div>${link(r)}</article>`).join("")}</div></div><div class="resource-foot"><div><h3>Start with value. Build what proves useful.</h3><p class="body">Each resource reveals where a tailored workflow can earn its keep.</p></div></div></section>`;
}
