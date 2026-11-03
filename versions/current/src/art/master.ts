import {
  easeX,
  identityFill,
  part,
  place,
  plait,
  solidStrip,
  strip,
  tag,
  type Entrance,
  type Pt,
} from "./kit";
import {
  drawn,
  type Anchor,
  type Plan,
  type Rect,
  type Staged,
} from "./compose";

/**
 * The Found42 drawing: the plait. It sits beside the industry pages' copy; the
 * homepage opening no longer carries a drawing.
 *
 * The three things a business already has arrive as three strands of their
 * own tone — your people, your workflows, what your business knows. They are
 * plaited into one, and the plait holds only because a red band is tied round
 * it: human direction. Past the band the work leaves as one solid piece with
 * a tag on it, practical AI at work; on the wide sheet two more tails leave
 * with blank tags — the same work reaching further, unnamed.
 *
 * The stranded, bound and tagged pieces are described once; the two sheets
 * differ only in where the plait runs, which way its strands arrive and how
 * the band is tied.
 */

const WIDTH = 40;
const LANE = 46;

const STRAND_KEYS = ["n1", "n2", "n3"] as const;

type Strand = {
  /** The path the strand arrives along, and the y of its cut end. */
  readonly path: string;
  readonly pad: number;
  readonly origin: Pt;
};

type Tail = {
  readonly path: string;
  readonly tagAt: Pt;
  readonly turn: number;
};

type Output = {
  readonly path: string;
  readonly enter: Entrance;
  readonly at: Pt;
  readonly tagAt: Pt;
  readonly width: number;
  readonly height: number;
  readonly turn: number;
};

type MasterGeometry = {
  readonly lanes: readonly [number, number, number];
  /** The strand fills, in the order the strands arrive. */
  readonly fills: readonly [string, string, string];
  /** The fills the plait weaves, in lane order. */
  readonly braidFills: readonly [string, string, string];
  readonly start: number;
  readonly step: number;
  readonly crossings: number;
  readonly axis: "x" | "y";
  readonly strands: readonly Strand[];
  readonly plaitAt: Pt;
  readonly band: Rect;
  /** The darker face of the band, and the cord that ties it to its plate. */
  readonly cuff: string;
  readonly cord: string;
  readonly cordAt: Pt;
  readonly plate: Rect;
  readonly bindingAt: Pt;
  readonly directionAt: Pt;
  readonly output: Output;
  readonly tails: readonly Tail[];
  readonly labels: Record<"n1" | "n2" | "n3" | "human" | "n4", Anchor>;
};

const landscapeLanes = [310 - LANE, 310, 310 + LANE] as const;
const landscapeStart = 330;
const landscapeEnd = landscapeStart + 58 * 5;
const landscapeBand: Rect = {
  x: landscapeEnd - 2,
  y: landscapeLanes[0] - 40,
  w: 50,
  h: landscapeLanes[2] - landscapeLanes[0] + 80,
};
const landscapeOut = landscapeBand.x + landscapeBand.w;
const landscapeCord = landscapeBand.x + landscapeBand.w / 2;
const landscapePlate: Rect = { x: landscapeCord - 130, y: 452, w: 260, h: 56 };

