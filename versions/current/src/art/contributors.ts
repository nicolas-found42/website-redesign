import {
  easeX,
  easeY,
  figure,
  part,
  place,
  r,
  seal,
  strip,
  type Entrance,
  type LabelPlace,
  type Pt,
} from "./kit";
import { contents, folio, laptop, paper } from "./work";
import {
  drawn,
  type Anchor,
  type Plan,
  type Rect,
  type Staged,
} from "./compose";

/**
 * Individual Contributors and Teams: four role artifacts and a shared review.
 *
 * Four roles in one company, each with a ribbon of its own. Each
 * ribbon passes its named function in open space and continues
 * in its own lane: four smooth top-to-bottom pipelines that never cross.
 * Each lane enters the gate through a slot of its own: the human in the
 * loop, where a person reviews before anything leaves. Past the gate the
 * four lanes continue as four separate paths, each with room of its own,
 * and end together at one shared result: reviewed work returns to each
 * role. The ribbons alternate the owner's red, charcoal and white, each
 * with a charcoal outline, and every lane is named by its role and skill —
 * no lane depends on its colour alone to be told apart.
 *
 * The four roles, the gate, the reviewer and the shared result are stated
 * once. The wide sheet runs the frame across the lanes and sends the returns
 * sideways; the narrow one turns each lane down into a frame below them.
 */

/** Red, charcoal, white, red: one per role, alternating along the lanes. */
const FILLS = [
  "var(--red-strand)",
  "var(--ink)",
  "var(--paper)",
  "var(--red-strand)",
] as const;

/** A role's tab names the lane without adding another person. */
function tab(x: number, y: number, width: number, height: number): string {
  const h = height / 2;
  return (
    `<rect class="f-sunk" x="${r(x + 5)}" y="${r(y - h + 6)}" width="${width}" height="${height}" rx="4"/>` +
    `<path class="f-ink" d="M${r(x)} ${r(y - h)} L${r(x + width)} ${r(y - h)} L${r(x + width)} ${r(y + h)} L${r(x)} ${r(y + h)} L${r(x + 14)} ${r(y)} Z"/>`
  );
}

/**
 * One lane's slot on the gate: an open ring where that lane's ribbon
 * passes through the frame, so every lane has an entry of its own.
 */
function slotRing(x: number, y: number, width: number, height: number): string {
  return `<rect class="s-ink" x="${r(x)}" y="${r(y)}" width="${width}" height="${height}" rx="8" fill="none" stroke-width="3"/>`;
}

/** The gate: four charcoal posts framing the lanes, with a reviewer's seal on it. */
function gate(frame: Rect): string {
  const { x, y, w, h } = frame;
  const post = 16;
  return (
    `<rect class="f-ink" x="${x}" y="${y}" width="${post}" height="${h}" rx="4"/>` +
    `<rect class="f-ink" x="${x + w - post}" y="${y}" width="${post}" height="${h}" rx="4"/>` +
    `<rect class="f-ink" x="${x}" y="${y}" width="${w}" height="${post}" rx="4"/>` +
    `<rect class="f-ink" x="${x}" y="${y + h - post}" width="${w}" height="${post}" rx="4"/>`
  );
}

const plate = (x: number, y: number, width: number, height: number) =>
  `<rect class="f-red-deep" x="${r(x + 5)}" y="${r(y + 6)}" width="${width}" height="${height}" rx="6" opacity="0.28"/>` +
  `<rect class="f-red" x="${r(x)}" y="${r(y)}" width="${width}" height="${height}" rx="6"/>`;

const backdrop = (x: number, y: number, w: number, h: number) =>
  `<rect class="f-warm" x="${x}" y="${y}" width="${w}" height="${h}" rx="12"/>` +
  `<rect class="s-line" x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="none" stroke-width="2"/>`;

/**
 * The shared result: one charcoal panel the four paths end under, so they
 * arrive together and the caption is said once.
 */
