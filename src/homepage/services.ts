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
  <p class="service-detail note--plain">${schematic.detail}</p>
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
   <p class="lead" data-reveal>For leadership teams and portfolio-company operators ready to apply AI to real challenges. Start with your people, your workflows, or your product.</p>
  </div>
  <div class="services-stage">
   <div class="services-aside">
    <div class="services-sticky">
     <div class="services-art" data-system-host></div>
     <div class="services-rail" role="group" aria-label="Jump to a way we help">${rail}</div>
     <p class="services-caption note--plain" aria-live="polite">${schematics[0].detail}</p>
    </div>
   </div>
   <div class="services-list">${articles}</div>
  </div>
  <div class="services-foot">
   <a class="link" href="https://www.found42.com/contact">Discuss your challenge <span class="signal-dot"></span>${arrow}</a>
  </div>
 </div>
</section>`;
}
