/**
 * The audience scenes: three ways the same method lands, drawn three ways.
 *
 * A scene is drawn in the working-system's hand — ink routes, ringed markers,
 * red for what is human or live, monospaced annotations — but each one is its
 * own picture rather than the transit map with new words on it:
 *
 * - **Executives** apply a tailored skill to an operating problem and receive an
 *   illustrative decision brief, with executive direction still deciding how it
 *   is used. The operating view is hypothetical, not a client artifact.
 * - **Contributors** get a skill for the role they already have: four roles in
 *   one company, each with its own skill, all ending with the human in the loop.
 * - **Builders** climb from a work problem to a workflow the team uses: three
 *   reviewed steps — test, troubleshoot, anticipate failures.
 *
 * A fourth scene, **review**, is the failure-mode gate the playbook explains.
 *
 * Every scene is authored twice, landscape and portrait, for the same reason
 * the schematics are: a phone gets a drawing composed for a phone. Elements
 * carry a `beat` — the order the drawing tells its story in — and the still
 * composition is always the resting state.
 */
import { cornerRadius, roundedPolyline, type Point } from "./schematic";
import { destinationRegister } from "./content";
import { sitePath } from "./paths";

export type SceneAnchor =
  "start" | "under" | "end" | "above" | "below" | "right" | "center";

export type SceneFrame = {
  /** x, y, width, height in field units. */
  readonly box: readonly [number, number, number, number];
  readonly kind: "panel" | "outline" | "control" | "block";
  readonly beat: number;
};

export type SceneRoute = {
  readonly points: readonly Point[];
  readonly weight: "trunk" | "branch" | "return";
  readonly beat: number;
  /** Signals run this route. */
  readonly carry?: boolean;
};

export type SceneMarker = {
  readonly at: Point;
  readonly kind: "source" | "human" | "result" | "person" | "check";
  readonly beat: number;
};

export type SceneLabel = {
  readonly at: Point;
  readonly anchor: SceneAnchor;
  readonly text: string;
  readonly kind: "source" | "human" | "result" | "caption" | "control" | "card";
  readonly beat: number;
  /**
   * Wrap inside this width, in field units: the label of a card or control, or
   * an annotation that would otherwise run into the next element along.
   */
  readonly width?: number;
};

export type SceneLayout = {
  readonly width: number;
  readonly height: number;
  readonly frames: readonly SceneFrame[];
  readonly routes: readonly SceneRoute[];
  readonly markers: readonly SceneMarker[];
  readonly labels: readonly SceneLabel[];
};

