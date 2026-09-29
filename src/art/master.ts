import {
  easeX,
  identityFill,
  part,
  place,
  plait,
  solidStrip,
  strip,
  tag,
  type Art,
  type Orientation,
} from "./kit";

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
 */

const WIDTH = 40;
const LANE = 46;

function landscape(): Art {
  const lanes = [310 - LANE, 310, 310 + LANE] as const;
  const fills = [identityFill.n1, identityFill.n2, identityFill.n3] as const;
  const start = 330;
  const step = 58;
  const crossings = 5;
  const end = start + step * crossings;
  const braid = plait({
    start,
    step,
    crossings,
    lanes,
    width: WIDTH,
    fills,
  });

  const entries = [
    `M40 108 L120 108 ${easeX([120, 108], [start, lanes[0]], 0.55)}`,
    `M40 310 L${start} 310`,
    `M40 512 L120 512 ${easeX([120, 512], [start, lanes[2]], 0.55)}`,
  ];

  // The band that holds it: red, with its far side in the deeper red.
  const band = {
    x: end - 2,
    y: lanes[0] - 40,
    w: 50,
    h: lanes[2] - lanes[0] + 80,
  };
  const binding =
    `<rect class="f-red-deep" x="${band.x + 6}" y="${band.y + 6}" width="${band.w}" height="${band.h}" rx="7" opacity="0.28"/>` +
    `<rect class="f-red" x="${band.x}" y="${band.y}" width="${band.w}" height="${band.h}" rx="7"/>` +
    `<rect class="f-red-deep" x="${band.x + band.w - 16}" y="${band.y}" width="16" height="${band.h}" rx="5"/>`;

  const cordX = band.x + band.w / 2;
  const plate = { x: cordX - 130, y: 452, w: 260, h: 56 };
  const human =
    `<path class="s-red" d="M${cordX} ${band.y + band.h} L${cordX} ${plate.y}" stroke-width="4" fill="none"/>` +
    `<rect class="f-red-deep" x="${plate.x + 5}" y="${plate.y + 6}" width="${plate.w}" height="${plate.h}" rx="6" opacity="0.28"/>` +
    `<rect class="f-red" x="${plate.x}" y="${plate.y}" width="${plate.w}" height="${plate.h}" rx="6"/>` +
    `<circle class="f-paper" cx="${cordX}" cy="${plate.y + 10}" r="4.5"/>`;

  // Past the band: one solid piece, and on the wide sheet two unnamed tails.
  const out = band.x + band.w;
  const named = `M${out} 310 L766 310`;
  const upper = `M${out} ${lanes[0] + 6} ${easeX([out, lanes[0] + 6], [880, 132], 0.6)}`;
  const lower = `M${out} ${lanes[2] - 6} ${easeX([out, lanes[2] - 6], [880, 488], 0.6)}`;

  const parts = [
    part(
      {
        name: "tail",
        beat: 2,
        enter: "slide-right",
        order: 1,
        origin: [out, 310],
        links: ["human>out1"],
      },
      solidStrip(upper, 22, "ink") +
        tag([880, 132], 70, 40, { tone: "paper", turn: -12 }),
    ),
    part(
      {
        name: "tail",
        beat: 2,
        enter: "slide-right",
        order: 2,
        origin: [out, 310],
        links: ["human>out2"],
      },
      solidStrip(lower, 22, "ink") +
        tag([880, 488], 70, 40, { tone: "paper", turn: 12 }),
    ),
    part(
      {
        name: "output",
        beat: 2,
        enter: "slide-right",
        origin: [out, 310],
        nodes: ["n4"],
        links: ["human>n4"],
      },
      solidStrip(named, WIDTH + 12, "ink") +
        tag([760, 310], 230, 112, { tone: "ink" }),
    ),
    ...entries.map((d, index) =>
      part(
        {
          name: "strand",
          beat: 0,
          enter: "slide-right",
          order: index,
          origin: [40, 310],
          nodes: [["n1", "n2", "n3"][index]],
          links: [`${["n1", "n2", "n3"][index]}>human`],
        },
        strip(d, WIDTH, fills[index]) +
          `<path class="s-ink" d="M40 ${[108, 310, 512][index] - WIDTH / 2 - 3} l0 ${WIDTH + 6}" stroke-width="3"/>`,
      ),
    ),
    part(
      { name: "plait", beat: 1, enter: "unfold-x", origin: [start, 310] },
      braid.strands.join("") + braid.overs,
    ),
    part(
      {
        name: "binding",
        beat: 1,
        enter: "wrap",
        order: 1,
        origin: [cordX, 310],
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
        origin: [cordX, band.y + band.h],
      },
      human,
    ),
  ];

  return {
    width: 1000,
    height: 620,
    defs: "",
    parts: parts.join(""),
    labels: {
      n1: place([40, 80], "start", "above", { beat: 0 }),
      n2: place([40, 282], "start", "above", { beat: 0 }),
      n3: place([40, 548], "start", "below", { beat: 0 }),
      human: place([cordX, plate.y + plate.h / 2 + 3], "center", "middle", {
        width: plate.w - 24,
        ground: "red",
        beat: 1,
      }),
      n4: place([760 + 22 + (230 - 22) / 2, 310], "center", "middle", {
        width: 184,
        ground: "ink",
        beat: 2,
      }),
    },
  };
}

