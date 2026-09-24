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
      : "href" in resource
        ? resource.href
        : sitePath(`resources/#${resource.id}`);
  return `<a class="link" href="${href}">${resource.action} <span class="signal-dot"></span>${arrow}</a>`;
};

const resourceCard = (resource: PublicResource) => `
  <article class="resource" data-reveal>
   <h3>${resource.title}</h3>
   <p class="body">${resource.description}</p>
   <p class="note--plain access">${resource.gate}</p>
   ${resourceLink(resource)}
  </article>`;

/**
 * Start Here: a deliberately short preview of useful first steps. The scorecard
 * runs on the full Resources page; the public toolkit opens its verified source.
 */
export function resourcesSection() {
  return `<section id="resources" class="band wrap resources" aria-labelledby="resources-title">
 <div class="section-head">
  <div><p class="note section-label">Free resources</p><h2 id="resources-title" class="display" data-reveal-lines>Start Here</h2></div>
  <p class="lead" data-reveal>Choose a useful first step. Take the readiness check on this site, or explore the public C-Level AI workshop materials.</p>
 </div>
 <div class="resource-grid resource-grid--preview">${preview.map(resourceCard).join("")}</div>
 <div class="resource-foot"><a class="action action--ghost" href="${sitePath("resources/")}">Explore all free resources ${arrow}</a></div>
</section>`;
}
