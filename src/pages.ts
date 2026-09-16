import {
  resources,
  industries,
  biography,
  principles,
  essays,
} from "./content";
import { siteHeader, siteFooter } from "./homepage/chrome";
import { inquirySection } from "./homepage/inquiry";
import { servicesSection } from "./homepage/services";
import { schematicFigure, masterSchematic } from "./schematic";
import { sitePath } from "./paths";
export const pageMeta: Record<string, { title: string; description: string }> =
  {
    "": {
      title: "Found42 — AI built around your work",
      description:
        "Practical AI systems for executives and training built around your role, your industry and your company.",
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
  `<form class="email-form" data-email-form novalidate><label for="${id}-email">Work email <span class="note--plain">(required)</span></label><div class="form-line"><input id="${id}-email" name="email" type="email" disabled data-await-script autocomplete="email" maxlength="255" required aria-describedby="${id}-availability ${id}-error" placeholder="you@company.com"><button class="action" type="submit" disabled data-await-script>${button} →</button></div><p id="${id}-availability" class="note--plain">Preview only. Delivery is not connected; your email will not be sent or stored.</p><p id="${id}-error" class="form-status" role="status"></p><noscript>JavaScript is needed to preview validation. Delivery is not connected.</noscript></form>`;
const opening = (label: string, title: string, body: string, aside: string) =>
  `<section class="page-opening wrap"><div>${index(label)}<h1 class="display" data-reveal-lines>${title}</h1><p class="lead">${body}</p><button class="action" data-dialog="contact">Talk to our team →</button></div><aside class="page-aside">${aside}</aside></section><div class="wrap hero-rail page-rail"><span class="note">Your role · Your industry · Your company</span><button class="motion-toggle note" data-motion-toggle aria-pressed="false"><span class="motion-toggle-mark" aria-hidden="true"></span><span>Pause motion</span></button></div>`;
export function pathways() {
  return `<section class="wrap pathways band" aria-labelledby="pathways-title"><div>${index("Two ways into the work")}<h2 id="pathways-title" class="display">Your expertise.<br><span class="signal">A system around it.</span></h2></div><div class="pathway-grid"><article><p class="note">For executives</p><h3>Adopt a system.<br>Keep your attention.</h3><p>Bring the business problem. Workflows and automations give you a practical system to use, without making tool setup or development your job.</p><a class="link" href="${sitePath("services/#service-automation")}">Explore usable systems →</a></article><article><p class="note">For domain experts & teams</p><h3>Start with the work<br>you know best.</h3><p>Training is built around your role, industry and company: your recurring decisions, documents, terminology and review standards. Apply your expertise more efficiently, with human judgment at the center.</p><a class="link" href="${sitePath("services/#service-training")}">Explore tailored training →</a></article></div></section>`;
}
function resourcesPage() {
  return (
    opening(
      "Free resources",
      "Start with the work.",
      "Four practical tools to help your team choose better use cases, build stronger skills, and catch weak outputs.",
      '<p class="page-number">04</p><h3>Free working resources</h3><p>No abstract AI curriculum.</p>',
    ) +
    `<section id="scorecard" class="wrap band content-split"><div>${index("01 / Interactive preview")}<h2 class="display">AI Readiness Scorecard</h2><p>Test one workflow against the factors that matter: repetition, output clarity, review safety, and frequency.</p><p class="note--plain">No email required. This is a starting point for discussion, not a measured business outcome.</p></div><div id="assessment" class="assessment" aria-label="AI Readiness Scorecard"></div></section>` +
    resources
      .slice(1)
      .map(
        (r, i) =>
          `<section id="${r.id}" class="resource-detail ${i === 1 ? "on-ink" : ""}" ${i === 1 ? 'data-ground="ink"' : ""}><div class="wrap content-split"><div>${index(`0${i + 2} / Free resource`)}<h2 class="display">${r.title}</h2><p>${r.description}</p><button class="link" data-dialog="contact">Want this tailored? Talk to us →</button></div><div class="resource-access"><h3>Get ${r.outcome.toLowerCase()}</h3><p class="note--plain">${r.gate}</p>${r.id === "course" ? '<button class="action" data-dialog="course">Start the mini-course →</button>' : emailForm(r.id, "Get the resource")}</div></div></section>`,
      )
      .join("") +
    `<section class="wrap band"><h2 class="display">A pattern is a starting point.</h2><p class="lead">Bespoke work adapts it to your responsibilities, source documents and company’s quality standard. Your expertise supplies the context.</p><a class="link" href="${sitePath("services/")}">See how engagements work →</a></section>` +
    inquirySection()
  );
}
function servicesPage() {
  return (
    opening(
      "Services",
      'Build capability.<br><span class="signal">Remove drag.</span>',
      "We train teams, build custom skills, and automate repeatable work. Every engagement starts with the operating problem, not the technology.",
      "<p>“Use free resources to learn. Bring us the workflow when it needs to work under pressure.”</p>",
    ) +
    pathways() +
    servicesSection() +
    `<section class="wrap band"><p class="note">Three pillars · From learning to leverage.</p><div class="boundary-grid"><article>${index("Clear boundary")}<h2 class="display">Free shows the pattern.</h2><p>Our resources help you test the method and improve individual practice.</p><a class="link" href="${sitePath("resources/")}">Explore free resources →</a></article><article>${index("Bespoke changes the system.")}<h2 class="display">Paid builds the advantage.</h2><p>Custom engagements encode your context, quality bar, controls, and workflows.</p><p>Discovery starts with the job to be done. Co-design uses your examples and review standards. Testing and failure-mode review identify where people must stay in control.</p></article></div></section>` +
    inquirySection()
  );
}
function industryPage(key: keyof typeof industries) {
  const d = industries[key];
  return (
    opening(
      d.name,
      d.title,
      d.intro,
      `<p class="page-number">${d.aside}</p><h3>${d.asideTitle}</h3><p>${d.asideBody}</p>${key === "private-equity" ? '<p class="note--plain">A target, not a guaranteed result.</p>' : ""}`,
    ) +
    `<section class="band on-ink" data-ground="ink"><div class="wrap"><div class="section-head"><div>${index("Where we work")}<h2 class="display">${d.heading}</h2></div><p class="lead">${d.context}</p></div><div class="industry-grid">${d.items.map(([t, b], i) => `<article><p class="note">0${i + 1}</p><h3>${t}</h3><p>${b}</p></article>`).join("")}</div></div></section><section class="wrap band content-split"><div>${index("Built around your company")}<h2 class="display">Context in.<br>Judgment throughout.</h2><p>Built around your role, your industry, and your company—not a generic AI curriculum.</p><a class="link" href="${sitePath("services/")}">Workshops, Workflows & Automations →</a><a class="link" href="${sitePath("resources/#scorecard")}">Test a workflow’s readiness →</a></div><div class="page-drawing">${schematicFigure(masterSchematic, "portrait")}</div></section>` +
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
      "<h3>New essays are coming.</h3><p>Get the first issue when it’s ready.</p>" +
        emailForm("newsletter", "Join the list"),
    ) +
    `<section class="wrap band essay-list" aria-label="Forthcoming essays">${essays.map((e, i) => `<article><p class="note">Essay 0${i + 1} <span>${e.minutes} min</span></p><div><h2>${e.title}</h2><p>${e.description}</p></div><p class="note">Coming soon</p></article>`).join("")}<p class="lead">The focus: useful practice shaped around a specific role, industry and company. These essays are forthcoming; full articles are not yet available.</p><a class="link" href="${sitePath("resources/#scorecard")}">Try the readiness check now →</a></section>`
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
                    `<a class="link" href="${sitePath()}">Return home →</a>`,
                  );
  return siteHeader() + `<main id="main">${content}</main>` + siteFooter();
}
