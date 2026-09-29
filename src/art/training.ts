import {
  figure,
  part,
  place,
  r,
  seal,
  stander,
  strip,
  tag,
  type Art,
  type LabelPlace,
  type Orientation,
  type Pt,
} from "./kit";

/**
 * Workshops: people designing, practising and reviewing together.
 *
 * A team stands at a whiteboard with sticky notes and a diagram of its real
 * work — the design-thinking half of a workshop. The same people then sit at a
 * keyboard for live guided practice, gather under the red banner for group
 * review, and leave with a reusable skill they apply afterwards, back at the
 * work they started from. People are charcoal, red and white cut paper with
 * charcoal outlines; the ribbon that joins the stages is solid.
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

function landscape(): Art {
  const labels: Record<string, LabelPlace> = {
    n1: place([50, 126], "start", "above", { width: 400, beat: 0 }),
    n2: place([380, 246], "start", "above", { width: 270, beat: 1 }),
    human: place([758, 222], "center", "middle", {
      width: 196,
      ground: "red",
      beat: 1,
    }),
    n3: place([924, 396], "center", "below", { width: 130, beat: 2 }),
    n4: place([500, 594], "center", "middle", { width: 380, beat: 3 }),
  };
  const parts = [
    part(
      {
        name: "whiteboard",
        beat: 0,
        enter: "unfold-y",
        origin: [50, 150],
        nodes: ["n1"],
      },
      whiteboard(50, 150, 270, 170),
    ),
    part(
      {
        name: "designers",
        beat: 0,
        order: 1,
        enter: "rise",
        origin: [180, 440],
      },
      stander([110, 440], 1, "ink", "right") +
        stander([260, 440], 1, "paper", "left"),
    ),
    part(
      {
        name: "desk",
        beat: 1,
        enter: "slide-right",
        origin: [370, 300],
        nodes: ["n2"],
        links: ["n2>human"],
      },
      desk(370, 270, 250),
    ),
    part(
      {
        name: "flow",
        beat: 1,
        order: 1,
        enter: "slide-right",
        origin: [40, 470],
        links: ["n1>human"],
      },
      strip("M40 470 L860 470", 16, RIBBON, { edge: 2.5 }),
    ),
    part(
      {
        name: "review",
        beat: 1,
        order: 2,
        enter: "swing",
        origin: [758, 200],
        nodes: ["human"],
        links: ["human>n3"],
      },
      banner(646, 200, 224, 44, 200) +
        stander([715, 440], 0.96, "strand") +
        stander([765, 440], 1, "paper") +
        stander([815, 440], 0.96, "ink") +
        seal([866, 204], 18, -8),
    ),
    part(
      {
        name: "takeaway",
        beat: 2,
        enter: "swing",
        origin: [866, 350],
        nodes: ["n3"],
        links: ["n3>n4"],
      },
      strip("M860 470 L880 470", 16, RIBBON, { edge: 2.5 }) +
        takeaway([868, 350], 112, 64),
    ),
    part(
      {
        name: "return",
        beat: 3,
        enter: "unfold-y",
        origin: [900, 480],
        nodes: ["n4"],
        links: ["n4>n1"],
      },
      strip(
        "M900 490 L900 540 C900 556 890 566 870 566 L110 566 C90 566 80 556 80 540 L80 490",
        16,
        RIBBON,
        { edge: 2.5 },
      ),
    ),
  ];
  return { width: 1000, height: 620, defs: "", parts: parts.join(""), labels };
}

function portrait(): Art {
  const labels: Record<string, LabelPlace> = {
    n1: place([30, 132], "start", "above", { width: 290, beat: 0 }),
    n2: place([340, 190], "start", "above", { width: 260, beat: 1 }),
    human: place([160, 562], "center", "middle", {
      width: 210,
      ground: "red",
      beat: 1,
    }),
    n3: place([470, 596], "center", "above", { width: 220, beat: 2 }),
    n4: place([310, 824], "center", "middle", { width: 400, beat: 3 }),
  };
  const parts = [
    part(
      {
        name: "whiteboard",
        beat: 0,
        enter: "unfold-y",
        origin: [30, 150],
        nodes: ["n1"],
      },
      whiteboard(30, 150, 270, 150),
    ),
    part(
      {
        name: "designers",
        beat: 0,
        order: 1,
        enter: "rise",
        origin: [150, 420],
      },
      stander([84, 420], 0.9, "ink", "right") +
        stander([230, 420], 0.9, "paper", "left"),
    ),
    part(
      {
        name: "desk",
        beat: 1,
        enter: "slide-left",
        origin: [340, 260],
        nodes: ["n2"],
        links: ["n2>human"],
      },
      desk(340, 232, 250),
    ),
    part(
      {
        name: "flow",
        beat: 1,
        order: 1,
        enter: "slide-right",
        origin: [30, 446],
        links: ["n1>human"],
      },
      strip(
        "M30 446 L572 446 C596 446 606 460 606 478 C606 496 596 510 572 510 L60 510",
        16,
        RIBBON,
        { edge: 2.5 },
      ),
    ),
    part(
      {
        name: "review",
        beat: 1,
        order: 2,
        enter: "swing",
        origin: [160, 534],
        nodes: ["human"],
        links: ["human>n3"],
      },
      banner(30, 540, 260, 44, 160) +
        stander([80, 744], 0.96, "strand") +
        stander([160, 744], 1, "paper") +
        stander([240, 744], 0.96, "ink") +
        seal([286, 544], 18, -8),
    ),
    part(
      {
        name: "takeaway",
        beat: 2,
        enter: "swing",
        origin: [370, 640],
        nodes: ["n3"],
        links: ["n3>n4"],
      },
      strip("M330 510 L330 640 L360 640", 16, RIBBON, { edge: 2.5 }) +
        takeaway([370, 640], 200, 64),
    ),
    part(
      {
        name: "return",
        beat: 3,
        enter: "unfold-y",
        origin: [560, 700],
        nodes: ["n4"],
        links: ["n4>n1"],
      },
      strip(
        "M520 690 L520 770 C520 786 510 796 494 796 L50 796 C32 796 22 786 22 770 L22 320",
        16,
        RIBBON,
        { edge: 2.5 },
      ),
    ),
  ];
  return { width: 620, height: 840, defs: "", parts: parts.join(""), labels };
}

export const trainingArt = (orientation: Orientation): Art =>
  orientation === "portrait" ? portrait() : landscape();
