/**
 * The workshop kit: the parts every drawing is made from.
 *
 * Each drawing is an object someone could make on a table — strands plaited
 * and bound, a strip folded into a loop, a sheet run through a roller, a stair
 * folded from card — so the work is shown by how its pieces are joined rather
 * than by lines drawn between points. The kit keeps those pieces in one hand:
 *
 * - **Materials.** Solid paper and card in the site's own inks, each with a
 *   charcoal outline. Each of the five node identities has its own tone, so a
 *   strand of "your people" is recognisably the same material wherever it
 *   appears, and red is only ever the human's part.
 * - **Parts.** Every piece a drawing assembles is a part: an outer group that
 *   is never transformed and an inner body that an entrance may move. A part
 *   declares when it arrives (its beat) and how (its entrance), and nothing
 *   else about motion lives in the drawing.
 * - **Labels.** Words are HTML set over the drawing, not SVG text, so they keep
 *   the page's type, sizes and wrapping. A drawing only says where each label
 *   sits and what it sits on.
 *
 * Colours are classes, not values, so a drawing follows the tokens.
 */

export type Pt = readonly [number, number];
export type Orientation = "landscape" | "portrait";

/** How a part arrives. The still composition never depends on it. */
export type Entrance =
  | "rise"
  | "drop"
  | "slide-right"
  | "slide-left"
  | "slide-down"
  | "slide-up"
  | "unfold-x"
  | "unfold-y"
  | "swing"
  | "stamp"
  | "pop"
  | "wrap"
  | "fade";

export type PartSpec = {
  /** What the part is, for tests and for anyone reading the markup. */
  readonly name: string;
  /** The story beat it arrives in. */
  readonly beat: number;
  readonly enter: Entrance;
  /** The point an entrance scales, swings or unfolds about, in field units. */
  readonly origin?: Pt;
  /** Order within its beat. */
  readonly order?: number;
  /**
   * The connections this part makes visible, as `from>to` node keys. Every
   * connection the drawing's content declares has at least one part saying
   * it shows it.
   */
  readonly links?: readonly string[];
  /** The node keys this part stands for. */
  readonly nodes?: readonly string[];
  /**
   * The marks this part carries, as `kind:key` — a person on a role, a
   * reviewer's check on a step — so each can be matched to what the scene says.
   */
  readonly marks?: readonly string[];
};

export const r = (value: number) => Math.round(value * 10) / 10;
export const pt = ([x, y]: Pt) => `${r(x)} ${r(y)}`;

/**
 * One part. The outer group is placed by nothing and the inner body is the
 * only thing an entrance touches, so a tween can never displace a piece.
 */
export function part(spec: PartSpec, body: string): string {
  const [ox, oy] = spec.origin ?? [0, 0];
  const data = [
    `data-part="${spec.name}"`,
    `data-beat="${spec.beat}"`,
    `data-enter="${spec.enter}"`,
    spec.order ? `data-order="${spec.order}"` : "",
    spec.links?.length ? `data-links="${spec.links.join(" ")}"` : "",
    spec.nodes?.length ? `data-nodes="${spec.nodes.join(" ")}"` : "",
    spec.marks?.length ? `data-marks="${spec.marks.join(" ")}"` : "",
  ]
    .filter(Boolean)
    .join(" ");
  return `<g class="part" ${data}><g class="part-body" style="transform-origin:${r(ox)}px ${r(oy)}px">${body}</g></g>`;
}

/* ── Materials ── */

/**
 * The fills. Every strip is a solid surface with a charcoal outline — no dots,
 * stripes or rules. Each of the five node identities keeps its own solid tone,
 * so a strand of "your people" is recognisably the same material wherever it
 * appears, and red is only ever the human's part.
 */
export const identityFill = {
  n1: "var(--paper)",
  n2: "var(--ink)",
  n3: "var(--paper-sunk)",
} as const;

/* ── Pieces ── */

/**
 * A strip of paper along a path: an ink edge, then its fill. Butt
 * ends, so a strip can be cut and continued without a seam.
 */
