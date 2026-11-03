import { part, place, type LabelPlace, type Pt } from "./kit";
import { arrow, paper } from "./work";
import {
  chain,
  drawn,
  stageRun,
  type Connector,
  type Plan,
  type Rect,
  type Staged,
  type Stage,
} from "./compose";

/**
 * C-level executives: four output documents, rather than people illustrating
 * their working day.
 *
 * The four cards are stated once — brief, meeting brief, debrief and actions
 * from transcripts — each with the sample it produces. The wide sheet sets
 * them two by two and the narrow one stacks them; only their positions, the
 * connectors between them and the decision's size come from geometry.
 */

const CARDS: readonly Stage[] = [
  {
    key: "brief",
    name: "brief",
    beat: 0,
    enter: "rise",
    nodes: ["brief"],
    marks: ["source:brief"],
  },
  {
    key: "meeting",
    name: "meeting",
    beat: 1,
    enter: "rise",
    nodes: ["meeting"],
    marks: ["result:meeting"],
  },
  {
    key: "debrief",
    name: "debrief",
    beat: 2,
    enter: "rise",
    nodes: ["debrief"],
    marks: ["result:debrief"],
  },
  {
    key: "actions",
    name: "actions",
    beat: 3,
    enter: "rise",
    nodes: ["actions"],
    marks: ["result:actions"],
  },
];

type TimelineGeometry = {
  xs: readonly number[];
  ys: readonly number[];
  w: number;
  connectors: readonly Connector[];
  decision: {
    at: Pt;
    box: Rect;
    arrow: { d: string; tip: Pt };
  };
};

/** Content blocks are fields in each output, never a decorative ruled texture. */
const field = (x: number, y: number, w: number, h = 8) =>
  `<rect class="f-muted" x="${x}" y="${y}" width="${w}" height="${h}" rx="2"/>`;

/** The recognizable output each card produces. */
function output(index: number, x: number, y: number, w: number): string {
  if (index === 0) {
    // Three priorities, each with a rank badge, summary and supporting detail.
    return [0, 1, 2]
      .map((row) => {
        const yy = y + row * 64;
        const rank = [
          "M20 12 L28 6 V34 M20 34 H36",
          "M16 12 Q28 0 36 12 Q39 18 16 34 H38",
          "M16 8 Q40 0 36 18 Q42 36 16 32 M25 19 H34",
        ][row];
        return (
          `<rect class="f-warm" x="${x}" y="${yy}" width="${w}" height="54" rx="4"/>` +
          `<g transform="translate(${x + 3} ${yy + 6})"><path class="s-ink" d="${rank}" fill="none" stroke-width="4" stroke-linecap="round"/></g>` +
          field(x + 58, yy + 13, w - 82, 10) +
          field(x + 58, yy + 33, w * 0.56, 6)
        );
      })
      .join("");
  }
  if (index === 1) {
    // An agenda has time boxes and discussion blocks, rather than a checklist.
    return [0, 1, 2]
      .map((row) => {
        const yy = y + row * 64;
        return (
          `<rect class="f-warm s-line" x="${x}" y="${yy}" width="56" height="48" rx="4" stroke-width="2"/>` +
          `<circle class="s-ink" cx="${x + 28}" cy="${yy + 24}" r="15" stroke-width="2.5"/><path class="s-ink" d="M${x + 28} ${yy + 12} V${yy + 24} L${x + 36 + row * 2} ${yy + 29}" stroke-width="2.5"/>` +
          `<rect class="f-warm" x="${x + 70}" y="${yy}" width="${w - 70}" height="48" rx="4"/>` +
          field(x + 84, yy + 12, w - 112, 10) +
          field(x + 84, yy + 31, w * 0.43, 6)
        );
      })
      .join("");
  }
  if (index === 2) {
    // A debrief table pairs the follow-up with its owner and due-date fields.
    const owner = x + w * 0.56;
    const date = x + w * 0.77;
    return (
      `<rect class="f-warm" x="${x}" y="${y}" width="${w}" height="180" rx="4"/>` +
      `<path class="s-line" d="M${owner - 12} ${y + 8} V${y + 172} M${date - 12} ${y + 8} V${y + 172}" stroke-width="2"/>` +
      [0, 1, 2]
        .map((row) => {
          const yy = y + 12 + row * 56;
          return (
            field(x + 12, yy + 8, w * 0.45, 9) +
            field(x + 12, yy + 27, w * 0.32, 6) +
            `<circle class="f-muted" cx="${owner + 15}" cy="${yy + 10}" r="8"/><path class="f-muted" d="M${owner + 2} ${yy + 30} Q${owner + 15} ${yy + 11} ${owner + 28} ${yy + 30} Z"/>` +
            `<rect class="f-paper s-ink" x="${date}" y="${yy + 2}" width="39" height="32" rx="3" stroke-width="2"/><path class="s-ink" d="M${date} ${yy + 12} H${date + 39} M${date + 10} ${yy - 2} V${yy + 6} M${date + 29} ${yy - 2} V${yy + 6}" stroke-width="2"/>` +
            field(date + 9, yy + 20, 21, 6)
          );
        })
        .join("")
    );
  }
  // Transcript notes on the left become discrete tasks on the right. The
  // checklist remains unapproved until the executive's separate decision.
  const notes = w * 0.32;
  const tasks = x + w * 0.47;
  return (
    `<rect class="f-paper" x="${x}" y="${y}" width="${notes}" height="134" rx="4"/>` +
    [0, 1, 2]
      .map((row) => {
        const yy = y + 12 + row * 40;
        return (
          field(x + 10, yy, notes - 20, 8) +
          field(x + 10, yy + 16, notes * 0.65, 6) +
          `<rect class="f-paper" x="${tasks}" y="${yy - 4}" width="${w * 0.53}" height="34" rx="4"/><rect class="s-ink" x="${tasks + 9}" y="${yy + 4}" width="17" height="17" rx="2" stroke-width="2"/>` +
          field(tasks + 36, yy + 8, w * 0.53 - 48, 8)
        );
      })
      .join("") +
    `<path class="s-paper" d="M${x + notes + 7} ${y + 65} H${tasks - 8} M${tasks - 17} ${y + 58} L${tasks - 8} ${y + 65} L${tasks - 17} ${y + 72}" stroke-width="3"/>`
  );
}

