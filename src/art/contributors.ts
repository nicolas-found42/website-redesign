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
  type Pt,
} from "./kit";

/**
 * Teams and individual contributors: the gate.
 *
 * Four people in one company, each with a ribbon of their own role. Each
 * ribbon runs through a skill cut for that role — its buckle — and the four
 * ribbons are then braided into one bundle. The bundle passes through a gate:
 * the human in the loop, where a person reviews before anything leaves. The
 * ribbons stay four ribbons the whole way; the method is shared, the skill is
 * not. The ribbons alternate the owner's red, charcoal and white, each with a
 * charcoal outline.
 */

/** Red, charcoal, white, red: one per role, alternating along the bundle. */
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

/**
 * Four strands braided along one axis: at each crossing neighbouring strands
 * swap lanes, the one moving towards the higher lane passing over. Returns the
 * strands' continuations from their first lane, the crossings' upper pieces
 * (drawn again on top of every strand) and the lane each strand leaves in.
 */
function braid({
  start,
  step,
  lanes,
  width,
  fills,
  axis,
}: {
  start: number;
  step: number;
  lanes: readonly number[];
  width: number;
  /** One fill per strand, in the order the strands start across the lanes. */
  fills: readonly string[];
  axis: "x" | "y";
}) {
  const at = (along: number, across: number): Pt =>
    axis === "x" ? [along, across] : [across, along];
  const ease = axis === "x" ? easeX : easeY;
  const crossings = [
    [
      [0, 1],
      [2, 3],
    ],
    [[1, 2]],
    [
      [0, 1],
      [2, 3],
    ],
  ];
  let lane = [0, 1, 2, 3];
  const paths = ["", "", "", ""];
  const overs: { strand: number; d: string; fillPath: string }[] = [];
  crossings.forEach((swaps, k) => {
    const next = [...lane];
    for (const [a, b] of swaps) {
      next[lane.indexOf(a)] = b;
      next[lane.indexOf(b)] = a;
    }
    const from = start + k * step;
    const to = from + step;
    for (let s = 0; s < 4; s += 1) {
      const a = at(from, lanes[lane[s]]);
      const b = at(to, lanes[next[s]]);
      const piece = ` ${ease(a, b, 0.5)}`;
      paths[s] += piece;
      if (next[s] > lane[s])
        overs.push({
          strand: s,
          d: `M${a[0]} ${a[1]}${piece}`,
          fillPath: `M${r(at(from - 1.5, lanes[lane[s]])[0])} ${r(at(from - 1.5, lanes[lane[s]])[1])} L${a[0]} ${a[1]}${piece} L${r(at(to + 1.5, lanes[next[s]])[0])} ${r(at(to + 1.5, lanes[next[s]])[1])}`,
        });
    }
    lane = next;
  });
  return {
    paths,
    overs: overs
      .map((over) =>
        strip(over.d, width, fills[over.strand], {
          fillPath: over.fillPath,
        }),
      )
      .join(""),
    /** The lane each strand leaves in. */
    leaves: lane,
  };
}

/** The gate: two charcoal posts and a lintel with a reviewer's seal, the bundle between. */
function gate(
  frame: { x: number; y: number; w: number; h: number },
  axis: "x" | "y",
): string {
  const { x, y, w, h } = frame;
  const post = 16;
  const body =
    axis === "x"
      ? // Upright: a post above and below the bundle, a lintel across the top.
        `<rect class="f-ink" x="${x}" y="${y}" width="${w}" height="${post}" rx="4"/>` +
        `<rect class="f-ink" x="${x}" y="${y + h - post}" width="${w}" height="${post}" rx="4"/>` +
        `<rect class="f-ink" x="${x}" y="${y}" width="${post}" height="${h}" rx="4"/>` +
        `<rect class="f-ink" x="${x + w - post}" y="${y}" width="${post}" height="${h}" rx="4"/>`
      : `<rect class="f-ink" x="${x}" y="${y}" width="${post}" height="${h}" rx="4"/>` +
        `<rect class="f-ink" x="${x + w - post}" y="${y}" width="${post}" height="${h}" rx="4"/>` +
        `<rect class="f-ink" x="${x}" y="${y}" width="${w}" height="${post}" rx="4"/>` +
        `<rect class="f-ink" x="${x}" y="${y + h - post}" width="${w}" height="${post}" rx="4"/>`;
  return body;
}

const plate = (x: number, y: number, width: number, height: number) =>
  `<rect class="f-red-deep" x="${r(x + 5)}" y="${r(y + 6)}" width="${width}" height="${height}" rx="6" opacity="0.28"/>` +
  `<rect class="f-red" x="${r(x)}" y="${r(y)}" width="${width}" height="${height}" rx="6"/>`;

