/** Lovable content baseline, captured 2026-09-16. Full provenance is in artifacts/lovable-migration. */
const resourceInventory = [
  {
    id: "scorecard",
    title: "AI Readiness Scorecard",
    description:
      "Assess your current AI use, data practices and workflow readiness before deciding where to focus.",
    outcome: "A 5-minute operational baseline",
    gate: "Free · 12 yes-or-no questions · No email required. Answers stay in your browser.",
    action: "Take the scorecard",
  },
  {
    id: "playbook",
    title: "Failure Mode Playbook",
    description:
      "Spot weak outputs, missing context, and false confidence before they reach the business.",
    outcome: "12 checks for safer adoption",
    gate: "Free resource · Work email requested. Delivery is not connected in this preview.",
    action: "Explore the playbook",
  },
  {
    id: "library",
    title: "Skills Starter Library",
    description:
      "Start with reusable skills for analysis, synthesis, review, and decision support.",
    outcome: "Four working skill patterns",
    gate: "Free resource · Work email requested. Delivery is not connected in this preview.",
    action: "Explore the library",
  },
  {
    id: "course",
    title: "Strategic Advisor Mini-Course",
    description:
      "Build a disciplined thinking partner that challenges assumptions and sharpens decisions.",
    outcome: "Five practical daily lessons",
    gate: "Free 5-day mini-course · Work email requested. Enrollment is not connected in this preview.",
    action: "Explore the mini-course",
  },
];
/**
 * Said once wherever an opening's lead names Claude. The visitors the site is
 * for, non-technical teams and their executives, are the least likely to know
 * the product by name.
 */
export const claudeGloss = "Claude is Anthropic’s AI assistant.";
/** Provisional later meeting sequence (03:56–04:22); Executive Communications awaits a real offering. */
export const resources = [
  resourceInventory[0],
  resourceInventory[3],
  resourceInventory[2],
  resourceInventory[1],
];
export const services = [
  {
    title: "Workshops",
    label: "Build capability in your own work.",
    description:
      "Live or on-demand enablement using your team’s real decisions, documents, and operating rhythms.",
    details: [
      "Role-specific practice",
      "Reusable skills, not prompt lists",
      "Manager rollout guidance",
    ],
    context:
      "Teams learn on their own work, not on demo prompts. Practice with the responsibilities, terminology and review standards of your role, your industry and your company.",
  },
  {
    title: "Workflows",
    label: "Make your expertise repeatable.",
    description:
      "Custom Claude skills and plugins designed around one high-value job to be done.",
    details: [
      "Discovery",
      "Co-design skills & plugins",
      "Testing & failure-mode review",
    ],
    context:
      "Your source material, examples and quality bar shape a system your team can use. Executives bring the operating problem; they do not need to become developers.",
  },
  {
    title: "Automations",
    label: "Return attention to expert work.",
    description:
      "Bespoke end-to-end workflows for repetitive work that should not consume expert attention.",
    details: [
      "Human review points",
      "System handoffs",
      "Target: 8 hours saved weekly",
    ],
    context:
      "Eight hours is a target where workflow fit supports it, not a guaranteed result. Keep judgment and human interaction with people while reducing repetitive work.",
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
        label: "See how workshops work",
        href: "services/#service-training",
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
    aside: "8h",
    asideTitle: "Target weekly capacity returned",
    asideBody: "Per person, where workflow fit supports it.",
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
export const essays = [
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