function portrait(): Art {
  // Lanes left to right take the strands in reverse, so their corners nest.
  const lanes = [492 - LANE * 2, 492 - LANE, 492] as const;
  const fills = [identityFill.n3, identityFill.n2, identityFill.n1] as const;
  const start = 330;
  const step = 52;
  const crossings = 5;
  const end = start + step * crossings;
  const braid = plait({
    start,
    step,
    crossings,
    lanes,
    width: WIDTH,
    fills,
    axis: "y",
  });

  const rows = [80, 190, 300];
  const toLane = [lanes[2], lanes[1], lanes[0]];
  const entries = rows.map((y, index) => {
    const x = toLane[index];
    return `M40 ${y} L${x - 60} ${y} C${x - 20} ${y} ${x} ${y + 20} ${x} ${y + 60} L${x} ${start}`;
  });

  const band = {
    x: lanes[0] - 40,
    y: end - 2,
    w: lanes[2] - lanes[0] + 80,
    h: 48,
  };
  const binding =
    `<rect class="f-red-deep" x="${band.x + 6}" y="${band.y + 6}" width="${band.w}" height="${band.h}" rx="7" opacity="0.28"/>` +
    `<rect class="f-red" x="${band.x}" y="${band.y}" width="${band.w}" height="${band.h}" rx="7"/>` +
    `<rect class="f-red-deep" x="${band.x}" y="${band.y + band.h - 15}" width="${band.w}" height="15" rx="5"/>`;

  const cordY = band.y + band.h / 2;
  const plate = { x: 40, y: cordY - 30, w: 296, h: 60 };
  const human =
    `<path class="s-red" d="M${plate.x + plate.w} ${cordY} L${band.x} ${cordY}" stroke-width="4" fill="none"/>` +
    `<rect class="f-red-deep" x="${plate.x + 5}" y="${plate.y + 6}" width="${plate.w}" height="${plate.h}" rx="6" opacity="0.28"/>` +
    `<rect class="f-red" x="${plate.x}" y="${plate.y}" width="${plate.w}" height="${plate.h}" rx="6"/>` +
    `<circle class="f-paper" cx="${plate.x + plate.w - 12}" cy="${cordY}" r="4.5"/>`;

  const mid = lanes[1];
  const out = band.y + band.h;
  const named = `M${mid} ${out} L${mid} 700`;

  const parts = [
    part(
      {
        name: "output",
        beat: 2,
        enter: "slide-down",
        origin: [mid, out],
        nodes: ["n4"],
        links: ["human>n4"],
      },
      solidStrip(named, WIDTH + 12, "ink") +
        tag([mid, 694], 140, 300, { tone: "ink", turn: 90 }),
    ),
    ...entries.map((d, index) =>
      part(
        {
          name: "strand",
          beat: 0,
          enter: "slide-right",
          order: index,
          origin: [40, rows[index]],
          nodes: [["n1", "n2", "n3"][index]],
          links: [`${["n1", "n2", "n3"][index]}>human`],
        },
        strip(d, WIDTH, fills[2 - index]) +
          `<path class="s-ink" d="M40 ${rows[index] - WIDTH / 2 - 3} l0 ${WIDTH + 6}" stroke-width="3"/>`,
      ),
    ),
    part(
      { name: "plait", beat: 1, enter: "unfold-y", origin: [mid, start] },
      braid.strands.join("") + braid.overs,
    ),
    part(
      {
        name: "binding",
        beat: 1,
        enter: "wrap",
        order: 1,
        origin: [mid, cordY],
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
        origin: [band.x, cordY],
      },
      human,
    ),
  ];

  return {
    width: 620,
    height: 870,
    defs: "",
    parts: parts.join(""),
    labels: {
      n1: place([40, rows[0] - 30], "start", "above", { width: 400, beat: 0 }),
      n2: place([40, rows[1] - 30], "start", "above", { width: 360, beat: 0 }),
      n3: place([40, rows[2] + 30], "start", "below", { width: 300, beat: 0 }),
      human: place(
        [plate.x + (plate.w - 20) / 2, cordY + 2],
        "center",
        "middle",
        {
          width: plate.w - 40,
          ground: "red",
          beat: 1,
        },
      ),
      n4: place([mid, 694 + 22 + (140 - 22) / 2], "center", "middle", {
        width: 260,
        ground: "ink",
        beat: 2,
      }),
    },
  };
}

export const masterArt = (orientation: Orientation): Art =>
  orientation === "portrait" ? portrait() : landscape();