const backdrop = (x: number, y: number, w: number, h: number) =>
  `<rect class="f-warm" x="${x}" y="${y}" width="${w}" height="${h}" rx="12"/>` +
  `<rect class="s-line" x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="none" stroke-width="2"/>`;

function landscape(): Art {
  const ys = [170, 272, 374, 476];
  const centre = 330;
  const lanes = ys.map((_, i) => centre + (i - 1.5) * 42);
  const width = 30;
  const braided = braid({
    start: 675,
    step: 40,
    lanes,
    width,
    fills: FILLS,
    axis: "x",
  });
  const exit = 675 + 40 * 3;
  const frame = { x: 806, y: 196, w: 84, h: 268 };
  const labels: Record<string, LabelPlace> = {
    company: place([62, 70], "start", "below", { width: 400 }),
    human: place([frame.x + frame.w / 2, 531], "center", "middle", {
      width: 210,
      ground: "red",
    }),
  };
  const rows = ys.map((y, i) => {
    const n = i + 1;
    labels[`role${n}`] = place([124, y], "start", "middle", {
      width: 164,
      ground: "ink",
    });
    labels[`skill${n}`] = place([490, y], "center", "middle", { width: 214 });
    const d = `M290 ${y} L640 ${y} ${easeX([640, y], [675, lanes[i]], 0.5)}${braided.paths[i]} L${exit + 150} ${lanes[braided.leaves[i]]}`;
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
        buckle(360, y, 260, 76, width) +
        tab(60, y, 230, 58),
    );
  });
  const parts = [
    part(
      { name: "company", beat: 0, enter: "fade", nodes: ["company"] },
      backdrop(30, 44, 940, 552),
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
      gate(frame, "x") +
        seal([frame.x + frame.w / 2, frame.y - 4], 20, -8) +
        `<path class="s-red" d="M${frame.x + frame.w / 2} ${frame.y + frame.h} L${frame.x + frame.w / 2} 500" stroke-width="4"/>` +
        plate(frame.x + frame.w / 2 - 124, 500, 248, 62),
    ),
    ...rows,
    part(
      { name: "crossings", beat: 4, enter: "fade", order: 1 },
      braided.overs,
    ),
  ];
  return { width: 1000, height: 620, defs: "", parts: parts.join(""), labels };
}

function portrait(): Art {
  const ys = [160, 292, 424, 556];
  // The top role's ribbon runs furthest right, so no ribbon crosses another
  // on its way down; it takes the bundle's last lane.
  const lanes = [594, 566, 538, 510];
  const bundle = [492, 522, 552, 582];
  const strandOf = (row: number) => 3 - row;
  const width = 20;
  const braidStart = 650;
  const braided = braid({
    start: braidStart,
    step: 34,
    lanes: bundle,
    width,
    fills: [...FILLS].reverse(),
    axis: "y",
  });
  const exit = braidStart + 34 * 3;
  const frame = { x: 470, y: 762, w: 134, h: 74 };
  const labels: Record<string, LabelPlace> = {
    company: place([40, 54], "start", "below", { width: 520 }),
    human: place([306, 799], "center", "middle", { width: 250, ground: "red" }),
  };
  const rows = ys.map((y, i) => {
    const n = i + 1;
    const x = lanes[i];
    const radius = Math.min(24, x - 480);
    labels[`role${n}`] = place([98, y], "start", "middle", {
      width: 162,
      ground: "ink",
    });
    labels[`skill${n}`] = place([382, y], "center", "middle", { width: 170 });
    const d = `M262 ${y} L${x - radius} ${y} Q${x} ${y} ${x} ${y + radius} L${x} ${braidStart - 30} ${easeY([x, braidStart - 30], [bundle[strandOf(i)], braidStart], 0.5)}${braided.paths[strandOf(i)]} L${bundle[braided.leaves[strandOf(i)]]} ${exit + 130}`;
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
        tab(34, y, 228, 60),
    );
  });
  const parts = [
    part(
      { name: "company", beat: 0, enter: "fade", nodes: ["company"] },
      backdrop(14, 30, 592, 850),
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
      gate(frame, "y") +
        seal([frame.x - 4, frame.y + 4], 18, -8) +
        `<path class="s-red" d="M${frame.x} ${frame.y + frame.h / 2} L440 ${frame.y + frame.h / 2}" stroke-width="4"/>` +
        plate(172, frame.y + frame.h / 2 - 32, 268, 64),
    ),
    ...rows,
    part(
      { name: "crossings", beat: 4, enter: "fade", order: 1 },
      braided.overs,
    ),
  ];
  return { width: 620, height: 900, defs: "", parts: parts.join(""), labels };
}

export const contributorsArt = (orientation: Orientation): Art =>
  orientation === "portrait" ? portrait() : landscape();
