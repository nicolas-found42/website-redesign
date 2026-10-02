import {
  identityFill,
  part,
  place,
  pt,
  r,
  seal,
  strip,
  type Art,
  type Orientation,
  type Pt,
} from "./kit";

/**
 * Automations: the line with a stamp on it.
 *
 * Five stations in the order the work moves through them. Repetitive work is
 * a stack of the same sheet; system handoffs are a sheet a strip passes
 * through, slot after slot; human direction is the red card the stamp stands
 * on; human review is the sheet the seal lands on — a person marks approval
 * where judgment matters, so nothing approves itself; usable output is the
 * dark card carrying the stamp's mark, with two more copies beside it: the
 * same reviewed work reaching a customer more than one way.
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

/** The same stamp smaller: wrapped so it can stand on a narrow station. */
function smallStamp(at: Pt, width: number, scale: number) {
  const [x, y] = at;
  return (
    `<g transform="translate(${pt(at)}) scale(${scale}) translate(${r(-x)} ${r(-y)})">` +
    stamp(at, width) +
    `</g>`
  );
}

/** A red card: the human's station, carrying their word. */
function directionCard(at: Pt, width: number, height: number) {
  const [x, y] = at;
  return (
    `<rect class="f-sunk" x="${r(x - width / 2 + 6)}" y="${r(y - height / 2 + 7)}" width="${width}" height="${height}" rx="10"/>` +
    `<rect class="f-red s-ink" x="${r(x - width / 2)}" y="${r(y - height / 2)}" width="${width}" height="${height}" rx="10" stroke-width="3"/>`
  );
}

