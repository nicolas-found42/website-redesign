import {
  resources,
  industries,
  biography,
  principles,
  essays,
  claudeGloss,
  industryFounder,
  services,
  destinationRegister,
} from "./content";
import { previewNotice, siteHeader, siteFooter } from "./homepage/chrome";
import { inquirySection } from "./homepage/inquiry";
import { servicesSection } from "./homepage/services";
import { audiencesSection } from "./homepage/audiences";
import { reviewScene, sceneFigure } from "./audiences";
import { schematicFigure, masterSchematic } from "./schematic";
import { sitePath } from "./paths";
import { catalogSections } from "./catalog";
import { starterSkills } from "./resource-materials";
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
      title: "Training Tracks, Formats & Services | Found42",
      description:
        "Explore five training tracks, six delivery formats, custom builds, advisory services and no-charge starting sessions.",
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
        "Preview essays on role-specific Claude skills, workflow design and human review.",
    },
  };
const sectionLabel = (label: string) =>
  `<p class="note section-label">${label}</p>`;
/** An opening's lead, followed by what Claude is whenever the lead names it. */
const lead = (body: string) =>
  `<p class="lead">${body}</p>${body.includes("Claude") ? `<p class="note--plain gloss">${claudeGloss}</p>` : ""}`;
const opening = (label: string, title: string, body: string, aside: string) =>
  `<section class="page-opening wrap"><div>${sectionLabel(label)}<h1 class="display" data-reveal-lines>${title}</h1>${lead(body)}<a class="action" href="${destinationRegister.liveInquiry}" data-dialog="contact">Talk to our team&nbsp;→</a></div><aside class="page-aside">${aside}</aside></section>`;
/** Deliver the original skill archives without requiring an email or Drive access. */
function resourceMaterials(id: string) {
  if (id === "library")
    return `<div id="starter-files" class="wrap resource-materials"><div class="starter-grid">${starterSkills.map((skill) => `<article><h3>${skill.title}</h3><p>${skill.description}</p><a class="link" href="${sitePath(`resources/skills/${skill.file}`)}" download="${skill.file}">Download ${skill.title.toLowerCase()} skill&nbsp;→</a></article>`).join("")}</div><p class="note--plain">These are Claude custom skill packages. Upload the .skill file using Claude’s custom skill settings, then configure it for your work and review its outputs. A Claude account with custom skills enabled is required. See <a class="link" href="https://support.claude.com/en/articles/12512198-how-to-create-custom-skills">Claude’s custom skill instructions</a>.</p></div>`;
  if (id === "course")
    return `<div class="wrap resource-materials"><h3>Set up your advisor</h3><p>The package includes a context template and scenario prompts. Fill in references/my-context-template.md and save it as references/my-context.md to calibrate the advisor to your role, organization and priorities. Keep confidential context in your own copy.</p><a class="link" href="${sitePath("resources/skills/strategic-advisor.skill")}" download="strategic-advisor.skill">Download the strategic advisor skill&nbsp;→</a></div>`;
  return "";
}
function resourcesPage() {
  return (
    opening(
      "Free resources",
      "Start with the work.",
      "Five free resources to explore: a readiness check, workshop materials, a published playbook request, four Claude skill packages and a Strategic Advisor lesson.",
      '<p class="note page-aside-label">No abstract AI curriculum.</p>',
    ) +
    `<section id="scorecard" class="wrap band"><div class="content-split scorecard-split"><div class="scorecard-intro"><p class="note section-label">AI Readiness Scorecard</p><h2 class="display">AI Readiness Scorecard</h2><p>${resources[0].description}</p><p>Twelve yes-or-no questions about your current AI use, data practices, workflows, team readiness and automation goals, then one open question. It takes about five minutes.</p><p>Your result is a readiness stage, a status for each area and where to start.</p><p class="note--plain">No email required. Your answers stay in this browser and are not sent or stored.</p></div><div id="scorecard-app" class="assessment scorecard" role="group" aria-label="AI Readiness Scorecard"><noscript><p class="assessment-body">The scorecard needs JavaScript. The original assessment on ScoreApp is linked on this page.</p></noscript></div><div class="scorecard-original"><p class="note--plain">Prefer an emailed PDF report? The original assessment on ScoreApp asks for your first and last name, email, company and country before the questions. Its privacy and communications terms apply.</p><a class="link" href="${destinationRegister.scoreApp}">Take the original assessment on ScoreApp&nbsp;→</a></div></div><details class="workflow-preview"><summary>Try the four-question workflow preview · No email required</summary><p>From the redesign prototype: test one workflow against repetition, output clarity, review safety and frequency. It is separate from the AI Readiness Scorecard above, which looks at the business rather than one workflow.</p><div id="assessment" class="assessment" aria-label="Workflow discussion preview"></div></details></section>` +
    resources
      .filter((resource) => resource.id !== "scorecard")
      .map((resource) => {
        const access =
          resource.id === "playbook"
            ? `<a class="link" href="${resource.href}">${resource.action}&nbsp;→</a><p class="note--plain">The published playbook is requested on found42.com. Its form asks for your email, LinkedIn profile and a human check.</p>`
            : `<a class="link" href="${resource.href}">${resource.action}&nbsp;→</a>`;
        return `<section id="${resource.id}" class="resource-detail"><div class="wrap content-split"><div><h2 class="display">${resource.title}</h2><p>${resource.description}</p>${resource.id === "playbook" ? `<figure class="review-figure">${sceneFigure(reviewScene, "landscape", "system review-scene")}<figcaption class="note--plain review-caption">Three failure modes the published playbook is built to catch, and the human review a result passes before it reaches the business. The complete check list is not reproduced here.</figcaption></figure>` : ""}<a class="link" href="${destinationRegister.liveInquiry}" data-dialog="contact" data-interest="${resource.title}">Want this tailored? Talk to us&nbsp;→</a></div><div class="resource-access"><h3>${resource.outcome}</h3><p class="note--plain">${resource.gate}</p>${access}</div></div>${resourceMaterials(resource.id)}</section>`;
      })
      .join("") +
    `<section class="wrap band closing-band"><h2 class="display">A pattern is a starting point.</h2><p>For publicly available workshop materials, explore the <a class="link" href="${destinationRegister.toolkit}">C-Level AI Toolkit&nbsp;→</a>: video, slides, fictional practice cases and custom GPT links. Its practice advisors are custom GPTs, so they need a ChatGPT account. The toolkit’s custom GPT exercises are separate from the Claude skill packages above.</p><p class="lead">Bespoke work adapts it to your responsibilities, source documents and company’s quality standard. Your expertise supplies the context.</p><a class="link" href="${sitePath("services/#tracks")}">Explore training and services&nbsp;→</a></section>` +
    inquirySection()
  );
}
/**
 * What an engagement asks and gives, before a visitor is asked to make an
 * inquiry: the question a buyer has first and the service descriptions below
 * leave open.
 */
