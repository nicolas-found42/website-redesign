import {
  easeX,
  easeY,
  figure,
  part,
  place,
  r,
  seal,
  strip,
  type Art,
  type LabelPlace,
  type Orientation,
} from "./kit";

/**
 * Individual Contributors and Teams: the gate.
 *
 * Four people in one company, each with a ribbon of their own role. Each
 * ribbon runs through a skill cut for that role — its buckle — and the four
 * ribbons then run side by side as parallel lanes in the rows' own order.
 * The lanes pass through a gate: the human in the loop, where a person
 * reviews before anything leaves. The ribbons stay four ribbons the whole
 * way; the method is shared, the skill is not. Past the gate the four
 * ribbons part into four separate paths, each with room of its own, and end
 * together at one shared result: reviewed work returns to each role. The
 * ribbons alternate the owner's red, charcoal and white, each with a
 * charcoal outline.
 */

/** Red, charcoal, white, red: one per role, alternating along the lanes. */
const FILLS = [
  "var(--red-strand)",
  "var(--ink)",
  "var(--paper)",
  "var(--red-strand)",
] as const;

/** A role's tab: the ribbon's end, with the person it belongs to. */
function tab(x: number, y: number, width: number, height: number): string {
  const h = height / 2;
  return (
    `<rect class="f-sunk" x="${r(x + 5)}" y="${r(y - h + 6)}" width="${width}" height="${height}" rx="4"/>` +
    `<path class="f-ink" d="M${r(x)} ${r(y - h)} L${r(x + width)} ${r(y - h)} L${r(x + width)} ${r(y + h)} L${r(x)} ${r(y + h)} L${r(x + 14)} ${r(y)} Z"/>` +
    figure([x + 40, y + 4], 0.72, "paper")
  );
}

/** A skill: the buckle a role's ribbon is threaded through. */
function buckle(
  x: number,
  y: number,
  width: number,
  height: number,
  ribbon: number,
): string {
  const h = height / 2;
  const slot = (sx: number) =>
    `<rect class="f-ink" x="${r(sx - 5)}" y="${r(y - ribbon / 2 - 4)}" width="10" height="${ribbon + 8}" rx="2"/>`;
  return (
    `<rect class="f-sunk" x="${r(x + 6)}" y="${r(y - h + 7)}" width="${width}" height="${height}" rx="10"/>` +
    `<rect class="f-paper s-ink" x="${r(x)}" y="${r(y - h)}" width="${width}" height="${height}" rx="10" stroke-width="3"/>` +
    slot(x + 16) +
    slot(x + width - 16)
  );
}

/** The gate: four charcoal posts framing the lanes, with a reviewer's seal on it. */
function gate(frame: { x: number; y: number; w: number; h: number }): string {
  const { x, y, w, h } = frame;
  const post = 16;
  return (
    `<rect class="f-ink" x="${x}" y="${y}" width="${post}" height="${h}" rx="4"/>` +
    `<rect class="f-ink" x="${x + w - post}" y="${y}" width="${post}" height="${h}" rx="4"/>` +
    `<rect class="f-ink" x="${x}" y="${y}" width="${w}" height="${post}" rx="4"/>` +
    `<rect class="f-ink" x="${x}" y="${y + h - post}" width="${w}" height="${post}" rx="4"/>`
  );
}

const plate = (x: number, y: number, width: number, height: number) =>
  `<rect class="f-red-deep" x="${r(x + 5)}" y="${r(y + 6)}" width="${width}" height="${height}" rx="6" opacity="0.28"/>` +
  `<rect class="f-red" x="${r(x)}" y="${r(y)}" width="${width}" height="${height}" rx="6"/>`;

const backdrop = (x: number, y: number, w: number, h: number) =>
  `<rect class="f-warm" x="${x}" y="${y}" width="${w}" height="${h}" rx="12"/>` +
  `<rect class="s-line" x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="none" stroke-width="2"/>`;

/**
 * The shared result: one charcoal panel the four paths end under, so they
 * arrive together and the caption is said once.
 */
const resultPanel = (x: number, y: number, w: number, h: number) =>
  `<rect class="f-sunk" x="${r(x + 5)}" y="${r(y + 6)}" width="${w}" height="${h}" rx="8"/>` +
  `<rect class="f-ink s-ink" x="${x}" y="${y}" width="${w}" height="${h}" rx="8" stroke-width="2.5"/>`;