/** The dark card of usable output, carrying the stamp's mark. */
function outputCard(at: Pt, width: number, height: number, mark = true) {
  const [x, y] = at;
  const impression = mark
    ? `<g transform="translate(${r(x + width / 2 - 42)} ${r(y + height / 2 - 38)}) rotate(-14)" opacity="0.92"><circle class="s-red" r="21" fill="none" stroke-width="4"/><circle class="s-red" r="14" fill="none" stroke-width="1.6"/><path class="s-red" d="M-8 1 L-2 7 L9 -6" fill="none" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></g>`
    : "";
  return (
    `<rect class="f-sunk" x="${r(x - width / 2 + 6)}" y="${r(y - height / 2 + 7)}" width="${width}" height="${height}" rx="10"/>` +
    `<rect class="f-ink" x="${r(x - width / 2)}" y="${r(y - height / 2)}" width="${width}" height="${height}" rx="10"/>` +
    impression
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

/** One step's arrow into the next: a shaft and its head, solid ink. */
function nextRight(from: Pt, to: Pt) {
  const [x1, y] = from;
  const [x2] = to;
  const tip = x2 - 2;
  return (
    `<path class="s-ink" d="M${r(x1)} ${r(y)} L${r(tip)} ${r(y)} M${r(tip - 9)} ${r(y - 7)} L${r(tip)} ${r(y)} L${r(tip - 9)} ${r(y + 7)}" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`
  );
}

/** One step's arrow into the one below: a shaft and its head, solid ink. */
function nextDown(from: Pt, to: Pt) {
  const [, y1] = from;
  const [x, y2] = to;
  const tip = y2 - 2;
  return (
    `<path class="s-ink" d="M${r(x)} ${r(y1)} L${r(x)} ${r(tip)} M${r(x - 7)} ${r(tip - 9)} L${r(x)} ${r(tip)} L${r(x + 7)} ${r(tip - 9)}" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`
  );
}

function landscape(): Art {
  const repetitive = identityFill.n1;
  const handoffs = identityFill.n2;
  const review = identityFill.n3;
  const axis = 340;

  const stack = [0, 1, 2, 3]
    .map((k) =>
      sheet([105 - k * 7, axis - k * 8], 150, 100, 8, repetitive, {
        corner: k === 3,
      }),
    )
    .join("");

  const parts = [
    part(
      {
        name: "copy",
        beat: 4,
        enter: "slide-right",
        order: 1,
        origin: [885, 272],
        links: ["human>out1"],
      },
      sheet([885, 272], 150, 105, -9, "var(--paper)", { mark: true }),
    ),
    part(
      {
        name: "copy",
        beat: 4,
        enter: "slide-right",
        order: 2,
        origin: [885, 408],
        links: ["human>out2"],
      },
      sheet([885, 408], 150, 105, 9, "var(--paper)", { mark: true }),
    ),
    part(
      {
        name: "output",
        beat: 4,
        enter: "slide-right",
        origin: [885, axis],
        nodes: ["n4"],
      },
      outputCard([885, axis], 160, 120),
    ),
    part(
      {
        name: "reviewed",
        beat: 3,
        enter: "rise",
        origin: [685, axis],
        nodes: ["n3"],
        marks: ["seal:approved"],
      },
      sheet([685, axis], 150, 110, -4, review) + seal([711, axis], 24),
    ),
    part(
      {
        name: "direction",
        beat: 2,
        enter: "rise",
        origin: [500, 355],
        nodes: ["human"],
      },
      directionCard([500, 355], 170, 110),
    ),
    part(
      {
        name: "stamp",
        beat: 2,
        enter: "stamp",
        order: 1,
        origin: [500, 300],
        nodes: ["human"],
      },
      stamp([500, 300], 150),
    ),
    part(
      {
        name: "handoffs",
        beat: 1,
        enter: "slide-right",
        origin: [300, axis],
        nodes: ["n2"],
      },
      sheet([300, axis], 150, 100, 3, "var(--paper)") +
        strip(`M232 ${axis} L368 ${axis}`, 34, handoffs) +
        slots([272, 328], axis, 72),
    ),
    part(
      {
        name: "repetition",
        beat: 0,
        enter: "drop",
        origin: [105, 300],
        nodes: ["n1"],
      },
      stack,
    ),
    part(
      {
        name: "next",
        beat: 1,
        enter: "fade",
        origin: [205, axis],
        links: ["n1>n2"],
      },
      nextRight([188, axis], [222, axis]),
    ),
    part(
      {
        name: "next",
        beat: 2,
        enter: "fade",
        origin: [399, axis],
        links: ["n2>human"],
      },
      nextRight([382, axis], [416, axis]),
    ),
    part(
      {
        name: "next",
        beat: 3,
        enter: "fade",
        origin: [597, axis],
        links: ["human>n3"],
      },
      nextRight([589, axis], [604, axis]),
    ),
    part(
      {
        name: "next",
        beat: 4,
        enter: "fade",
        origin: [782, axis],
        links: ["n3>n4"],
      },
      nextRight([766, axis], [799, axis]),
    ),
  ];

  return {
    width: 1000,
    height: 620,
    parts: parts.join(""),
    labels: {
      n1: place([105, 238], "center", "above", { width: 180, beat: 0 }),
      n2: place([300, 238], "center", "above", { width: 180, beat: 1 }),
      human: place([500, 358], "center", "middle", {
        width: 150,
        ground: "red",
        beat: 2,
      }),
      n3: place([685, 234], "center", "above", { width: 180, beat: 3 }),
      n4: place([885, axis], "center", "middle", {
        width: 150,
        ground: "ink",
        beat: 4,
      }),
    },
  };
}

function portrait(): Art {
  const repetitive = identityFill.n1;
  const handoffs = identityFill.n2;
  const review = identityFill.n3;
  const axis = 310;

  const stack = [0, 1, 2, 3]
    .map((k) =>
      sheet([axis - k * 6, 88 - k * 7], 200, 80, 6, repetitive, {
        corner: k === 3,
      }),
    )
    .join("");

  const parts = [
    part(
      {
        name: "copy",
        beat: 4,
        enter: "slide-down",
        order: 1,
        origin: [140, 686],
        links: ["human>out1"],
      },
      sheet([140, 686], 150, 75, -9, "var(--paper)", { mark: true }),
    ),
    part(
      {
        name: "copy",
        beat: 4,
        enter: "slide-down",
        order: 2,
        origin: [480, 686],
        links: ["human>out2"],
      },
      sheet([480, 686], 150, 75, 9, "var(--paper)", { mark: true }),
    ),
    part(
      {
        name: "output",
        beat: 4,
        enter: "slide-down",
        origin: [axis, 686],
        nodes: ["n4"],
      },
      // The word stays clear on the narrow card: the two marked copies
      // beside it carry the stamp's mark here.
      outputCard([axis, 686], 200, 90, false),
    ),
    part(
      {
        name: "reviewed",
        beat: 3,
        enter: "rise",
        origin: [axis, 565],
        nodes: ["n3"],
        marks: ["seal:approved"],
      },
      sheet([axis, 565], 200, 90, -3, review) + seal([338, 565], 22),
    ),
    part(
      {
        name: "direction",
        beat: 2,
        enter: "rise",
        origin: [axis, 439],
        nodes: ["human"],
      },
      directionCard([axis, 439], 230, 90),
    ),
    part(
      {
        name: "stamp",
        beat: 2,
        enter: "stamp",
        order: 1,
        origin: [axis, 394],
        nodes: ["human"],
      },
      smallStamp([axis, 394], 150, 0.5),
    ),
    part(
      {
        name: "handoffs",
        beat: 1,
        enter: "slide-down",
        origin: [axis, 208],
        nodes: ["n2"],
      },
      sheet([axis, 208], 200, 90, 2, "var(--paper)") +
        strip(`M${axis} 157 L${axis} 259`, 30, handoffs) +
        slotsAcross([188, 234], axis, 66),
    ),
    part(
      {
        name: "repetition",
        beat: 0,
        enter: "drop",
        origin: [axis, 73],
        nodes: ["n1"],
      },
      stack,
    ),
    part(
      {
        name: "next",
        beat: 1,
        enter: "fade",
        origin: [axis, 145],
        links: ["n1>n2"],
      },
      nextDown([axis, 134], [axis, 156]),
    ),
    part(
      {
        name: "next",
        beat: 2,
        enter: "fade",
        origin: [axis, 272],
        links: ["n2>human"],
      },
      nextDown([axis, 260], [axis, 284]),
    ),
    part(
      {
        name: "next",
        beat: 3,
        enter: "fade",
        origin: [axis, 503],
        links: ["human>n3"],
      },
      nextDown([axis, 491], [axis, 515]),
    ),
    part(
      {
        name: "next",
        beat: 4,
        enter: "fade",
        origin: [axis, 629],
        links: ["n3>n4"],
      },
      nextDown([axis, 617], [axis, 641]),
    ),
  ];

  return {
    width: 620,
    height: 740,
    parts: parts.join(""),
    labels: {
      n1: place([420, 88], "start", "middle", { width: 185, beat: 0 }),
      n2: place([200, 208], "end", "middle", { width: 185, beat: 1 }),
      human: place([axis, 439], "center", "middle", {
        width: 200,
        ground: "red",
        beat: 2,
      }),
      n3: place([420, 565], "start", "middle", { width: 185, beat: 3 }),
      n4: place([axis, 686], "center", "middle", {
        width: 190,
        ground: "ink",
        beat: 4,
      }),
    },
  };
}

export const productArt = (orientation: Orientation): Art =>
  orientation === "portrait" ? portrait() : landscape();
