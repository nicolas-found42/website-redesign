import {
  resources,
  industries,
  biography,
  principles,
  essays,
  claudeGloss,
  industryFounder,
  serviceCatalog,
  catalogBiography,
  destinationRegister,
} from "./content";
import { siteHeader, siteFooter } from "./homepage/chrome";
import { inquirySection } from "./homepage/inquiry";
import { reviewScene, sceneFigure } from "./audiences";
import { schematicFigure, masterSchematic } from "./schematic";
import { sitePath } from "./paths";
export const pageMeta: Record<string, { title: string; description: string }> =
  {
    "": {
      title: "Found42 — Hands-on Claude skills and training for business",
      description:
        "Found42 helps non-technical teams use AI in the work they already own: role-specific training, tailored skills and workflows, and automation of repeatable work.",
    },
    resources: {
      title: "Free Claude Resources | Found42",
      description:
        "Assess one workflow and explore playbooks, skills and practical training shaped around real work.",
    },
    services: {
      title: "Services | Found42",
      description:
        "Explore five Claude training tracks, six delivery formats, custom builds, advisory and two no-charge 30-minute sessions.",
    },
    "industries/private-equity": {
      title: "AI for Private Equity | Found42",
      description:
        "Claude workflows shaped around your firm’s deal screening, diligence and portfolio operations.",
    },
    "industries/b2b-saas": {
      title: "AI for B2B SaaS Teams | Found42",
      description:
        "Claude workflows shaped around your customer context, product feedback and go-to-market work.",
    },
    about: {
      title: "About Found42 | Richard Achée, Founder and CEO",
      description:
        "Meet Richard Achée and the business experience behind Found42’s practical, customized AI work.",
    },
    blog: {
      title: "Operator Notes | Found42",
      description:
        "Forthcoming essays on role-specific Claude skills, workflow design and human review.",
    },
  };
const sectionLabel = (label: string) =>
  `<p class="note section-label">${label}</p>`;
/** An opening's lead, followed by what Claude is whenever the opening names it. */
const lead = (body: string, title = "") =>
  `<p class="lead">${body}</p>${`${title} ${body}`.includes("Claude") ? `<p class="note--plain gloss">${claudeGloss}</p>` : ""}`;
const opening = (
  label: string,
  title: string,
  body: string,
  aside: string,
  action = "Talk to our team",
) =>
  `<section class="page-opening wrap"><div>${sectionLabel(label)}<h1 class="display" data-reveal-lines>${title}</h1>${lead(body, title)}<button class="action" data-dialog="contact">${action}&nbsp;→</button><noscript><p class="no-script-contact"><a class="link" href="${destinationRegister.liveInquiry}">Open Found42’s contact form&nbsp;→</a></p></noscript></div><aside class="page-aside">${aside}</aside></section><div class="wrap hero-rail page-rail"><span class="note">Your role · Your industry · Your company</span><button class="motion-toggle note" data-motion-toggle aria-pressed="false"><span class="motion-toggle-mark" aria-hidden="true"></span><span>Pause motion</span></button></div>`;
/**
 * Planned resources stay visibly unavailable (ADR 0005), grouped after the ones
 * a visitor can use today so they read as what is coming rather than as dead
 * ends among the working links. Each states its status once.
 */