const resultPanel = (x: number, y: number, w: number, h: number) =>
  `<rect class="f-sunk" x="${r(x + 5)}" y="${r(y + 6)}" width="${w}" height="${h}" rx="8"/>` +
  `<rect class="f-ink s-ink" x="${x}" y="${y}" width="${w}" height="${h}" rx="8" stroke-width="2.5"/>`;

/** Each role handles a different artifact: deal folder, plan, feedback, account. */
function roleArtifacts(x: number, y: number, w: number, role: number): string {
  const scale = w / 560;
  const object =
    role === 0
      ? folio(330, 0, 160, "owners")
      : role === 1
        ? laptop(320, -8, 180, "plan")
        : role === 2
          ? paper(325, 0, 165, 95) +
            [0, 1, 2]
              .map(
                (i) =>
                  `<rect class="f-${i === 1 ? "warm" : "sunk"} s-ink" x="${340 + i * 43}" y="${18 + i * 8}" width="34" height="48" rx="3" stroke-width="1.5"/>`,
              )
              .join("")
          : folio(335, 0, 150, "priorities");
  return (
    `<g transform="translate(${x} ${y}) scale(${scale})">` +
    paper(180, 56, 85, 40) +
    `<g transform="translate(190 63) scale(.42)">${contents(0, 0, 160, "owners")}</g>` +
    object +
    `</g>`
  );
}

type RolePlacement = {
  path: string;
  origin: Pt;
  tab: Rect;
  artifact: { x: number; y: number; w: number };
  role: Anchor;
  skill: Anchor;
};

type ReturnPlacement = {
  path: string;
  fillPath: string;
  origin: Pt;
  enter: Entrance;
};

type Gate = {
  origin: Pt;
  sealAt: Pt;
  sealRadius: number;
  stem: string;
  plate: Rect;
};

type ContributorsGeometry = {
  /** The ribbon width: thinner on the narrow sheet. */
  width: number;
  company: { rect: Rect; label: Anchor };
  frame: Rect;
  gate: Gate;
  roles: readonly RolePlacement[];
  reviewer: { at: Pt; scale: number };
  lanes: string;
  returns: readonly ReturnPlacement[];
  panel: Rect;
  result: { origin: Pt; enter: Entrance; label: Anchor };
  human: Anchor;
};

const landscapeYs = [160, 370, 580, 790];
const landscapeCentre = 475;
const landscapeFrame: Rect = { x: 806, y: 126, w: 84, h: 702 };
const landscapePanel: Rect = { x: 1060, y: 210, w: 230, h: 530 };
const landscapeGap = 130;
const landscapeEnds = landscapeYs.map(
  (_, lane) => landscapeCentre + (lane - 1.5) * landscapeGap,
);
const landscapeBeyond = landscapeFrame.x + landscapeFrame.w + 10;

