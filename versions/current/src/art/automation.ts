import { part, place, seal, type Pt } from "./kit";
import { arrow, colleague, contents, desk, folio, laptop, paper } from "./work";
import {
  chain,
  drawn,
  stageRun,
  type Connector,
  type Plan,
  type Staged,
  type Stage,
} from "./compose";

/**
 * Workflows: a customer engagement, with a reusable build and a refit loop.
 *
 * The engagement is one run of five stages — brief, co-design, test and
 * review, handover, review in the customer context — that feeds back into
 * co-design. The stages and their connections are stated once; the wide
 * sheet arranges them across two rows and the narrow one down a column, and
 * each orientation's geometry record carries only those numbers.
 */

const STAGES: readonly Stage[] = [
  { key: "n1", name: "source-material", beat: 0, enter: "rise", nodes: ["n1"] },
  { key: "n2", name: "co-design", beat: 1, enter: "rise", nodes: ["n2"] },
  { key: "n3", name: "customer-review", beat: 2, enter: "rise", nodes: ["n3"] },
  { key: "human", name: "handover", beat: 3, enter: "rise", nodes: ["human"] },
  { key: "n4", name: "customer-review", beat: 4, enter: "rise", nodes: ["n4"] },
];

type Anchor = {
  readonly at: Pt;
  readonly align: "start" | "center";
  readonly width: number;
};

type EngagementGeometry = {
  xs: readonly number[];
  ys: readonly number[];
  /** The stage's box width; every object and word is measured from it. */
  w: number;
  connectors: readonly Connector[];
  gate: Pt;
  /** The wide sheet ties the review point down to its decision word. */
  gateStem: boolean;
  decision: Anchor;
  returnPath: string;
  returnTip: Pt;
  returnDir: "down" | "right";
};

const landscape: EngagementGeometry = {
  xs: [70, 390, 710, 710, 390],
  ys: [100, 100, 100, 490, 490],
  w: 250,
  connectors: [
    { d: "M330 260 H378", tip: [378, 260], dir: "right" },
    { d: "M650 260 H698", tip: [698, 260], dir: "right" },
    { d: "M835 378 V478", tip: [835, 478], dir: "down" },
    { d: "M700 650 H650", tip: [650, 650], dir: "left" },
  ],
  gate: [674, 650],
  gateStem: true,
  decision: { at: [710, 845], align: "center", width: 410 },
  returnPath: "M490 785 V905 H28 V30 H515 V88",
  returnTip: [515, 88],
  returnDir: "down",
};

const column = [40, 340, 640, 940, 1370];
const portrait: EngagementGeometry = {
  xs: [120, 120, 120, 120, 120],
  ys: column,
  w: 400,
  connectors: column.slice(0, -1).map((y, i) => ({
    d:
      i === 3
        ? "M320 1214 V1240 H90 V1348 H320 V1358"
        : `M320 ${y + 274} V${column[i + 1] - 12}`,
    tip: [320, column[i + 1] - 12],
    dir: "down",
  })),
  gate: [90, 1290],
  gateStem: false,
  decision: { at: [145, 1290], align: "start", width: 430 },
  returnPath: "M120 1510 H28 V400 H108",
  returnTip: [108, 400],
  returnDir: "right",
};

/** The object each stage is shown by: the work as it is passed along. */
function object(i: number, x: number, y: number, w: number): string {
  const cx = x + w / 2;
  if (i === 0)
    return (
      folio(cx - 93, y + 120, 145, "owners") +
      paper(cx + 16, y + 140, 82, 95) +
      contents(cx + 25, y + 160, 65, "priorities")
    );
  if (i === 1)
    return (
      laptop(cx - 82, y + 105, 164, "plan") +
      colleague([cx - 104, y + 204], 0.75, "point") +
      colleague([cx + 116, y + 204], 0.75, "read", "left") +
      desk(x - 12, y + 242, w + 24)
    );
  if (i === 2 || i === 4)
    return (
      laptop(cx - 96, y + 111, 122, i === 2 ? "tests" : "owners") +
      colleague([cx + 50, y + 196], 0.85, "review") +
      desk(x - 8, y + 239, w + 16) +
      seal([cx + 103, y + 223], 16)
    );
  return (
    laptop(cx - 98, y + 121, 134, "plan") +
    folio(cx + 50, y + 169, 66, "actions") +
    colleague([cx + 72, y + 139], 0.75, "point", "left") +
    desk(x - 10, y + 244, w + 20)
  );
}

const plan: Plan<EngagementGeometry> = {
  size: {
    landscape: { width: 1000, height: 1020 },
    portrait: { width: 620, height: 1770 },
  },
  geometry: { landscape, portrait },
  build: (g, size): Staged => {
    const links = chain(STAGES);
    const staged = stageRun(
      STAGES,
      (_, i) => {
        const cx = g.xs[i] + g.w / 2;
        const y = g.ys[i];
        return {
          origin: [cx, y + 245],
          label: place([cx, y + 45], "center", "middle", {
            width: g.w - 14,
            ground: i === 3 ? "red" : "paper",
            beat: i,
          }),
        };
      },
      (_, i) => {
        const x = g.xs[i];
        const y = g.ys[i];
        const heading =
          (i === 3
            ? `<rect class="f-red" x="${x - 10}" y="${y}" width="${g.w + 20}" height="90" rx="5"/>`
            : "") +
          `<text class="f-${i === 3 ? "paper" : "muted"}" x="${i === 3 ? x + 2 : x - 16}" y="${y + 50}" font-size="20" font-family="var(--font-display)">${i + 1}</text>`;
        return heading + object(i, x, y, g.w);
      },
    );
    const connectors = g.connectors.map((connector, i) =>
      stageLink(links[i], connector, i + 1),
    );
    const [gx, gy] = g.gate;
    const parts = [
      stageLink(
        "n4>n2",
        { d: g.returnPath, tip: g.returnTip, dir: g.returnDir },
        5,
        "refit",
      ),
      ...[...connectors].reverse(),
      ...staged.parts,
      reviewPoint(gx, gy, g.gateStem),
    ];
    return {
      parts,
      labels: {
        ...staged.labels,
        decision: place(g.decision.at, g.decision.align, "middle", {
          width: g.decision.width,
          beat: 4,
        }),
        iteration: place(
          [size.width / 2, size.height - 70],
          "center",
          "middle",
          {
            width: size.width - 110,
            beat: 5,
          },
        ),
      },
    };
  },
};

/** One connector part: an arrow under the stages, joining two of them. */
function stageLink(
  link: string,
  connector: Connector,
  beat: number,
  name = "next",
): string {
  return part(
    { name, beat, enter: "fade", links: [link] },
    arrow(connector.d, connector.tip, connector.dir),
  );
}

/** The review point: a person's seal on a lozenge, before the result leaves. */
function reviewPoint(x: number, y: number, stem: boolean): string {
  return part(
    { name: "review-point", beat: 4, enter: "pop", marks: ["seal:n4"] },
    `<path class="f-paper s-ink" d="M${x} ${y - 25} L${x + 25} ${y} L${x} ${y + 25} L${x - 25} ${y} Z" stroke-width="3"/>` +
      seal([x, y], 13) +
      (stem
        ? `<path class="s-red" d="M${x} ${y + 25} V804" stroke-width="2"/>`
        : ""),
  );
}

export const automationArt = drawn(plan);
