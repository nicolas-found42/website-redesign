import {
  part,
  place,
  prints,
  paint,
  pt,
  r,
  strip,
  type Art,
  type Orientation,
  type Pt,
} from "./kit";

/**
 * Executives: the roller.
 *
 * The operating problem arrives crumpled — the way a real one does. A
 * tailored executive skill is the roller it is fed through, and what comes out
 * is flat: a decision brief you can use. The brief lands on an illustrative
 * operating view, which a red clip holds — executive direction — and the view
 * feeds back to the problem it answers. The view is hypothetical, drawn as a
 * board of plain bars rather than any client's system.
 */

/**
 * A crumpled sheet: a faceted ball of paper, lit from the upper left. An outer
 * ring of creases meets an inner one, and each facet takes the light by which
 * way it faces, so the ball reads as paper screwed up in a hand rather than a
 * wheel of spokes.
 */
function crumple(at: Pt, radius: number): string {
  const [cx, cy] = at;
  const ring = (count: number, reach: readonly number[], twist: number) =>
    reach.map((k, i): Pt => {
      const a = (i / count) * Math.PI * 2 + twist + (i % 2 ? 0.07 : -0.05);
      return [cx + Math.cos(a) * radius * k, cy + Math.sin(a) * radius * k];
    });
  const rim = ring(
    12,
    [0.94, 0.82, 1, 0.88, 0.97, 0.8, 0.93, 0.99, 0.84, 0.96, 0.86, 1],
    -0.2,
  );
  const inner = ring(5, [0.46, 0.4, 0.5, 0.38, 0.44], 0.35);
  const hub: Pt = [cx - radius * 0.08, cy - radius * 0.06];
  // Angles measured from the first rim point, so the zip starts there.
  const base = Math.atan2(rim[0][1] - cy, rim[0][0] - cx) - 0.001;
  const angle = ([x, y]: Pt) => {
    const turn = Math.PI * 2;
    return (((Math.atan2(y - cy, x - cx) - base) % turn) + turn) % turn;
  };

  // Zip the two rings together into a band of triangles, then close the
  // middle with a fan from a point just off centre.
  const facets: Pt[][] = [];
  let i = 0;
  let j = 0;
  while (i < rim.length || j < inner.length) {
    const a = rim[i % rim.length];
    const b = inner[j % inner.length];
    const nextRim = rim[(i + 1) % rim.length];
    const nextInner = inner[(j + 1) % inner.length];
    const rimAhead =
      i < rim.length &&
      (j >= inner.length ||
        angle(nextRim) + (i + 1 >= rim.length ? Math.PI * 2 : 0) <
          angle(nextInner) + (j + 1 >= inner.length ? Math.PI * 2 : 0));
    if (rimAhead) {
      facets.push([a, nextRim, b]);
      i += 1;
    } else {
      facets.push([a, nextInner, b]);
      j += 1;
    }
  }
  inner.forEach((p, k) => facets.push([hub, p, inner[(k + 1) % inner.length]]));

  const light = (facet: Pt[], k: number) => {
    const mx = facet.reduce((sum, p) => sum + p[0], 0) / facet.length - cx;
    const my = facet.reduce((sum, p) => sum + p[1], 0) / facet.length - cy;
    const reach = Math.hypot(mx, my) / radius;
    // Facing the light, upper left; a crease every so often turns one away.
    const lit = ((-mx - my) / (Math.hypot(mx, my) || 1)) * reach;
    const turned = k % 4 === 1 ? -0.34 : k % 5 === 2 ? 0.22 : 0;
    const value = lit + turned;
    if (value > 0.42) return "f-paper";
    if (value > -0.05) return "f-warm";
    if (value > -0.5) return "f-sunk";
    return "f-line";
  };
  const outline = `M${rim.map(pt).join(" L")} Z`;
  return (
    `<path class="f-sunk" d="${outline}" transform="translate(6 7)"/>` +
    facets
      .map(
        (facet, k) =>
          `<path class="${light(facet, k)} s-ink" d="M${facet.map(pt).join(" L")} Z" stroke-width="1.3" stroke-linejoin="round"/>`,
      )
      .join("") +
    `<path class="s-ink" d="${outline}" fill="none" stroke-width="3" stroke-linejoin="round"/>`
  );
}

/** The roller, seen side on: an ink cylinder with its highlight. */
function roller(x: number, y: number, width: number, height: number): string {
  const h = height / 2;
  return (
    `<rect class="f-sunk" x="${r(x + 6)}" y="${r(y + 8)}" width="${width}" height="${height}" rx="${r(h)}"/>` +
    `<rect class="f-ink" x="${r(x)}" y="${r(y)}" width="${width}" height="${height}" rx="${r(h)}"/>` +
    `<rect class="f-paper" x="${r(x + h * 0.6)}" y="${r(y + height * 0.16)}" width="${r(width - h * 1.2)}" height="${r(height * 0.1)}" rx="3" opacity="0.18"/>` +
    `<ellipse class="f-muted" cx="${r(x + width - h * 0.55)}" cy="${r(y + h)}" rx="${r(h * 0.28)}" ry="${r(h * 0.8)}" opacity="0.7"/>`
  );
}

