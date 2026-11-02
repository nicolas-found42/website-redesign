/** Approved October 2026 scorecard source; provenance in artifacts/review-tickets/170/. */
export type ReadinessQuestion = {
  id: string;
  cat: number | null;
  text: string;
  opts: readonly { label: string; points: number | null }[];
  low?: string;
  fix?: string;
};
export const scorecardQuestions: readonly ReadinessQuestion[] = [
  {
    id: "P1",
    cat: null,
    text: "Which AI assistant do you use most at work?",
    opts: [
      {
        label: "Claude",
        points: null,
      },
      {
        label: "ChatGPT",
        points: null,
      },
      {
        label: "Microsoft Copilot",
        points: null,
      },
      {
        label: "Gemini",
        points: null,
      },
      {
        label: "Other or none",
        points: null,
      },
    ],
  },
  {
    id: "1.1",
    cat: 0,
    text: "Does your company give you an approved AI tool for work?",
    opts: [
      {
        label: "No, or not sure",
        points: 0,
      },
      {
        label: "I use my own personal account",
        points: 1,
      },
      {
        label: "Yes",
        points: 3,
      },
    ],
    low: "AI use is off the books or blocked.",
    fix: "Ask for an approved company AI tool before putting work data into AI.",
  },
  {
    id: "1.2",
    cat: 0,
    text: "How do you mostly use AI at work?",
    opts: [
      {
        label: "Rarely or never",
        points: 0,
      },
      {
        label: "For quick questions, like a search engine",
        points: 1,
      },
      {
        label: "To draft and edit emails or documents",
        points: 2,
      },
      {
        label: "To do whole tasks, like research or meeting prep",
        points: 3,
      },
    ],
    low: "AI is used like a search engine, not a coworker.",
    fix: "Pick one whole task, like account research, and hand it to AI from start to finish.",
  },
  {
    id: "1.3",
    cat: 0,
    text: "Does AI save you real time each week?",
    opts: [
      {
        label: "Not really",
        points: 0,
      },
      {
        label: "A little",
        points: 1,
      },
      {
        label: "Yes, a lot",
        points: 3,
      },
    ],
    low: "AI isn't paying you back in time yet.",
    fix: "Choose the task you repeat most and give it to AI every time this week.",
  },
  {
    id: "2.1",
    cat: 1,
    text: "For tasks you repeat, do you reuse saved AI instructions (like a saved prompt or Claude skill)?",
    opts: [
      {
        label: "No, I start fresh each time",
        points: 0,
      },
      {
        label: "Sometimes",
        points: 1,
      },
      {
        label: "Yes, usually",
        points: 3,
      },
    ],
    low: "Every session starts from zero, so nothing compounds.",
    fix: "Save the instructions you keep retyping as a Claude skill.",
  },
  {
    id: "2.2",
    cat: 1,
    text: "Do you use AI for the regular parts of your job, like research, reports, meeting prep or follow-ups?",
    opts: [
      {
        label: "No",
        points: 0,
      },
      {
        label: "Now and then",
        points: 1,
      },
      {
        label: "Yes, every week",
        points: 3,
      },
    ],
    low: "Your core, recurring work is still done by hand.",
    fix: "Pick the task you do every week and set AI up to do the first draft of it.",
  },
  {
    id: "2.3",
    cat: 1,
    text: "Have you built or set up your own AI skill or workflow?",
    opts: [
      {
        label: "No",
        points: 0,
      },
      {
        label: "I tried, but I don't use it",
        points: 1,
      },
      {
        label: "Yes, and I use it regularly",
        points: 3,
      },
    ],
    low: "No working builds yet, or tools left half-built.",
    fix: "Customise a ready-made skill first, then build your own from it.",
  },
  {
    id: "2.4",
    cat: 1,
    text: "Do any of your AI tasks run automatically on a schedule?",
    opts: [
      {
        label: "No, or not sure",
        points: 0,
      },
      {
        label: "Yes",
        points: 3,
      },
    ],
    low: "AI only works when someone remembers to ask.",
    fix: "Schedule one task, like a weekly market scan, to run while you sleep.",
  },
  {
    id: "3.1",
    cat: 2,
    text: "Is your AI tool connected to apps you use, like email, calendar or shared drives?",
    opts: [
      {
        label: "No, or not sure",
        points: 0,
      },
      {
        label: "Yes, one app",
        points: 2,
      },
      {
        label: "Yes, several",
        points: 3,
      },
    ],
    low: "AI works from copy and paste and can quietly miss data.",
    fix: "Connect the app you use most so AI works from real data.",
  },
  {
    id: "3.2",
    cat: 2,
    text: "Are your work meetings recorded and transcribed?",
    opts: [
      {
        label: "Rarely",
        points: 0,
      },
      {
        label: "Sometimes",
        points: 1,
      },
      {
        label: "Most of them",
        points: 3,
      },
    ],
    low: "Follow-up workflows have nothing to work from.",
    fix: "Record and transcribe your key meetings so notes and follow-ups can be drafted for you.",
  },
  {
    id: "3.3",
    cat: 2,
    text: "Do you have templates or good examples you reuse, like a standard deck or brief?",
    opts: [
      {
        label: "No",
        points: 0,
      },
      {
        label: "A few, but scattered",
        points: 1,
      },
      {
        label: "Yes, easy to find",
        points: 3,
      },
    ],
    low: "There's nothing to template from or check AI against.",
    fix: "Save your best deck, brief and follow-up email as reference examples.",
  },
  {
    id: "4.1",
    cat: 3,
    text: "Do you check AI answers against the source before you use them?",
    opts: [
      {
        label: "Rarely",
        points: 0,
      },
      {
        label: "Sometimes",
        points: 1,
      },
      {
        label: "Usually",
        points: 2,
      },
      {
        label: "Always, for anything important",
        points: 3,
      },
    ],
    low: "Made-up facts could reach a client, a colleague or a report.",
    fix: "Check every number, name and quote against the source before it leaves you.",
  },
  {
    id: "4.2",
    cat: 3,
    text: "Do you test a new AI skill or workflow before you rely on it?",
    opts: [
      {
        label: "No, or I don't use any",
        points: 0,
      },
      {
        label: "Sometimes",
        points: 1,
      },
      {
        label: "Yes, always",
        points: 3,
      },
    ],
    low: "A skill that works once can break for everyone else.",
    fix: "Test each new skill on an example where you already know the right answer.",
  },
  {
    id: "4.3",
    cat: 3,
    text: "Do you know the common ways AI gets things wrong, like making up facts?",
    opts: [
      {
        label: "No",
        points: 0,
      },
      {
        label: "Somewhat",
        points: 1,
      },
      {
        label: "Yes",
        points: 3,
      },
    ],
    low: "One bad output can turn a team off AI.",
    fix: "Read the free Failure Mode Playbook so you spot the usual mistakes.",
  },
  {
    id: "4.4",
    cat: 3,
    text: "Does your company have written rules on what customer or company data can go into AI?",
    opts: [
      {
        label: "No, or not sure",
        points: 0,
      },
      {
        label: "Informal guidance only",
        points: 1,
      },
      {
        label: "Yes",
        points: 3,
      },
    ],
    low: "Confidential data could end up in the wrong tool.",
    fix: "Ask for written rules on what customer and company data can go into AI.",
  },
  {
    id: "5.1",
    cat: 4,
    text: "Do you know which tasks you would hand to AI first?",
    opts: [
      {
        label: "Not yet",
        points: 0,
      },
      {
        label: "I have some ideas",
        points: 1,
      },
      {
        label: "Yes, clearly",
        points: 3,
      },
    ],
    low: "There's no clear starting point.",
    fix: "Write down three weekly tasks that eat your time. That's your first build.",
  },
  {
    id: "5.2",
    cat: 4,
    text: "Does anyone on your team have time set aside to build AI workflows?",
    opts: [
      {
        label: "No, or not sure",
        points: 0,
      },
      {
        label: "Someone does it on the side",
        points: 1,
      },
      {
        label: "Yes",
        points: 3,
      },
    ],
    low: "Nobody owns AI workflows, so they aren't maintained.",
    fix: "Give one person a few hours a week to build and look after AI workflows.",
  },
  {
    id: "5.3",
    cat: 4,
    text: "When someone builds a useful AI skill, can the rest of your team use it?",
    opts: [
      {
        label: "No, or not sure",
        points: 0,
      },
      {
        label: "Sometimes, shared in chat or email",
        points: 1,
      },
      {
        label: "Yes, from one shared place",
        points: 3,
      },
    ],
    low: "Good skills get rebuilt instead of shared.",
    fix: "Pick one shared place for skills, with an owner for each.",
  },
];
export const readinessAreas = [
  {
    id: "use",
    name: "How you use AI today",
    desc: "Access, everyday habits and time saved",
    advice: {
      low: "Start with approved access and one daily habit. Install a ready-made skill, like Communication Intelligence, and use it on real emails this week.",
      mid: "You use AI regularly. The next gain comes from handing it whole tasks, like account research or meeting prep, instead of single questions.",
      high: "AI is part of how you work and it saves you real time. Put some of that time into building workflows others can use.",
    },
  },
  {
    id: "reuse",
    name: "Reusable skills and workflows",
    desc: "Saved, repeatable and running on its own",
    advice: {
      low: "Every session starts from scratch. Save your best instructions as a Claude skill so the next run takes seconds, not a re-explanation.",
      mid: "Some of your work is reusable. Turn the task you repeat most into a skill, then put one weekly task on a schedule.",
      high: "You build and reuse skills. Combine related skills into a plugin so your team can install them in one step.",
    },
  },
  {
    id: "context",
    name: "Context and data",
    desc: "Whether AI can see what your work depends on",
    advice: {
      low: "AI is working from copy and paste. Connect one app you live in, like your calendar or shared drive, and start recording key meetings.",
      mid: "AI has some context. Gather your best decks, briefs and follow-ups as reference examples so its output matches your standard.",
      high: "AI has the context it needs. Use your templates as test examples so new skills are checked against your best work.",
    },
  },
  {
    id: "safe",
    name: "Testing and safeguards",
    desc: "Whether AI output is checked before it goes out",
    advice: {
      low: "Fix this area first. Learn the common ways AI goes wrong, check facts against the source, and agree what customer data can go in.",
      mid: "You check some output. Make testing a habit: run every new skill on an example where you already know the right answer.",
      high: "You test and you have clear rules. Write your checks down so others reuse them when they build.",
    },
  },
  {
    id: "team",
    name: "Team and scale",
    desc: "Whether AI work spreads beyond one person",
    advice: {
      low: "AI is a solo effort today. Pick the first tasks to hand over, and name one person with time to build.",
      mid: "Someone is building, mostly on the side. Give them one shared place to publish skills so the team stops rebuilding the same thing.",
      high: "You have an owner and a shared library. You're ready for custom automations that give hours back to the whole team.",
    },
  },
] as const;
export const readinessStages = {
  found: {
    name: "Foundations",
    cls: "s-found",
    n: 1,
    text: "You're at the start. AI shows up in your work now and then, often for quick questions, and little of it is saved, connected or checked. The fastest progress comes from one ready-made skill and knowing how AI goes wrong.",
  },
  build: {
    name: "Ready to build",
    cls: "s-build",
    n: 2,
    text: "You use AI every day, but most of that work isn't reusable, connected or tested yet. This is the point where learning to build your own skills pays off fastest.",
  },
  scale: {
    name: "Ready to scale",
    cls: "s-scale",
    n: 3,
    text: "You build, test and share AI skills, and someone owns them. The next step is automations that run across the team and give hours back every week.",
  },
} as const;
export const readinessOffers = {
  starter: {
    title: "Get the free starter kit",
    body: "If you mostly ask AI quick questions, these three free resources turn it into something you rely on every day.",
    list: [
      "Communication Intelligence: a ready-made Claude skill that sharpens your emails and messages",
      "The Failure Mode Playbook: spot the common ways AI goes wrong before they cost you",
      "Claude as a Strategic Advisor: a free mini course",
    ],
    btn: "Get the free starter kit",
    dest: "the free resources page",
    short: [
      "Get the free starter kit",
      "Free skills, the Failure Mode Playbook and mini courses.",
    ],
  },
  clevel: {
    title: "C-Level AI",
    body: "If your days are full of meetings, email and decisions, C-Level AI installs a working AI chief of staff for you in four hours, so you start each day knowing what matters.",
    list: [
      "A daily view of your top priorities and blind spots",
      "Briefs prepared before your meetings",
      "Follow-ups and tasks pulled out of your calls for you",
    ],
    btn: "See C-Level AI",
    dest: "the C-Level AI page",
    short: [
      "Bring AI to your leadership",
      "C-Level AI gives executives a working AI chief of staff in four hours.",
    ],
  },
  builder: {
    title: "AI Builder for Go-to-Market",
    body: "If you use AI daily but still redo the same research, prep and follow-ups by hand, this hands-on Saturday intensive teaches you to build skills that do that work for you.",
    list: [
      "Install, customise and schedule ready-made skills",
      "Build and test a company research plugin with your group",
      "Take home eight ready-made plugins for go-to-market work",
      "Submit your own plugin for review and earn the AI Builder badge",
    ],
    btn: "See AI Builder for Go-to-Market",
    dest: "the AI Builder for Go-to-Market page",
    short: [
      "AI Builder for Go-to-Market",
      "For sales, marketing, RevOps and strategy roles: learn to build your own skills.",
    ],
  },
  workflows: {
    title: "Workflows built for your role",
    body: "If off-the-shelf AI tools don't fit how you work, we sit down with you and your team, co-design Claude skills for your role, and test them before you rely on them.",
    list: [
      "Discovery with the people who actually do the work",
      "Claude skills and plugins designed around your role and tools",
      "Testing and failure-mode training before rollout",
    ],
    btn: "Talk to us about workflows",
    dest: "the Workflows page",
    short: [
      "Workflows built for your role",
      "We co-design and test Claude skills for how your team works.",
    ],
  },
  automations: {
    title: "Custom automations for your team",
    body: "If your team already builds and shares AI skills, the next hours come back from automations that run without anyone starting them.",
    list: [
      "Discovery with your AI champion and end users",
      "Automations built on the skills you already have",
      "Testing and failure-mode training before rollout",
    ],
    btn: "Talk to us about automations",
    dest: "the consultation booking page",
    short: [
      "Custom automations",
      "Automations that run on their own and give your team hours back.",
    ],
  },
  advanced: {
    short: [
      "AI Builder Advanced",
      "Apps and multi-agent systems for your builders. Join the waitlist.",
    ],
    dest: "the AI Builder Advanced waitlist",
  },
  talk: {
    short: ["Talk to us", "Not sure where to start? Book a short call."],
    dest: "the consultation booking page",
  },
} as const;
export const readinessRoutes = {
  found: {
    exec: ["clevel", "starter", "talk"],
    gtm: ["starter", "clevel", "talk"],
    other: ["starter", "clevel", "talk"],
  },
  build: {
    exec: ["clevel", "workflows", "builder"],
    gtm: ["builder", "workflows", "starter"],
    other: ["workflows", "builder", "starter"],
  },
  scale: {
    exec: ["automations", "workflows", "advanced"],
    gtm: ["automations", "advanced", "builder"],
    other: ["automations", "advanced", "workflows"],
  },
} as const;
export const readinessRoles = [
  "Founder or executive",
  "Sales or business development",
  "Marketing",
  "Revenue operations",
  "Strategy and operations",
  "Finance",
  "HR and people",
  "Product or engineering",
  "Consulting or professional services",
  "Other",
] as const;
export const MAX_TOTAL = 51;