function landscape(): Art {
  const ys = [170, 272, 374, 476];
  const centre = 330;
  // Four parallel lanes in the rows' own top-to-bottom order, spaced wider
  // than a ribbon: each role keeps its lane all the way through the gate,
  // so no ribbon crosses another.
  const lanes = ys.map((_, i) => centre + (i - 1.5) * 56);
  const width = 30;
  const channel = 700;
  const frame = { x: 806, y: 196, w: 84, h: 268 };
  // Past the gate the four paths part to ends of their own on the result.
  const panel = { x: 1060, y: 196, w: 230, h: 268 };
  // The canvas ends a margin past the panel, and the company's backdrop fills
  // it: nothing here is a number of its own to drift from the panel's.
  const canvasWidth = panel.x + panel.w + 50;
  const gap = 70;
  const ends = lanes.map((_, lane) => centre + (lane - 1.5) * gap);
  const beyond = frame.x + frame.w + 10;
  const labels: Record<string, LabelPlace> = {
    company: place([62, 70], "start", "below", { width: 400 }),
    human: place([frame.x + frame.w / 2, 531], "center", "middle", {
      width: 330,
      ground: "red",
    }),
    result: place([panel.x + panel.w / 2, centre], "center", "middle", {
      width: panel.w - 30,
      ground: "ink",
    }),
  };
  const rows = ys.map((y, i) => {
    const n = i + 1;
    labels[`role${n}`] = place([124, y], "start", "middle", {
      width: 200,
      ground: "ink",
    });
    labels[`skill${n}`] = place([490, y], "center", "middle", { width: 214 });
    const d = `M290 ${y} L640 ${y} ${easeX([640, y], [channel, lanes[i]], 0.5)} L${beyond} ${lanes[i]}`;
    return part(
      {
        name: "role",
        beat: n,
        enter: "slide-right",
        origin: [60, y],
        nodes: [`role${n}`, `skill${n}`],
        links: [`role${n}>skill${n}`, `skill${n}>human`],
        marks: [`person:role${n}`],
      },
      strip(d, width, FILLS[i]) +
        buckle(360, y, 260, 94, width) +
        tab(60, y, 270, 58),
    );
  });
  const returns = ys.map((_, i) => {
    const y = lanes[i];
    const tail = `L${beyond + 30} ${y} ${easeX([beyond + 30, y], [panel.x + 30, ends[i]], 0.5)}`;
    return part(
      {
        name: "return",
        beat: 6,
        enter: "slide-right",
        origin: [beyond, y],
        order: i,
        links: ["human>result"],
      },
      // The paper starts a little before the edge, so it meets the ribbon
      // that arrived at the gate without a seam.
      strip(`M${beyond - 2} ${y} ${tail}`, width, FILLS[i], {
        fillPath: `M${beyond - 3.5} ${y} ${tail}`,
      }),
    );
  });
  const parts = [
    part(
      { name: "company", beat: 0, enter: "fade", nodes: ["company"] },
      backdrop(30, 44, canvasWidth - 60, 552),
    ),
    part(
      {
        name: "gate",
        beat: 5,
        enter: "wrap",
        origin: [frame.x + frame.w / 2, centre],
        nodes: ["human"],
        marks: ["human:human"],
      },
      gate(frame) +
        seal([frame.x + frame.w / 2, frame.y - 4], 20, -8) +
        `<path class="s-red" d="M${frame.x + frame.w / 2} ${frame.y + frame.h} L${frame.x + frame.w / 2} 500" stroke-width="4"/>` +
        plate(frame.x + frame.w / 2 - 180, 500, 360, 62),
    ),
    ...rows,
    ...returns,
    part(
      {
        name: "result",
        beat: 6,
        enter: "unfold-x",
        origin: [panel.x, centre],
        order: 4,
        nodes: ["result"],
        marks: ["result:result"],
      },
      resultPanel(panel.x, panel.y, panel.w, panel.h),
    ),
  ];
  return { width: canvasWidth, height: 620, parts: parts.join(""), labels };
}