function laterResources() {
  const later = resources.filter(
    (resource) => resource.status === "unavailable",
  );
  return `<div class="wrap resources-later-head"><p class="note section-label">Coming later</p><p class="lead">Planned, not available yet. Each says what you can use today instead.</p></div>${later
    .map((resource) => {
      const action =
        "href" in resource
          ? `<a class="link" href="${resource.href}">${resource.action}&nbsp;→</a>`
          : `<button class="link" data-dialog="contact" data-interest="${resource.title}">${resource.action}&nbsp;→</button>`;
      return `<section id="${resource.id}" class="resource-detail resource-later"><div class="wrap content-split"><div><h2 class="display">${resource.title}</h2><p>${resource.description}</p></div><div class="resource-access"><h3>${resource.outcome}</h3><p class="note--plain">${resource.gate}</p>${action}</div></div></section>`;
    })
    .join("")}`;
}
function resourcesPage() {
  return (
    opening(
      "Free resources",
      "Start with the work.",
      "Three free resources you can use today, and two more that are coming later. Choose better use cases, build stronger skills, and catch weak outputs.",
      '<p class="note page-aside-label">No abstract AI curriculum.</p>',
    ) +
    `<section id="scorecard" class="wrap band"><div class="content-split scorecard-split"><div class="scorecard-intro"><p class="note section-label">AI Readiness Scorecard</p><h2 class="display">AI Readiness Scorecard</h2><p>${resources[0].description}</p><p>Twelve yes-or-no questions about your current AI use, data practices, workflows, team readiness and automation goals, then one open question. It takes about five minutes.</p><p>Your result is a readiness stage, a status for each area and where to start.</p><p class="note--plain">No email required. Your answers stay in this browser and are not sent or stored.</p></div><div id="scorecard-app" class="assessment scorecard" role="group" aria-label="AI Readiness Scorecard"><noscript><p class="assessment-body">The scorecard needs JavaScript. The original assessment on ScoreApp is linked on this page.</p></noscript></div><div class="scorecard-original"><p class="note--plain">Prefer an emailed PDF report? The original assessment on ScoreApp asks for your first and last name, email, company and country before the questions. Its privacy and communications terms apply.</p><a class="link" href="${destinationRegister.scoreApp}">Take the original assessment on ScoreApp&nbsp;→</a></div></div><details class="workflow-preview"><summary>Try the four-question workflow preview · No email required</summary><p>From the redesign prototype: test one workflow against repetition, output clarity, review safety and frequency. It is separate from the AI Readiness Scorecard above, which looks at the business rather than one workflow.</p><div id="assessment" class="assessment" aria-label="Workflow discussion preview"></div></details></section>` +
    resources
      .filter(
        (resource) =>
          resource.id !== "scorecard" && resource.status === "available",
      )
      .map((resource) => {
        const access =
          resource.id === "playbook"
            ? `<a class="link" href="${resource.href}">${resource.action}&nbsp;→</a><p class="note--plain">The published playbook is requested on found42.com. Its form asks for your email, LinkedIn profile and a human check.</p>`
            : `<a class="link" href="${resource.href}">${resource.action}&nbsp;→</a>`;
        return `<section id="${resource.id}" class="resource-detail"><div class="wrap content-split"><div><h2 class="display">${resource.title}</h2><p>${resource.description}</p>${resource.id === "playbook" ? `<figure class="review-figure">${sceneFigure(reviewScene, "landscape", "system review-scene")}<figcaption class="note--plain review-caption">Three failure modes the published playbook is built to catch, and the human review a result passes before it reaches the business. The complete check list is not reproduced here.</figcaption></figure>` : ""}<button class="link" data-dialog="contact" data-interest="${resource.title}">Want this tailored? Talk to us&nbsp;→</button></div><div class="resource-access"><h3>${resource.outcome}</h3><p class="note--plain">${resource.gate}</p>${access}</div></div></section>`;
      })
      .join("") +
    laterResources() +
    `<section class="wrap band closing-band"><h2 class="display">A pattern is a starting point.</h2><p>For publicly available workshop materials, explore the <a class="link" href="${destinationRegister.toolkit}">C-Level AI Toolkit&nbsp;→</a>: video, slides, fictional practice cases and custom GPT links. Its practice advisors are custom GPTs, so they need a ChatGPT account. This is separate from the unavailable Strategic Advisor mini-course and Skills Starter Library.</p><p class="lead">Bespoke work adapts it to your responsibilities, source documents and company’s quality standard. Your expertise supplies the context.</p><a class="link" href="${sitePath("services/#formats")}">See delivery formats&nbsp;→</a></section>` +
    inquirySection()
  );
}
type CatalogOption = {
  readonly name: string;
  readonly mode?: string;
  readonly detail: string;
  readonly terms: string;
  readonly id?: string;
};
const catalogOptions = (rows: readonly CatalogOption[], inquiries = false) =>
  `<div class="catalog-options">${rows.map((row) => `<article class="catalog-option"><div><h3>${row.name}</h3>${row.mode ? `<p class="catalog-option-mode">${row.mode}</p>` : ""}</div><div class="catalog-option-body"><p>${row.detail}</p><p class="note--plain">${row.terms}</p>${inquiries ? `<button class="link" data-dialog="contact" data-service="${row.name}" data-contact="${row.id}">Inquire about ${row.name}&nbsp;→</button>` : ""}</div></article>`).join("")}</div>`;
const catalogHead = (id: string, label: string, title: string, lead: string) =>
  `<div class="section-head"><div>${sectionLabel(label)}<h2 id="${id}-title" class="display">${title}</h2></div><p class="lead">${lead}</p></div>`;