/** A sheet with its ruled lines: the brief. */
function brief(at: Pt, width: number, height: number, turn: number): string {
  const x = -width / 2;
  const y = -height / 2;
  const lines = [0.3, 0.44, 0.58, 0.72]
    .map(
      (k, i) =>
        `<rect class="f-ink" x="${r(x + width * 0.14)}" y="${r(y + height * k)}" width="${r(width * (i === 3 ? 0.4 : 0.7))}" height="5" rx="1"/>`,
    )
    .join("");
  return (
    `<g transform="translate(${pt(at)}) rotate(${r(turn)})">` +
    `<rect class="f-sunk" x="${r(x + 5)}" y="${r(y + 6)}" width="${width}" height="${height}"/>` +
    `<rect class="f-paper s-ink" x="${r(x)}" y="${r(y)}" width="${width}" height="${height}" stroke-width="2.6"/>` +
    `<rect class="f-ink" x="${r(x + width * 0.14)}" y="${r(y + height * 0.12)}" width="${r(width * 0.36)}" height="9" rx="1"/>` +
    lines +
    `</g>`
  );
}

/** The board the brief is put to work on: a header rule and four bars. */
function board(
  uid: string,
  box: { x: number; y: number; w: number; h: number },
  rule: { y: number; length?: number },
  rows: readonly { y: number; length: number }[],
) {
  const prints = ["dots", "stripes", "rules", "checks"] as const;
  return (
    `<rect class="f-sunk" x="${box.x + 7}" y="${box.y + 8}" width="${box.w}" height="${box.h}" rx="6"/>` +
    `<rect class="f-warm s-ink" x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" rx="6" stroke-width="3"/>` +
    `<rect class="f-ink" data-rule x="${box.x + 32}" y="${rule.y}" width="${rule.length ?? box.w - 64}" height="3"/>` +
    rows
      .map(
        (row, i) =>
          `<rect class="s-ink" x="${box.x + 32}" y="${row.y}" width="${row.length}" height="26" rx="3" fill="${paint(uid, prints[i])}" stroke-width="2.2"/>`,
      )
      .join("")
  );
}

/** A red binder clip gripping the board's edge. */
function clip(at: Pt, side: "left" | "bottom"): string {
  const [x, y] = at;
  const body =
    `<path class="f-sunk" d="M-40 -34 L10 -26 L10 26 L-40 34 Z" transform="translate(5 6)"/>` +
    `<path class="f-red" d="M-40 -34 L10 -26 L10 26 L-40 34 Z"/>` +
    `<path class="f-red-deep" d="M-40 -34 L-24 -31.5 L-24 31.5 L-40 34 Z"/>` +
    `<path class="s-red-deep" d="M-40 -18 C-78 -22 -78 22 -40 18" fill="none" stroke-width="5"/>` +
    `<path class="s-red" d="M-40 -9 C-64 -12 -64 12 -40 9" fill="none" stroke-width="4"/>`;
  const turn = side === "left" ? 0 : -90;
  return `<g transform="translate(${r(x)} ${r(y)}) rotate(${turn})">${body}</g>`;
}

