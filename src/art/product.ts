import {
  identityFill,
  part,
  place,
  pt,
  r,
  strip,
  type Art,
  type Orientation,
  type Pt,
} from "./kit";

/**
 * Automations: the stamp, read as an ordered process.
 *
 * Five stages run one way along a single rail: a stack of repetitive work
 * piled at the infeed, system handoffs slotted along the line, a human-review
 * sheet astride it as the checkpoint the work passes through, one red
 * stamp — human direction — pressing down as the decision, and the usable
 * output tucked out from under the press, each sheet carrying the human's
 * mark, with two more copies beside it: the same work reaching a customer
 * more than one way. Paper heads on the rail point the way, so the order
 * reads by shape and place, never by colour alone — and nothing is approved
 * until the review and the press have had their say.
 */

/** A sheet of paper turned about its centre, with a flat sheet beneath it. */
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
    ? `<g transform="translate(${r(x + width - 42)} ${r(y + height - 38)}) rotate(-14)" opacity="0.92"><circle class="s-red" r="21" fill="none" stroke-width="4"/><circle class="s-red" r="14" fill="none" stroke-width="1.6"/><path class="s-red" d="M-8 1 L-2 7 L9 -6" fill="none" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></g>`
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

/**
 * A direction head riding the rail: a solid paper point with a charcoal
 * outline, so the way the work moves reads by shape on any ground.
 */
function chevron(at: Pt, along: "x" | "y") {
  const h = 11;
  const d =
    along === "x"
      ? `M${-h} ${-h} L${h} 0 L${-h} ${h} Z`
      : `M${-h} ${-h} L0 ${h} L${h} ${-h} Z`;
  return (
    `<g transform="translate(${pt(at)})">` +
    `<path class="f-paper s-ink" d="${d}" stroke-width="2.5" stroke-linejoin="round"/>` +
    `</g>`
  );
}

function landscape(): Art {
  const repetitive = identityFill.n1;
  const handoffs = identityFill.n2;
  const review = identityFill.n3;
  // Everything that goes in reaches under the stamp, and everything that comes
  // out starts from under it.
  const press: Pt = [500, 334];

  const stack = [0, 1, 2, 3, 4]
    .map((k) =>
      sheet([230 + k * 13, 200 - k * 10], 200, 120, 12, repetitive, {
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
        marks: ["result:n4"],
      },
      sheet([710, 338], 256, 150, -2, "var(--ink)", { mark: true }),
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
        slots([100, 160], 336, 76) +
        chevron([62, 336], "x") +
        chevron([190, 336], "x"),
    ),
    part(
      {
        name: "reviewed",
        beat: 1,
        enter: "rise",
        order: 1,
        origin: [288, 386],
        nodes: ["n3"],
        links: ["n3>human"],
        marks: ["check:n3"],
      },
      // Astride the rail, ahead of the press: the checkpoint the work passes
      // through. It paints over the line, so the line visibly runs into the
      // review and out again towards the stamp.
      sheet([288, 336], 160, 100, -4, review),
    ),
    part(
      {
        name: "repetition",
        beat: 0,
        enter: "drop",
        origin: [250, 180],
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
        marks: ["human:human"],
      },
      stamp(press, 250),
    ),
  ];

  return {
    width: 1000,
    height: 620,
    parts: parts.join(""),
    labels: {
      n1: place([150, 66], "start", "above", { width: 330, beat: 0 }),
      n2: place([40, 372], "start", "below", { width: 160, beat: 1 }),
      n3: place([288, 452], "center", "below", { width: 240, beat: 1 }),
      human: place([press[0], press[1] - 54], "center", "middle", {
        width: 226,
        ground: "red",
        beat: 2,
      }),
      n4: place([710, 334], "center", "middle", {
        width: 180,
        ground: "ink",
        beat: 3,
      }),
    },
  };
}

function portrait(): Art {
  const repetitive = identityFill.n1;
  const handoffs = identityFill.n2;
  const review = identityFill.n3;
  const press: Pt = [310, 590];

  const stack = [0, 1, 2, 3, 4]
    .map((k) =>
      sheet([120 + k * 11, 300 - k * 9], 184, 110, 10, repetitive, {
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
      sheet([176, 657], 176, 122, -15, "var(--paper)", { mark: true }),
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
      sheet([444, 657], 176, 122, 15, "var(--paper)", { mark: true }),
    ),
    part(
      {
        name: "output",
        beat: 3,
        enter: "slide-down",
        origin: press,
        nodes: ["n4"],
        links: ["human>n4"],
        marks: ["result:n4"],
      },
      sheet([310, 655], 256, 150, -1, "var(--ink)", { mark: true }),
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
      strip(`M310 40 L310 ${press[1] - 30}`, 40, handoffs) +
        slotsAcross([120, 196], 310, 76) +
        chevron([310, 158], "y") +
        chevron([310, 228], "y"),
    ),
    part(
      {
        name: "reviewed",
        beat: 1,
        enter: "rise",
        order: 1,
        origin: [310, 360],
        nodes: ["n3"],
        links: ["n3>human"],
        marks: ["check:n3"],
      },
      // Astride the rail, ahead of the press: the checkpoint the work passes
      // through on its way down to the stamp.
      sheet([310, 310], 160, 100, -4, review),
    ),
    part(
      {
        name: "repetition",
        beat: 0,
        enter: "drop",
        origin: [140, 280],
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
        marks: ["human:human"],
      },
      stamp(press, 280),
    ),
  ];

  return {
    width: 620,
    height: 740,
    parts: parts.join(""),
    labels: {
      n1: place([40, 168], "start", "above", { width: 240, beat: 0 }),
      n2: place([342, 70], "start", "middle", { width: 250, beat: 1 }),
      n3: place([600, 310], "end", "middle", { width: 190, beat: 1 }),
      human: place([press[0], press[1] - 54], "center", "middle", {
        width: 250,
        ground: "red",
        beat: 2,
      }),
      n4: place([310, 657], "center", "middle", {
        width: 210,
        ground: "ink",
        beat: 3,
      }),
    },
  };
}

export const productArt = (orientation: Orientation): Art =>
  orientation === "portrait" ? portrait() : landscape();