function portrait(): Art {
  const ys = [160, 292, 424, 556];
  // The top role's ribbon runs furthest right, so no ribbon crosses another
  // on its way down; it takes the bundle's last lane.
  const lanes = [594, 566, 538, 510];
  // Four parallel lanes holding the rows' left-to-right order: each ribbon
  // keeps its lane all the way through the gate, so no ribbon crosses
  // another. The lanes sit a ribbon apart with the backdrop showing between.
  const bundle = [492, 522, 552, 582];
  const strandOf = (row: number) => 3 - row;
  const width = 20;
  const channel = 650;
  const frame = { x: 470, y: 762, w: 134, h: 74 };
  // Past the gate the four paths part to ends of their own on the result.
  const panel = { x: 120, y: 1004, w: 470, h: 104 };
  // The canvas ends a margin below the panel, and the company's backdrop fills
  // it: nothing here is a number of its own to drift from the panel's.
  const canvasHeight = panel.y + panel.h + 40;
  const beyond = frame.y + frame.h + 10;
  const ends = bundle.map((_, lane) => 300 + lane * 84);
  const labels: Record<string, LabelPlace> = {
    company: place([40, 54], "start", "below", { width: 520 }),
    human: place([306, 799], "center", "middle", { width: 250, ground: "red" }),
    result: place(
      [panel.x + panel.w / 2, panel.y + panel.h / 2],
      "center",
      "middle",
      {
        width: panel.w - 32,
        ground: "ink",
      },
    ),
  };
  const rows = ys.map((y, i) => {
    const n = i + 1;
    const x = lanes[i];
    const radius = Math.min(24, x - 480);
    labels[`role${n}`] = place([88, y], "start", "middle", {
      width: 188,
      ground: "ink",
    });
    labels[`skill${n}`] = place([382, y], "center", "middle", { width: 170 });
    const d = `M262 ${y} L${x - radius} ${y} Q${x} ${y} ${x} ${y + radius} L${x} ${channel - 30} ${easeY([x, channel - 30], [bundle[strandOf(i)], channel], 0.5)} L${bundle[strandOf(i)]} ${beyond}`;
    return part(
      {
        name: "role",
        beat: n,
        enter: "slide-right",
        origin: [34, y],
        nodes: [`role${n}`, `skill${n}`],
        links: [`role${n}>skill${n}`, `skill${n}>human`],
        marks: [`person:role${n}`],
      },
      strip(d, width, FILLS[i]) +
        buckle(288, y, 188, 92, width) +
        tab(34, y, 244, 60),
    );
  });
  const returns = ys.map((_, i) => {
    const lane = strandOf(i);
    const x = bundle[lane];
    const tail = `L${x} ${beyond + 26} ${easeY([x, beyond + 26], [ends[lane], panel.y + 30], 0.5)}`;
    return part(
      {
        name: "return",
        beat: 6,
        enter: "slide-down",
        origin: [x, beyond],
        order: i,
        links: ["human>result"],
      },
      strip(`M${x} ${beyond - 2} ${tail}`, width, FILLS[i], {
        fillPath: `M${x} ${beyond - 3.5} ${tail}`,
      }),
    );
  });
  const parts = [
    part(
      { name: "company", beat: 0, enter: "fade", nodes: ["company"] },
      backdrop(14, 30, 592, canvasHeight - 60),
    ),
    part(
      {
        name: "gate",
        beat: 5,
        enter: "wrap",
        origin: [frame.x + frame.w / 2, frame.y + frame.h / 2],
        nodes: ["human"],
        marks: ["human:human"],
      },
      gate(frame) +
        seal([frame.x - 4, frame.y + 4], 18, -8) +
        `<path class="s-red" d="M${frame.x} ${frame.y + frame.h / 2} L440 ${frame.y + frame.h / 2}" stroke-width="4"/>` +
        plate(172, frame.y + frame.h / 2 - 48, 268, 96),
    ),
    ...rows,
    ...returns,
    part(
      {
        name: "result",
        beat: 6,
        enter: "unfold-y",
        origin: [panel.x + panel.w / 2, panel.y],
        order: 4,
        nodes: ["result"],
        marks: ["result:result"],
      },
      resultPanel(panel.x, panel.y, panel.w, panel.h),
    ),
  ];
  return { width: 620, height: canvasHeight, parts: parts.join(""), labels };
}

export const contributorsArt = (orientation: Orientation): Art =>
  orientation === "portrait" ? portrait() : landscape();