function tracksBand() {
  return `<section id="tracks" class="wrap band catalog-band" aria-labelledby="tracks-title">${catalogHead("tracks", "Training", "Five training tracks.", "Each track has its own curriculum, exercises and audience, and trains people to use Claude as a system, not a tool.")}<div class="track-list">${serviceCatalog.tracks
    .map(
      (track) =>
        `<article class="track" id="track-${track.id}" aria-labelledby="track-${track.id}-title"><div class="track-head"><h3 id="track-${track.id}-title">${track.name}</h3><p class="track-format">${track.format}</p></div><div class="track-body"><p class="track-audience"><span class="track-term">For</span>${track.audience}</p><p class="track-term">You leave with</p><ul class="scope-list">${track.assets.map((asset) => `<li>${asset}</li>`).join("")}</ul><button class="link" data-dialog="contact" data-service="${track.name}" data-contact="${track.id}">Inquire about ${track.name}&nbsp;→</button></div></article>`,
    )
    .join(
      "",
    )}</div><div class="services-industries catalog-industries"><p class="note">Built for</p><ul><li><a class="link" href="${sitePath("industries/private-equity/")}">Private Equity</a></li><li><a class="link" href="${sitePath("industries/b2b-saas/")}">B2B SaaS</a></li></ul></div></section>`;
}
function formatsBand() {
  return `<section id="formats" class="wrap band catalog-band" aria-labelledby="formats-title">${catalogHead("formats", "Delivery formats", "Choose how your team learns.", "The format changes the group, time and setting. A track can be tailored to the team's work, with light customization for private cohorts.")}${catalogOptions(serviceCatalog.formats)}</section>`;
}
function beyondTrainingBand() {
  return `<section id="beyond-training" class="wrap band catalog-band" aria-labelledby="beyond-training-title">${catalogHead("beyond-training", "Beyond training", "Make it last. Keep it governed.", "Training builds capability. These services turn it into something your team keeps using, or keep its use of AI governed over time.")}${catalogOptions(serviceCatalog.beyondTraining, true)}</section>`;
}
function freeSessionsBand() {
  return `<section id="start-free" class="band start-free" aria-labelledby="start-free-title"><div class="wrap">${catalogHead("start-free", "Start free", "Two 30-minute sessions, offered at no charge.", "A short, live look at the method before you choose a longer engagement.")}<div class="free-sessions">${serviceCatalog.freeSessions
    .map(
      (session) =>
        `<article><h3>${session.name}</h3><p><span class="track-term">You leave with</span>${session.outcome}</p></article>`,
    )
    .join(
      "",
    )}</div><button class="action" data-dialog="contact" data-service="a free session" data-contact="free-session">Ask for a free session&nbsp;→</button></div></section>`;
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
  return `<section class="wrap band catalog-start" aria-labelledby="catalog-start-title">${sectionLabel("Where to begin")}<h2 id="catalog-start-title" class="display">A useful place to begin</h2><p class="lead">Start with a no-charge 30-minute session to identify one decision or workflow worth improving. Then choose a training track and delivery format that fit the people doing the work. If the team needs a lasting workflow or ongoing guidance, discuss a custom build or advisory after that first step.</p><button class="action" data-dialog="contact">Inquire about a starting path&nbsp;→</button></section>`;
}
function servicesPage() {
  return (
    opening(
      "Services",
      "Use Claude as a system, not a tool.",
      "Found42 trains teams along five tracks, then helps them build and govern what they keep using. Explore the work, the ways to learn and where to begin.",
      `<p class="note page-aside-label">On this page</p><ul class="page-jumps"><li><a class="link" href="#tracks">Training tracks</a></li><li><a class="link" href="#formats">Delivery formats</a></li><li><a class="link" href="#beyond-training">Beyond training</a></li><li><a class="link" href="#start-free">Start free</a></li></ul>`,
      "Inquire",
    ) +
    tracksBand() +
    formatsBand() +
    beyondTrainingBand() +
    freeSessionsBand() +
    catalogBiographyBand() +
    catalogQuotesBand() +
    catalogStartingPath() +
    inquirySection()
  );
}
/**
 * Who a reader would be dealing with, for an industry whose first question is
 * whether anyone here has done this before. The About page carries the rest.
 */
const founderBand = (lines: readonly string[]) =>
  `<section class="wrap band biography founder-band" aria-labelledby="founder-title"><figure class="portrait"><img src="${sitePath("assets/richard-achee.png")}" alt="Richard Achée, Founder and CEO of Found42" width="750" height="750" loading="lazy"><figcaption class="note">Richard Achée, Founder and CEO</figcaption></figure><div>${sectionLabel("Founder and CEO")}<h2 id="founder-title" class="display">Richard Achée</h2>${lines.map((line) => `<p>${line}</p>`).join("")}<a class="link" href="${sitePath("about/")}">Meet Richard Achée&nbsp;→</a></div></section>`;