export type Scene = {
  readonly id: string;
  /** What the drawing shows, for anyone who cannot see it. */
  readonly description: string;
  readonly landscape: SceneLayout;
  readonly portrait: SceneLayout;
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

const frame = (
  box: SceneFrame["box"],
  kind: SceneFrame["kind"],
  beat: number,
): SceneFrame => ({ box, kind, beat });
const trunk = (
  points: readonly Point[],
  beat: number,
  carry = false,
): SceneRoute => ({ points, weight: "trunk", beat, carry });
const branch = (
  points: readonly Point[],
  beat: number,
  carry = false,
): SceneRoute => ({ points, weight: "branch", beat, carry });
const back = (points: readonly Point[], beat: number): SceneRoute => ({
  points,
  weight: "return",
  beat,
});
const marker = (
  at: Point,
  kind: SceneMarker["kind"],
  beat: number,
): SceneMarker => ({ at, kind, beat });
const label = (
  at: Point,
  anchor: SceneAnchor,
  text: string,
  kind: SceneLabel["kind"],
  beat: number,
  width?: number,
): SceneLabel => ({ at, anchor, text, kind, beat, width });

/** Planner rows: one quiet line per row, drawn in one after another. */
const rows = (
  x1: number,
  x2: number,
  ys: readonly number[],
  beat: number,
): SceneRoute[] =>
  ys.map((y, index) =>
    branch(
      [
        [x1, y],
        [x2, y],
      ],
      beat,
      index % 2 === 0,
    ),
  );

/* ── Executives: install a system, then use it ── */

const executiveLandscape: SceneLayout = {
  width: 1000,
  height: 620,
  frames: [
    frame([300, 122, 260, 56], "control", 1),
    frame([260, 236, 620, 324], "panel", 3),
  ],
  routes: [
    trunk(
      [
        [70, 150],
        [300, 150],
      ],
      1,
    ),
    trunk(
      [
        [560, 150],
        [740, 150],
      ],
      2,
    ),
    trunk(
      [
        [740, 150],
        [740, 236],
      ],
      3,
      true,
    ),
    branch(
      [
        [292, 290],
        [848, 290],
      ],
      3,
    ),
    ...rows(292, 848, [346, 402, 458, 514], 4),
    back(
      [
        [260, 560],
        [70, 560],
        [70, 150],
      ],
      5,
    ),
  ],
  markers: [
    marker([70, 150], "source", 0),
    marker([740, 150], "result", 2),
    marker([260, 398], "human", 5),
  ],
  labels: [
    label([70, 150], "under", "Your operating problem", "source", 0, 220),
    label([430, 150], "center", "Tailored executive skill", "control", 1, 260),
    label([740, 150], "start", "A decision brief you use", "result", 2),
    label([292, 250], "under", "Illustrative executive operating view", "caption", 3),
    label([260, 398], "end", "Executive direction", "human", 5),
  ],
};

const executivePortrait: SceneLayout = {
  width: 620,
  height: 800,
  frames: [
    frame([20, 150, 340, 56], "control", 1),
    frame([40, 300, 540, 400], "panel", 3),
  ],
  routes: [
    trunk(
      [
        [190, 60],
        [190, 150],
      ],
      1,
    ),
    trunk(
      [
        [190, 206],
        [190, 250],
      ],
      2,
    ),
    trunk(
      [
        [190, 250],
        [190, 300],
      ],
      3,
      true,
    ),
    branch(
      [
        [72, 430],
        [548, 430],
      ],
      3,
    ),
    ...rows(72, 548, [490, 550, 610, 670], 4),
    back(
      [
        [40, 700],
        [20, 700],
        [20, 60],
        [190, 60],
      ],
      5,
    ),
  ],
  markers: [
    marker([190, 60], "source", 0),
    marker([190, 250], "result", 2),
    marker([40, 700], "human", 5),
  ],
  labels: [
    label([190, 60], "right", "Your operating problem", "source", 0),
    label([190, 178], "center", "Tailored executive skill", "control", 1, 340),
    label([190, 250], "right", "A decision brief you use", "result", 2),
    label([72, 306], "above", "Illustrative executive operating view", "caption", 3),
    label([40, 700], "under", "Executive direction", "human", 5),
  ],
};

/* ── Contributors: the same method, a different skill for each role ── */

const roles: readonly (readonly [string, string])[] = [
  ["Deal team", "Deal screening"],
  ["Operations", "Plans and reviews"],
  ["Product", "Feedback triage"],
  ["Sales", "Account planning"],
];

const rosterLandscape = (): SceneLayout => {
  const ys = [170, 280, 390, 500];
  const layout: SceneLayout = {
    width: 1000,
    height: 620,
    frames: [
      frame([120, 80, 860, 520], "outline", 0),
      ...ys.map((y, index) =>
        frame([520, y - 32, 220, 64], "block", index + 1),
      ),
    ],
    routes: [
      ...ys.flatMap((y, index) => [
        branch(
          [
            [220, y],
            [520, y],
          ],
          index + 1,
        ),
        branch(
          [
            [740, y],
            [860, y],
          ],
          index + 1,
        ),
      ]),
      trunk(
        [
          [860, 170],
          [860, 560],
        ],
        5,
        true,
      ),
    ],
    markers: [
      ...ys.map((y, index) => marker([220, y], "person", index + 1)),
      marker([860, 560], "human", 5),
    ],
    labels: [
      label([140, 92], "under", "Your company", "caption", 0),
      ...ys.flatMap((y, index) => [
        label([220, y], "start", roles[index][0], "source", index + 1),
        label([630, y], "center", roles[index][1], "card", index + 1, 220),
      ]),
      label([860, 560], "below", "Human in the loop", "human", 5),
    ],
  };
  return layout;
};

const rosterPortrait = (): SceneLayout => {
  const ys = [190, 350, 510, 670];
  return {
    width: 620,
    height: 860,
    frames: [
      frame([24, 60, 572, 760], "outline", 0),
      ...ys.map((y, index) =>
        frame([230, y - 40, 300, 80], "block", index + 1),
      ),
    ],
    routes: [
      ...ys.flatMap((y, index) => [
        branch(
          [
            [90, y],
            [230, y],
          ],
          index + 1,
        ),
        branch(
          [
            [530, y],
            [568, y],
          ],
          index + 1,
        ),
      ]),
      trunk(
        [
          [568, 190],
          [568, 790],
        ],
        5,
        true,
      ),
    ],
    markers: [
      ...ys.map((y, index) => marker([90, y], "person", index + 1)),
      marker([568, 790], "human", 5),
    ],
    labels: [
      label([40, 72], "under", "Your company", "caption", 0),
      ...ys.flatMap((y, index) => [
        label([90, y], "start", roles[index][0], "source", index + 1),
        label([380, y], "center", roles[index][1], "card", index + 1, 300),
      ]),
      label([568, 790], "end", "Human in the loop", "human", 5),
    ],
  };
};

/* ── Builders: from a work problem to a workflow in use ── */

const steps: readonly string[] = [
  "Test",
  "Troubleshoot",
  "Anticipate failures",
];

const builderLandscape: SceneLayout = {
  width: 1000,
  height: 620,
  frames: [
    frame([736, 120, 48, 30], "block", 5),
    frame([796, 120, 48, 30], "block", 5),
    frame([856, 120, 48, 30], "block", 5),
  ],
  routes: [
    trunk(
      [
        [80, 520],
        [280, 520],
        [280, 420],
      ],
      1,
    ),
    trunk(
      [
        [280, 420],
        [480, 420],
        [480, 320],
      ],
      2,
    ),
    trunk(
      [
        [480, 320],
        [680, 320],
        [680, 220],
      ],
      3,
    ),
    trunk(
      [
        [680, 220],
        [880, 220],
      ],
      4,
    ),
    // One carrying route the length of the climb, so a signal takes every step.
    branch(
      [
        [80, 520],
        [280, 520],
        [280, 420],
        [480, 420],
        [480, 320],
        [680, 320],
        [680, 220],
        [880, 220],
      ],
      4,
      true,
    ),
    branch(
      [
        [880, 220],
        [880, 150],
      ],
      5,
    ),
    branch(
      [
        [784, 135],
        [796, 135],
      ],
      5,
    ),
    branch(
      [
        [844, 135],
        [856, 135],
      ],
      5,
    ),
  ],
  markers: [
    marker([80, 520], "person", 0),
    marker([280, 420], "check", 1),
    marker([480, 320], "check", 2),
    marker([680, 220], "check", 3),
    marker([880, 220], "result", 4),
  ],
  labels: [
    label([80, 520], "under", "A learner with a work problem", "source", 0),
    label([280, 420], "under", steps[0], "caption", 1),
    label([480, 320], "under", steps[1], "caption", 2),
    label([680, 220], "above", steps[2], "caption", 3),
    label([880, 220], "below", "Workflow in use", "result", 4),
  ],
};

const builderPortrait: SceneLayout = {
  width: 620,
  height: 880,
  frames: [
    frame([356, 80, 48, 30], "block", 5),
    frame([416, 80, 48, 30], "block", 5),
    frame([476, 80, 48, 30], "block", 5),
  ],
  routes: [
    trunk(
      [
        [60, 800],
        [360, 800],
        [360, 660],
      ],
      1,
    ),
    trunk(
      [
        [360, 660],
        [520, 660],
        [520, 480],
      ],
      2,
    ),
    // The climb switches back on a narrow sheet: the same three steps, drawn
    // as a zigzag rather than a staircase off the right edge.
    trunk(
      [
        [520, 480],
        [200, 480],
        [200, 300],
      ],
      3,
    ),
    trunk(
      [
        [200, 300],
        [520, 300],
        [520, 200],
      ],
      4,
    ),
    branch(
      [
        [60, 800],
        [360, 800],
        [360, 660],
        [520, 660],
        [520, 480],
        [200, 480],
        [200, 300],
        [520, 300],
        [520, 200],
      ],
      4,
      true,
    ),
    branch(
      [
        [520, 200],
        [520, 110],
      ],
      5,
    ),
    branch(
      [
        [404, 95],
        [416, 95],
      ],
      5,
    ),
    branch(
      [
        [464, 95],
        [476, 95],
      ],
      5,
    ),
  ],
  markers: [
    marker([60, 800], "person", 0),
    marker([360, 660], "check", 1),
    marker([520, 480], "check", 2),
    marker([200, 300], "check", 3),
    marker([520, 200], "result", 4),
  ],
  labels: [
    label([60, 800], "start", "A learner with a work problem", "source", 0),
    label([360, 660], "under", steps[0], "caption", 1),
    label([520, 480], "end", steps[1], "caption", 2),
    label([200, 300], "under", steps[2], "caption", 3),
    label([520, 200], "end", "Workflow in use", "result", 4),
  ],
};

/* ── Review: the failure-mode gate the playbook explains ── */

const checks: readonly string[] = [
  "Weak outputs",
  "Missing context",
  "False confidence",
];

/**
 * A checklist reads down the page at every width, so the review scene has one
 * composition: a draft result, three checks, human review, then the business.
 */
const reviewLayout: SceneLayout = {
  width: 620,
  height: 520,
  frames: [],
  routes: [
    trunk(
      [
        [120, 50],
        [120, 390],
      ],
      1,
      true,
    ),
    trunk(
      [
        [120, 390],
        [120, 470],
      ],
      3,
    ),
  ],
  markers: [
    marker([120, 50], "source", 0),
    marker([120, 135], "check", 1),
    marker([120, 220], "check", 1),
    marker([120, 305], "check", 1),
    marker([120, 390], "human", 2),
    marker([120, 470], "result", 3),
  ],
  labels: [
    label([120, 50], "right", "A draft result", "source", 0),
    label([120, 135], "right", checks[0], "caption", 1),
    label([120, 220], "right", checks[1], "caption", 1),
    label([120, 305], "right", checks[2], "caption", 1),
    label([120, 390], "right", "Human review", "human", 2),
    label([120, 470], "right", "Reaches the business", "result", 3),
  ],
};

export const reviewScene: Scene = {
  id: "review",
  description:
    "Failure-mode review illustration: a draft result passes three checks — weak outputs, missing context, false confidence — and human review before it reaches the business.",
  landscape: reviewLayout,
  portrait: reviewLayout,
};

export const audiences: readonly Audience[] = [
  {
    id: "executives",
    choice: "C-level executives",
    proposition: "Use AI in your decisions and operations.",
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
      label: "Explore the Four-Hour AI Executive on Maven",
      href: destinationRegister.executiveCourse,
    },
    linkNote:
      "Preview link, still being confirmed. The course page and its access terms are on Maven.",
    scene: {
      id: "executives",
      description:
        "Executive illustration: an operating problem enters a tailored skill and produces an illustrative decision brief, with human direction deciding how it is used.",
      landscape: executiveLandscape,
      portrait: executivePortrait,
    },
  },
  {
    id: "contributors",
    choice: "Individual contributors",
    proposition: "Skills specific to your role.",
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
      label: "Explore tailored training",
      href: sitePath("services/#tracks"),
    },
    scene: {
      id: "contributors",
      description:
        "Contributor illustration: four roles in one company — deal team, operations, product and sales — each connected to its own skill, all ending with the human in the loop.",
      landscape: rosterLandscape(),
      portrait: rosterPortrait(),
    },
  },
  {
    id: "builders",
    choice: "AI builders",
    proposition: "Build workflows your team uses.",
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
      label: "Ask about AI builder support",
    },
    linkNote:
      "Interim path: no verified AI Builder course is published.",
    scene: {
      id: "builders",
      description:
        "Builder illustration: a learner with a work problem climbs three reviewed steps — test, troubleshoot, anticipate failures — to a workflow in use.",
      landscape: builderLandscape,
      portrait: builderPortrait,
    },
  },
];

