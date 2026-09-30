/** Existing Found42 material recovered from Drive; provenance is recorded in docs/resource-sources.md. */
export const starterSkills = [
  {
    id: "exec-comms-reviewer",
    title: "Executive communications reviewer",
    file: "exec-comms-reviewer.skill",
    description: "Review an executive message before sending it.",
  },
  {
    id: "strategy-teardown",
    title: "Strategy teardown",
    file: "strategy-teardown.skill",
    description:
      "Critically assess partner, ecosystem and channel strategies against the supplied evidence.",
  },
  {
    id: "strategic-advisor",
    title: "Strategic advisor",
    file: "strategic-advisor.skill",
    description:
      "Pressure-test a decision with role-specific perspectives, a context template and scenario prompts.",
  },
  {
    id: "context-audit",
    title: "Context audit",
    file: "context-audit.skill",
    description:
      "Check Claude’s assumptions, review stale context and run a calibration interview.",
  },
] as const;

/** Selected method excerpts; source drafts’ unverified case studies and numerical claims are omitted. */
export const essays = [
  {
    title: "Reduce Shadow AI Risk: The Guardrail-to-Greenlight Method",
    description:
      "Route recurring AI tasks through approved paths, then turn unmet demand into governed workflows.",
    sections: [
      {
        title: "Route the work",
        paragraphs: [
          "The label isn’t the real problem. The problem is the gap the label points to. You can publish a policy and still have AI use happening all over the place where it shouldn’t.",
          "Definition: The Guardrail-to-Greenlight Loop is a workflow that detects high-risk AI interactions at the moment of use, routes them through pre-approved paths, and turns recurring “shadow” demand into sanctioned capability with measurable controls.",
        ],
      },
      {
        title: "Make the approved path usable",
        paragraphs: [
          "The Loop only works when it runs in order. Detection without a path just pushes behavior underground.",
          "Shadow AI sticks around when policy lives in a document and safety adds time. It starts to fade when the safe route is also the fast route.",
        ],
      },
      {
        title: "Map tasks and data",
        paragraphs: [
          "Build a Shadow AI Interaction Map. The output is a one-page routing table. Have Security and IT list the top 10 AI-supported tasks they see in the business, like editing, summarization, ticket triage, coding help, and customer email drafts. List the top 10 data types employees touch, like PII, customer contracts, financials, source code, and product roadmap. For each task/data pairing, assign one of three paths: Sanctioned Internal, Allow-but-Filter, or Block-with-Request.",
        ],
      },
      {
        title: "Review the demand",
        paragraphs: [
          "Next step: the CISO (or Head of Security Governance) schedules a 45-minute monthly “AI Routing Review” starting next month. Security, IT, and Legal approve one new sanctioned workflow and retire one unclassified AI tool from the environment. Track month over month whether “unapproved AI tool” detections drop while the count of logged AI interactions stays flat or goes up.",
        ],
      },
    ],
  },
  {
    title: "Preventing the Moral Crumple Zone: Verifiable AI Delegation",
    description:
      "Define what can be verified, who owns the result and when an agent must stop.",
    sections: [
      {
        title: "Require a verifiable outcome",
        paragraphs: [
          "Contract-First Decomposition answers one gatekeeping question before delegation happens: Can you prove the agent did this correctly? A task can only be delegated if three things are documented in writing before execution. The outcome must be verifiable. The scope must be bounded and measurable. Accountability for failure must be assigned to a named role with the resources and authority to intervene.",
          'Contract-First Decomposition makes verifiability a hard requirement. If a subtask is too subjective, too expensive, or too complex to verify, it needs further breakdown before delegation is appropriate. This forces organizations to either restructure the task into verifiable pieces or keep it human-owned. The question changes from "Can the AI do this?" to "Can we prove the AI did this correctly?"',
        ],
      },
      {
        title: "Keep the boundary explicit",
        paragraphs: [
          "The contract becomes the agent's operational boundary. Any decision or data not explicitly mentioned stays human-owned. Any output that fails the verification criteria triggers immediate escalation.",
          "For agents labeled \"Requires Restructuring,\" reverse-engineer the task into verifiable components. Often this reveals the task can't be cleanly decomposed. That's a signal it should stay human-owned. The organization has eliminated a deployment risk.",
        ],
      },
      {
        title: "Monitor the scope",
        paragraphs: [
          "Implement a real-time monitoring trigger. If the agent attempts an action outside its scope, the system halts execution and escalates to the named owner immediately. Logging captures every decision, every data source queried, and every outcome. Audit the logs weekly to detect behavioral drift—patterns suggesting the agent is working around ambiguous instructions.",
        ],
      },
      {
        title: "Audit the highest-stakes work",
        paragraphs: [
          "Next step: The operations lead responsible for production AI systems should audit the three highest-stakes agents (those affecting customer decisions, revenue, or compliance) using these verification questions by end of week. For each one, document the decision or task owned, current success measurement, named ownership, and whether outcome verification is possible within 30 days. Count how many agents fail the verification test. That number is your governance gap.",
          "Without verifiable outcomes, accountability becomes diffuse and failure modes stay invisible until they cost real money.",
        ],
      },
    ],
  },
  {
    title:
      "Make Every Individual Contributor More Powerful: The Partner Architecture Blueprint",
    description:
      "Keep permissions, context and human approval coherent as AI work moves between applications.",
    sections: [
      {
        title: "Design around connected work",
        paragraphs: [
          "So the real problem isn’t “how do you deploy AI.” The real problem is designing an augmented office as a partner architecture, with tools, agents, and human champions, without triggering AI sprawl, “agentwashing,” or a new layer of work that eats the time you were supposed to get back.",
          "The default playbook is “pick a tool, run pilots, write a policy.” It works until today’s conditions break it, because it assumes each AI experience can be separated from the rest of the work system. Your work can’t be separated. Knowledge work is cross-application by default (calendar → email → docs → CRM/ERP). AI value depends on context continuity and permissioning, so a tool-by-tool rollout creates duplicated effort, inconsistent access, and governance bottlenecks.",
        ],
      },
      {
        title: "Keep the boundaries intact",
        paragraphs: [
          "Partner architecture isn’t “more AI.” It’s a controlled way to let work move across apps while permissioning, context, and accountability stay intact.",
        ],
      },
      {
        title: "Name who approves",
        paragraphs: [
          "If you can’t draw who approves an AI output and where it can write back, you don’t have an augmented office. You have scattered tools.",
        ],
      },
      {
        title: "Review capabilities before expanding",
        paragraphs: [
          "Next step: The Head of IT (or CIO) runs a 45-minute weekly “Assistant/Agent Intake” review every Tuesday for the next 6 weeks, approving new AI requests only after they’re entered into the assistant-vs-agent register with the systems touched and the allowed output type. Watch for one observable outcome: the number of AI tools in use stabilizes while the share of usage in a standardized, permissioned pathway increases. Fewer one-off pilots, more repeatable deployments.",
        ],
      },
    ],
  },
] as const;
