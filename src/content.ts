import { sitePath } from "./paths";

/** Every active learning or resource destination the site is allowed to publish. */
export const destinationRegister = {
  executiveCourse: "https://maven.com/richard-achee/four-hour-ai",
  strategicAdvisorLesson:
    "https://maven.com/p/fc1def/build-a-strategic-advisor-in-claude",
  toolkit: "https://www.found42.com/toolkit",
  failureModePlaybook: "https://www.found42.com/ai-failure-modes-playbook",
  scoreApp: "https://found42.scoreapp.com/",
  liveInquiry: "https://www.found42.com/contact",
} as const;

/**
 * The direct channels found42.com/contact already publishes (recorded in
 * `docs/contexts/inquiries/AUDIT.md`), so a visitor ready to talk can reach a
 * person without going through the form.
 */
export const directContact = {
  email: "richard@found42.com",
  phone: "(646) 300-1247",
  tel: "+16463001247",
} as const;

/**
 * The public free-resource inventory. Availability and destination are owned
 * together so a homepage preview and the complete resource page cannot drift
 * into promising something different. Unfulfilled source offerings stay in the
 * register as unavailable rather than presenting an email form that sends nowhere.
 */
const resourceInventory = [
  {
    id: "scorecard",
    title: "AI Readiness Scorecard",
    description:
      "Assess your current AI use, data practices and workflow readiness before deciding where to focus.",
    outcome: "A readiness stage and practical next steps",
    gate: "Free · 12 yes-or-no questions · No email required. Answers stay in your browser.",
    action: "Take the scorecard",
    status: "available",
  },
  {
    id: "toolkit",
    title: "C-Level AI Toolkit",
    description:
      "Explore workshop video, slides, fictional practice cases and custom GPT links built for executive AI practice.",
    outcome: "Public workshop materials and practice exercises",
    gate: "Public page · Some custom GPT links require a ChatGPT account.",
    action: "Explore the toolkit",
    status: "available",
    href: destinationRegister.toolkit,
  },
  {
    id: "playbook",
    title: "AI Failure Modes Playbook",
    description:
      "Spot weak outputs, missing context, and false confidence before they reach the business.",
    outcome: "A request for the published playbook",
    gate: "Free resource · The published request form asks for your work email and LinkedIn profile.",
    action: "Request the published AI Failure Modes Playbook",
    status: "available",
    href: destinationRegister.failureModePlaybook,
  },
  {
    id: "library",
    title: "Skills Starter Library",
    description:
      "Role-specific working skills for analysis, synthesis, review and decision support.",
    outcome: "No starter files are available yet",
    gate: "Unavailable · The published library and delivery route are still being prepared.",
    action: "Ask us about the library",
    status: "unavailable",
  },
  {
    id: "course",
    title: "Strategic Advisor Mini-Course",
    description:
      "A planned five-day mini-course for turning Claude into a disciplined thinking partner.",
    outcome: "The five-day mini-course is not available",
    gate: "Unavailable · A verified public lesson exists, but it is not this five-day course.",
    action: "Read the verified lesson",
    status: "unavailable",
    href: destinationRegister.strategicAdvisorLesson,
  },
] as const;

export type PublicResource = (typeof resourceInventory)[number];
/**
 * What follows a consultation inquiry, told wherever one can be started. Each
 * step restates published wording: the live form's promise to get back to the
 * visitor, and the mapping the industry pages promise before any build. It
 * never implies a booked meeting; that needs a verified booking flow first.
 */
export const inquirySteps = [
  "You send an inquiry through Found42’s contact form.",
  "Found42 replies to arrange a first conversation.",
  "That conversation maps one workflow, its decision, source material, failure modes and review points, before any build is recommended.",
] as const;
/**
 * Said once wherever an opening's lead names Claude. The visitors the site is
 * for, non-technical teams and their executives, are the least likely to know
 * the product by name.
 */
export const claudeGloss = "Claude is Anthropic’s AI assistant.";
/** The complete, honest resource inventory used by the Free Resources page. */
export const resources = resourceInventory;
/**
 * Each service's `engagement` restates what the site already publishes about
 * that service (its description, scope and context) as what an engagement
 * starts with, asks of the client and leaves behind. No length, price or tier:
 * the September 23 stand-up added none, and they await the business owner
 * (Launch dependency 10).
 */