export const sceneById = (id: string): Scene =>
  id === reviewScene.id
    ? reviewScene
    : (audiences.find((audience) => audience.scene.id === id) ?? audiences[0])
        .scene;

/* ── Markup ── */

const attr = (value: number) => (Math.round(value * 100) / 100).toString();

export const sceneFrameMarkup = (layout: SceneLayout): string =>
  layout.frames
    .map(({ box: [x, y, w, h], kind, beat }) => {
      const radius = kind === "control" ? 28 : kind === "block" ? 4 : 2;
      return `<rect class="frame frame--${kind}" data-beat="${beat}" x="${attr(x)}" y="${attr(y)}" width="${attr(w)}" height="${attr(h)}" rx="${radius}"/>`;
    })
    .join("");

export const sceneRouteMarkup = (layout: SceneLayout): string =>
  layout.routes
    .map(
      (route, index) =>
        `<path class="route route--${route.weight}${route.carry ? " route--carry" : ""}" data-route="${index}" data-beat="${route.beat}" d="${roundedPolyline(route.points, cornerRadius)}"/>`,
    )
    .join("");

const markerBody = (kind: SceneMarker["kind"]): string => {
  switch (kind) {
    case "human":
      return '<circle class="marker-halo" r="28"/><circle class="marker-ring" r="15"/><circle class="marker-core" r="6"/>';
    case "person":
      return '<circle class="marker-ring" r="16"/><circle class="marker-head" cy="-4" r="4.5"/><path class="marker-shoulders" d="M-8 9 Q0 0 8 9"/>';
    case "check":
      return '<circle class="marker-ring" r="13"/><path class="marker-tick" d="M-5 0.5 L-1.5 4 L5.5 -3.5"/>';
    default:
      return '<circle class="marker-ring" r="11"/><circle class="marker-core" r="4"/>';
  }
};

