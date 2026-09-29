import { sitePath } from "../paths";

/**
 * The organizations the owner confirmed Found42 has worked with, in the
 * approved order. Each mark is the organization's own, bundled from its
 * official material and shown unaltered, so the file's colors and proportions
 * are its own. `height` is the mark's perceived-size share, set per mark so
 * the row reads as one size without stretching any of them.
 */
const companies = [
  { file: "google.svg", name: "Google", width: 74, height: 24 },
  {
    file: "edgescale-ai.svg",
    name: "Edgescale AI",
    width: 26,
    height: 73,
    // Its only published mark is off-white, made for the company's dark ground.
    tile: true,
  },
  {
    file: "mba.jpg",
    name: "Millsapps, Ballinger &amp; Associates (MB&amp;A)",
    width: 400,
    height: 215,
  },
  {
    file: "sep.svg",
    name: "Scottish Equity Partners (SEP)",
    width: 60,
    height: 40,
  },
  {
    file: "peakspan-capital.svg",
    name: "PeakSpan Capital",
    width: 169,
    height: 23,
  },
] as const;

export function companiesSection() {
  return `<section id="companies" class="companies wrap" aria-label="Teams we have worked with">
   <p class="note section-label">Teams we have worked with</p>
   <ul class="company-logos">${companies
     .map((company) => {
       const image = `<img src="${sitePath(`assets/logos/${company.file}`)}" alt="${company.name}" width="${company.width}" height="${company.height}" loading="lazy" decoding="async">`;
       return `<li class="company-logo company-logo--${company.file.replace(/\.\w+$/, "")}">${"tile" in company ? `<span class="company-logo-tile">${image}</span>` : image}</li>`;
     })
     .join("")}</ul>
  </section>`;
}
