import { services } from "../content";
import { arrow } from "../icons";
import { schematicFigure, schematics } from "../schematic";

/**
 * How Found42 helps: three ways in, drawn.
 *
 * On a wide screen this is one sticky drawing beside three articles that scroll
 * past it; the drawing reconfigures to whichever article the visitor is
 * reading. On a narrow screen the sticky split is abandoned and each article
 * carries its own portrait drawing, because a half-height sticky pane and a
 * column of text do not both fit on a phone.
 *
 * Both arrangements contain all three services in full. Nothing is behind an
 * interaction, and the choice rail is a way to jump rather than a way to reveal.
 *
 * The caption under the drawing is not a live region. Reading changes it, so
 * announcing it would narrate an ordinary scroll; every sentence it can show is
 * already in the article beside it, and the drawing carries its own description.
 */
export function servicesSection() {
  const rail = schematics
    .map(
      (schematic, index) =>
        `<button class="choice" type="button" data-service="${index}" aria-pressed="${index === 0}"><span class="choice-index" aria-hidden="true">0${index + 1}</span><span>${schematic.choice}</span></button>`,
    )
    .join("");

  const articles = services
    .map((service, index) => {
      const schematic = schematics[index];
      return `<article class="service" data-reveal id="service-${schematic.id}" data-service-article="${index}" aria-labelledby="service-${schematic.id}-title">
  <div class="service-figure">${schematicFigure(schematic, "portrait")}</div>
  <p class="service-label note">${service.label}</p>
  <h3 id="service-${schematic.id}-title">${service.title}</h3>
  <p class="body">${service.description}</p>
  <p class="service-detail note--plain">${service.context}</p><ul class="scope-list">${service.details.map((detail) => `<li>${detail}</li>`).join("")}</ul><button class="link" data-dialog="contact">Discuss ${service.title.toLowerCase()} →</button>
 </article>`;
    })
    .join("");

  return `<section id="services" class="services on-ink band" data-ground="ink" aria-labelledby="services-title">
 <div class="wrap">
  <div class="services-head">
   <div>
    <p class="index"><b>02</b><span class="rule"></span><span class="note">How we help</span></p>
    <h2 id="services-title" class="display" data-reveal-lines>From possibility to practical work.</h2>
   </div>
   <p class="lead" data-reveal>Built around your role, your industry, and your company—not a generic AI curriculum. We train teams, build custom skills, and automate repeatable work.</p>
  </div>
  <div class="services-stage">
   <div class="services-aside">
    <div class="services-sticky">
     <div class="services-art" data-system-host></div>
     <div class="services-rail" role="group" aria-label="Jump to a way we help">${rail}</div>
     <p class="services-caption note--plain" aria-hidden="true">${schematics[0].detail}</p>
    </div>
   </div>
   <div class="services-list">${articles}</div>
  </div>
  <div class="services-foot">
   <button class="link" data-dialog="contact">Discuss your challenge <span class="signal-dot"></span>${arrow}</button>
  </div>
 </div>
</section>`;
}