/** The live form's current service-interest vocabulary, separate from public names. */
export const inquiryInterests = {
  workshops: { form: "Training", carry: "Workshops" },
  workflows: { form: "Automation", carry: "Workflows" },
  automations: { form: "Automation", carry: "Automations" },
  "ai-builder-support": { form: "Automation", carry: "AI builder support" },
  "c-level-ai": { form: "Training", carry: "the C-Level AI track" },
  analysts: { form: "Training", carry: "the Analysts track" },
  "gtm-teams": { form: "Training", carry: "the GTM Teams track" },
  "ai-builders": { form: "Training", carry: "the AI Builders track" },
  "role-based": { form: "Training", carry: "Customized Role-Based Training" },
  "free-session": { form: "Training", carry: "a free 30-minute session" },
} as const;

export type InquiryContext = keyof typeof inquiryInterests;

export const services = [
  {
    title: "Workshops",
    inquiryInterest: "Training",
    inquiryContext: "workshops",
    label: "Build capability in your own work.",
    description:
      "Live or on-demand enablement using your team’s real decisions, documents, and operating rhythms.",
    details: [
      "Live guided practice on real work",
      "Reusable skills and review points",
      "An applicable takeaway for the team",
    ],
    context:
      "Teams learn on their own work, not on demo prompts. Practice with the responsibilities, terminology and review standards of your role, your industry and your company.",
    engagement: {
      startsWith:
        "The role: its responsibilities, terminology and review standards.",
      youProvide:
        "Your team’s real decisions and documents, to practise on instead of demo prompts.",
      youGet:
        "Live or on-demand practice for the role, reusable skills rather than prompt lists, and rollout guidance for managers.",
    },
  },
  {
    title: "Workflows",
    inquiryInterest: "Automation",
    inquiryContext: "workflows",
    label: "Make your expertise repeatable.",
    description:
      "Custom Claude skills and plugins designed around one high-value job to be done.",
    details: [
      "Your brief and operating problem",
      "Tailored design, build and testing",
      "A workflow the team can deploy",
    ],
    context:
      "Your source material, examples and quality bar shape a system your team can use. Executives bring the operating problem; they do not need to become developers.",
    engagement: {
      startsWith: "Discovery around one high-value job to be done.",
      youProvide:
        "The operating problem, your source material, examples and quality bar. No development work.",
      youGet:
        "Custom Claude skills and plugins, co-designed with your team and tested with a failure-mode review.",
    },
  },
  {
    title: "Automations",
    inquiryInterest: "Automation",
    inquiryContext: "automations",
    label: "Return attention to expert work.",
    description:
      "Bespoke end-to-end workflows for repetitive work that should not consume expert attention.",
    details: [
      "Repetitive work and system handoffs",
      "Human direction and review points",
      "A usable output the team can rely on",
    ],
    context:
      "Map the repetitive process, keep people in control at the handoffs that need judgment, and give the team an output they can use. The scope and expected time depend on the workflow.",
    engagement: {
      startsWith:
        "The repetitive work that should not consume expert attention, mapped before any build is recommended.",
      youProvide:
        "The workflow, the systems it passes between, and the people who review its results.",
      youGet:
        "An end-to-end workflow with human review points and system handoffs.",
    },
  },
];
export const testimonials = [
  {
    quote:
      "What stood out in the C-Level AI workshop was how practical it was.",
    label:
      "Paul Keely · Co-founder / Managing Director, Palladium Security LLC",
  },
  {
    quote:
      "The sessions were engaging and interactive, which made learning enjoyable.",
    label: "Carmen Paredes Ramirez · Founder & CEO of Ruruka and Maraja",
  },
];
/**
 * The service catalog: what Found42 sells, to whom, in which formats, and the
 * price each format starts at. Adapted from Found42's own catalog, without any
 * client-specific terms. Prices are starting points only; every engagement gets
 * a fixed quote after a free discovery assessment.
 */
