import {
  figure,
  place,
  r,
  seal,
  stander,
  strip,
  tag,
  type Align,
  type Baseline,
  type Entrance,
  type Ground,
  type Pt,
} from "./kit";
import {
  drawn,
  stageRun,
  type Anchor,
  type Plan,
  type Rect,
  type Staged,
  type Stage,
} from "./compose";

/**
 * Workshops: people designing, practising and reviewing together.
 *
 * A team stands at a whiteboard with sticky notes and a diagram of its real
 * work — the design-thinking half of a workshop. The same people then sit at a
 * keyboard for live guided practice, gather under the red banner for group
 * review, and leave with a reusable skill they apply afterwards, back at the
 * work they started from. People are charcoal, red and white cut paper with
 * charcoal outlines; the ribbon that joins the stages is solid.
 *
 * The seven stages, their words and their connections are stated once. The
 * wide sheet runs them roughly left to right and the narrow one carries the
 * same loop down and around; only the placements come from geometry.
 */

const RIBBON = "var(--paper-warm)";

/** A whiteboard with a small diagram and sticky notes, on a tray. */
function whiteboard(x: number, y: number, w: number, h: number): string {
  const box = (bx: number, by: number) =>
    `<rect class="f-warm s-ink" x="${r(bx)}" y="${r(by)}" width="${r(w * 0.17)}" height="${r(h * 0.19)}" rx="4" stroke-width="2.2"/>`;
  const arrow = (ax: number, ay: number, bx: number) =>
    `<path class="s-ink" d="M${r(ax)} ${r(ay)} L${r(bx)} ${r(ay)} M${r(bx - 7)} ${r(ay - 5)} L${r(bx)} ${r(ay)} L${r(bx - 7)} ${r(ay + 5)}" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
  const note = (nx: number, ny: number, tone: string, turn: number) =>
    `<rect class="${tone} s-ink" x="${r(nx)}" y="${r(ny)}" width="${r(w * 0.14)}" height="${r(w * 0.14)}" rx="2" stroke-width="2" transform="rotate(${turn} ${r(nx + w * 0.07)} ${r(ny + w * 0.07)})"/>`;
  const dy = y + h * 0.3;
  return (
    `<rect class="f-sunk" x="${x + 6}" y="${y + 7}" width="${w}" height="${h}" rx="6"/>` +
    `<rect class="f-paper s-ink" x="${x}" y="${y}" width="${w}" height="${h}" rx="6" stroke-width="4"/>` +
    box(x + w * 0.08, dy) +
    arrow(x + w * 0.27, dy + h * 0.095, x + w * 0.37) +
    box(x + w * 0.38, dy) +
    arrow(x + w * 0.57, dy + h * 0.095, x + w * 0.67) +
    box(x + w * 0.68, dy) +
    note(x + w * 0.1, y + h * 0.62, "f-warm", -6) +
    note(x + w * 0.3, y + h * 0.66, "f-sunk", 5) +
    note(x + w * 0.5, y + h * 0.6, "f-paper", -3) +
    note(x + w * 0.7, y + h * 0.65, "f-warm", 7) +
    `<rect class="f-ink" x="${x + 10}" y="${y + h}" width="${w - 20}" height="9" rx="3"/>`
  );
}

/** A desk with a laptop, and two people seated at it. */
function desk(x: number, y: number, w: number): string {
  const top = y + 66;
  return (
    `<rect class="f-ink" x="${x + 14}" y="${top + 12}" width="10" height="70" rx="3"/>` +
    `<rect class="f-ink" x="${x + w - 24}" y="${top + 12}" width="10" height="70" rx="3"/>` +
    figure([x + 40, top - 16], 1.5, "ink") +
    figure([x + w - 44, top - 12], 1.35, "strand") +
    // The laptop: a screen with a cursor block, on a base, hands on the keys.
    `<rect class="f-sunk" x="${x + w / 2 - 44 + 5}" y="${y + 6 + 5}" width="96" height="62" rx="5"/>` +
    `<rect class="f-paper s-ink" x="${x + w / 2 - 44}" y="${y + 6}" width="96" height="62" rx="5" stroke-width="3"/>` +
    `<rect class="f-ink" x="${x + w / 2 - 30}" y="${y + 20}" width="34" height="6" rx="2"/>` +
    `<rect class="f-ink" x="${x + w / 2 - 30}" y="${y + 34}" width="60" height="6" rx="2"/>` +
    `<rect class="f-ink" x="${x + w / 2 - 56}" y="${top - 6}" width="120" height="9" rx="4"/>` +
    `<rect class="f-ink" x="${x}" y="${top + 2}" width="${w}" height="14" rx="4"/>`
  );
}

/** A red banner on two posts, over the people gathered under it. */
function banner(
  x: number,
  y: number,
  w: number,
  h: number,
  drop: number,
): string {
  return (
    `<rect class="f-ink" x="${x + 12}" y="${y + h}" width="7" height="${drop}"/>` +
    `<rect class="f-ink" x="${x + w - 19}" y="${y + h}" width="7" height="${drop}"/>` +
    `<rect class="f-red-deep" x="${x + 5}" y="${y + 6}" width="${w}" height="${h}" rx="6" opacity="0.28"/>` +
    `<rect class="f-red" x="${x}" y="${y}" width="${w}" height="${h}" rx="6"/>`
  );
}

/** A tag, sealed by a reviewer: the reusable skill the team leaves with. */
const takeaway = (at: Pt, width: number, height: number) =>
  tag(at, width, height, { tone: "ink" }) +
  seal([at[0] + width - 28, at[1]], 17, -8);

const STAGES: readonly Stage[] = [
  { key: "n1", name: "whiteboard", beat: 0, enter: "unfold-y", nodes: ["n1"] },
  { key: "designers", name: "designers", beat: 0, order: 1, enter: "rise" },
  {
    key: "n2",
    name: "desk",
    beat: 1,
    enter: "slide-right",
    nodes: ["n2"],
    links: ["n2>human"],
  },
  {
    key: "flow",
    name: "flow",
    beat: 1,
    order: 1,
    enter: "slide-right",
    links: ["n1>human"],
  },
  {
    key: "human",
    name: "review",
    beat: 1,
    order: 2,
    enter: "swing",
    nodes: ["human"],
    links: ["human>n3"],
  },
  {
    key: "n3",
    name: "takeaway",
    beat: 2,
    enter: "swing",
    nodes: ["n3"],
    links: ["n3>n4"],
  },
  {
    key: "n4",
    name: "return",
    beat: 3,
    enter: "unfold-y",
    nodes: ["n4"],
    links: ["n4>n1"],
  },
];

type LabelKey = "n1" | "n2" | "human" | "n3" | "n4";

type Word = {
  readonly align: Align;
  readonly baseline: Baseline;
  readonly ground?: Ground;
  readonly beat: number;
};

/** The words themselves: how each is set, wherever the sheet places it. */
const LABELS: Record<LabelKey, Word> = {
  n1: { align: "start", baseline: "above", beat: 0 },
  n2: { align: "start", baseline: "above", beat: 1 },
  human: { align: "center", baseline: "middle", ground: "red", beat: 1 },
  n3: { align: "center", baseline: "below", beat: 2 },
  n4: { align: "center", baseline: "middle", beat: 3 },
};

/** A narrow sheet may set a word above where the wide one sets it below. */
type TrainingAnchor = Anchor & { readonly baseline?: Baseline };

type Placement = { readonly origin: Pt; readonly enter?: Entrance };

type Group = { readonly at: Pt; readonly scale: number };

type Banner = {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly drop: number;
};

type TrainingGeometry = {
  readonly whiteboard: Rect;
  readonly designers: readonly Group[];
  readonly desk: { readonly x: number; readonly y: number; readonly w: number };
  readonly flow: { readonly path: string };
  readonly review: {
    readonly banner: Banner;
    readonly people: readonly (Group & {
      readonly tone: "ink" | "strand" | "paper";
    })[];
    readonly sealAt: Pt;
  };
  readonly takeaway: {
    readonly path: string;
    readonly at: Pt;
    readonly width: number;
    readonly height: number;
  };
  readonly back: { readonly path: string };
  readonly places: Readonly<Record<string, Placement>>;
  readonly labels: Readonly<Record<LabelKey, TrainingAnchor>>;
};

const landscape: TrainingGeometry = {
  whiteboard: { x: 50, y: 150, w: 270, h: 170 },
  designers: [
    { at: [110, 440], scale: 1 },
    { at: [260, 440], scale: 1 },
  ],
  desk: { x: 370, y: 270, w: 250 },
  flow: { path: "M40 470 L860 470" },
  review: {
    banner: { x: 646, y: 200, w: 224, h: 44, drop: 200 },
    people: [
      { at: [715, 440], scale: 0.96, tone: "strand" },
      { at: [765, 440], scale: 1, tone: "paper" },
      { at: [815, 440], scale: 0.96, tone: "ink" },
    ],
    sealAt: [866, 204],
  },
  takeaway: {
    path: "M860 470 L880 470",
    at: [868, 350],
    width: 112,
    height: 64,
  },
  back: {
    path: "M900 490 L900 540 C900 556 890 566 870 566 L110 566 C90 566 80 556 80 540 L80 490",
  },
  places: {
    n1: { origin: [50, 150] },
    designers: { origin: [180, 440] },
    n2: { origin: [370, 300] },
    flow: { origin: [40, 470] },
    human: { origin: [758, 200] },
    n3: { origin: [866, 350] },
    n4: { origin: [900, 480] },
  },
  labels: {
    n1: { at: [50, 126], width: 400 },
    n2: { at: [380, 246], width: 270 },
    human: { at: [758, 222], width: 196 },
    n3: { at: [924, 396], width: 130 },
    n4: { at: [500, 594], width: 380 },
  },
};

const portrait: TrainingGeometry = {
  whiteboard: { x: 30, y: 150, w: 270, h: 150 },
  designers: [
    { at: [84, 420], scale: 0.9 },
    { at: [230, 420], scale: 0.9 },
  ],
  desk: { x: 340, y: 232, w: 250 },
  flow: {
    path: "M30 446 L572 446 C596 446 606 460 606 478 C606 496 596 510 572 510 L60 510",
  },
  review: {
    banner: { x: 30, y: 540, w: 260, h: 44, drop: 160 },
    people: [
      { at: [80, 744], scale: 0.96, tone: "strand" },
      { at: [160, 744], scale: 1, tone: "paper" },
      { at: [240, 744], scale: 0.96, tone: "ink" },
    ],
    sealAt: [286, 544],
  },
  takeaway: {
    path: "M330 510 L330 640 L360 640",
    at: [370, 640],
    width: 200,
    height: 64,
  },
  back: {
    path: "M520 690 L520 770 C520 786 510 796 494 796 L50 796 C32 796 22 786 22 770 L22 320",
  },
  places: {
    n1: { origin: [30, 150] },
    designers: { origin: [150, 420] },
    n2: { origin: [340, 260], enter: "slide-left" },
    flow: { origin: [30, 446] },
    human: { origin: [160, 534] },
    n3: { origin: [370, 640] },
    n4: { origin: [560, 700] },
  },
  labels: {
    n1: { at: [30, 132], width: 290 },
    n2: { at: [340, 190], width: 260 },
    human: { at: [160, 562], width: 210 },
    n3: { at: [470, 596], width: 220, baseline: "above" },
    n4: { at: [310, 824], width: 400 },
  },
};

const plan: Plan<TrainingGeometry> = {
  size: {
    landscape: { width: 1000, height: 620 },
    portrait: { width: 620, height: 840 },
  },
  geometry: { landscape, portrait },
  build: (g): Staged => {
    const bodies: Record<string, string> = {
      n1: whiteboard(
        g.whiteboard.x,
        g.whiteboard.y,
        g.whiteboard.w,
        g.whiteboard.h,
      ),
      designers:
        stander(g.designers[0].at, g.designers[0].scale, "ink", "right") +
        stander(g.designers[1].at, g.designers[1].scale, "paper", "left"),
      n2: desk(g.desk.x, g.desk.y, g.desk.w),
      flow: strip(g.flow.path, 16, RIBBON, { edge: 2.5 }),
      human:
        banner(
          g.review.banner.x,
          g.review.banner.y,
          g.review.banner.w,
          g.review.banner.h,
          g.review.banner.drop,
        ) +
        g.review.people
          .map((person) => stander(person.at, person.scale, person.tone))
          .join("") +
        seal(g.review.sealAt, 18, -8),
      n3:
        strip(g.takeaway.path, 16, RIBBON, { edge: 2.5 }) +
        takeaway(g.takeaway.at, g.takeaway.width, g.takeaway.height),
      n4: strip(g.back.path, 16, RIBBON, { edge: 2.5 }),
    };
    return stageRun(
      STAGES,
      (stage) => {
        const anchor = g.labels[stage.key as LabelKey];
        const word = LABELS[stage.key as LabelKey];
        return {
          origin: g.places[stage.key].origin,
          enter: g.places[stage.key].enter,
          label: anchor
            ? place(anchor.at, word.align, anchor.baseline ?? word.baseline, {
                width: anchor.width,
                ground: word.ground,
                beat: word.beat,
              })
            : undefined,
        };
      },
      (stage) => bodies[stage.key],
    );
  },
};

export const trainingArt = drawn(plan);
