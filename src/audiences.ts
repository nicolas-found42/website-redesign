/**
 * The audience scenes: three ways the same method lands, drawn three ways.
 *
 * A scene is made in the same hand as the working-system drawings — paper
 * in the site's inks, red for what is human — but each one is its own
 * object rather than the plait with new words on it:
 *
 * - **Executives** use four cards through a working day: Claude Daily Brief,
 *   Meeting Brief, Meeting Debrief and Actions from Transcripts. The final
 *   decision stays with them. These are illustrative, with no live integration.
 * - **Individual Contributors and Teams** each run a ribbon of their own role
 *   through a skill cut for it — four roles in one company — and the four
 *   ribbons run side by side through one gate: the human in the loop.
 * - **Builders** climb a stair folded from card, from a work problem to a
 *   workflow in use, with a reviewer's seal on each step: design, test,
 *   troubleshoot, anticipate failures.
 *
 * A fourth scene, **review**, is the failure-mode gate the playbook explains.
 *
 * This module holds what each scene says — its words, when in its story each
 * is told, what each marks, and what joins what. How it is drawn lives in
 * `art/`, once for a wide field and once for a narrow one.
 */
import { artFor } from "./art";
import { fieldHtml } from "./art/field";
import type { Art, Orientation } from "./art/kit";
import { sitePath } from "./paths";

export type SceneOrientation = Orientation;

export type SceneLabel = {
  /** The piece of the drawing this label names; the drawing places it by this key. */
  readonly key: string;
  readonly text: string;
  readonly kind: "source" | "human" | "result" | "caption" | "control" | "card";
  /** The beat the scene tells it in. */
  readonly beat: number;
};

/** A mark the drawing carries on a labelled piece, and when it arrives. */
export type SceneMark = {
  readonly key: string;
  readonly kind: "source" | "human" | "result" | "person" | "check";
  readonly beat: number;
};

export type Scene = {
  readonly id: string;
  /** What the drawing shows, for anyone who cannot see it. */
  readonly description: string;
  readonly labels: readonly SceneLabel[];
  readonly marks: readonly SceneMark[];
  /**
   * What joins what, as `from>to` label keys. Every link has a piece of the
   * drawing that shows it.
   */
  readonly links: readonly string[];
};

export type Audience = {
  readonly id: string;
  /** The rail label a visitor selects. */
  readonly choice: string;
  /** One line under the rail label: the proposition in the visitor's terms. */
  readonly proposition: string;
  readonly kicker: string;
  readonly title: string;
  readonly body: string;
  /** Three short things this audience gets, from the converged reference. */
  readonly points: readonly [string, string, string];
  readonly caption: string;
  readonly link: { readonly label: string; readonly href?: string };
  /** A release gate or honest interim state beside a not-yet-final route. */
  readonly linkNote?: string;
  readonly scene: Scene;
};

const label = (
  key: string,
  text: string,
  kind: SceneLabel["kind"],
  beat: number,
): SceneLabel => ({ key, text, kind, beat });
const mark = (
  key: string,
  kind: SceneMark["kind"],
  beat: number,
): SceneMark => ({ key, kind, beat });

type SceneContent = Pick<Scene, "labels" | "marks" | "links">;

/* ── Executives: four cards through a working day ── */

const executiveScene: SceneContent = {
  labels: [
    label("brief", "Claude Daily Brief", "source", 0),
    label("meeting", "Meeting Brief", "card", 1),
    label("debrief", "Meeting Debrief", "card", 2),
    label("actions", "Actions from Transcripts", "result", 3),
    label("direction", "You decide", "human", 4),
    label(
      "illustrative",
      "Illustrative example · no live integrations",
      "caption",
      4,
    ),
  ],
  marks: [
    mark("brief", "source", 0),
    mark("meeting", "result", 1),
    mark("debrief", "result", 2),
    mark("actions", "result", 3),
    mark("direction", "human", 4),
  ],
  links: [
    "brief>meeting",
    "meeting>debrief",
    "debrief>actions",
    "direction>actions",
  ],
};

/* ── Contributors: the same method, a different skill for each role ── */