const landscape: MasterGeometry = {
  lanes: landscapeLanes,
  fills: [identityFill.n1, identityFill.n2, identityFill.n3],
  braidFills: [identityFill.n1, identityFill.n2, identityFill.n3],
  start: landscapeStart,
  step: 58,
  crossings: 5,
  axis: "x",
  strands: [
    {
      path: `M40 108 L120 108 ${easeX([120, 108], [landscapeStart, landscapeLanes[0]], 0.55)}`,
      pad: 108,
      origin: [40, 310],
    },
    { path: `M40 310 L${landscapeStart} 310`, pad: 310, origin: [40, 310] },
    {
      path: `M40 512 L120 512 ${easeX([120, 512], [landscapeStart, landscapeLanes[2]], 0.55)}`,
      pad: 512,
      origin: [40, 310],
    },
  ],
  plaitAt: [landscapeStart, 310],
  band: landscapeBand,
  cuff: `<rect class="f-red-deep" x="${landscapeBand.x + landscapeBand.w - 16}" y="${landscapeBand.y}" width="16" height="${landscapeBand.h}" rx="5"/>`,
  cord: `M${landscapeCord} ${landscapeBand.y + landscapeBand.h} L${landscapeCord} ${landscapePlate.y}`,
  cordAt: [landscapeCord, landscapePlate.y + 10],
  plate: landscapePlate,
  bindingAt: [landscapeCord, 310],
  directionAt: [landscapeCord, landscapeBand.y + landscapeBand.h],
  output: {
    path: `M${landscapeOut} 310 L766 310`,
    enter: "slide-right",
    at: [landscapeOut, 310],
    tagAt: [760, 310],
    width: 230,
    height: 112,
    turn: 0,
  },
  tails: [
    {
      path: `M${landscapeOut} ${landscapeLanes[0] + 6} ${easeX([landscapeOut, landscapeLanes[0] + 6], [880, 132], 0.6)}`,
      tagAt: [880, 132],
      turn: -12,
    },
    {
      path: `M${landscapeOut} ${landscapeLanes[2] - 6} ${easeX([landscapeOut, landscapeLanes[2] - 6], [880, 488], 0.6)}`,
      tagAt: [880, 488],
      turn: 12,
    },
  ],
  labels: {
    n1: { at: [40, 80] },
    n2: { at: [40, 282] },
    n3: { at: [40, 548] },
    human: {
      at: [landscapeCord, landscapePlate.y + landscapePlate.h / 2 + 3],
      width: landscapePlate.w - 24,
    },
    n4: { at: [760 + 22 + (230 - 22) / 2, 310], width: 184 },
  },
};

// Lanes left to right take the strands in reverse, so their corners nest.
const portraitLanes = [492 - LANE * 2, 492 - LANE, 492] as const;
const portraitStart = 330;
const portraitEnd = portraitStart + 52 * 5;
const portraitMid = portraitLanes[1];
const portraitBand: Rect = {
  x: portraitLanes[0] - 40,
  y: portraitEnd - 2,
  w: portraitLanes[2] - portraitLanes[0] + 80,
  h: 48,
};
const portraitCordY = portraitBand.y + portraitBand.h / 2;
const portraitPlate: Rect = { x: 40, y: portraitCordY - 30, w: 296, h: 60 };
const portraitRows = [80, 190, 300] as const;
const portraitToLane = [
  portraitLanes[2],
  portraitLanes[1],
  portraitLanes[0],
] as const;
const portraitOut = portraitBand.y + portraitBand.h;

const portrait: MasterGeometry = {
  lanes: portraitLanes,
  fills: [identityFill.n1, identityFill.n2, identityFill.n3],
  braidFills: [identityFill.n3, identityFill.n2, identityFill.n1],
  start: portraitStart,
  step: 52,
  crossings: 5,
  axis: "y",
  strands: portraitRows.map((y, index) => {
    const x = portraitToLane[index];
    return {
      path: `M40 ${y} L${x - 60} ${y} C${x - 20} ${y} ${x} ${y + 20} ${x} ${y + 60} L${x} ${portraitStart}`,
      pad: y,
      origin: [40, y],
    };
  }),
  plaitAt: [portraitMid, portraitStart],
  band: portraitBand,
  cuff: `<rect class="f-red-deep" x="${portraitBand.x}" y="${portraitBand.y + portraitBand.h - 15}" width="${portraitBand.w}" height="15" rx="5"/>`,
  cord: `M${portraitPlate.x + portraitPlate.w} ${portraitCordY} L${portraitBand.x} ${portraitCordY}`,
  cordAt: [portraitPlate.x + portraitPlate.w - 12, portraitCordY],
  plate: portraitPlate,
  bindingAt: [portraitMid, portraitCordY],
  directionAt: [portraitBand.x, portraitCordY],
  output: {
    path: `M${portraitMid} ${portraitOut} L${portraitMid} 700`,
    enter: "slide-down",
    at: [portraitMid, portraitOut],
    tagAt: [portraitMid, 694],
    width: 140,
    height: 300,
    turn: 90,
  },
  tails: [],
  labels: {
    n1: { at: [40, portraitRows[0] - 30], width: 400 },
    n2: { at: [40, portraitRows[1] - 30], width: 360 },
    n3: { at: [40, portraitRows[2] + 30], width: 300 },
    human: {
      at: [portraitPlate.x + (portraitPlate.w - 20) / 2, portraitCordY + 2],
      width: portraitPlate.w - 40,
    },
    n4: { at: [portraitMid, 694 + 22 + (140 - 22) / 2], width: 260 },
  },
};