function engagementsBand() {
  const rows = [
    ["Starts with", "startsWith"],
    ["You provide", "youProvide"],
    ["You get", "youGet"],
  ] as const;
  return `<section id="engagements" class="wrap band engagements" aria-labelledby="engagements-title">${sectionLabel("What an engagement looks like")}<h2 id="engagements-title" class="display">What working with us looks like.</h2><div class="engagement-grid">${services.map((service) => `<article><h3>${service.title}</h3><dl>${rows.map(([term, key]) => `<div><dt class="note">${term}</dt><dd>${service.engagement[key]}</dd></div>`).join("")}</dl></article>`).join("")}</div></section>`;
}
function servicesPage() {
  return (
    opening(
      "Services",
      'Training, skills and automations<br><span class="signal">for your real work.</span>',
      "Explore five training tracks, six delivery formats and ongoing services. Start with a no-charge session or inquire about the work your team needs.",
      `<p class="note page-aside-label">On this page</p><ul class="page-jumps"><li><a class="link" href="#tracks">Training tracks</a></li><li><a class="link" href="#formats">Delivery formats</a></li><li><a class="link" href="#beyond-training">Beyond training</a></li><li><a class="link" href="#start-free">Start free</a></li></ul>`,
    ) +
    engagementsBand() +
    audiencesSection() +
    servicesSection() +
    catalogSections() +
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
      '<p class="note">Three method excerpts from Found42’s existing essay drafts.</p><p>No newsletter subscription is available yet.</p>',
    ) +
    `<section class="wrap band essay-list" aria-label="Essay excerpts">${essays.map((essay) => `<article><p class="note">Draft excerpt</p><div><h2>${essay.title}</h2><p>${essay.description}</p><details class="essay-body"><summary>Read ${essay.title.toLowerCase()}</summary>${essay.sections.map((section) => `<section><h3>${section.title}</h3>${section.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("")}</section>`).join("")}</details></div></article>`).join("")}<p class="note--plain">Selected method sections from existing Found42 drafts, edited for this preview. Full articles await editorial review.</p><a class="link" href="${sitePath("resources/#scorecard")}">Try the readiness check now&nbsp;→</a></section>`
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
  // #148 scopes the notice to the seven content pages. The 404 opening already
  // says it is not part of the preview, so the notice would repeat it there.
  const notice = route === "404" ? "" : previewNotice();
  return (
    siteHeader() +
    `<main id="main">${notice}${content}</main>` +
    siteFooter()
  );
}