export function strip(
  d: string,
  width: number,
  fill: string,
  {
    edge = 3,
    className = "",
    fillPath = d,
  }: { edge?: number; className?: string; fillPath?: string } = {},
): string {
  return (
    `<path class="s-ink${className ? ` ${className}` : ""}" d="${d}" fill="none" stroke-width="${r(width + edge * 2)}"/>` +
    `<path d="${fillPath}" fill="none" stroke="${fill}" stroke-width="${r(width)}"/>`
  );
}

/** A strip in one of the solid inks, by class. */
/** A direction along one axis: a strip's heading into or out of a fold. */
export type Dir = readonly [number, number];
const step = (a: Pt, b: Dir, k = 1): Pt => [a[0] + b[0] * k, a[1] + b[1] * k];

/**
 * A mitred fold where a strip `width` wide travelling `into` turns to travel
 * `out`. The folded-over face is the strip's reverse — the outgoing paper in
 * shadow — and the crease runs corner to corner across it.
 */
export function mitre(
  at: Pt,
  into: Dir,
  out: Dir,
  incoming: string,
  outgoing: string,
  width: number,
  { crease = "s-ink" }: { crease?: string } = {},
) {
  const h = width / 2;
  const outer = step(step(at, into, h), out, -h);
  const inner = step(step(at, into, -h), out, h);
  const before = step(step(at, into, -h), out, -h);
  const after = step(step(at, into, h), out, h);
  const e = h + 3;
  const square = `M${pt(step(step(at, into, -e), out, -e))} L${pt(step(step(at, into, e), out, -e))} L${pt(step(step(at, into, e), out, e))} L${pt(step(step(at, into, -e), out, e))} Z`;
  return (
    `<path class="f-ink" d="${square}"/>` +
    `<path d="M${pt(outer)} L${pt(before)} L${pt(inner)} Z" fill="${incoming}"/>` +
    `<path d="M${pt(outer)} L${pt(after)} L${pt(inner)} Z" fill="${outgoing}"/>` +
    `<path class="f-ink" d="M${pt(outer)} L${pt(after)} L${pt(inner)} Z" opacity="0.2"/>` +
    `<path class="${crease}" d="M${pt(outer)} L${pt(inner)}" stroke-width="2.6"/>`
  );
}

/** A straight run of strip between two fold centres, `from`/`to` short of each. */
export const run = (
  a: Pt,
  b: Pt,
  fill: string,
  width: number,
  { from = width / 2, to = width / 2 }: { from?: number; to?: number } = {},
) => {
  const d: Dir = [Math.sign(b[0] - a[0]), Math.sign(b[1] - a[1])];
  return strip(`M${pt(step(a, d, from))} L${pt(step(b, d, -to))}`, width, fill);
};

/**
 * A cut end: a swallowtail, the way a ribbon is cut, notched at `at` and
 * running `length` to the right.
 */
export const swallowtail = (
  at: Pt,
  fill: string,
  width: number,
  length = 64,
) => {
  const [x, y] = at;
  const h = width / 2;
  const notch = Math.min(20, width * 0.4);
  const d = `M${r(x + length)} ${r(y - h)} L${r(x)} ${r(y - h)} L${r(x + notch)} ${r(y)} L${r(x)} ${r(y + h)} L${r(x + length)} ${r(y + h)} Z`;
  return (
    `<path class="s-ink" d="${d}" stroke-width="6" stroke-linejoin="miter"/>` +
    `<path d="${d}" fill="${fill}"/>`
  );
};

export function solidStrip(
  d: string,
  width: number,
  tone: "ink" | "red" | "paper" | "warm" | "sunk" | "line",
  { edge = 0 } = {},
): string {
  const under = edge
    ? `<path class="s-ink" d="${d}" fill="none" stroke-width="${r(width + edge * 2)}"/>`
    : "";
  return `${under}<path class="s-${tone}" d="${d}" fill="none" stroke-width="${r(width)}"/>`;
}

/**
 * A tag: a card with a notched end and a punched hole, the thing a finished
 * piece is labelled with. Drawn pointing along +x from `at` (its hole end),
 * then rotated by `turn` degrees.
 */