export const serviceCatalog = {
  tracks: [
    {
      id: "c-level-ai",
      name: "C-Level AI",
      audience: "C-level executives, owners, partners and principals.",
      assets: [
        "A personalized Chief of Staff Claude plugin",
        "Skills including a Daily Briefing, Executive Coaching, Meeting Killer and Automated Meeting Follow-Up",
      ],
      format: "Virtual or in person",
    },
    {
      id: "analysts",
      name: "Analysts",
      audience: "Deal teams, FP&amp;A, research and financial analysts.",
      assets: [
        "Role-specific Claude Skills and plugins that automate key analyst work: CIM-to-deal memo, portfolio scrubbing, pitch narratives, and deck generation that follows strict presentation templates",
        "Deal materials handled under NDA",
      ],
      format: "Virtual or in person",
    },
    {
      id: "gtm-teams",
      name: "GTM Teams",
      audience: "Sales, business development, marketing and revenue operations.",
      assets: [
        "A personalized set of 10 role-specific Claude Skills and plugins for lead generation, account-based marketing (ABM), contact enrichment and pipeline analysis",
        "A library of more than 200 GTM Skill templates",
      ],
      format: "Virtual or in person",
    },
    {
      id: "ai-builders",
      name: "AI Builders",
      audience:
        "Designated AI champions and advanced users who are not engineers. The track takes them from using AI to building it.",
      assets: [
        "Personalized Claude Skills and automations to build, deploy and maintain AI agents inside your organization",
        "Train-the-trainer content",
        "A library of Claude Skills and Claude Code automations: Meeting Debrief Coach, Weekly AI Wins Capture Agent and Competitive Intelligence Digest",
        "A Chief of Staff toolkit: Daily Briefing, Weekly Briefing and Post-Meeting Automations",
        "Failure mode training, live debugging sessions and engineering best practices for builders who are not engineers",
      ],
      format: "Virtual or hybrid: in person, virtual and on demand",
    },
    {
      id: "role-based",
      name: "Customized Role-Based Training",
      audience: "Any function the other tracks don’t cover.",
      assets: [
        "A personalized set of 10 role-specific Claude Skills and plugins tailored to the job function",
      ],
      format: "Virtual or in person",
    },
  ],
  formats: [
    {
      name: "Open enrollment",
      mode: "Virtual",
      detail:
        "A public cohort with a mixed audience from several companies, for the standard tracks: C-Level AI, GTM Teams and AI Builders.",
      terms: "Per seat, minimum 10 seats",
      from: "$599",
      unit: "per seat",
    },
    {
      name: "Private cohort",
      mode: "Virtual",
      detail: "A dedicated half-day session for one company or a group of companies.",
      terms: "Flat fee, up to 20 seats",
      from: "$8,500",
      unit: "per cohort",
    },
    {
      name: "Private workshop",
      mode: "In person",
      detail:
        "A hands-on half or full day on site. Time, materials and travel are included.",
      terms: "Flat fee, up to 25 seats",
      from: "$12,000",
      unit: "per workshop",
    },
    {
      name: "Function clinic",
      mode: "Virtual",
      detail: "A focused 90-minute session on a single function.",
      terms: "Flat fee, up to 20 people",
      from: "$3,500",
      unit: "per clinic",
    },
    {
      name: "Executive 1:1",
      mode: "Virtual",
      detail:
        "Six weeks, one to one, building a customized AI system inside the executive’s own inbox, calendar and tools, with personalized training.",
      terms: "One executive, six weeks",
      from: "$5,000",
      unit: "flat fee",
    },
    {
      name: "Custom role-based program",
      mode: "Virtual",
      detail:
        "Discovery, findings, clinics and automation builds for one or more functions the tracks don’t cover.",
      terms: "Scoped to the work",
    },
  ],
  beyondTraining: [
    {
      name: "Custom build",
      detail:
        "A durable set of customized assets, such as multi-skill plugins, automation workflows and build guides, that your team keeps using after training.",
      terms: "Per build",
      from: "$6,000",
      unit: "per build",
    },
    {
      name: "Advisory retainer",
      detail:
        "A standing monthly relationship with the group that governs AI across your company or portfolio.",
      terms: "Three-month minimum",
      from: "$9,000",
      unit: "per month",
    },
    {
      name: "Advisory facilitation",
      mode: "Virtual or in person",
      detail:
        "One half-day or full-day working session that produces a governance policy grid and an enablement plan.",
      terms: "Per session",
      from: "$8,500",
      unit: "per session",
    },
    {
      name: "Annual program",
      detail:
        "A customized bundle of virtual or in-person cohorts, builds and advisory across a year, for a company or a portfolio.",
      terms: "Scoped to the work",
    },
  ],
  freeSessions: [
    {
      name: "Claude as a Strategic Advisor",
      outcome: "A configured strategic advisor, demonstrated live on an M&amp;A case study.",
    },
    {
      name: "Claude for High-Stakes Communications",
      outcome: "A reusable review pattern for email: tone, risks and revisions.",
    },
  ],
  quotes: [
    {
      quote:
        "Richard’s C-Level AI workshop went beyond theory. It helped me turn ChatGPT into a trusted advisor in less than an hour.",
      name: "Andrew Miller",
      role: "Former co-founder and CEO, Cameyo (acquired by Google)",
    },
    {
      quote: "C-Level AI is a completely unique approach that cuts through the AI hype.",
      name: "Robb Henshaw",
      role: "CMO, Edgescale AI",
    },
    {
      quote:
        "What stood out in the C-Level AI workshop was how practical it was. The exercises turned AI from concept to execution.",
      name: "Paul Keely",
      role: "Co-founder and managing director, Palladium Security",
    },
  ],
} as const;
export const questions = [
  {
    text: "How repeatable is the work you want to improve?",
    options: [
      "Different every time",
      "Some patterns exist",
      "Highly repeatable",
    ],
  },
  {
    text: "How clear is a good output?",
    options: ["Mostly subjective", "Examples exist", "A clear standard exists"],
  },
  {
    text: "How safely can a person review the result?",
    options: ["Hard to verify", "Needs specialist review", "Quick to verify"],
  },
  {
    text: "How often does the team do this work?",
    options: ["Monthly", "Weekly", "Daily"],
  },
];
export const results = [
  {
    title: "Clarify before building",
    body: "The opportunity may be real, but the work needs a clearer standard or safer review path first.",
  },
  {
    title: "Promising, with guardrails",
    body: "Start with a narrow task, define examples, and keep a human review step while the skill improves.",
  },
  {
    title: "Strong first workflow",
    body: "You have the repetition, quality bar, and review capacity needed for a useful Claude skill.",
  },
];
/**
 * The AI Readiness Scorecard, answered on the page.
 *
 * Questions: the Plan B assessment in Found42's "Scorecard Questions" draft
 * (June 25–26, 2026), the separate-assessment structure the June 26 stand-up
 * adopted, grouped under the five areas the ScoreApp landing advertises. The
 * two cost and fit questions describe what has held a business back, so they
 * shape the advice rather than the stage. The stages, area statuses and advice
 * are editorial drafts awaiting Found42's own scorecard outcomes; following the
 * June 26 discussion, the result is a stage and next steps, never a score.
 * Link destinations are site paths, resolved by `sitePath()` where they render.
 */
