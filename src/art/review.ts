import { part, place, r, seal, strip, tag, type Art } from "./kit";

/**
 * The failure-mode review: the gates.
 *
 * A draft result is fed down through three gates. Each is a slotted bar that
 * catches one failure — weak outputs, missing context, false confidence — and
 * carries a reviewer's seal. Below them a red band is human review; only then
 * does the work leave with its tag, reaching the business. A checklist reads
 * down the page at every width, so this drawing has one composition.
 */

const X = 128;

function gate(y: number): string {
  return (
    `<rect class="f-sunk" x="${X - 78 + 5}" y="${y - 13 + 6}" width="156" height="26" rx="4"/>` +
    `<rect class="f-ink" x="${X - 78}" y="${y - 13}" width="156" height="26" rx="4"/>` +
    `<rect class="f-paper" x="${X - 30}" y="${y - 5}" width="60" height="10" rx="2"/>`
  );
}

function draft(): string {
  const lines = [0, 1, 2, 3]
    .map(
      (k) =>
        `<path class="s-ink" d="M${X - 46} ${r(60 + k * 16)} q 12 -5 24 0 t 24 0 t ${k === 3 ? 12 : 24} 0" fill="none" stroke-width="3" stroke-linecap="round"/>`,
    )
    .join("");
  return (
    `<rect class="f-sunk" x="${X - 64 + 6}" y="${28 + 7}" width="128" height="116" rx="3"/>` +
    `<rect class="f-warm s-ink" x="${X - 64}" y="28" width="128" height="116" rx="3" stroke-width="2.6"/>` +
    lines
  );
}

function composition(): Art {
  const gates = [210, 290, 370];
  const keys = ["weak", "missing", "false"];
  const parts = [
    part(
      {
        name: "feed",
        beat: 1,
        enter: "unfold-y",
        origin: [X, 140],
        links: ["draft>weak", "weak>missing", "missing>false", "false>review"],
      },
      strip(`M${X} 136 L${X} 506`, 30, "var(--paper-warm)", { edge: 2.5 }),
    ),
    part(
      {
        name: "draft",
        beat: 0,
        enter: "drop",
        origin: [X, 86],
        nodes: ["draft"],
        marks: ["source:draft"],
      },
      draft(),
    ),
    ...gates.map((y, index) =>
      part(
        {
          name: "gate",
          beat: 1,
          order: index,
          enter: "unfold-x",
          origin: [X, y],
          nodes: [keys[index]],
          marks: [`check:${keys[index]}`],
        },
        gate(y) + seal([X - 96, y], 20, -8 + index * 6),
      ),
    ),
    part(
      {
        name: "review",
        beat: 2,
        enter: "wrap",
        origin: [X, 430],
        nodes: ["review"],
        marks: ["human:review"],
      },
      `<rect class="f-red" x="${X - 44}" y="${430 - 20}" width="88" height="40" rx="6"/>` +
        `<rect class="f-red-deep" x="${X - 44}" y="${430 + 8}" width="88" height="12" rx="4"/>` +
        `<path class="s-red" d="M${X + 44} 430 L${X + 72} 430" stroke-width="4"/>` +
        `<rect class="f-red" x="${X + 72}" y="${430 - 28}" width="258" height="56" rx="6"/>`,
    ),
    part(
      {
        name: "business",
        beat: 3,
        enter: "swing",
        origin: [X, 470],
        nodes: ["business"],
        marks: ["result:business"],
        links: ["review>business"],
      },
      tag([X, 520], 320, 66, { tone: "ink", turn: 0 }),
    ),
  ];
  return {
    width: 620,
    height: 590,
    defs: "",
    parts: parts.join(""),
    labels: {
      draft: place([X + 90, 86], "start", "middle", { width: 380 }),
      weak: place([X + 104, gates[0]], "start", "middle", { width: 360 }),
      missing: place([X + 104, gates[1]], "start", "middle", { width: 360 }),
      false: place([X + 104, gates[2]], "start", "middle", { width: 360 }),
      review: place([X + 72 + 129, 431], "center", "middle", {
        width: 236,
        ground: "red",
      }),
      business: place([X + 22 + 149, 521], "center", "middle", {
        width: 280,
        ground: "ink",
      }),
    },
  };
}

export const reviewArt = (): Art => composition();
