import { resources, type PublicResource } from "../content";
import { arrow } from "../icons";
import { sitePath } from "../paths";

/** A short preview of the complete Free Resources inventory. */
const preview = resources.filter((resource) =>
  ["scorecard", "toolkit"].includes(resource.id),
);

/** The full catalog owns access and fulfillment; the homepage shows only a taste. */
const resourceLink = (resource: PublicResource) => {
  const href =
    resource.id === "scorecard"
      ? sitePath("resources/#scorecard")
      : resource.href;
  return `<a class="link" href="${href}">${resource.action} <span class="signal-dot"></span>${arrow}</a>`;
};

const resourceCard = (resource: PublicResource) => `
  <article class="resource" data-reveal>
   <h3>${resource.title}</h3>
   <p class="body">${resource.id === "scorecard" ? "Assess your AI use, data practices and workflow readiness before deciding where to focus." : "Workshop video, slides, practice cases and custom GPT links built for executive AI practice."}</p>
   <p class="note--plain access">${resource.id === "scorecard" ? "12 yes-or-no questions · No email required" : "Public page · Some links need a ChatGPT account"}</p>
   ${resourceLink(resource)}
  </article>`;

/**
 * Start Here: a deliberately short preview of useful first steps. The scorecard
 * runs on the full Resources page; the public toolkit opens its verified source.
 */
export function resourcesSection() {
  return `<section id="resources" class="band wrap resources" aria-labelledby="resources-title">
 <div class="section-head">
  <div><p class="note section-label">Free resources</p><h2 id="resources-title" class="display" data-reveal-lines>Not ready to talk? Start here</h2></div>
  <a class="link" href="${sitePath("resources/")}">All free resources ${arrow}</a>
 </div>
 <div class="resource-grid resource-grid--preview">${preview.map(resourceCard).join("")}</div>
</section>`;
}