export const scorecard = {
  areas: [
    {
      id: "tools",
      name: "Current AI use",
      questions: [
        "Do you currently use any AI tools to automate repetitive tasks in your business?",
        "Have you tried using an AI tool in your business and kept using it past the first week?",
      ],
      advice:
        "Pick one repetitive task and use an AI tool on it for two weeks, so the team judges from real experience.",
      link: {
        label: "Explore the Skills Starter Library",
        href: "resources/#library",
      },
    },
    {
      id: "data",
      name: "Data practices",
      questions: [
        "Is your data stored in a centralized location accessible to your team?",
        "Do you have policies on what data can be shared with AI tools?",
      ],
      advice:
        "Decide where the source material for that task lives, and what may be shared with AI tools, before building on it.",
    },
    {
      id: "workflow",
      name: "Workflow efficiency",
      questions: [
        "Are your business processes already digitized and standardized?",
        "Have you identified any specific tasks that could benefit from automation?",
      ],
      advice:
        "Write one process down step by step. A standard your team already follows is what a skill can repeat.",
    },
    {
      id: "team",
      name: "AI integration readiness",
      questions: [
        "Do you have clear policies on which AI tools can be used at work?",
        "Is your team trained to utilize AI tools for process improvement?",
        "If you rolled out one new automation tomorrow, would your team actually use it without you pushing them to?",
      ],
      advice:
        "Agree which AI tools are approved, and give the people who will use them practice on their own work.",
      link: {
        label: "See the training tracks",
        href: "services/#tracks",
      },
    },
    {
      id: "goals",
      name: "Automation goals",
      questions: [
        "Do you have a process for deciding which tasks are worth automating?",
      ],
      advice:
        "Choose the work worth changing with a simple test: it repeats, a good result is clear, and a person can check it quickly.",
    },
  ],
  barriers: [
    {
      id: "cost",
      question:
        "Have you ever decided against trying an AI tool because of the cost?",
      advice:
        "Cost has stopped you before, so start with the free resources and one narrow workflow before committing to a larger build.",
    },
    {
      id: "fit",
      question:
        "Have you ever decided against trying an AI tool because you weren’t sure it would work for your business?",
      advice:
        "Not being sure it would work is a reason to test one workflow with a person reviewing every result before relying on it.",
      link: {
        label: "See the Failure Mode Playbook",
        href: "resources/#playbook",
      },
    },
  ],
  open: "What would you like to automate instantly?",
  /** Chosen by how many of the ten area questions are answered yes. */
  stages: [
    {
      from: 0,
      title: "Early days",
      body: "Most of the foundations are still ahead, which is where many businesses begin. Start with one repetitive task and the basics that make it safe to try.",
    },
    {
      from: 4,
      title: "Foundations forming",
      body: "Some foundations are in place. Closing the gaps below first will make a first workflow easier to build and to trust.",
    },
    {
      from: 7,
      title: "Ready for a first workflow",
      body: "Most foundations are in place. Choose one repeated, reviewable task and build a skill around it, with a person checking the result.",
    },
    {
      from: 9,
      title: "Ready to scale",
      body: "The foundations are in place. The next gains come from connecting workflows and keeping review points where judgment matters.",
    },
  ],
} as const;
export const industries = {
  "private-equity": {
    name: "Private Equity",
    title: "More signal per deal.",
    intro:
      "Claude skills for the work between the data room and the decision, designed around evidence, judgment, and review.",
    heading: "High context. Clear controls.",
    aside: "1st",
    asideTitle: "A consistent first-pass screen",
    asideBody:
      "Your house view, applied the same way to every deal, with judgment left to the deal team.",
    items: [
      [
        "Deal screening",
        "Turn a house view into a consistent first-pass screen without flattening judgment.",
      ],
      [
        "Diligence synthesis",
        "Structure source-grounded findings across commercial, operational, and market workstreams.",
      ],
      [
        "Portfolio operations",
        "Give operating teams repeatable skills for reviews, plans, and performance narratives.",
      ],
      [
        "Custom skills",
        "Encode the firm’s criteria, review steps, and language into the work itself.",
      ],
    ],
    context:
      "For investment leaders, the value is a usable system shaped around the firm’s house view and review process. For deal and operating teams, training uses their source material, criteria and decision standards. Human judgment stays with the people accountable for the decision.",
    cta: "Bring us one live workflow.",
    ctaBody:
      "We’ll map the decision, source material, failure modes, and review points before recommending a build.",
  },
  "b2b-saas": {
    name: "B2B SaaS",
    title: "Make expertise repeatable.",
    intro:
      "Claude skills for customer, product, and go-to-market teams, built to improve throughput without making the work generic.",
    heading: "Closer to customers. Faster to action.",
    aside: "1→N",
    asideTitle: "Turn expert practice into team practice",
    asideBody: "",
    items: [
      [
        "Customer success",
        "Turn account context into sharper briefs, risk reviews, and consistent follow-through.",
      ],
      [
        "Feedback triage",
        "Group signal without losing the customer language product teams need to hear.",
      ],
      [
        "GTM enablement",
        "Build reusable skills for research, account planning, call review, and message testing.",
      ],
      [
        "Team adoption",
        "Train operators on the same quality bar, then improve it with real examples.",
      ],
    ],
    context:
      "For SaaS leaders, adopt repeatable systems around the customer work that matters. For customer success, product and GTM teams, practice with your account context, customer language and real examples. Your company’s quality bar guides the output; people own the customer relationship.",
    cta: "Choose one customer workflow.",
    ctaBody:
      "We’ll show you where Claude can add speed, where judgment stays human, and what a safe first build looks like.",
  },
};
export const biography = [
  "Richard has over two decades of experience leading teams and driving innovation in enterprise across three continents.",
  "As an M&A business sponsor, he closed two successful strategic acquisitions at Google: Cameyo and Neverware.",
  "As a business development leader, he helped dozens of start-ups grow from solopreneurs to category leaders.",
  "As a board advisor and fractional GTM lead, he has supported lean start-ups in the US, EMEA, and APAC.",
  "Richard now channels his business expertise, lifelong love of coaching and mentoring, and teacher’s mindset to help everyone learn how to use AI effectively to address their most pressing challenges.",
  "His expansive network of founders, fractional CxOs, domain experts, and strategic partners creates opportunities to bring the right skills and experience to meet each person at their point of need.",
];
/**
 * The founder biography lines an industry page quotes: the published
 * experience closest to that reader's work. They stay biography, not a client
 * record or an employer's endorsement (see the Credibility audit).
 */
export const industryFounder: Partial<
  Record<keyof typeof industries, readonly string[]>
> = {
  "private-equity": [biography[1], biography[0]],
};
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
 * Forthcoming essays. The Lovable source gives each a reading time; it shows
 * only once an essay has a published `href`, so an unwritten essay is not
 * timed. Until then each reads "Coming soon".
 */
export const essays: {
  title: string;
  description: string;
  minutes: string;
  href?: string;
}[] = [
  {
    title: "Why prompt libraries fail teams",
    description:
      "A folder of clever instructions is not an operating system. Skills need context, examples, and ownership.",
    minutes: "07",
  },
  {
    title: "The first workflow test",
    description:
      "Four questions that reveal whether a task is ready for Claude, or still too ambiguous to automate.",
    minutes: "05",
  },
  {
    title: "Design the failure review first",
    description:
      "How to make weak outputs visible before they become polished, plausible mistakes.",
    minutes: "09",
  },
];
