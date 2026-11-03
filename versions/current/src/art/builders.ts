import { part, place, seal, type Pt } from "./kit";
import {
  arrow,
  colleague,
  contents,
  desk,
  folio,
  laptop,
  paper,
  type WorkSurface,
} from "./work";
import {
  chain,
  drawn,
  stageRun,
  type Anchor,
  type Connector,
  type Plan,
  type Staged,
  type Stage,
} from "./compose";

/**
 * Builders learn together by testing their own build and investigating
 * failures.
 *
 * One learner works through four stations and arrives at a shared build made
 * of three joined parts. The stations, their kinds, their checks and the
 * connections between them are stated once; the wide sheet stands three
 * stations in a row above two more, the narrow one stacks all five.
 */

type Station = Stage & { readonly surface: WorkSurface };

const STATIONS: readonly Station[] = [
  {
    key: "design",
    name: "proving-station",
    beat: 1,
    enter: "rise",
    nodes: ["design"],
    marks: ["check:design"],
    surface: "plan",
  },
  {
    key: "test",
    name: "proving-station",
    beat: 2,
    enter: "rise",
    nodes: ["test"],
    marks: ["check:test"],
    surface: "tests",
  },
  {
    key: "troubleshoot",
    name: "proving-station",
    beat: 3,
    enter: "rise",
    nodes: ["troubleshoot"],
    marks: ["check:troubleshoot"],
    surface: "fault",
  },
  {
    key: "anticipate",
    name: "proving-station",
    beat: 4,
    enter: "rise",
    nodes: ["anticipate"],
    marks: ["check:anticipate"],
    surface: "failures",
  },
  {
    key: "workflow",
    name: "shared-build",
    beat: 5,
    enter: "rise",
    nodes: ["workflow"],
    marks: ["result:workflow"],
    surface: "actions",
  },
];

/** Two stations that show a colleague pointing at the work. */
const POINTED: Record<string, true> = { troubleshoot: true, workflow: true };

type Person = {
  readonly dx: number;
  readonly dy: number;
  readonly scale: number;
};

type ProvingGeometry = {
  xs: readonly number[];
  ys: readonly number[];
  widths: readonly number[];
  learner: { label: Anchor; at: Pt; arrow: Connector };
  /** The screen sits this far into the station's box, and is this wide. */
  screen: {
    dx: (width: number) => number;
    width: number;
    folioDy: number;
    laptopDy: number;
  };
  /** A reviewer at every station, a pointer at the ones that need one. */
  people: (width: number) => readonly Person[];
  checkDx: (width: number) => number;
  connectors: readonly Connector[];
  /** The three-pane build below the stations, and the arrow down to it. */
  components: { bx: number; by: number; entry: Connector };
};

const landscape: ProvingGeometry = {
  xs: [30, 355, 680, 60, 550],
  ys: [190, 190, 190, 550, 550],
  widths: [280, 280, 280, 370, 410],
  learner: {
    label: { at: [165, 80], width: 680 },
    at: [87, 80],
    arrow: { d: "M123 114 H170 V176", tip: [170, 176], dir: "down" },
  },
  screen: {
    dx: (width) => width / 2 - 83,
    width: 166,
    folioDy: 95,
    laptopDy: 80,
  },
  people: (width) => [
    { dx: width / 2 - 80, dy: 203, scale: 0.75 },
    { dx: width / 2 + 118, dy: 199, scale: 0.75 },
  ],
  checkDx: (width) => width / 2 - 32,
  connectors: [
    { d: "M316 330 H347", tip: [347, 330], dir: "right" },
    { d: "M641 330 H672", tip: [672, 330], dir: "right" },
    { d: "M965 325 H982 V510 H245 V535", tip: [245, 535], dir: "down" },
    { d: "M440 695 H538", tip: [538, 695], dir: "right" },
  ],
  components: {
    bx: 585,
    by: 895,
    entry: { d: "M755 878 V887", tip: [755, 887], dir: "down" },
  },
};

