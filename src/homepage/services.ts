import { services } from "../content";
import { ribbonSvg, type RibbonVariant } from "../artwork";
import { arrow } from "../icons";

// Service illustrations cycle through the ribbon compositions.
const motifs: readonly RibbonVariant[] = ["loop", "route", "combine"];

/** The three published services, each with its ribbon illustration. */
export function servicesSection() {
  return `<section id="services" class="services-section" aria-labelledby="services-title"><div class="wrap section">
 <div class="section-top"><div><p class="eyebrow">02 / How we help</p><h2 id="services-title">From possibility<br>to practical work.</h2></div><p class="section-intro">For leadership teams and portfolio-company operators ready to apply AI to real challenges. Start with your people, your workflows, or your product.</p></div>
 <div class="service-list">${services.map((service, index) => `<article class="service-row reveal"><div class="service-art" aria-hidden="true">${ribbonSvg(motifs[index % motifs.length], { className: "ribbon-motif" })}<span>0${index + 1}</span></div><div><p class="service-label">${service.label}</p><h3>${service.title}</h3></div><p>${service.description}</p></article>`).join("")}</div>
 <a class="text-link" href="https://www.found42.com/contact">Discuss your challenge ${arrow}</a>
</div></section>`;
}