const landscape: TimelineGeometry = {
  xs: [30, 530, 30, 530],
  ys: [24, 24, 534, 534],
  w: 440,
  connectors: [
    { d: "M476 174 H524", tip: [524, 174], dir: "right" },
    { d: "M750 504 V522 H14 V684 H24", tip: [24, 684], dir: "right" },
    { d: "M476 684 H524", tip: [524, 684], dir: "right" },
  ],
  decision: {
    at: [750, 962],
    box: { x: 554, y: 924, w: 392, h: 76 },
    arrow: { d: "M960 962 H982 V850 H960", tip: [960, 850] },
  },
};

const portraitColumn = [24, 584, 1144, 1704];
const portrait: TimelineGeometry = {
  xs: [40, 40, 40, 40],
  ys: portraitColumn,
  w: 520,
  connectors: portraitColumn.slice(0, -1).map((y, i) => ({
    d: `M300 ${y + 486} V${portraitColumn[i + 1] - 8}`,
    tip: [300, portraitColumn[i + 1] - 8],
    dir: "down" as const,
  })),
  decision: {
    at: [300, 2132],
    box: { x: 64, y: 2094, w: 472, h: 76 },
    arrow: { d: "M550 2132 H572 V2020 H550", tip: [550, 2020] },
  },
};

const plan: Plan<TimelineGeometry> = {
  size: {
    landscape: { width: 1000, height: 1260 },
    portrait: { width: 600, height: 2450 },
  },
  geometry: { landscape, portrait },
  build: (g, size): Staged => {
    const links = chain(CARDS);
    const staged = stageRun(
      CARDS,
      (card, index) => {
        const x = g.xs[index],
          y = g.ys[index],
          last = card.key === "actions";
        return {
          origin: [x, y],
          label: place([x + g.w / 2, y + 78], "center", "middle", {
            width: g.w - 24,
            ground: last ? "ink" : "paper",
          }),
        };
      },
      (card, index) => {
        const x = g.xs[index],
          y = g.ys[index],
          last = card.key === "actions";
        return (
          paper(x, y, g.w, 470, last) + output(index, x + 24, y + 250, g.w - 48)
        );
      },
    );
    const samples: Record<string, LabelPlace> = {};
    CARDS.forEach((card, index) => {
      samples[`${card.key}-sample`] = place(
        [g.xs[index] + g.w / 2, g.ys[index] + 208],
        "center",
        "middle",
        { width: g.w - 24, ground: card.key === "actions" ? "ink" : "paper" },
      );
    });
    const connectors = g.connectors.map((connector, index) =>
      part(
        { name: "next", beat: index + 1, enter: "fade", links: [links[index]] },
        arrow(connector.d, connector.tip, connector.dir),
      ),
    );
    const { box } = g.decision;
    const body =
      `<rect class="f-red" x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" rx="5"/>` +
      arrow(g.decision.arrow.d, g.decision.arrow.tip, "left", true);
    const decision = part(
      {
        name: "decision",
        beat: 4,
        enter: "rise",
        nodes: ["direction"],
        marks: ["human:direction"],
        links: ["direction>actions"],
      },
      body,
    );
    return {
      parts: staged.parts.flatMap((piece, index) =>
        index < connectors.length
          ? [piece, connectors[index]]
          : [piece, decision],
      ),
      labels: {
        ...staged.labels,
        ...samples,
        direction: place(g.decision.at, "center", "middle", {
          width: g.w - 66,
          ground: "red",
        }),
        illustrative: place(
          [size.width / 2, size.height - 110],
          "center",
          "middle",
          {
            width: size.width - 60,
          },
        ),
      },
    };
  },
};

export const executivesArt = drawn(plan);
