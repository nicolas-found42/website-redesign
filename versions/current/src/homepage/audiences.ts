import { audiences, sceneFigure } from "../audiences";
import { icon } from "../icons";

/** All audience articles remain in reading order; the rail jumps to their work. */
export function audiencesSection() {
  const rail = audiences
    .map(
      (audience, index) =>
        `<button class="choice audience-choice" type="button" data-audience="${index}" aria-pressed="${index === 0}" aria-controls="audience-${audience.id}">${audience.choice}</button>`,
    )
    .join("");
  const scenes = audiences
    .map(
      (audience, index) =>
        `<div class="audience-pinned-scene" data-audience-scene="${index}"${index ? " hidden" : ""}>${sceneFigure(audience.scene, "landscape", "system audience-scene")}</div>`,
    )
    .join("");
  const articles = audiences
    .map(
      (audience, index) =>
        `<article class="audience-panel" id="audience-${audience.id}" data-audience-panel="${index}" aria-labelledby="audience-${audience.id}-title">
      <p class="audience-kicker note">${audience.kicker}</p>
      <h3 id="audience-${audience.id}-title" class="audience-scene-title">${audience.choice}</h3>
      <figure class="audience-figure">${sceneFigure(audience.scene, "portrait", "system audience-scene")}<figcaption class="note--plain audience-caption">${audience.caption}</figcaption></figure>
      <p class="body">${audience.proposition}</p>
      <ul class="scope-list audience-points">${audience.points.map((point) => `<li>${point}</li>`).join("")}</ul>
      <a class="link" href="${audience.link.href}">${audience.link.label} ${icon("arrow")}</a>
    </article>`,
    )
    .join("");
  return `<section id="audiences" class="band wrap audiences" aria-labelledby="audiences-title">
 <div class="section-head">
  <div>
   <p class="note section-label">Who we help</p>
   <h2 id="audiences-title" class="display" data-reveal-lines>Find the work that sounds like yours</h2>
  </div>
  <p class="lead" data-reveal>Whether you are an executive, an individual contributor, or an AI builder, we have workshops tailored to your role that will put Claude to work and save you 4-8 hours every week.</p>
 </div>
 <div class="audience-stage">
   <div class="audience-aside"><div class="audience-sticky">
     <div class="audience-art">${scenes}</div>
     <div class="audience-rail" role="group" aria-label="Choose an audience">${rail}</div>
     <p class="audience-pinned-caption note--plain">${audiences[0].caption}</p>
   </div></div>
   <div class="audience-panels">${articles}</div>
 </div>
</section>`;
}