export const sceneMarkerMarkup = (layout: SceneLayout): string =>
  layout.markers
    .map(
      ({ at, kind, beat }) =>
        `<g class="marker marker--${kind}" data-beat="${beat}" transform="translate(${attr(at[0])} ${attr(at[1])})"><g class="marker-body">${markerBody(kind)}</g></g>`,
    )
    .join("");

export const sceneLabelMarkup = (layout: SceneLayout): string =>
  layout.labels
    .map((entry) => {
      const x = ((entry.at[0] / layout.width) * 100).toFixed(3);
      const y = ((entry.at[1] / layout.height) * 100).toFixed(3);
      const width =
        entry.width === undefined
          ? ""
          : `;--w:${((entry.width / layout.width) * 100).toFixed(3)}`;
      return (
        `<span class="system-label system-label--${entry.anchor} system-label--${entry.kind}"` +
        ` data-beat="${entry.beat}" style="--x:${x};--y:${y}${width}">` +
        `<i class="system-label-text">${entry.text}</i></span>`
      );
    })
    .join("");

export type SceneOrientation = "landscape" | "portrait";

/** One complete still scene, which the live drawing starts from and returns to. */
export function sceneFieldMarkup(
  scene: Scene,
  orientation: SceneOrientation = "landscape",
): string {
  const layout = scene[orientation];
  return (
    `<div class="system-field scene-field" style="--ratio:${layout.width} / ${layout.height}"` +
    ` role="img" aria-label="${scene.description}">` +
    `<svg class="system-svg" viewBox="0 0 ${layout.width} ${layout.height}" fill="none"` +
    ' aria-hidden="true" focusable="false">' +
    `<g class="frames">${sceneFrameMarkup(layout)}</g>` +
    `<g class="routes">${sceneRouteMarkup(layout)}</g>` +
    '<g class="signals"></g>' +
    `<g class="markers">${sceneMarkerMarkup(layout)}</g>` +
    "</svg>" +
    `<div class="system-labels" aria-hidden="true">${sceneLabelMarkup(layout)}</div>` +
    "</div>"
  );
}

/** A still scene in a host the live drawing can later take over. */
export const sceneFigure = (
  scene: Scene,
  orientation: SceneOrientation,
  className = "system system--quiet",
): string =>
  `<div class="${className}" data-scene-host data-scene="${scene.id}">${sceneFieldMarkup(scene, orientation)}</div>`;