export function tag(
  at: Pt,
  width: number,
  height: number,
  {
    tone = "ink",
    turn = 0,
  }: { tone?: "ink" | "paper" | "red"; turn?: number } = {},
): string {
  const h = height / 2;
  const notch = Math.min(22, height * 0.42);
  const d = `M0 0 L${r(notch)} ${r(-h)} L${r(width)} ${r(-h)} L${r(width)} ${r(h)} L${r(notch)} ${r(h)} Z`;
  const fill = tone === "ink" ? "f-ink" : tone === "red" ? "f-red" : "f-paper";
  const hole = tone === "paper" ? "f-sunk" : "f-paper";
  return (
    `<g transform="translate(${pt(at)}) rotate(${r(turn)})">` +
    `<path class="f-sunk" d="${d}" transform="translate(4 5)"/>` +
    `<path class="${fill} s-ink" d="${d}" stroke-width="2.5" stroke-linejoin="round"/>` +
    `<circle class="${hole} s-ink" cx="${r(notch * 0.95)}" cy="0" r="${r(Math.min(6, height * 0.12))}" stroke-width="2"/>` +
    `</g>`
  );
}

/** A cut-paper figure: a head and shoulders, the person a role belongs to. */
export function figure(
  at: Pt,
  scale = 1,
  tone: "ink" | "red" | "strand" | "paper" = "ink",
): string {
  const fill =
    tone === "ink"
      ? "f-ink"
      : tone === "red"
        ? "f-red"
        : tone === "strand"
          ? "f-strand s-ink"
          : "f-paper";
  return (
    `<g transform="translate(${pt(at)}) scale(${r(scale * 100) / 100})">` +
    `<circle class="${fill}" cx="0" cy="-15" r="10.5"/>` +
    `<path class="${fill}" d="M-19 22 C-19 4 -11 -1 0 -1 C11 -1 19 4 19 22 Z"/>` +
    `</g>`
  );
}

/**
 * A cut-paper person, standing: head, body and legs, set with their feet at
 * `at`. A raised arm points at the work when `point` is given. Tones alternate
 * charcoal, the strand red and white, and white ones carry a charcoal outline.
 */
export function stander(
  at: Pt,
  scale = 1,
  tone: "ink" | "strand" | "paper" = "ink",
  point?: "left" | "right",
): string {
  const fill =
    tone === "ink"
      ? "f-ink"
      : tone === "strand"
        ? "f-strand s-ink"
        : "f-paper s-ink";
  const arm = point
    ? `<path class="s-${tone === "paper" ? "ink" : tone}" d="M${point === "right" ? 14 : -14} -84 L${point === "right" ? 44 : -44} -104" fill="none" stroke-width="9" stroke-linecap="round"/>`
    : "";
  return (
    `<g transform="translate(${pt(at)}) scale(${r(scale * 100) / 100})" stroke-width="2.5">` +
    `<rect class="${fill}" x="-14" y="-46" width="12" height="46" rx="4"/>` +
    `<rect class="${fill}" x="2" y="-46" width="12" height="46" rx="4"/>` +
    arm +
    `<rect class="${fill}" x="-19" y="-94" width="38" height="56" rx="12"/>` +
    `<circle class="${fill}" cx="0" cy="-110" r="13"/>` +
    `</g>`
  );
}