const portraitColumn = [160, 505, 850, 1195, 1540];
const portrait: ProvingGeometry = {
  xs: [50, 50, 50, 50, 50],
  ys: portraitColumn,
  widths: [520, 520, 520, 520, 520],
  learner: {
    label: { at: [140, 80], width: 440 },
    at: [74, 80],
    arrow: { d: "M95 136 H310 V146", tip: [310, 146], dir: "down" },
  },
  screen: { dx: () => 205, width: 270, folioDy: 95, laptopDy: 80 },
  people: () => [
    { dx: 85, dy: 197, scale: 0.9 },
    { dx: 448, dy: 186, scale: 0.85 },
  ],
  checkDx: () => 141,
  connectors: portraitColumn.slice(0, -1).map((y, i) => ({
    d: `M310 ${y + 290} V${portraitColumn[i + 1] - 16}`,
    tip: [310, portraitColumn[i + 1] - 16],
    dir: "down" as const,
  })),
  components: {
    bx: 155,
    by: 1950,
    entry: { d: "M310 1870 V1939", tip: [310, 1939], dir: "down" },
  },
};

const plan: Plan<ProvingGeometry> = {
  size: {
    landscape: { width: 1000, height: 970 },
    portrait: { width: 620, height: 2030 },
  },
  geometry: { landscape, portrait },
  build: (g): Staged => {
    const links = chain(STATIONS);
    const staged = stageRun(
      STATIONS,
      (station, i) => {
        const x = g.xs[i],
          y = g.ys[i],
          width = g.widths[i];
        return {
          origin: [x + width / 2, y + 250],
          label: place([x + width / 2, y + 25], "center", "middle", {
            width: width - 15,
            ground: station.key === "workflow" ? "ink" : "paper",
          }),
        };
      },
      (station, i) => stationBody(g, station, i),
    );
    const connectors = g.connectors.map((connector, i) =>
      part(
        { name: "next", beat: i + 2, enter: "fade", links: [links[i]] },
        arrow(connector.d, connector.tip, connector.dir),
      ),
    );
    return {
      parts: [
        ...[...connectors].reverse(),
        learner(g),
        ...staged.parts,
        components(g),
      ],
      labels: {
        learner: place(g.learner.label.at, "start", "middle", {
          width: g.learner.label.width,
        }),
        ...staged.labels,
      },
    };
  },
};

/** The learner who works through every station, and the arrow into Design. */
function learner(g: ProvingGeometry): string {
  return part(
    {
      name: "learner",
      beat: 0,
      enter: "rise",
      marks: ["person:learner"],
      nodes: ["learner"],
      links: ["learner>design"],
    },
    colleague(g.learner.at, 0.62, "point") +
      arrow(g.learner.arrow.d, g.learner.arrow.tip, g.learner.arrow.dir),
  );
}

/** One station: its heading, screen, people, desk and reviewer's check. */
function stationBody(g: ProvingGeometry, station: Station, i: number): string {
  const x = g.xs[i],
    y = g.ys[i],
    width = g.widths[i];
  const heading =
    station.key === "workflow"
      ? `<rect class="f-ink" x="${x}" y="${y - 15}" width="${width}" height="80" rx="5"/>`
      : "";
  const screenX = x + g.screen.dx(width);
  const [reviewer, pointer] = g.people(width);
  const screen =
    station.key === "design" || station.key === "anticipate"
      ? folio(screenX, y + g.screen.folioDy, g.screen.width, station.surface)
      : laptop(screenX, y + g.screen.laptopDy, g.screen.width, station.surface);
  const people =
    colleague([x + reviewer.dx, y + reviewer.dy], reviewer.scale, "review") +
    (POINTED[station.key]
      ? colleague(
          [x + pointer.dx, y + pointer.dy],
          pointer.scale,
          "point",
          "left",
        )
      : "");
  const check =
    station.key === "workflow" ? "" : seal([x + g.checkDx(width), y + 229], 16);
  return heading + screen + people + desk(x, y + 245, width) + check;
}

/** The reusable build: three joined panes under the last station. */
function components(g: ProvingGeometry): string {
  const { bx, by, entry } = g.components;
  const panes = [0, 1, 2]
    .map(
      (i) =>
        paper(bx + i * 112, by, 94, 52) +
        `<g transform="translate(${bx + i * 112 + 12} ${by + 12}) scale(.55)">${contents(0, 0, 120, "owners")}</g>` +
        (i < 2
          ? arrow(
              `M${bx + i * 112 + 97} ${by + 26} H${bx + (i + 1) * 112 - 3}`,
              [bx + (i + 1) * 112 - 3, by + 26],
            )
          : ""),
    )
    .join("");
  return part(
    { name: "components", beat: 6, enter: "rise", links: ["workflow>blocks"] },
    arrow(entry.d, entry.tip, entry.dir) + panes,
  );
}

export const buildersArt = drawn(plan);