const landscape: ContributorsGeometry = {
  width: 30,
  company: {
    rect: {
      x: 30,
      y: 44,
      w: landscapePanel.x + landscapePanel.w + 50 - 60,
      h: 1036,
    },
    label: { at: [62, 70], width: 400 },
  },
  frame: landscapeFrame,
  gate: {
    origin: [landscapeFrame.x + landscapeFrame.w / 2, landscapeCentre],
    sealAt: [landscapeFrame.x + landscapeFrame.w / 2, landscapeFrame.y - 4],
    sealRadius: 20,
    stem: `<path class="s-red" d="M${landscapeFrame.x + landscapeFrame.w / 2} ${landscapeFrame.y + landscapeFrame.h} L${landscapeFrame.x + landscapeFrame.w / 2} 990" stroke-width="4"/>`,
    plate: {
      x: landscapeFrame.x + landscapeFrame.w / 2 - 180,
      y: 990,
      w: 360,
      h: 60,
    },
  },
  roles: landscapeYs.map((y) => ({
    path: `M290 ${y} L360 ${y} M620 ${y} L${landscapeFrame.x + 10} ${y}`,
    origin: [60, y],
    tab: { x: 60, y, w: 270, h: 70 },
    artifact: { x: 60, y: y + 65, w: 560 },
    role: { at: [124, y], width: 200 },
    skill: { at: [490, y], width: 214 },
  })),
  reviewer: { at: [966, 914], scale: 2.5 },
  lanes: landscapeYs
    .map((y) => slotRing(landscapeFrame.x - 12, y - 21, 36, 42))
    .join(""),
  returns: landscapeYs.map((y, lane) => {
    const tail = `L${landscapeBeyond + 30} ${y} ${easeX([landscapeBeyond + 30, y], [landscapePanel.x + 30, landscapeEnds[lane]], 0.5)}`;
    return {
      path: `M${landscapeBeyond - 2} ${y} ${tail}`,
      fillPath: `M${landscapeBeyond - 3.5} ${y} ${tail}`,
      origin: [landscapeBeyond, y],
      enter: "slide-right",
    };
  }),
  panel: landscapePanel,
  result: {
    origin: [landscapePanel.x, landscapeCentre],
    enter: "unfold-x",
    label: {
      at: [landscapePanel.x + landscapePanel.w / 2, landscapeCentre],
      width: landscapePanel.w - 30,
    },
  },
  human: { at: [landscapeFrame.x + landscapeFrame.w / 2, 1020], width: 330 },
};

const portraitYs = [160, 400, 640, 880];
// Each lane turns down at a line of its own and falls straight to the
// gate: horizontals sit at different heights and verticals at different
// lines, so no lane crosses another on its way down.
const portraitDownAt = [594, 566, 538, 510];
const portraitFrame: Rect = { x: 470, y: 1130, w: 134, h: 74 };
const portraitPanel: Rect = { x: 120, y: 1460, w: 470, h: 104 };
const portraitCanvas = portraitPanel.y + portraitPanel.h + 40;
const portraitBeyond = portraitFrame.y + portraitFrame.h + 10;
const portraitEnds = [552, 468, 384, 300];
const portraitCentre = portraitFrame.y + portraitFrame.h / 2;

const portrait: ContributorsGeometry = {
  width: 20,
  company: {
    rect: { x: 14, y: 30, w: 592, h: portraitCanvas - 60 },
    label: { at: [40, 54], width: 520 },
  },
  frame: portraitFrame,
  gate: {
    origin: [portraitFrame.x + portraitFrame.w / 2, portraitCentre],
    sealAt: [portraitFrame.x - 4, portraitFrame.y + 4],
    sealRadius: 18,
    stem: `<path class="s-red" d="M${portraitFrame.x} ${portraitCentre} L440 ${portraitCentre}" stroke-width="4"/>`,
    plate: { x: 172, y: portraitCentre - 48, w: 268, h: 96 },
  },
  roles: portraitYs.map((y, lane) => {
    const x = portraitDownAt[lane];
    const radius = Math.min(24, x - 480);
    return {
      path: `M262 ${y} L288 ${y} M476 ${y} L${x - radius} ${y} Q${x} ${y} ${x} ${y + radius} L${x} ${portraitFrame.y + 10}`,
      origin: [34, y],
      tab: { x: 34, y, w: 244, h: 80 },
      artifact: { x: 34, y: y + 60, w: 432 },
      role: { at: [88, y], width: 188 },
      skill: { at: [382, y], width: 170 },
    };
  }),
  reviewer: { at: [290, 1310], scale: 2.8 },
  lanes: portraitDownAt
    .map((x) => slotRing(x - 16, portraitFrame.y - 12, 32, 36))
    .join(""),
  returns: portraitYs.map((_, lane) => {
    const x = portraitDownAt[lane];
    const tail = `L${x} ${portraitBeyond + 26} ${easeY([x, portraitBeyond + 26], [portraitEnds[lane], portraitPanel.y + 30], 0.5)}`;
    return {
      path: `M${x} ${portraitBeyond - 2} ${tail}`,
      fillPath: `M${x} ${portraitBeyond - 3.5} ${tail}`,
      origin: [x, portraitBeyond],
      enter: "slide-down",
    };
  }),
  panel: portraitPanel,
  result: {
    origin: [portraitPanel.x + portraitPanel.w / 2, portraitPanel.y],
    enter: "unfold-y",
    label: {
      at: [
        portraitPanel.x + portraitPanel.w / 2,
        portraitPanel.y + portraitPanel.h / 2,
      ],
      width: portraitPanel.w - 32,
    },
  },
  human: { at: [306, 1167], width: 250 },
};

