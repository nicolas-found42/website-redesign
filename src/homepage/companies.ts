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
    file: "seidler-equity-partners.svg",
    name: "Seidler Equity Partners (SEP)",
    width: 295,
    height: 108,
  },
  {
    file: "peakspan-capital.svg",
    name: "PeakSpan Capital",
    width: 169,
    height: 23,
  },
  {
    file: "palladium-security.png",
    name: "Palladium Security",
    width: 512,
    height: 564,
  },
  { file: "maraja.jpg", name: "Marajá", width: 200, height: 200 },
  { file: "ruruka.jpg", name: "Ruruka", width: 200, height: 200 },
  {
    file: "crown-point-advisory-group.svg",
    name: "Crown Point Advisory Group",
    width: 60,
    height: 60,
  },
  { file: "idc.png", name: "IDC", width: 1200, height: 602 },
  {
    file: "paravet-live.svg",
    name: "ParaVet.live",
    width: 213,
    height: 47,
    tile: true,
  },
  { file: "mobile-club.svg", name: "mobile.club", width: 240, height: 26 },
  {
    file: "mindsi-sports-performance.jpg",
    name: "MINDSi Sports Performance",
    width: 200,
    height: 200,
  },
  {
    file: "minds-i-education.jpg",
    name: "MINDS-i Education",
    width: 225,
    height: 62,
    tile: true,
  },
  {
    file: "prelude-solutions.avif",
    name: "Prelude Solutions",
    width: 2298,
    height: 556,
  },
] as const;

function companyMarks(duplicate = false) {
  return companies
    .map((company) => {
      const image = `<img src="${sitePath(`assets/logos/${company.file}`)}" alt="${duplicate ? "" : company.name}" width="${company.width}" height="${company.height}" decoding="async">`;
      return `<li class="company-logo company-logo--${company.file.replace(/\.\w+$/, "")}">${"tile" in company ? `<span class="company-logo-tile">${image}</span>` : image}</li>`;
    })
    .join("");
}

export function companiesSection() {
  return `<section id="companies" class="companies wrap" aria-labelledby="companies-title">
   <h2 id="companies-title" class="companies-title">Teams we have worked with</h2>
   <div class="company-strip"><div class="company-track">
    <ul class="company-logos">${companyMarks()}</ul>
    <ul class="company-logos" aria-hidden="true">${companyMarks(true)}</ul>
   </div></div>
  </section>`;
}
