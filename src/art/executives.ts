import {
  part,
  place,
  pt,
  r,
  strip,
  seal,
  type Art,
  type LabelPlace,
  type Orientation,
  type Pt,
} from "./kit";

/**
 * Executives: the roller and the Daily Brief.
 *
 * The operating problem arrives crumpled — the way a real one does. A
 * tailored executive skill is the roller it is fed through, and what comes out
 * is flat: a Claude Daily Brief you can use, with a compact selection of its
 * sections — Critical, Needle Movers, Calendar Intelligence, Pipeline &
 * Revenue, Recommended Actions. A red clip holds the brief, and a seal on the
 * recommended actions is the executive's decision; the recommendations feed
 * back to the problem they answer. The brief is illustrative and fictional:
 * nothing in it is read from a real inbox, calendar or CRM.
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

/** A red binder clip gripping the brief's edge. */
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

/**
 * The Daily Brief: a document with a charcoal title band carrying a plain
 * asterisk, and one row for each section it shows. Rows are plain surfaces;
 * the last, Recommended Actions, is outlined in red because that is where a
 * person decides.
 */
function dailyBrief(
  box: { x: number; y: number; w: number; h: number },
  header: number,
  rows: readonly number[],
  rowHeight: number,
): string {
  const { x, y, w, h } = box;
  const spark = (cx: number, cy: number) =>
    [0, 45, 90, 135]
      .map(
        (turn) =>
          `<path class="s-paper" d="M${r(cx - 11)} ${r(cy)} L${r(cx + 11)} ${r(cy)}" transform="rotate(${turn} ${r(cx)} ${r(cy)})" stroke-width="3.4" stroke-linecap="round" fill="none"/>`,
      )
      .join("");
  return (
    `<rect class="f-sunk" x="${x + 7}" y="${y + 8}" width="${w}" height="${h}" rx="8"/>` +
    `<rect class="f-paper s-ink" x="${x}" y="${y}" width="${w}" height="${h}" rx="8" stroke-width="3"/>` +
    `<path class="f-ink" d="M${x} ${y + header} L${x} ${y + 8} Q${x} ${y} ${x + 8} ${y} L${x + w - 8} ${y} Q${x + w} ${y} ${x + w} ${y + 8} L${x + w} ${y + header} Z"/>` +
    spark(x + 30, y + header / 2) +
    rows
      .map((row, i) => {
        const last = i === rows.length - 1;
        return (
          `<rect class="${last ? "f-paper s-red" : "f-warm s-ink"}" x="${x + 24}" y="${row}" width="${w - 48}" height="${rowHeight}" rx="6" stroke-width="${last ? 3 : 2}"/>` +
          `<rect class="f-ink" x="${x + 38}" y="${r(row + rowHeight / 2 - 6)}" width="12" height="12" rx="3"/>` +
          `<rect class="f-line" x="${x + w - 120}" y="${r(row + rowHeight / 2 - 3)}" width="72" height="6" rx="3"/>`
        );
      })
      .join("")
  );
}