const plan: Plan<ContributorsGeometry> = {
  size: {
    landscape: {
      width: landscapePanel.x + landscapePanel.w + 50,
      height: 1100,
    },
    portrait: { width: 620, height: portraitCanvas },
  },
  geometry: { landscape, portrait },
  build: (g): Staged => {
    const rows = g.roles.map((role, lane) => {
      const n = lane + 1;
      return part(
        {
          name: "role",
          beat: n,
          enter: "slide-right",
          origin: role.origin,
          nodes: [`role${n}`, `skill${n}`],
          links: [`role${n}>skill${n}`, `skill${n}>human`],
        },
        strip(role.path, g.width, FILLS[lane]) +
          tab(role.tab.x, role.tab.y, role.tab.w, role.tab.h) +
          roleArtifacts(
            role.artifact.x,
            role.artifact.y,
            role.artifact.w,
            lane,
          ),
      );
    });
    const returns = g.returns.map((back, lane) =>
      part(
        {
          name: "return",
          beat: 6,
          enter: back.enter,
          origin: back.origin,
          order: lane,
          links: ["human>result"],
        },
        strip(back.path, g.width, FILLS[lane], { fillPath: back.fillPath }),
      ),
    );
    const labels: Record<string, LabelPlace> = {
      company: place(g.company.label.at, "start", "below", {
        width: g.company.label.width,
      }),
      human: place(g.human.at, "center", "middle", {
        width: g.human.width,
        ground: "red",
      }),
      result: place(g.result.label.at, "center", "middle", {
        width: g.result.label.width,
        ground: "ink",
      }),
    };
    g.roles.forEach((role, lane) => {
      labels[`role${lane + 1}`] = place(role.role.at, "start", "middle", {
        width: role.role.width,
        ground: "ink",
      });
      labels[`skill${lane + 1}`] = place(role.skill.at, "center", "middle", {
        width: role.skill.width,
      });
    });
    const parts = [
      part(
        { name: "company", beat: 0, enter: "fade", nodes: ["company"] },
        backdrop(
          g.company.rect.x,
          g.company.rect.y,
          g.company.rect.w,
          g.company.rect.h,
        ),
      ),
      part(
        {
          name: "gate",
          beat: 5,
          enter: "wrap",
          origin: g.gate.origin,
          nodes: ["human"],
          marks: ["human:human"],
        },
        gate(g.frame) +
          seal(g.gate.sealAt, g.gate.sealRadius, -8) +
          g.gate.stem +
          plate(g.gate.plate.x, g.gate.plate.y, g.gate.plate.w, g.gate.plate.h),
      ),
      ...rows,
      part(
        { name: "human-reviewer", beat: 5, enter: "rise" },
        figure(g.reviewer.at, g.reviewer.scale, "red"),
      ),
      part({ name: "lanes", beat: 4, enter: "fade", order: 1 }, g.lanes),
      ...returns,
      part(
        {
          name: "result",
          beat: 6,
          enter: g.result.enter,
          origin: g.result.origin,
          order: 4,
          nodes: ["result"],
          marks: ["result:result"],
        },
        resultPanel(g.panel.x, g.panel.y, g.panel.w, g.panel.h),
      ),
    ];
    return { parts, labels };
  },
};

export const contributorsArt = drawn(plan);