const plan: Plan<MasterGeometry> = {
  size: {
    landscape: { width: 1000, height: 620 },
    portrait: { width: 620, height: 870 },
  },
  geometry: { landscape, portrait },
  build: (g): Staged => {
    const braid = plait({
      start: g.start,
      step: g.step,
      crossings: g.crossings,
      lanes: g.lanes,
      width: WIDTH,
      fills: g.braidFills,
      axis: g.axis,
    });
    const plate = g.plate;
    const binding =
      `<rect class="f-red-deep" x="${g.band.x + 6}" y="${g.band.y + 6}" width="${g.band.w}" height="${g.band.h}" rx="7" opacity="0.28"/>` +
      `<rect class="f-red" x="${g.band.x}" y="${g.band.y}" width="${g.band.w}" height="${g.band.h}" rx="7"/>` +
      g.cuff;
    const human =
      `<path class="s-red" d="${g.cord}" stroke-width="4" fill="none"/>` +
      `<rect class="f-red-deep" x="${plate.x + 5}" y="${plate.y + 6}" width="${plate.w}" height="${plate.h}" rx="6" opacity="0.28"/>` +
      `<rect class="f-red" x="${plate.x}" y="${plate.y}" width="${plate.w}" height="${plate.h}" rx="6"/>` +
      `<circle class="f-paper" cx="${g.cordAt[0]}" cy="${g.cordAt[1]}" r="4.5"/>`;
    const parts = [
      ...g.tails.map((tail, index) =>
        part(
          {
            name: "tail",
            beat: 2,
            enter: "slide-right",
            order: index + 1,
            origin: g.output.at,
            links: [`human>out${index + 1}`],
          },
          solidStrip(tail.path, 22, "ink") +
            tag(tail.tagAt, 70, 40, { tone: "paper", turn: tail.turn }),
        ),
      ),
      part(
        {
          name: "output",
          beat: 2,
          enter: g.output.enter,
          origin: g.output.at,
          nodes: ["n4"],
          links: ["human>n4"],
        },
        solidStrip(g.output.path, WIDTH + 12, "ink") +
          tag(g.output.tagAt, g.output.width, g.output.height, {
            tone: "ink",
            turn: g.output.turn,
          }),
      ),
      ...g.strands.map((strand, index) =>
        part(
          {
            name: "strand",
            beat: 0,
            enter: "slide-right",
            order: index,
            origin: strand.origin,
            nodes: [STRAND_KEYS[index]],
            links: [`${STRAND_KEYS[index]}>human`],
          },
          strip(strand.path, WIDTH, g.fills[index]) +
            `<path class="s-ink" d="M40 ${strand.pad - WIDTH / 2 - 3} l0 ${WIDTH + 6}" stroke-width="3"/>`,
        ),
      ),
      part(
        {
          name: "plait",
          beat: 1,
          enter: g.axis === "y" ? "unfold-y" : "unfold-x",
          origin: g.plaitAt,
        },
        braid.strands.join("") + braid.overs,
      ),
      part(
        {
          name: "binding",
          beat: 1,
          enter: "wrap",
          order: 1,
          origin: g.bindingAt,
          nodes: ["human"],
        },
        binding,
      ),
      part(
        {
          name: "direction",
          beat: 1,
          enter: "swing",
          order: 2,
          origin: g.directionAt,
        },
        human,
      ),
    ];
    return {
      parts,
      labels: {
        n1: place(g.labels.n1.at, "start", "above", {
          width: g.labels.n1.width,
          beat: 0,
        }),
        n2: place(g.labels.n2.at, "start", "above", {
          width: g.labels.n2.width,
          beat: 0,
        }),
        n3: place(g.labels.n3.at, "start", "below", {
          width: g.labels.n3.width,
          beat: 0,
        }),
        human: place(g.labels.human.at, "center", "middle", {
          width: g.labels.human.width,
          ground: "red",
          beat: 1,
        }),
        n4: place(g.labels.n4.at, "center", "middle", {
          width: g.labels.n4.width,
          ground: "ink",
          beat: 2,
        }),
      },
    };
  },
};

export const masterArt = drawn(plan);