export const roles: readonly (readonly [string, string])[] = [
  ["Deal team", "Deal screening"],
  ["Operations", "Plans and reviews"],
  ["Product", "Feedback triage"],
  ["Sales", "Account planning"],
];

const rosterScene: SceneContent = {
  labels: [
    label("company", "Your company", "caption", 0),
    ...roles.flatMap(([role, skill], index) => [
      label(`role${index + 1}`, role, "source", index + 1),
      label(`skill${index + 1}`, skill, "card", index + 1),
    ]),
    label("human", "Human in the loop", "human", 5),
    label("result", "Reviewed work returns to each role.", "result", 6),
  ],
  marks: [
    ...roles.map((_, index) => mark(`role${index + 1}`, "person", index + 1)),
    mark("human", "human", 5),
    mark("result", "result", 6),
  ],
  links: [
    ...roles.flatMap((_, index) => [
      `role${index + 1}>skill${index + 1}`,
      `skill${index + 1}>human`,
    ]),
    "human>result",
  ],
};

/* ── Builders: from a work problem to a workflow in use ── */

export const steps: readonly string[] = [
  "Design",
  "Test",
  "Troubleshoot",
  "Anticipate failures",
];

const builderScene: SceneContent = {
  labels: [
    label("learner", "A learner with a work problem", "source", 0),
    label("design", steps[0], "caption", 1),
    label("test", steps[1], "caption", 2),
    label("troubleshoot", steps[2], "caption", 3),
    label("anticipate", steps[3], "caption", 4),
    label("workflow", "Workflow in use", "result", 5),
  ],
  marks: [
    mark("learner", "person", 0),
    mark("design", "check", 1),
    mark("test", "check", 2),
    mark("troubleshoot", "check", 3),
    mark("anticipate", "check", 4),
    mark("workflow", "result", 5),
  ],
  // The workflow in use is three linked parts, joined to the climb that made it.
  links: [
    "learner>design",
    "design>test",
    "test>troubleshoot",
    "troubleshoot>anticipate",
    "anticipate>workflow",
    "workflow>blocks",
  ],
};

/* ── Review: the failure-mode gate the playbook explains ── */

export const checks: readonly string[] = [
  "Weak outputs",
  "Missing context",
  "False confidence",
];

/**
 * A checklist reads down the page at every width, so the review scene has one
 * composition: a draft result, three checks, human review, then the business.
 */
export const reviewScene: Scene = {
  id: "review",
  description:
    "Failure-mode review illustration: a draft result passes three checks — weak outputs, missing context, false confidence — and human review before it reaches the business.",
  labels: [
    label("draft", "A draft result", "source", 0),
    label("weak", checks[0], "caption", 1),
    label("missing", checks[1], "caption", 1),
    label("false", checks[2], "caption", 1),
    label("review", "Human review", "human", 2),
    label("business", "Reaches the business", "result", 3),
  ],
  marks: [
    mark("draft", "source", 0),
    mark("weak", "check", 1),
    mark("missing", "check", 1),
    mark("false", "check", 1),
    mark("review", "human", 2),
    mark("business", "result", 3),
  ],
  links: [
    "draft>weak",
    "weak>missing",
    "missing>false",
    "false>review",
    "review>business",
  ],
};