function landscape(): Art {
  const ball: Pt = [118, 158];
  const doc = { x: 262, y: 280, w: 640, h: 316 };
  const header = 50;
  const rowHeight = 36;
  const rows = [0, 1, 2, 3, 4].map((i) => doc.y + header + 14 + i * 44);
  // The paper leaves the roller flat and curls down onto the brief.
  const sheet = `M560 160 L682 160 C742 160 776 190 776 250 L776 300`;
  const labels: Record<string, LabelPlace> = {
    problem: place([ball[0] + 8, ball[1] + 76], "center", "below", {
      width: 210,
    }),
    skill: place([410, 162], "center", "middle", { width: 250, ground: "ink" }),
    brief: place([doc.x + 62, doc.y + header / 2], "start", "middle", {
      width: 300,
      ground: "ink",
    }),
    illustrative: place(
      [doc.x + doc.w - 24, doc.y + doc.h + 24],
      "end",
      "middle",
      {
        width: 460,
      },
    ),
    direction: place([doc.x - 70, rows[4] + rowHeight / 2], "end", "middle", {
      width: 150,
    }),
  };
  rows.forEach((_, i) => {
    labels[`section${i + 1}`] = place(
      [doc.x + 64, rows[i] + rowHeight / 2],
      "start",
      "middle",
      { width: 330 },
    );
  });
  const parts = [
    part(
      {
        name: "feedback",
        beat: 6,
        enter: "unfold-y",
        order: 1,
        origin: [30, 590],
        links: ["brief>problem"],
      },
      strip(
        `M${doc.x + 20} 610 L52 610 C38 610 30 602 30 586 L30 ${ball[1] + 10} C30 ${ball[1] - 6} 40 ${ball[1] - 14} 60 ${ball[1] - 14}`,
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
        name: "daily-brief",
        beat: 2,
        enter: "unfold-y",
        origin: [doc.x, doc.y],
        nodes: [
          "brief",
          "section1",
          "section2",
          "section3",
          "section4",
          "section5",
        ],
        marks: ["result:brief"],
        links: ["skill>brief"],
      },
      dailyBrief(doc, header, rows, rowHeight),
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
        name: "sheet",
        beat: 2,
        order: 1,
        enter: "slide-right",
        origin: [560, 160],
      },
      strip(sheet, 34, "var(--paper)", { edge: 2.5 }),
    ),
    part(
      {
        name: "direction",
        beat: 5,
        enter: "stamp",
        origin: [doc.x, rows[4] + rowHeight / 2],
        nodes: ["direction"],
        marks: ["human:direction"],
        links: ["direction>brief"],
      },
      clip([doc.x + 2, rows[4] + rowHeight / 2], "left") +
        seal([doc.x + doc.w - 78, rows[4] + rowHeight / 2], 17, -8),
    ),
  ];
  return { width: 1000, height: 650, parts: parts.join(""), labels };
}

function portrait(): Art {
  const ball: Pt = [120, 92];
  const doc = { x: 44, y: 360, w: 540, h: 412 };
  const header = 52;
  const rowHeight = 46;
  const rows = [0, 1, 2, 3, 4].map((i) => doc.y + header + 16 + i * 60);
  const sheet = `M440 214 L486 214 C534 214 560 240 560 290 L560 380`;
  const labels: Record<string, LabelPlace> = {
    problem: place([198, 92], "start", "middle", { width: 380 }),
    skill: place([236, 214], "center", "middle", { width: 330, ground: "ink" }),
    brief: place([doc.x + 64, doc.y + header / 2], "start", "middle", {
      width: 380,
      ground: "ink",
    }),
    illustrative: place(
      [doc.x + doc.w - 24, doc.y + doc.h - 22],
      "end",
      "middle",
      {
        width: 470,
      },
    ),
    direction: place([doc.x + 124, doc.y + doc.h + 44], "start", "middle", {
      width: 400,
    }),
  };
  rows.forEach((_, i) => {
    labels[`section${i + 1}`] = place(
      [doc.x + 66, rows[i] + rowHeight / 2],
      "start",
      "middle",
      { width: 376 },
    );
  });
  const parts = [
    part(
      {
        name: "feedback",
        beat: 6,
        enter: "unfold-y",
        order: 1,
        origin: [20, 800],
        links: ["brief>problem"],
      },
      strip(
        `M${doc.x + 20} 826 L34 826 C24 826 20 818 20 806 L20 ${ball[1] + 12} C20 ${ball[1] - 2} 28 ${ball[1] - 8} 40 ${ball[1] - 8} L72 ${ball[1] - 8}`,
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
        name: "daily-brief",
        beat: 2,
        enter: "unfold-y",
        origin: [doc.x, doc.y],
        nodes: [
          "brief",
          "section1",
          "section2",
          "section3",
          "section4",
          "section5",
        ],
        marks: ["result:brief"],
        links: ["skill>brief"],
      },
      dailyBrief(doc, header, rows, rowHeight),
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
        name: "sheet",
        beat: 2,
        order: 1,
        enter: "slide-right",
        origin: [440, 214],
      },
      strip(sheet, 32, "var(--paper)", { edge: 2.5 }),
    ),
    part(
      {
        name: "direction",
        beat: 5,
        enter: "stamp",
        origin: [doc.x + 70, doc.y + doc.h],
        nodes: ["direction"],
        marks: ["human:direction"],
        links: ["direction>brief"],
      },
      clip([doc.x + 70, doc.y + doc.h - 2], "bottom") +
        seal([doc.x + doc.w - 70, rows[4] + rowHeight / 2], 17, -8),
    ),
  ];
  return { width: 620, height: 860, parts: parts.join(""), labels };
}

export const executivesArt = (orientation: Orientation): Art =>
  orientation === "portrait" ? portrait() : landscape();
