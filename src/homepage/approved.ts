import { sitePath } from "../paths";
import { destinationRegister } from "../content";

const audienceCards = [
  {
    title: "C-level executives",
    body: "Bring the operating problem behind a decision or result. We shape an AI skill for it while your people stay responsible for the call.",
    action: "For executives",
    anchor: "track-c-level-ai",
    diagram: [
      "Your problem",
      "Tailored skill",
      "Decision brief",
      "Executive direction",
    ],
  },
  {
    title: "Individual contributors",
    body: "Training built around your role, industry and company, so skills take on recurring work and free you for judgment.",
    action: "For individual contributors",
    anchor: "track-role-based",
    diagram: [
      "Your company",
      "Role-specific skills",
      "Work reviewed",
      "Your judgment",
    ],
  },
  {
    title: "AI builders",
    body: "No engineering background needed. Learn to test, troubleshoot and anticipate failure modes in workflows your team relies on.",
    action: "For AI builders",
    anchor: "track-ai-builders",
    diagram: ["Work problem", "Test", "Troubleshoot", "Workflow in use"],
  },
];

const serviceCards = [
  {
    title: "Workshops",
    label: "Build capability",
    description:
      "Live or on-demand training on your team's real decisions, documents and operating rhythms. Teams learn on their own work, not on demo prompts.",
    points: [
      "Guided practice on real work",
      "Reusable skills and review points",
      "A takeaway the team applies",
    ],
    diagram: [
      "Your team's real work",
      "Live guided practice",
      "Group review",
      "Reusable skill",
    ],
    interest: "Training",
    context: "workshops",
  },
  {
    title: "Workflows",
    label: "Make expertise repeatable",
    description:
      "Custom Claude skills and plugins built around one high-value job your team does often. Your source material, examples and quality bar shape the result.",
    points: [
      "Your brief and quality bar",
      "Tailored design, build and testing",
      "A workflow the team can deploy",
    ],
    diagram: [
      "Your brief",
      "Design and build",
      "Test together",
      "Deployable workflow",
    ],
    interest: "Automation",
    context: "workflows",
  },
  {
    title: "Automations",
    label: "Return expert attention",
    description:
      "End-to-end workflows for repetitive work that should not consume expert attention, with people in control wherever judgment is needed.",
    points: [
      "Repetitive work and handoffs mapped",
      "Human review at key points",
      "An output the team can rely on",
    ],
    diagram: [
      "Map handoffs",
      "Automate repeat work",
      "Human review",
      "Reliable output",
    ],
    interest: "Automation",
    context: "automations",
  },
] as const;

const quotes = [
  {
    name: "Robb Henshaw",
    role: "Former Co-Founder and CMO at Cameyo (acquired by Google)",
    note: "",
    image: "robb-henshaw.jpeg",
    quote:
      "“C-Level AI is a completely unique approach that cuts through the AI hype. It starts with the C-Level AI training workshop, providing your execs with practical AI skills and immediate value. Following it up with the Scorecard gives you a clear understanding of your current state. You head into the discovery session with great ideas of what could be possible that is grounded in reality.”",
  },
  {
    name: "Paul Keely",
    role: "Co-founder and Managing Director, Palladium Security LLC",
    note: "Former Co-founder, Born In The Cloud (acquired by Open Systems)",
    image: "paul-keely.jpeg",
    quote:
      "“What stood out in the C-Level AI workshop was how practical it was. The exercises turned AI from concept to execution, with role-play coaching and tailored prompts that improved my client outreach instantly. Richard brings the balance of a trusted advisor and a hands-on coach.”",
  },
  {
    name: "Carmen Paredes Ramirez",
    role: "Founder and CEO of Ruruka and Maraja",
    note: "MIT Innovator Under 35 LATAM 2025",
    image: "carmen-paredes-ramirez.jpeg",
    quote:
      "“This course was amazing and incredibly useful! The sessions were engaging and interactive, which made learning enjoyable. I especially appreciated having access to the materials on demand after the live session. It was perfect for catching up on anything I missed during the live sessions. The pacing was just right, and everything was explained clearly and easy to understand.”",
  },
  {
    name: "Andrew Miller",
    role: "Former Co-Founder and CEO, Cameyo (acquired by Google)",
    note: "",
    image: "andrew-miller.jpeg",
    quote:
      "“Richard’s C-Level AI workshop went beyond theory. It helped me turn ChatGPT into a trusted advisor and a sounding board in less than 1 hour. The role-play coaching and personalized AI tools delivered quick, actionable tweaks I could implement immediately. It’s already changing how I approach client conversations.”",
  },
  {
    name: "Neville Louison",
    role: "Founder of Soulful Silverback",
    note: "",
    image: "neville-louison.jpeg",
    quote:
      "“Working with Richard in the Strategy Pivot Workshop unlocked a clear, actionable path forward for my business pivot. With his expert guidance through ChatGPT, Gemini, and Gamma, I not only refined my positioning and GTM playbook, but also had a fully functional landing page live in under three hours!”",
  },
];