function industryPage(key: keyof typeof industries) {
  const d = industries[key];
  const founder = industryFounder[key];
  return (
    opening(
      d.name,
      d.title,
      d.intro,
      `<p class="page-stat">${d.aside}</p><h2 class="heading-h3">${d.asideTitle}</h2>${d.asideBody ? `<p>${d.asideBody}</p>` : ""}`,
    ) +
    `<section class="band on-ink" data-ground="ink"><div class="wrap"><div class="section-head"><div>${sectionLabel("Where we work")}<h2 class="display">${d.heading}</h2></div><p class="lead">${d.context}</p></div><div class="industry-grid">${d.items.map(([t, b]) => `<article><h3>${t}</h3><p>${b}</p></article>`).join("")}</div></div></section>${founder ? founderBand(founder) : ""}<section class="wrap band content-split"><div>${sectionLabel("Built around your company")}<h2 class="display">Context in.<br>Judgment throughout.</h2><p>Built around your role, your industry, and your company—not a generic AI curriculum.</p><a class="link" href="${sitePath("services/#tracks")}">Explore training tracks&nbsp;→</a><a class="link" href="${sitePath("resources/#scorecard")}">Take the AI Readiness Scorecard&nbsp;→</a></div><div class="page-drawing">${schematicFigure(masterSchematic, "portrait")}</div></section>` +
    inquirySection(d.cta, d.ctaBody)
  );
}
function aboutPage() {
  return (
    opening(
      "Who we are",
      "Built for operators.",
      "Found42 helps non-technical teams make Claude useful in the work they already own, without outsourcing judgment or buying into theatre.",
      "<p>The goal is not more AI activity. It is better work, with less drag.</p>",
    ) +
    `<section class="wrap band biography"><figure class="portrait"><img src="${sitePath("assets/richard-achee.png")}" alt="Richard Achée, Founder and CEO of Found42" width="750" height="750"><figcaption class="note">Richard Achée, Founder and CEO</figcaption></figure><div>${sectionLabel("Founder and CEO")}<h2 class="display">Richard Achée</h2><p>${biography[0]}</p><ul class="scope-list">${biography
      .slice(1, 4)
      .map((t) => `<li>${t}</li>`)
      .join("")}</ul>${biography
      .slice(4)
      .map((t) => `<p>${t}</p>`)
      .join(
        "",
      )}</div></section><section class="on-ink band" data-ground="ink"><div class="wrap">${sectionLabel("Operating principles")}<h2 class="display">Useful. Testable. Owned.</h2><div class="principles">${principles.map(([t, b]) => `<article><h3>${t}</h3><p>${b}</p></article>`).join("")}</div><p class="lead">That means training and systems shaped around the knowledge owners: their role, industry, company and standards for good work.</p></div></section>` +
    inquirySection()
  );
}
function blogPage() {
  return (
    opening(
      "Operator notes",
      'Useful thinking,<br><span class="signal">plainly written.</span>',
      "Field notes on training teams, designing Claude skills, and deciding what should, and should not, be automated.",
      '<p class="note">New essays are coming.</p><p>No newsletter subscription is available yet.</p>',
    ) +
    `<section class="wrap band essay-list" aria-label="Forthcoming essays">${essays.map((e) => `<article><p class="note">Forthcoming essay${e.href ? ` <span>${e.minutes} min</span>` : ""}</p><div><h2>${e.title}</h2><p>${e.description}</p></div><p class="note">Coming soon</p></article>`).join("")}<p class="lead">The focus: useful practice shaped around a specific role, industry and company.</p><a class="link" href="${sitePath("resources/#scorecard")}">Try the readiness check now&nbsp;→</a></section>`
  );
}
export function renderPage(route: string) {
  const content =
    route === "resources"
      ? resourcesPage()
      : route === "services"
        ? servicesPage()
        : route === "about"
          ? aboutPage()
          : route === "blog"
            ? blogPage()
            : route === "industries/private-equity"
              ? industryPage("private-equity")
              : route === "industries/b2b-saas"
                ? industryPage("b2b-saas")
                : opening(
                    "404",
                    "Page not found.",
                    "This destination is not part of the Found42 preview.",
                    `<a class="link" href="${sitePath()}">Return home&nbsp;→</a>`,
                  );
  return siteHeader() + `<main id="main">${content}</main>` + siteFooter();
}
