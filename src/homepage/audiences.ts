import { audiences, sceneFigure } from "../audiences";
import { icon } from "../icons";

/**
 * Whom we help: three audiences, one method, each drawn its own way.
 *
 * All three audiences are on the page in full: a rail of three choices that
 * says what each one gets, and a panel for each with its explanation, its own
 * scene and its own contextual link. With scripts the panels become a gallery —
 * one shown at a time, chosen from the rail, the arrows or the keyboard — and
 * the shown scene tells its story. Without them, or under reduced motion, the
 * three panels simply read one after another with their still scenes.
 *
 * The rail reports the selection with `aria-pressed`, as the services rail
 * does. Nothing depends on hover, on the motion, or on colour alone: the
 * selected choice also carries a rule, and the panel restates its audience.
 */
export function audiencesSection() {
  const rail = audiences
    .map(
      (audience, index) =>
        `<button class="audience-choice" type="button" data-audience="${index}" aria-pressed="${index === 0}"><span class="choice-index" aria-hidden="true">0${index + 1}</span><span class="audience-choice-name">${audience.choice}</span><span class="audience-choice-note note--plain">${audience.proposition}</span></button>`,
    )
    .join("");

  const panels = audiences
    .map(
      (
        audience,
        index,
      ) => `<article class="audience-panel" id="audience-${audience.id}" data-audience-panel="${index}" aria-labelledby="audience-${audience.id}-title">
   <div class="audience-copy">
    <p class="note audience-kicker">${audience.kicker}</p>
    <h3 id="audience-${audience.id}-title">${audience.title}</h3>
    <p class="body">${audience.body}</p>
    <ul class="scope-list audience-points">${audience.points.map((point) => `<li>${point}</li>`).join("")}</ul>
    <a class="link" href="${audience.link.href}">${audience.link.label} <span class="signal-dot"></span>${icon("arrow")}</a>
   </div>
   <figure class="audience-figure">${sceneFigure(audience.scene, "landscape", "system audience-scene")}<figcaption class="note--plain audience-caption">${audience.caption}</figcaption></figure>
  </article>`,
    )
    .join("");

  return `<section id="audiences" class="band wrap audiences" aria-labelledby="audiences-title">
 <div class="section-head">
  <div>
   <p class="note section-label">Whom we help</p>
   <h2 id="audiences-title" class="display" data-reveal-lines>Who Found42 helps</h2>
  </div>
  <p class="lead" data-reveal>Choose the work that sounds like yours. Found42 can train an executive, help an individual contributor apply a role-specific skill, or support an AI builder with the testing and review around a workflow.</p>
 </div>
 <div class="audience-stage">
  <div class="audience-rail" role="group" aria-label="Choose an audience">${rail}</div>
  <div class="audience-panels">${panels}</div>
  <div class="audience-nav" hidden>
   <button class="audience-step note" type="button" data-audience-step="-1" aria-label="Previous audience">${icon("left")} Previous</button>
   <p class="audience-count note--plain" aria-hidden="true"><span data-audience-count>01</span> / 0${audiences.length}</p>
   <button class="audience-step note" type="button" data-audience-step="1" aria-label="Next audience">Next ${icon("right")}</button>
  </div>
 </div>
</section>`;
}