const flow = (labels: readonly string[]) =>
  `<div class="ah-flow" aria-label="${labels.join(" to ")}">${labels.map((label, index) => `<span class="ah-flow-step${index === labels.length - 1 ? " ah-flow-step--end" : ""}">${label}</span>`).join("")}</div>`;

export function approvedHomepage() {
  return `<div class="approved-homepage">
<section class="ah-hero ah-wrap" aria-labelledby="hero-title"><div class="ah-hero-copy"><p class="ah-eyebrow">Claude skills and training for business</p><h1 id="hero-title">Train teams.<br>Build useful skills.<br><span>Automate the work.</span></h1><p>Found42 helps non-technical teams use AI in the work they already own. We train people in their roles, build tailored Claude skills, and automate repeatable work while judgment stays with your team.</p><div class="ah-actions"><a class="ah-button" href="${destinationRegister.liveInquiry}" data-dialog="contact">Talk to us →</a><a class="ah-button ah-button--secondary" href="${sitePath("resources/")}">Explore free resources ↗</a></div></div><div class="ah-hero-visual"><div class="ah-system" role="img" aria-label="Your people, workflows and business knowledge flow through human direction into practical AI at work">${flow(["Your people", "Human direction", "Practical AI at work"])}<div class="ah-system-inputs">Your workflows <span>What your business knows</span></div></div><figure class="ah-hero-quote"><img src="${sitePath("assets/paul-keely.jpeg")}" alt="Paul Keely" width="72" height="72"><div><blockquote>“What stood out in the C-Level AI workshop was how practical it was.”</blockquote><figcaption>Paul Keely · Co-founder and Managing Director, Palladium Security LLC</figcaption></div></figure></div><button class="motion-toggle note" type="button" data-motion-toggle aria-pressed="false"><span class="motion-toggle-mark" aria-hidden="true"></span><span>Pause motion</span></button></section>
<section class="ah-companies ah-wrap" aria-label="Teams we have worked with"><p>Teams we have worked with</p><ul><li>Google</li><li>PeakSpan</li><li>SEP <small>Private equity</small></li></ul></section>
<section class="ah-counts ah-wrap" aria-label="Found42 in numbers"><div><strong>20+</strong><span>workshops delivered</span></div><div><strong>500+</strong><span>people trained</span></div><div><strong>50+</strong><span>skills and workflows built</span></div></section>
<section id="audiences" class="ah-audiences ah-wrap" aria-labelledby="audiences-title"><div class="ah-heading"><div><p class="ah-eyebrow">Who we help</p><h2 id="audiences-title">Find the work that sounds like yours</h2></div><p>Whether you lead the company, own a role, or build for your team, we start from your real work.</p></div><div class="ah-audience-grid">${audienceCards.map((card, i) => `<article class="ah-audience-card"><div class="ah-card-diagram">${flow(card.diagram)}</div><span class="ah-number">0${i + 1}</span><h3>${card.title}</h3><p>${card.body}</p><a href="${sitePath(`services/#${card.anchor}`)}">${card.action} →</a></article>`).join("")}</div></section>
<section id="services" class="ah-services ah-wrap" aria-labelledby="services-title"><div class="ah-heading"><div><p class="ah-eyebrow">Services</p><h2 id="services-title">Three ways we help</h2></div><p>Every engagement starts with your work and leaves your team with something it can use.</p></div><div class="ah-service-controls" role="group" aria-label="Choose a service">${serviceCards.map((card, i) => `<button type="button" data-approved-service="${i}" aria-pressed="${i === 0}"><small>0${i + 1}</small>${card.title}</button>`).join("")}</div><div class="ah-service-panels">${serviceCards.map((card, i) => `<article class="ah-service-panel" data-approved-panel="${i}" aria-labelledby="ah-service-${i}"><div><p class="ah-eyebrow">${card.label}</p><h3 id="ah-service-${i}">${card.title}</h3><p>${card.description}</p><ul>${card.points.map((point) => `<li>${point}</li>`).join("")}</ul><a class="ah-text-action" href="${destinationRegister.liveInquiry}" data-dialog="contact" data-service="${card.title}" data-interest="${card.interest}" data-contact="${card.context}">Talk to us about ${card.title.toLowerCase()} →</a></div><div class="ah-service-diagram">${flow(card.diagram)}</div></article>`).join("")}</div></section>
<section class="ah-briefing" data-ground="ink" aria-labelledby="briefing-title"><div class="ah-wrap"><p class="ah-eyebrow">See it in practice</p><div class="ah-heading"><div><h2 id="briefing-title">From a busy week to a ready briefing</h2><p>A briefing skill does the prep. You walk into every call knowing what matters.</p></div></div><div class="ah-briefing-grid"><ol><li><strong>The skill gathers your week</strong><span>Sources</span></li><li><strong>It builds a briefing for every call</strong><span>One page per meeting.</span></li><li><strong>You get the summary and decide</strong></li></ol><div class="ah-briefing-picture" aria-label="Illustrative weekly briefing and Slack message"><div class="ah-source-grid"><div><strong>Calendar</strong><span>This week's meetings</span></div><div><strong>Email</strong><span>Recent threads</span></div><div><strong>Drive</strong><span>Docs and transcripts</span></div><div><strong>Notion</strong><span>Open items</span></div></div><div class="ah-paper"><small>Weekly briefing</small><h3>[Client] decision call</h3><ul><li>Call at a glance</li><li>Where things stand</li><li>Open action items</li><li>Advisor notes</li></ul></div><div class="ah-slack"><small>Slack message</small><p>Your briefing is ready</p><p>Top priorities this week</p><div class="ah-faux-controls"><span>Open briefing</span><span>Reply</span></div></div></div></div><p class="ah-illustrative">Illustrative example. No live Calendar, Email, Drive, Notion or Slack integration.</p></div></section>
<section class="ah-testimonials" aria-labelledby="testimonials-title"><div class="ah-wrap"><div class="ah-heading"><div><p class="ah-eyebrow">What clients say</p><h2 id="testimonials-title">What founders are saying</h2></div><div class="ah-carousel-nav"><button type="button" data-testimonial-step="-1" aria-label="Previous testimonial">←</button><span data-testimonial-count aria-live="polite">1 / 5</span><button type="button" data-testimonial-step="1" aria-label="Next testimonial">→</button></div></div><div class="ah-quote-track" tabindex="0" aria-label="Testimonials">${quotes.map((quote) => `<figure class="ah-quote"><blockquote>${quote.quote}</blockquote><figcaption><img src="${sitePath(`assets/${quote.image}`)}" alt="${quote.name}" width="64" height="64" loading="lazy"><span><strong>${quote.name}</strong><span>${quote.role}</span>${quote.note ? `<small>${quote.note}</small>` : ""}</span></figcaption></figure>`).join("")}</div></div></section>
<section class="ah-founder ah-wrap" aria-label="About the founder"><img src="${sitePath("assets/richard-achee.png")}" alt="Richard Achée, founder of Found42" width="110" height="110" loading="lazy"><div><h2>Led by Richard Achée, Founder and CEO</h2><p>Every engagement is shaped around your team's real work.</p></div><a href="${sitePath("about/")}">Meet Richard →</a></section>
<section id="resources" class="ah-resources ah-wrap" aria-labelledby="resources-title"><div class="ah-heading"><div><p class="ah-eyebrow">Free resources</p><h2 id="resources-title">Not ready to talk? Start here</h2></div><a href="${sitePath("resources/")}">All free resources →</a></div><div class="ah-resource-grid"><article><span class="ah-number">01</span><h3>AI Readiness Scorecard</h3><p>Assess your AI use, data practices and workflow readiness before deciding where to focus.</p><small>12 yes-or-no questions · No email required</small><a href="${sitePath("resources/#scorecard")}">Take the scorecard →</a></article><article><span class="ah-number">02</span><h3>C-Level AI Toolkit</h3><p>Workshop video, slides, practice cases and custom GPT links built for executive AI practice.</p><small>Public page · Some links need a ChatGPT account</small><a href="https://www.found42.com/toolkit">Explore the toolkit →</a></article></div></section>
<section id="contact" class="ah-closing" data-ground="red" aria-labelledby="contact-title"><div class="ah-wrap"><h2 id="contact-title">Want this built for your team?</h2><div><p>Bring us the messy workflow. We'll turn it into a tested, repeatable Claude skill.</p><a class="ah-button ah-button--light" href="${destinationRegister.liveInquiry}" data-dialog="contact">Talk to us →</a><small>We reply to arrange a first conversation, then map one workflow, its source material and review points before recommending any build.</small></div></div></section>
</div>`;
}
