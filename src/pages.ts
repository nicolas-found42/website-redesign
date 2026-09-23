import {
  resources,
  industries,
  biography,
  principles,
  essays,
  claudeGloss,
  industryFounder,
  services,
} from "./content";
import { previewNote, siteHeader, siteFooter } from "./homepage/chrome";
import { inquirySection } from "./homepage/inquiry";
import { servicesSection } from "./homepage/services";
import { audiencesSection } from "./homepage/audiences";
import { reviewScene, sceneFigure } from "./audiences";
import { schematicFigure, masterSchematic } from "./schematic";
import { sitePath } from "./paths";
export const pageMeta: Record<string, { title: string; description: string }> =
  {
    "": {
      title: "Found42 — Hands-on Claude skills and training for business",
      description:
        "Hands-on Claude skills and training for your business: usable AI systems for executives, role-specific training for individual contributors and AI builders.",
    },
    resources: {
      title: "Free Claude Resources | Found42",
      description:
        "Assess one workflow and explore playbooks, skills and practical training shaped around real work.",
    },
    services: {
      title: "Workshops, Workflows & Automations | Found42",
      description:
        "Role-specific training and usable AI systems, built around your company’s work and quality standards.",
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
const index = (label: string) =>
  `<p class="index"><b>F42</b><span class="rule"></span><span class="note">${label}</span></p>`;
export const emailForm = (id: string, button: string) =>
  `<form class="email-form" data-email-form novalidate><label for="${id}-email">Work email <span class="note--plain">(required)</span></label><div class="form-line"><input id="${id}-email" name="email" type="email" disabled data-await-script autocomplete="email" maxlength="255" required aria-describedby="${id}-availability ${id}-error" placeholder="you@company.com"><button class="action" type="submit" disabled data-await-script>${button}&nbsp;→</button></div><p id="${id}-availability" class="note--plain">Preview: your email is not sent or stored.</p><p id="${id}-error" class="form-status" role="status"></p><noscript>JavaScript is needed to preview validation. Delivery is not connected.</noscript></form>`;
/** An opening's lead, followed by what Claude is whenever the lead names it. */
const lead = (body: string) =>
  `<p class="lead">${body}</p>${body.includes("Claude") ? `<p class="note--plain gloss">${claudeGloss}</p>` : ""}`;
const opening = (label: string, title: string, body: string, aside: string) =>
  `<section class="page-opening wrap"><div>${index(label)}<h1 class="display" data-reveal-lines>${title}</h1>${lead(body)}<button class="action" data-dialog="contact">Talk to our team&nbsp;→</button></div><aside class="page-aside">${aside}</aside></section><div class="wrap hero-rail page-rail"><span class="note">Your role · Your industry · Your company</span><button class="motion-toggle note" data-motion-toggle aria-pressed="false"><span class="motion-toggle-mark" aria-hidden="true"></span><span>Pause motion</span></button></div>`;
function resourcesPage() {
  return (
    opening(
      "Free resources",
      "Start with the work.",
      "Four practical tools to help your team choose better use cases, build stronger skills, and catch weak outputs.",
      '<p class="page-number">04</p><h2 class="heading-h3">Free working resources</h2><p>No abstract AI curriculum.</p>',
    ) +
    `<section id="scorecard" class="wrap band"><div class="content-split scorecard-split"><div class="scorecard-intro">${index("01 / AI Readiness Scorecard")}<h2 class="display">Know where you stand.</h2><p>Twelve yes-or-no questions about your current AI use, data practices, workflows, team readiness and automation goals, then one open question. It takes about five minutes.</p><p>Your result is a readiness stage, a status for each area and where to start. It is not a score.</p><p class="note--plain">No email required. Your answers stay in this browser and are not sent or stored.</p></div><div id="scorecard-app" class="assessment scorecard" role="group" aria-label="AI Readiness Scorecard"><noscript><p class="assessment-body">The scorecard needs JavaScript. The original assessment on ScoreApp is linked on this page.</p></noscript></div><div class="scorecard-original"><p class="note--plain">Prefer an emailed PDF report? The original assessment on ScoreApp asks for your first and last name, email, company and country before the questions. Its privacy and communications terms apply.</p><a class="link" href="https://found42.scoreapp.com/">Take the original assessment on ScoreApp&nbsp;→</a></div></div><details class="workflow-preview"><summary>Try the four-question workflow preview · No email required</summary><p>From the redesign prototype: test one workflow against repetition, output clarity, review safety and frequency. It is separate from the AI Readiness Scorecard above, which looks at the business rather than one workflow.</p><div id="assessment" class="assessment" aria-label="Workflow discussion preview"></div></details></section>` +
    resources
      .slice(1)
      .map(
        (r, i) =>
          `<section id="${r.id}" class="resource-detail ${i === 1 ? "on-ink" : ""}" ${i === 1 ? 'data-ground="ink"' : ""}><div class="wrap content-split"><div>${index(`0${i + 2} / Free resource`)}<h2 class="display">${r.title}</h2><p>${r.description}</p>${r.id === "playbook" ? `<figure class="review-figure">${sceneFigure(reviewScene, "landscape", "system review-scene")}<figcaption class="note--plain review-caption">Fig. — three failure modes the playbook is built to catch, and the human review a result passes before it reaches the business. The complete 12-check list is not reproduced here.</figcaption></figure>` : ""}<button class="link" data-dialog="contact">Want this tailored? Talk to us&nbsp;→</button></div><div class="resource-access"><h3>Get ${r.outcome.toLowerCase()}</h3><p class="note--plain">${r.gate}</p>${r.id === "playbook" ? '<p>Twelve checks for spotting weak outputs, missing context and false confidence, so a person questions a result before relying on it.</p><a class="link" href="https://www.found42.com/ai-failure-modes-playbook">Request the published AI Failure Modes Playbook&nbsp;→</a><p class="note--plain">The published playbook is requested on found42.com. Its form asks for your email, your LinkedIn profile and a human check.</p>' : ""}${r.id === "course" ? '<button class="action" data-dialog="course">Explore the mini-course&nbsp;→</button>' : emailForm(r.id, "Preview the request")}</div></div></section>`,
      )
      .join("") +
    `<section class="wrap band closing-band"><h2 class="display">A pattern is a starting point.</h2><p>For publicly available workshop materials, explore the <a class="link" href="https://www.found42.com/toolkit">C-Level AI Toolkit&nbsp;→</a>: video, slides, fictional practice cases and custom GPT links. Its practice advisors are custom GPTs, so they need a ChatGPT account. This is separate from the forthcoming Strategic Advisor course and Skills Starter Library.</p><p class="lead">Bespoke work adapts it to your responsibilities, source documents and company’s quality standard. Your expertise supplies the context.</p><a class="link" href="${sitePath("services/#engagements")}">See how engagements work&nbsp;→</a></section>` +
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
  return `<section id="engagements" class="wrap band engagements" aria-labelledby="engagements-title">${index("What an engagement looks like")}<h2 id="engagements-title" class="display">What working with us looks like.</h2><div class="engagement-grid">${services.map((service, i) => `<article><p class="note">0${i + 1}</p><h3>${service.title}</h3><dl>${rows.map(([term, key]) => `<div><dt class="note">${term}</dt><dd>${service.engagement[key]}</dd></div>`).join("")}</dl></article>`).join("")}</div><p class="lead engagement-terms">Length and fees depend on the work, so they are not published here. Ask about both in your first conversation.</p></section>`;
}
function servicesPage() {
  return (
    opening(
      "Services",
      'Build capability.<br><span class="signal">Remove drag.</span>',
      "We train teams, build custom skills, and automate repeatable work. Every engagement starts with the operating problem, not the technology.",
      "<p>“Use free resources to learn. Bring us the workflow when it needs to work under pressure.”</p>",
    ) +
    engagementsBand() +
    audiencesSection() +
    servicesSection() +
    `<section class="wrap band"><p class="note">Three pillars · From learning to leverage.</p><div class="boundary-grid"><article>${index("Clear boundary")}<h2 class="display">Free shows the pattern.</h2><p>Our resources help you test the method and improve individual practice.</p><a class="link" href="${sitePath("resources/")}">Explore free resources&nbsp;→</a></article><article>${index("Bespoke changes the system.")}<h2 class="display">Paid builds the advantage.</h2><p>Custom engagements encode your context, quality bar, controls, and workflows.</p><p>Discovery starts with the job to be done. Co-design uses your examples and review standards. Testing and failure-mode review identify where people must stay in control.</p></article></div></section>` +
    inquirySection()
  );
}
/**
 * Who a reader would be dealing with, for an industry whose first question is
 * whether anyone here has done this before. The About page carries the rest.
 */
const founderBand = (lines: readonly string[]) =>
  `<section class="wrap band biography founder-band" aria-labelledby="founder-title"><figure class="portrait"><img src="${sitePath("assets/richard-achee.png")}" alt="Richard Achée, Founder and CEO of Found42" width="750" height="750" loading="lazy"><figcaption class="note">Richard Achée, Founder and CEO</figcaption></figure><div>${index("Founder and CEO")}<h2 id="founder-title" class="display">Richard Achée</h2>${lines.map((line) => `<p>${line}</p>`).join("")}<a class="link" href="${sitePath("about/")}">Meet Richard Achée&nbsp;→</a></div></section>`;
function industryPage(key: keyof typeof industries) {
  const d = industries[key];
  const founder = industryFounder[key];
  return (
    opening(
      d.name,
      d.title,
      d.intro,
      `<p class="page-number">${d.aside}</p><h2 class="heading-h3">${d.asideTitle}</h2><p>${d.asideBody}</p>${key === "private-equity" ? '<p class="note--plain">A target, not a guaranteed result.</p>' : ""}`,
    ) +
    `<section class="band on-ink" data-ground="ink"><div class="wrap"><div class="section-head"><div>${index("Where we work")}<h2 class="display">${d.heading}</h2></div><p class="lead">${d.context}</p></div><div class="industry-grid">${d.items.map(([t, b], i) => `<article><p class="note">0${i + 1}</p><h3>${t}</h3><p>${b}</p></article>`).join("")}</div></div></section>${founder ? founderBand(founder) : ""}<section class="wrap band content-split"><div>${index("Built around your company")}<h2 class="display">Context in.<br>Judgment throughout.</h2><p>Built around your role, your industry, and your company—not a generic AI curriculum.</p><a class="link" href="${sitePath("services/")}">Workshops, Workflows & Automations&nbsp;→</a><a class="link" href="${sitePath("resources/#scorecard")}">Take the AI Readiness Scorecard&nbsp;→</a></div><div class="page-drawing">${schematicFigure(masterSchematic, "portrait")}</div></section>` +
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
    `<section class="wrap band biography"><figure class="portrait"><img src="${sitePath("assets/richard-achee.png")}" alt="Richard Achée, Founder and CEO of Found42" width="750" height="750"><figcaption class="note">Richard Achée, Founder and CEO</figcaption></figure><div>${index("Founder and CEO")}<h2 class="display">Richard Achée</h2><p>${biography[0]}</p><ul class="scope-list">${biography
      .slice(1, 4)
      .map((t) => `<li>${t}</li>`)
      .join("")}</ul>${biography
      .slice(4)
      .map((t) => `<p>${t}</p>`)
      .join(
        "",
      )}</div></section><section class="on-ink band" data-ground="ink"><div class="wrap">${index("Operating principles")}<h2 class="display">Useful. Testable. Owned.</h2><div class="principles">${principles.map(([t, b], i) => `<article><p class="note">0${i + 1}</p><h3>${t}</h3><p>${b}</p></article>`).join("")}</div><p class="lead">That means training and systems shaped around the knowledge owners: their role, industry, company and standards for good work.</p></div></section>` +
    inquirySection()
  );
}
function blogPage() {
  return (
    opening(
      "Operator notes",
      'Useful thinking,<br><span class="signal">plainly written.</span>',
      "Field notes on training teams, designing Claude skills, and deciding what should, and should not, be automated.",
      '<h2 class="heading-h3">New essays are coming.</h2><p>Get the first issue when it’s ready.</p>' +
        emailForm("newsletter", "Join the list"),
    ) +
    `<section class="wrap band essay-list" aria-label="Forthcoming essays">${essays.map((e, i) => `<article><p class="note">Essay 0${i + 1} <span>${e.minutes} min</span></p><div><h2>${e.title}</h2><p>${e.description}</p></div><p class="note">Coming soon</p></article>`).join("")}<p class="lead">The focus: useful practice shaped around a specific role, industry and company.</p><a class="link" href="${sitePath("resources/#scorecard")}">Try the readiness check now&nbsp;→</a></section>`
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
  return (
    siteHeader() +
    `<main id="main">${previewNote()}${content}</main>` +
    siteFooter()
  );
}