/** The reviewer's seal: a red disc with a paper tick, pressed onto a step. */
export function seal(at: Pt, radius = 22, turn = -8): string {
  const s = radius / 22;
  return (
    `<g transform="translate(${pt(at)}) rotate(${r(turn)})">` +
    `<circle class="f-red" r="${r(radius)}"/>` +
    `<circle class="s-paper" r="${r(radius - 5 * s)}" fill="none" stroke-width="${r(1.6 * s)}" />` +
    `<path class="s-paper" d="M${r(-9 * s)} ${r(1 * s)} L${r(-2.5 * s)} ${r(7.5 * s)} L${r(10 * s)} ${r(-6.5 * s)}" fill="none" stroke-width="${r(4.6 * s)}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `</g>`
  );
}

/* ── Labels ── */

/** Where a label's box sits relative to its point. */
export type Align = "start" | "center" | "end";
export type Baseline = "above" | "middle" | "below";
/** The ground a label is set on, which decides its ink. */
export type Ground = "paper" | "ink" | "red";

export type LabelPlace = {
  readonly at: Pt;
  readonly align: Align;
  readonly baseline: Baseline;
  /** Wrap inside this width, in field units. */
  readonly width?: number;
  readonly ground?: Ground;
  /** The beat a schematic's label arrives in; a scene's labels carry their own. */
  readonly beat?: number;
};

/**
 * One drawing, ready to mount: the field it is drawn in, its
 * definitions, its parts in painting order, and a place for every label.
 */
export type Art = {
  readonly width: number;
  readonly height: number;
  readonly defs: string;
  readonly parts: string;
  readonly labels: Readonly<Record<string, LabelPlace>>;
};

export const place = (
  at: Pt,
  align: Align,
  baseline: Baseline,
  options: { width?: number; ground?: Ground; beat?: number } = {},
): LabelPlace => ({ at, align, baseline, ...options });

/* ── Curves ── */

/** A cubic that leaves `a` and arrives at `b` both travelling along x. */
export const easeX = (a: Pt, b: Pt, pull = 0.5) => {
  const dx = (b[0] - a[0]) * pull;
  return `C${r(a[0] + dx)} ${r(a[1])} ${r(b[0] - dx)} ${r(b[1])} ${pt(b)}`;
};
/** A cubic that leaves `a` and arrives at `b` both travelling along y. */
export const easeY = (a: Pt, b: Pt, pull = 0.5) => {
  const dy = (b[1] - a[1]) * pull;
  return `C${r(a[0])} ${r(a[1] + dy)} ${r(b[0])} ${r(b[1] - dy)} ${pt(b)}`;
};

/**
 * A three-strand plait along one axis.
 *
 * Strands start in lanes 0, 1 and 2. At each crossing one outer strand passes
 * *over* the middle one and takes its lane, alternating sides — which is all a
 * plait is. Each strand is drawn whole, then every crossing's upper piece is
 * drawn again on top; the fills are solid, so the repeated piece meets
 * the strand under it without a seam.
 */
/** How far a piece's paper runs past its ink edge to hide a join. */
const SEAM = 1.5;

export function plait({
  start,
  step,
  crossings,
  lanes,
  width,
  fills,
  axis = "x",
}: {
  start: number;
  step: number;
  crossings: number;
  lanes: readonly [number, number, number];
  width: number;
  fills: readonly [string, string, string];
  axis?: "x" | "y";
}): { strands: string[]; overs: string; exit: number[] } {
  const at = (along: number, across: number): Pt =>
    axis === "x" ? [along, across] : [across, along];
  const ease = axis === "x" ? easeX : easeY;
  let lane = [0, 1, 2];
  const paths = ["", "", ""].map((_, s) => `M${pt(at(start, lanes[s]))}`);
  const overs: string[] = [];
  for (let k = 0; k < crossings; k += 1) {
    const outer = k % 2 === 0 ? 0 : 2;
    const next = lane.map((l) => (l === outer ? 1 : l === 1 ? outer : l));
    const a = start + k * step;
    const b = a + step;
    for (let s = 0; s < 3; s += 1) {
      const from = at(a, lanes[lane[s]]);
      const to = at(b, lanes[next[s]]);
      const piece = ` ${ease(from, to, 0.5)}`;
      paths[s] += piece;
      // A piece laid over its own strand ends in the middle of that strand's
      // paper. Its fill runs a hair past its ink edge, so the edge's
      // anti-aliased end is covered rather than showing as a hairline.
      if (lane[s] === outer)
        overs.push(
          strip(`M${pt(from)}${piece}`, width, fills[s], {
            fillPath: `M${pt(at(a - SEAM, lanes[lane[s]]))} L${pt(from)}${piece} L${pt(at(b + SEAM, lanes[next[s]]))}`,
          }),
        );
    }
    lane = next;
  }
  return {
    // The strands meet whatever brings them in at `start`; the same overlap
    // hides that join.
    strands: paths.map((d, s) =>
      strip(d, width, fills[s], {
        fillPath: `M${pt(at(start - SEAM, lanes[s]))} L${d.slice(1)}`,
      }),
    ),
    overs: overs.join(""),
    // Which strand leaves in each lane.
    exit: [0, 1, 2].map((l) => lane.indexOf(l)),
  };
}