export const audiences: readonly Audience[] = [
  {
    id: "executives",
    choice: "C-level executives",
    proposition:
      "Bring the operating problem behind a decision or result. We shape an AI skill for it while your people stay responsible for the call.",
    kicker: "For C-level executives",
    title: "Use AI for your decisions,<br>teams and operations.",
    body: "Bring the operating problem behind a team, decision or business result. Found42 helps you shape a useful AI skill or workflow for that work, while your people remain responsible for the decision and its quality.",
    points: [
      "Role-based skills for the executive agenda",
      "A standard your teams can be held to",
      "Judgment stays with your people",
    ],
    caption:
      "Illustrative Claude example: Claude Daily Brief → Meeting Brief → Meeting Debrief → Actions from Transcripts. You decide what happens next. This is a hypothetical example, not a client result, with no live calendar, email, CRM or transcript integration.",
    link: {
      label: "For executives",
      href: sitePath("services/#track-c-level-ai"),
    },
    scene: {
      id: "executives",
      description:
        "Executive day: Claude Daily Brief → Meeting Brief → Meeting Debrief → Actions from Transcripts, with a red You decide mark on the last card. An illustrative Claude example, not a client result, with no live calendar, email, CRM or transcript integration.",
      ...executiveScene,
    },
  },
  {
    id: "contributors",
    choice: "Individual Contributors and Teams",
    proposition:
      "Training built around your role, industry and company, so skills take on recurring work and free you for judgment.",
    kicker: "For Individual Contributors and Teams",
    title: "Automate the repetitive,<br>keep the craft.",
    body: "Training is built around your role, industry and company: your recurring decisions, documents, terminology and review standards. Use role-based skills to automate important recurring work, freeing attention for judgment and expertise as the human in the loop.",
    points: [
      "Skills built around your actual role",
      "Less repetitive work each week",
      "Human judgment stays with you",
    ],
    caption:
      "One approach supports different roles: each person gets a skill for their own recurring work, with a person still responsible for judgment and quality.",
    link: {
      label: "For Individual Contributors and Teams",
      href: sitePath("services/#track-role-based"),
    },
    scene: {
      id: "contributors",
      description:
        "Individual Contributors and Teams illustration: four roles in one company — deal team, operations, product and sales — each connected to its own skill, running as four separate paths through the human-review gate to one result: reviewed work returns to each role.",
      ...rosterScene,
    },
  },
  {
    id: "builders",
    choice: "AI builders",
    proposition:
      "No engineering background needed. Learn to test, troubleshoot and anticipate failure modes in workflows your team relies on.",
    kicker: "For AI builders",
    title: "Build for your team,<br>no engineering background.",
    body: "You do not need to be an engineer to build AI automations for colleagues and teams. Learn product-engineering principles: testing, troubleshooting and anticipating failure modes, with people reviewing the work.",
    points: [
      "Design and test automations",
      "Troubleshoot with a method",
      "Keep people reviewing the work",
    ],
    caption:
      "From a work problem to a workflow in use: design, test, troubleshoot, anticipate failures, with a person reviewing each step.",
    link: {
      label: "For AI builders",
      href: sitePath("services/#track-ai-builders"),
    },
    scene: {
      id: "builders",
      description:
        "Builder illustration: a learner with a work problem climbs four reviewed steps — design, test, troubleshoot, anticipate failures — to a workflow in use.",
      ...builderScene,
    },
  },
];

export const sceneById = (id: string): Scene =>
  id === reviewScene.id
    ? reviewScene
    : (audiences.find((audience) => audience.scene.id === id) ?? audiences[0])
        .scene;

/* ── Markup ── */

/** One scene's artwork for one shape of field. */
export const sceneArt = (scene: Scene, orientation: SceneOrientation): Art =>
  artFor(scene.id, orientation);

/** One complete still scene, which the live drawing starts from and returns to. */
export function sceneFieldMarkup(
  scene: Scene,
  orientation: SceneOrientation = "landscape",
  className = "",
): string {
  return fieldHtml(
    sceneArt(scene, orientation),
    scene.labels,
    scene.description,
    `system-field scene-field${className ? ` ${className}` : ""}`,
  );
}

/**
 * The scenes whose script-free still also carries the narrow composition, so
 * a narrow screen without scripts is shown the drawing authored for it, as
 * the live scene is (ADR 0006). The other scenes are unchanged: their
 * script-free still is the wide composition at every width.
 */
const narrowStills: ReadonlySet<string> = new Set(["contributors"]);

/** A still scene in a host the live drawing can later take over. */
export function sceneFigure(
  scene: Scene,
  orientation: SceneOrientation,
  className = "system system--quiet",
): string {
  // Both compositions are set and a media query shows the one that fits
  // (`.scene-field--wide` / `--narrow` in system.css, switching where
  // `mountScene` does). The live drawing replaces the host's contents, so it
  // only ever sees one.
  const still =
    orientation === "landscape" && narrowStills.has(scene.id)
      ? sceneFieldMarkup(scene, "landscape", "scene-field--wide") +
        sceneFieldMarkup(scene, "portrait", "scene-field--narrow")
      : sceneFieldMarkup(scene, orientation);
  return `<div class="${className}" data-scene-host data-scene="${scene.id}">${still}</div>`;
}