function landscape(uid: string): Art {
  const ball: Pt = [118, 158];
  const view = { x: 262, y: 280, w: 640, h: 296 };
  const rows = [
    { y: 404, length: 380 },
    { y: 446, length: 430 },
    { y: 488, length: 520 },
    { y: 530, length: 300 },
  ];
  // The paper leaves the roller flat and curls down onto the board.
  const sheet = `M560 160 L682 160 C742 160 776 190 776 250 L776 300`;
  const parts = [
    part(
      {
        name: "feedback",
        beat: 5,
        enter: "unfold-y",
        order: 1,
        origin: [30, 560],
        links: ["view>problem"],
      },
      strip(
        `M${view.x + 20} 556 L52 556 C38 556 30 548 30 532 L30 ${ball[1] + 10} C30 ${ball[1] - 6} 40 ${ball[1] - 14} 60 ${ball[1] - 14}`,
        20,
        "var(--paper-sunk)",
        { edge: 2.5 },
      ),
    ),
    part(
      {
        name: "problem",
        beat: 0,
        enter: "drop",
        origin: ball,
        nodes: ["problem"],
        marks: ["source:problem"],
      },
      crumple(ball, 64),
    ),
    part(
      {
        name: "feed",
        beat: 1,
        enter: "slide-right",
        origin: [180, 160],
        links: ["problem>skill"],
      },
      strip(`M170 160 L270 160`, 30, "var(--paper-warm)", { edge: 2.5 }),
    ),
    part(
      {
        name: "view",
        beat: 3,
        enter: "unfold-y",
        origin: [view.x, view.y],
        nodes: ["view"],
      },
      board(uid, view, { y: 380, length: 420 }, rows),
    ),
    part(
      {
        name: "skill",
        beat: 1,
        enter: "slide-right",
        order: 1,
        origin: [260, 160],
        nodes: ["skill"],
      },
      roller(260, 112, 300, 96),
    ),
    part(
      {
        name: "brief",
        beat: 2,
        enter: "slide-right",
        origin: [560, 160],
        nodes: ["brief"],
        marks: ["result:brief"],
        links: ["skill>brief", "brief>view"],
      },
      strip(sheet, 34, "var(--paper)", { edge: 2.5 }) +
        brief([790, 368], 130, 150, 5),
    ),
    part(
      {
        name: "direction",
        beat: 5,
        enter: "stamp",
        origin: [view.x, 430],
        nodes: ["direction"],
        marks: ["human:direction"],
        links: ["direction>view"],
      },
      clip([view.x + 2, 430], "left"),
    ),
  ];
  return {
    width: 1000,
    height: 620,
    defs: prints(uid),
    parts: parts.join(""),
    labels: {
      problem: place([ball[0] + 8, ball[1] + 76], "center", "below", {
        width: 210,
      }),
      skill: place([410, 162], "center", "middle", {
        width: 250,
        ground: "ink",
      }),
      brief: place([640, 118], "start", "above", { width: 340 }),
      view: place([view.x + 32, view.y + 26], "start", "below", { width: 420 }),
      direction: place([view.x - 70, 430], "end", "middle", { width: 150 }),
    },
  };
}

function portrait(uid: string): Art {
  const ball: Pt = [120, 92];
  const view = { x: 44, y: 360, w: 540, h: 420 };
  const rows = [
    { y: 536, length: 330 },
    { y: 588, length: 420 },
    { y: 640, length: 470 },
    { y: 692, length: 260 },
  ];
  const sheet = `M440 214 L486 214 C534 214 560 240 560 290 L560 380`;
  const parts = [
    part(
      {
        name: "feedback",
        beat: 5,
        enter: "unfold-y",
        order: 1,
        origin: [20, 760],
        links: ["view>problem"],
      },
      strip(
        `M${view.x + 20} 764 L34 764 C24 764 20 756 20 744 L20 ${ball[1] + 12} C20 ${ball[1] - 2} 28 ${ball[1] - 8} 40 ${ball[1] - 8} L72 ${ball[1] - 8}`,
        22,
        "var(--paper-sunk)",
        { edge: 2.5 },
      ),
    ),
    part(
      {
        name: "problem",
        beat: 0,
        enter: "drop",
        origin: ball,
        nodes: ["problem"],
        marks: ["source:problem"],
      },
      crumple(ball, 58),
    ),
    part(
      {
        name: "feed",
        beat: 1,
        enter: "slide-down",
        origin: [120, 150],
        links: ["problem>skill"],
      },
      strip(`M120 146 L120 186`, 28, "var(--paper-warm)", { edge: 2.5 }),
    ),
    part(
      {
        name: "view",
        beat: 3,
        enter: "unfold-y",
        origin: [view.x, view.y],
        nodes: ["view"],
      },
      board(uid, view, { y: 500 }, rows),
    ),
    part(
      {
        name: "skill",
        beat: 1,
        enter: "slide-right",
        order: 1,
        origin: [40, 214],
        nodes: ["skill"],
      },
      roller(40, 168, 400, 92),
    ),
    part(
      {
        name: "brief",
        beat: 2,
        enter: "slide-right",
        origin: [440, 214],
        nodes: ["brief"],
        marks: ["result:brief"],
        links: ["skill>brief", "brief>view"],
      },
      strip(sheet, 32, "var(--paper)", { edge: 2.5 }) +
        brief([548, 432], 104, 124, 5),
    ),
    part(
      {
        name: "direction",
        beat: 5,
        enter: "stamp",
        origin: [view.x + 70, view.y + view.h],
        nodes: ["direction"],
        marks: ["human:direction"],
        links: ["direction>view"],
      },
      clip([view.x + 70, view.y + view.h - 2], "bottom"),
    ),
  ];
  return {
    width: 620,
    height: 860,
    defs: prints(uid),
    parts: parts.join(""),
    labels: {
      problem: place([198, 92], "start", "middle", { width: 380 }),
      skill: place([236, 214], "center", "middle", {
        width: 330,
        ground: "ink",
      }),
      brief: place([500, 330], "end", "above", { width: 420 }),
      view: place([view.x + 32, view.y + 26], "start", "below", { width: 380 }),
      direction: place(
        [view.x + 124, view.y + view.h + 42],
        "start",
        "middle",
        {
          width: 400,
        },
      ),
    },
  };
}

export const executivesArt = (orientation: Orientation, uid: string): Art =>
  orientation === "portrait" ? portrait(uid) : landscape(uid);
