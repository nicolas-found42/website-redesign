/**
 * The facts every version of the site shares: who Found42 is, what it has
 * published and what people have said. A version may change how these are
 * presented, never what they say; one that must change a fact declares it in
 * its `version.json` (`changesFacts`) so reviewers know they are judging copy.
 *
 * Shared code never imports from a version folder.
 */

/** Every active learning or resource destination the site is allowed to publish. */
export const destinationRegister = {
  executiveCourse: "https://maven.com/richard-achee/four-hour-ai",
  strategicAdvisorLesson:
    "https://maven.com/p/fc1def/build-a-strategic-advisor-in-claude",
  toolkit: "https://www.found42.com/toolkit",
  failureModePlaybook: "https://www.found42.com/ai-failure-modes-playbook",
  liveInquiry: "https://www.found42.com/contact",
} as const;

/**
 * The direct channels found42.com/contact already publishes, so a visitor
 * ready to talk can reach a person without going through the form.
 */
export const directContact = {
  email: "richard@found42.com",
  phone: "(646) 300-1247",
  tel: "+16463001247",
} as const;

/** Founder account supplied with the catalog, adapted for a public reader. */
export const catalogBiography = [
  "Richard Achée spent over 15 years at Google in business development across Enterprise, Education and Infrastructure. He founded Found42 to bring operator discipline to AI adoption for business leaders and their teams.",
  "He also serves as Head of Partnerships at Edgescale AI, where he works on AI in edge infrastructure, and founded BreakBeatCode, a nonprofit that has taught coding through music to more than 56,000 students in 51 countries.",
  "Richard has advised founders through three company exits since 2020. He brings an educator’s voice to each engagement: clear, direct and built around what the team needs to change in its work.",
] as const;
/** Founder biography as published; industry pages quote lines from it. */
export const biography = [
  "Richard has over two decades of experience leading teams and driving innovation in enterprise across three continents.",
  "As an M&A business sponsor, he closed two successful strategic acquisitions at Google: Cameyo and Neverware.",
  "As a business development leader, he helped dozens of start-ups grow from solopreneurs to category leaders.",
  "As a board advisor and fractional GTM lead, he has supported lean start-ups in the US, EMEA, and APAC.",
  "Richard now channels his business expertise, lifelong love of coaching and mentoring, and teacher’s mindset to help everyone learn how to use AI effectively to address their most pressing challenges.",
  "His expansive network of founders, fractional CxOs, domain experts, and strategic partners creates opportunities to bring the right skills and experience to meet each person at their point of need.",
];
export const principles = [
  ["Start narrow", "One meaningful workflow beats twenty shallow demos."],
  [
    "Design for failure",
    "A skill is only useful when the team knows where it can break.",
  ],
  [
    "Leave capability",
    "The people doing the work should understand, own, and improve the system.",
  ],
];

/**
 * #147: one attribution for Robb Henshaw, shared by the homepage testimonial
 * and the services catalog quote so the two surfaces cannot drift apart.
 */
export const robbHenshawAttribution =
  "CMO, Edgescale AI; former Co-Founder and CMO, Cameyo (acquired by Google)";

export const testimonials = [
  {
    name: "Robb Henshaw",
    role: robbHenshawAttribution,
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
