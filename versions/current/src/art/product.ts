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
 * Automations: repeated work crosses systems under human direction and review.
 *
 * The five stages are stated once — the queue of repeated work, the systems
 * it crosses, the operator who directs it, the reviewer who approves it and
 * the copy that leaves. The wide sheet runs them left to right and the narrow
 * one down a column; two copies branch from human direction in both.
 */

const STAGES: readonly Stage[] = [
  { key: "n1", name: "work-queue", beat: 0, enter: "rise", nodes: ["n1"] },
  { key: "n2", name: "system-handoffs", beat: 1, enter: "rise", nodes: ["n2"] },
  { key: "human", name: "operator", beat: 2, enter: "rise", nodes: ["human"] },
  {
    key: "n3",
    name: "reviewer",
    beat: 3,
    enter: "rise",
    nodes: ["n3"],
    marks: ["seal:approved"],
  },
  { key: "n4", name: "output", beat: 4, enter: "rise", nodes: ["n4"] },
];

type OperationsGeometry = {
  xs: readonly number[];
  ys: readonly number[];
  /** Each stage's word, in the stage's own order. */
  labelAt: (index: number) => Pt;
  labelAlign: "start" | "center";
  labelWidth: number;
  connectors: readonly Connector[];
  /** The two copies that branch from human direction. */
  copies: readonly { readonly at: Pt; readonly arrow: Connector }[];
};

const landscape: OperationsGeometry = {
  xs: [100, 300, 500, 700, 900],
  ys: [250, 250, 250, 250, 250],
  labelAt: (index) => [[100, 300, 500, 700, 900][index], 135],
  labelAlign: "center",
  labelWidth: 175,
  connectors: [
    { d: "M186 245 H214", tip: [214, 245], dir: "right" },
    { d: "M386 245 H414", tip: [414, 245], dir: "right" },
    { d: "M586 245 H614", tip: [614, 245], dir: "right" },
    { d: "M786 245 H814", tip: [814, 245], dir: "right" },
  ],
  copies: [
    {
      at: [900, 5],
      arrow: {
        d: "M548 200 H600 V20 H806 V65 H820",
        tip: [820, 65],
        dir: "right",
      },
    },
    {
      at: [900, 565],
      arrow: { d: "M500 488 V605 H820", tip: [820, 605], dir: "right" },
    },
  ],
};

const column = [140, 440, 780, 1120, 1460];
const portrait: OperationsGeometry = {
  xs: [430, 430, 430, 430, 430],
  ys: column,
  labelAt: (index) => [35, column[index] - 15],
  labelAlign: "start",
  labelWidth: 225,
  connectors: column.slice(0, -1).map((y, i) => ({
    d: `M430 ${y + (i < 2 ? 135 : 240)} V${column[i + 1] - 70}`,
    tip: [430, column[i + 1] - 70],
    dir: "down",
  })),
  copies: [
    {
      at: [150, 1675],
      arrow: { d: "M335 780 H18 V1710 H82", tip: [82, 1710], dir: "right" },
    },
    {
      at: [480, 1675],
      arrow: { d: "M524 780 H602 V1710 H552", tip: [552, 1710], dir: "left" },
    },
  ],
};

/** The object each stage is shown by. */
function object(i: number, x: number, y: number): string {
  if (i === 0)
    return (
      [2, 1, 0]
        .map((k) => paper(x - 70 - k * 5, y - 45 - k * 8, 140, 100))
        .join("") + contents(x - 52, y - 18, 108, "priorities")
    );
  if (i === 1)
    return (
      laptop(x - 74, y - 55, 148, "systems") +
      `<path class="s-ink" d="M${x - 36} ${y + 65} V${y + 82} H${x + 36} V${y + 65}" stroke-width="2.5"/>` +
      paper(x - 48, y + 68, 30, 42) +
      paper(x + 18, y + 68, 30, 42)
    );
  if (i === 4)
    return (
      paper(x - 76, y - 55, 152, 120, true) +
      contents(x - 58, y - 20, 116, "actions", true) +
      seal([x + 48, y + 46], 15)
    );
  return (
    laptop(x - 90, y - 58, 125, i === 2 ? "plan" : "tests") +
    colleague([x + 35, y + 105], 0.92, i === 2 ? "point" : "review") +
    folio(x + 38, y + 120, 58, "actions") +
    desk(x - 92, y + 154, 184) +
    (i === 3 ? seal([x + 68, y + 142], 15) : "")
  );
}

const plan: Plan<OperationsGeometry> = {
  size: {
    landscape: { width: 1000, height: 670 },
    portrait: { width: 620, height: 1790 },
  },
  geometry: { landscape, portrait },
  build: (g): Staged => {
    const links = chain(STAGES);
    const staged = stageRun(
      STAGES,
      (_, i) => ({
        origin: [g.xs[i], g.ys[i]],
        label: place(g.labelAt(i), g.labelAlign, "middle", {
          width: g.labelWidth,
          beat: i,
        }),
      }),
      (_, i) => object(i, g.xs[i], g.ys[i]),
    );
    const connectors = g.connectors.map((connector, i) =>
      part(
        { name: "next", beat: i + 1, enter: "fade", links: [links[i]] },
        arrow(connector.d, connector.tip, connector.dir),
      ),
    );
    const branches: string[] = [];
    const copies: string[] = [];
    g.copies.forEach(({ at, arrow: route }, i) => {
      const [x, y] = at;
      branches.push(
        part(
          {
            name: "branch",
            beat: 4,
            enter: "fade",
            links: [`human>out${i + 1}`],
          },
          arrow(route.d, route.tip, route.dir),
        ),
      );
      copies.push(
        part(
          {
            name: "copy",
            beat: 4,
            order: i + 1,
            enter: "rise",
            origin: [x, y],
          },
          paper(x - 66, y, 132, 80) +
            contents(x - 50, y + 16, 96, "owners") +
            seal([x + 46, y + 61], 13),
        ),
      );
    });
    return {
      parts: [
        ...branches.reverse(),
        ...[...connectors].reverse(),
        ...staged.parts,
        ...copies,
      ],
      labels: staged.labels,
    };
  },
};

export const productArt = drawn(plan);
