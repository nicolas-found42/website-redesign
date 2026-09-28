import {
  identityPrint,
  paint,
  part,
  place,
  prints,
  pt,
  r,
  strip,
  type Art,
  type Orientation,
  type Pt,
} from "./kit";

/**
 * Automations: the stamp.
 *
 * Repetitive work is a stack of the same sheet. System handoffs are a strip
 * passed through one slot after another. Human review is its own sheet. All
 * three go under one red stamp — human direction — and what comes out is the
 * usable output, pressed with the human's mark, with two more copies beside it:
 * the same work reaching a customer more than one way.
 */

/** A sheet of paper turned about its centre, with a flat print beneath it. */
function sheet(
  at: Pt,
  width: number,
  height: number,
  turn: number,
  fill: string,
  { mark = false, corner = true } = {},
): string {
  const x = -width / 2;
  const y = -height / 2;
  const fold = 20;
  const outline = corner
    ? `M${x} ${y} L${x + width - fold} ${y} L${x + width} ${y + fold} L${x + width} ${y + height} L${x} ${y + height} Z`
    : `M${x} ${y} L${x + width} ${y} L${x + width} ${y + height} L${x} ${y + height} Z`;
  const dog = corner
    ? `<path class="f-sunk s-ink" d="M${x + width - fold} ${y} L${x + width - fold} ${y + fold} L${x + width} ${y + fold} Z" stroke-width="2"/>`
    : "";
  // The stamp's impression: a ring and its tick, in the human's red.
  const impression = mark
    ? `<g transform="translate(${r(x + width - 42)} ${r(y + height - 38)}) rotate(-14)" opacity="0.92"><circle class="s-red" r="21" fill="none" stroke-width="4"/><circle class="s-red" r="14" fill="none" stroke-width="1.6" stroke-dasharray="2 3"/><path class="s-red" d="M-8 1 L-2 7 L9 -6" fill="none" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></g>`
    : "";
  return (
    `<g transform="translate(${pt(at)}) rotate(${r(turn)})">` +
    `<path class="f-sunk" d="${outline}" transform="translate(5 6)"/>` +
    `<path class="s-ink" d="${outline}" fill="${fill}" stroke-width="2.5"/>` +
    dog +
    impression +
    `</g>`
  );
}

/** A rubber stamp seen from the side: knob, neck, block and rubber. */
function stamp(at: Pt, width: number) {
  const [x, y] = at;
  const block = { x: x - width / 2, y: y - 92, w: width, h: 78 };
  return (
    `<rect class="f-sunk" x="${r(block.x + 7)}" y="${r(block.y + 8)}" width="${block.w}" height="${block.h + 14}" rx="8"/>` +
    `<path class="f-red-deep" d="M${r(x - 20)} ${r(block.y)} L${r(x - 26)} ${r(block.y - 58)} L${r(x + 26)} ${r(block.y - 58)} L${r(x + 20)} ${r(block.y)} Z"/>` +
    `<circle class="f-red" cx="${r(x)}" cy="${r(block.y - 84)}" r="36"/>` +
    `<circle class="f-red-deep" cx="${r(x + 10)}" cy="${r(block.y - 78)}" r="24" opacity="0.6"/>` +
    `<rect class="f-red" x="${r(block.x)}" y="${r(block.y)}" width="${block.w}" height="${block.h}" rx="8"/>` +
    `<rect class="f-red-deep" x="${r(block.x)}" y="${r(block.y + block.h - 18)}" width="${block.w}" height="18" rx="6"/>` +
    `<rect class="f-ink" x="${r(block.x + 8)}" y="${r(y - 14)}" width="${block.w - 16}" height="16" rx="2"/>`
  );
}

/** Two handoff slots a strip passes through. */
const slots = (xs: readonly number[], y: number, height: number) =>
  xs
    .map(
      (x) =>
        `<rect class="f-ink" x="${r(x - 9)}" y="${r(y - height / 2)}" width="18" height="${height}" rx="3"/>` +
        `<rect class="f-paper" x="${r(x - 3)}" y="${r(y - height / 2 + 8)}" width="6" height="${height - 16}" rx="2"/>`,
    )
    .join("");

/** Two handoff slots across a strip that runs down the sheet. */
const slotsAcross = (ys: readonly number[], x: number, width: number) =>
  ys
    .map(
      (y) =>
        `<rect class="f-ink" x="${r(x - width / 2)}" y="${r(y - 9)}" width="${width}" height="18" rx="3"/>` +
        `<rect class="f-paper" x="${r(x - width / 2 + 8)}" y="${r(y - 3)}" width="${width - 16}" height="6" rx="2"/>`,
    )
    .join("");

