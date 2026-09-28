import {
  catalogBiography,
  destinationRegister,
  serviceCatalog,
  type InquiryContext,
} from "./content";
import { sitePath } from "./paths";

const sectionLabel = (label: string) =>
  `<p class="note section-label">${label}</p>`;

type CatalogOption = {
  readonly name: string;
  readonly mode?: string;
  readonly detail: string;
  readonly terms: string;
};
const catalogOptions = <T extends CatalogOption>(
  rows: readonly T[],
  inquiry?: (row: T) => InquiryContext,
) =>
  `<div class="catalog-options">${rows.map((row) => `<article class="catalog-option"><div><h3>${row.name}</h3>${row.mode ? `<p class="catalog-option-mode">${row.mode}</p>` : ""}</div><div class="catalog-option-body"><p>${row.detail}</p><p class="note--plain">${row.terms}</p><a class="link" href="${destinationRegister.liveInquiry}" data-dialog="contact" data-service="${row.name}"${inquiry ? ` data-contact="${inquiry(row)}"` : ""}>Inquire about ${row.name}&nbsp;→</a></div></article>`).join("")}</div>`;
const catalogHead = (id: string, label: string, title: string, lead: string) =>
  `<div class="section-head"><div>${sectionLabel(label)}<h2 id="${id}-title" class="display">${title}</h2></div><p class="lead">${lead}</p></div>`;
function tracksBand() {
  return `<section id="tracks" class="wrap band catalog-band" aria-labelledby="tracks-title">${catalogHead("tracks", "Training", "Five training tracks.", "Each track has its own curriculum, exercises and audience, and trains people to use Claude as a system, not a tool.")}<div class="track-list">${serviceCatalog.tracks
    .map(
      (track) =>
        `<article class="track" id="track-${track.id}" aria-labelledby="track-${track.id}-title"><div class="track-head"><h3 id="track-${track.id}-title">${track.name}</h3><p class="track-format">${track.format}</p></div><div class="track-body"><p class="track-audience"><span class="track-term">For</span>${track.audience}</p><p class="track-term">You leave with</p><ul class="scope-list">${track.assets.map((asset) => `<li>${asset}</li>`).join("")}</ul><a class="link" href="${destinationRegister.liveInquiry}" data-dialog="contact" data-service="${track.name}" data-contact="${track.id}">Inquire about ${track.name}&nbsp;→</a></div></article>`,
    )
    .join(
      "",
    )}</div><div class="services-industries catalog-industries"><p class="note">Built for</p><ul><li><a class="link" href="${sitePath("industries/private-equity/")}">Private Equity</a></li><li><a class="link" href="${sitePath("industries/b2b-saas/")}">B2B SaaS</a></li></ul></div></section>`;
}
function formatsBand() {
  return `<section id="formats" class="wrap band catalog-band" aria-labelledby="formats-title">${catalogHead("formats", "Delivery formats", "Choose how your team learns.", "The format changes the group, time and setting. A track can be tailored to the team's work, with light customization for private cohorts.")}${catalogOptions(serviceCatalog.formats)}</section>`;
}
function beyondTrainingBand() {
  return `<section id="beyond-training" class="wrap band catalog-band" aria-labelledby="beyond-training-title">${catalogHead("beyond-training", "Beyond training", "Make it last. Keep it governed.", "Training builds capability. These services turn it into something your team keeps using, or keep its use of AI governed over time.")}${catalogOptions(serviceCatalog.beyondTraining, (service) => service.id)}</section>`;
}
function freeSessionsBand() {
  return `<section id="start-free" class="band start-free" aria-labelledby="start-free-title"><div class="wrap">${catalogHead("start-free", "Start free", "Two 30-minute sessions, offered at no charge.", "A short, live look at the method before you choose a longer engagement.")}<div class="free-sessions">${serviceCatalog.freeSessions
    .map(
      (session) =>
        `<article><h3>${session.name}</h3><p><span class="track-term">You leave with</span>${session.outcome}</p><a class="link" href="${destinationRegister.liveInquiry}" data-dialog="contact" data-service="${session.name}" data-contact="free-session">Inquire about ${session.name}&nbsp;→</a></article>`,
    )
    .join("")}</div></div></section>`;
}
function catalogQuotesBand() {
  return `<section class="wrap band catalog-band" aria-labelledby="catalog-quotes-title">${catalogHead("catalog-quotes", "What clients say", "In their words.", "Attributed accounts from people who took the training. They describe their experience, not a guaranteed result.")}<div class="catalog-quotes">${serviceCatalog.quotes
    .map(
      (q) =>
        `<figure class="quote"><blockquote><p>“${q.quote}”</p></blockquote><figcaption><strong>${q.name}</strong>${q.role}</figcaption></figure>`,
    )
    .join(
      "",
    )}</div><a class="link" href="${sitePath("about/")}">Meet Richard Achée&nbsp;→</a></section>`;
}
function catalogBiographyBand() {
  return `<section class="wrap band catalog-biography" aria-labelledby="catalog-biography-title"><figure class="portrait"><img src="${sitePath("assets/richard-achee.png")}" alt="Richard Achée, Founder and CEO of Found42" width="750" height="750" loading="lazy"></figure><div>${sectionLabel("Founder and CEO")}<h2 id="catalog-biography-title" class="display">About Richard Achée</h2>${catalogBiography.map((line) => `<p>${line}</p>`).join("")}<a class="link" href="${sitePath("about/")}">More about Richard&nbsp;→</a></div></section>`;
}
function catalogStartingPath() {
  return `<section class="wrap band catalog-start" aria-labelledby="catalog-start-title">${sectionLabel("Where to begin")}<h2 id="catalog-start-title" class="display">A useful place to begin</h2><p class="lead">Start with a no-charge 30-minute session to identify one decision or workflow worth improving. Then choose a training track and delivery format that fit the people doing the work. If the team needs a lasting workflow or ongoing guidance, discuss a custom build or advisory after that first step.</p><a class="action" href="${destinationRegister.liveInquiry}" data-dialog="contact">Inquire about a starting path&nbsp;→</a></section>`;
}
export function catalogSections() {
  return (
    tracksBand() +
    formatsBand() +
    beyondTrainingBand() +
    freeSessionsBand() +
    catalogBiographyBand() +
    catalogQuotesBand() +
    catalogStartingPath()
  );
}
