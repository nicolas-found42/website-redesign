/**
 * The audience scenes: three ways the same method lands, drawn three ways.
 *
 * A scene is made in the same hand as the working-system drawings — printed
 * paper in the site's inks, red for what is human — but each one is its own
 * object rather than the plait with new words on it:
 *
 * - **Executives** feed a crumpled operating problem through a tailored skill,
 *   which presses it into an illustrative decision brief; the brief goes onto
 *   an operating view that executive direction holds, and back to the problem.
 *   The operating view is hypothetical, not a client artifact.
 * - **Contributors** each run a ribbon of their own role through a skill cut
 *   for it — four roles in one company — and all four are gathered by one red
 *   loop: the human in the loop.
 * - **Builders** climb a stair folded from card, from a work problem to a
 *   workflow in use, with a reviewer's seal on each step: test, troubleshoot,
 *   anticipate failures.
 *
 * A fourth scene, **review**, is the failure-mode gate the playbook explains.
 *
 * This module holds what each scene says — its words, when in its story each
 * is told, what each marks, and what joins what. How it is drawn lives in
 * `art/`, once for a wide field and once for a narrow one.
 */
import { artFor } from "./art";
import { drawingId, fieldHtml } from "./art/field";
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

/* ── Executives: install a system, then use it ── */

const executiveScene: SceneContent = {
  labels: [
    label("problem", "Your operating problem", "source", 0),
    label("skill", "Tailored executive skill", "control", 1),
    label("brief", "A decision brief you use", "result", 2),
    label("view", "Illustrative executive operating view", "caption", 3),
    label("direction", "Executive direction", "human", 5),
  ],
  marks: [
    mark("problem", "source", 0),
    mark("brief", "result", 2),
    mark("direction", "human", 5),
  ],
  // The view feeds back into the problem it answers, under executive direction.
  links: [
    "problem>skill",
    "skill>brief",
    "brief>view",
    "direction>view",
    "view>problem",
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
  ],
  marks: [
    ...roles.map((_, index) => mark(`role${index + 1}`, "person", index + 1)),
    mark("human", "human", 5),
  ],
  links: roles.flatMap((_, index) => [
    `role${index + 1}>skill${index + 1}`,
    `skill${index + 1}>human`,
  ]),
};

/* ── Builders: from a work problem to a workflow in use ── */

export const steps: readonly string[] = [
  "Test",
  "Troubleshoot",
  "Anticipate failures",
];

const builderScene: SceneContent = {
  labels: [
    label("learner", "A learner with a work problem", "source", 0),
    label("test", steps[0], "caption", 1),
    label("troubleshoot", steps[1], "caption", 2),
    label("anticipate", steps[2], "caption", 3),
    label("workflow", "Workflow in use", "result", 4),
  ],
  marks: [
    mark("learner", "person", 0),
    mark("test", "check", 1),
    mark("troubleshoot", "check", 2),
    mark("anticipate", "check", 3),
    mark("workflow", "result", 4),
  ],
  // The workflow in use is three linked parts, joined to the climb that made it.
  links: [
    "learner>test",
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
      "Illustrative executive operating view: real work enters a tailored skill, produces a decision brief, and remains subject to executive direction. This is a hypothetical example, not a client result.",
    link: {
      label: "For executives",
      href: sitePath("services/#track-c-level-ai"),
    },
    scene: {
      id: "executives",
      description:
        "Executive illustration: an operating problem enters a tailored skill and produces an illustrative decision brief, with human direction deciding how it is used.",
      ...executiveScene,
    },
  },
  {
    id: "contributors",
    choice: "Individual contributors",
    proposition:
      "Training built around your role, industry and company, so skills take on recurring work and free you for judgment.",
    kicker: "For individual contributors",
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
      label: "For individual contributors",
      href: sitePath("services/#track-role-based"),
    },
    scene: {
      id: "contributors",
      description:
        "Contributor illustration: four roles in one company — deal team, operations, product and sales — each connected to its own skill, all ending with the human in the loop.",
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
      "From a work problem to a workflow in use: test, troubleshoot, anticipate failures, with a person reviewing each step.",
    link: {
      label: "For AI builders",
      href: sitePath("services/#track-ai-builders"),
    },
    scene: {
      id: "builders",
      description:
        "Builder illustration: a learner with a work problem climbs three reviewed steps — test, troubleshoot, anticipate failures — to a workflow in use.",
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
export const sceneArt = (
  scene: Scene,
  orientation: SceneOrientation,
  uid = drawingId(scene.id),
): Art => artFor(scene.id, orientation, uid);

/** One complete still scene, which the live drawing starts from and returns to. */
export function sceneFieldMarkup(
  scene: Scene,
  orientation: SceneOrientation = "landscape",
  uid?: string,
): string {
  return fieldHtml(
    sceneArt(scene, orientation, uid),
    scene.labels,
    scene.description,
    "system-field scene-field",
  );
}

/** A still scene in a host the live drawing can later take over. */
export const sceneFigure = (
  scene: Scene,
  orientation: SceneOrientation,
  className = "system system--quiet",
): string =>
  `<div class="${className}" data-scene-host data-scene="${scene.id}">${sceneFieldMarkup(scene, orientation)}</div>`;