function landscape(uid: string): Art {
  const repetitive = paint(uid, identityPrint.n1);
  const handoffs = paint(uid, identityPrint.n2);
  const review = paint(uid, identityPrint.n3);
  // Everything that goes in reaches under the stamp, and everything that comes
  // out starts from under it.
  const press: Pt = [500, 334];

  const stack = [0, 1, 2, 3, 4]
    .map((k) =>
      sheet([246 + k * 14, 214 - k * 11], 200, 120, 12, repetitive, {
        corner: k === 4,
      }),
    )
    .join("");

  const parts = [
    part(
      {
        name: "copy",
        beat: 3,
        enter: "slide-right",
        order: 1,
        origin: press,
        links: ["human>out1"],
      },
      sheet([706, 236], 200, 128, -17, "var(--paper)", { mark: true }),
    ),
    part(
      {
        name: "copy",
        beat: 3,
        enter: "slide-right",
        order: 2,
        origin: press,
        links: ["human>out2"],
      },
      sheet([706, 440], 200, 128, 17, "var(--paper)", { mark: true }),
    ),
    part(
      {
        name: "output",
        beat: 3,
        enter: "slide-right",
        origin: press,
        nodes: ["n4"],
        links: ["human>n4"],
      },
      sheet([724, 338], 256, 150, -2, "var(--ink)", { mark: true }),
    ),
    part(
      {
        name: "reviewed",
        beat: 1,
        enter: "rise",
        order: 1,
        origin: [300, 420],
        nodes: ["n3"],
        links: ["n3>human"],
      },
      sheet([296, 418], 226, 122, -13, review),
    ),
    part(
      {
        name: "handoffs",
        beat: 1,
        enter: "slide-right",
        origin: [40, 336],
        nodes: ["n2"],
        links: ["n2>human"],
      },
      strip(`M40 336 L${press[0]} 336`, 40, handoffs) +
        slots([124, 196], 336, 76),
    ),
    part(
      {
        name: "repetition",
        beat: 0,
        enter: "drop",
        origin: [280, 190],
        nodes: ["n1"],
        links: ["n1>human"],
      },
      stack,
    ),
    part(
      {
        name: "stamp",
        beat: 2,
        enter: "stamp",
        origin: press,
        nodes: ["human"],
      },
      stamp(press, 250),
    ),
  ];

  return {
    width: 1000,
    height: 620,
    defs: prints(uid),
    parts: parts.join(""),
    labels: {
      n1: place([150, 76], "start", "above", { width: 330, beat: 0 }),
      n2: place([40, 336 + 34], "start", "below", { width: 136, beat: 1 }),
      n3: place([170, 512], "start", "below", { width: 330, beat: 1 }),
      human: place([press[0], press[1] - 54], "center", "middle", {
        width: 226,
        ground: "red",
        beat: 2,
      }),
      n4: place([744, 334], "center", "middle", {
        width: 180,
        ground: "ink",
        beat: 3,
      }),
    },
  };
}

function portrait(uid: string): Art {
  const repetitive = paint(uid, identityPrint.n1);
  const handoffs = paint(uid, identityPrint.n2);
  const review = paint(uid, identityPrint.n3);
  const press: Pt = [310, 560];

  const stack = [0, 1, 2, 3, 4]
    .map((k) =>
      sheet([138 + k * 12, 408 - k * 10], 184, 110, 10, repetitive, {
        corner: k === 4,
      }),
    )
    .join("");

  const parts = [
    part(
      {
        name: "copy",
        beat: 3,
        enter: "slide-down",
        order: 1,
        origin: press,
        links: ["human>out1"],
      },
      sheet([176, 632], 176, 122, -15, "var(--paper)", { mark: true }),
    ),
    part(
      {
        name: "copy",
        beat: 3,
        enter: "slide-down",
        order: 2,
        origin: press,
        links: ["human>out2"],
      },
      sheet([444, 632], 176, 122, 15, "var(--paper)", { mark: true }),
    ),
    part(
      {
        name: "output",
        beat: 3,
        enter: "slide-down",
        origin: press,
        nodes: ["n4"],
        links: ["human>n4"],
      },
      sheet([310, 628], 256, 150, -1, "var(--ink)", { mark: true }),
    ),
    part(
      {
        name: "handoffs",
        beat: 1,
        enter: "slide-down",
        origin: [310, 40],
        nodes: ["n2"],
        links: ["n2>human"],
      },
      strip(`M310 40 L310 ${press[1] - 70}`, 40, handoffs) +
        slotsAcross([120, 196], 310, 76),
    ),
    part(
      {
        name: "reviewed",
        beat: 1,
        enter: "rise",
        order: 1,
        origin: [470, 410],
        nodes: ["n3"],
        links: ["n3>human"],
      },
      sheet([468, 410], 196, 112, -10, review),
    ),
    part(
      {
        name: "repetition",
        beat: 0,
        enter: "drop",
        origin: [170, 380],
        nodes: ["n1"],
        links: ["n1>human"],
      },
      stack,
    ),
    part(
      {
        name: "stamp",
        beat: 2,
        enter: "stamp",
        origin: press,
        nodes: ["human"],
      },
      stamp(press, 280),
    ),
  ];

  return {
    width: 620,
    height: 740,
    defs: prints(uid),
    parts: parts.join(""),
    labels: {
      n1: place([40, 282], "start", "above", { width: 240, beat: 0 }),
      n2: place([342, 70], "start", "middle", { width: 250, beat: 1 }),
      n3: place([580, 322], "end", "above", { width: 240, beat: 1 }),
      human: place([press[0], press[1] - 54], "center", "middle", {
        width: 250,
        ground: "red",
        beat: 2,
      }),
      n4: place([306, 640], "center", "middle", {
        width: 210,
        ground: "ink",
        beat: 3,
      }),
    },
  };
}

export const productArt = (orientation: Orientation, uid: string): Art =>
  orientation === "portrait" ? portrait(uid) : landscape(uid);
