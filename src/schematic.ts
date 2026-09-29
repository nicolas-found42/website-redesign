/**
 * The working-system drawings: what each one says.
 *
 * A composition is one way the business works — the same five node identities
 * each time, so switching between compositions rearranges the *same* work
 * rather than replacing one picture with another. This module holds only what
 * a composition says: its words, the kind of each node, and how the work moves
 * between them. How it is drawn lives in `art/`, which makes each composition a
 * made object — a plait, a folded loop, a concertina, a stamp — rather than
 * points joined by lines.
 *
 * Each composition is drawn twice. The landscape drawing is the wide,
 * editorial one; the portrait drawing is its own composition for narrow
 * screens, not the wide one scaled down. Neither depicts a product interface,
 * a customer system or a measured result.
 */
import { artFor } from "./art";
import { fieldHtml, type LabelContent } from "./art/field";
import type { Art, Orientation } from "./art/kit";

export type { Orientation } from "./art/kit";

export type NodeKind = "source" | "human" | "result";

export type SchematicNode = {
  /** Stable across compositions, so a node travels instead of being replaced. */
  readonly id: string;
  readonly label: string;
  readonly kind: NodeKind;
};

/**
 * How the work moves: `trunk` is the main line, `branch` joins or leaves it,
 * `return` is the feedback loop. A link to `out1` or `out2` is an unnamed
 * output — the same work reaching further than the named one.
 */
export type Link = {
  readonly from: string;
  readonly to: string;
  readonly weight: "trunk" | "branch" | "return";
};

export type Schematic = {
  readonly id: string;
  /** The control label a visitor selects. */
  readonly choice: string;
  /** The sentence shown with the drawing. */
  readonly detail: string;
  /** What the drawing shows, for anyone who cannot see it. */
  readonly description: string;
  readonly nodes: readonly SchematicNode[];
  readonly flow: Readonly<Record<Orientation, readonly Link[]>>;
};

const link = (
  from: string,
  to: string,
  weight: Link["weight"] = "branch",
): Link => ({ from, to, weight });

const cast = (
  n1: string,
  n2: string,
  n3: string,
  n4: string,
  human = "Human direction",
): readonly SchematicNode[] => [
  { id: "n1", label: n1, kind: "source" },
  { id: "n2", label: n2, kind: "source" },
  { id: "human", label: human, kind: "human" },
  { id: "n3", label: n3, kind: "source" },
  { id: "n4", label: n4, kind: "result" },
];

/**
 * Training: real work is designed together at a whiteboard, moves through live
 * guided practice and review, then returns as something the team can use — and
 * is applied back to the work.
 */
const trainingFlow: readonly Link[] = [
  link("n1", "human", "trunk"),
  link("n2", "human"),
  link("human", "n3", "trunk"),
  link("n3", "n4"),
  link("n4", "n1", "return"),
];

export const schematics: readonly Schematic[] = [
  {
    id: "training",
    choice: "Workshops",
    detail:
      "Real work on the whiteboard → hands-on practice → group review → a takeaway the team applies.",
    description:
      "Workshop illustration: people gather at a whiteboard with sticky notes and a diagram to design around the team's real work, move to hands-on keyboard practice, review the result together as a group, and leave with a reusable skill they apply afterwards.",
    nodes: cast(
      "Team's real work, designed at the whiteboard",
      "Live guided practice at the keyboard",
      "Reusable skill",
      "Apply afterwards",
      "Group review",
    ),
    flow: { landscape: trainingFlow, portrait: trainingFlow },
  },
  {
    id: "automation",
    choice: "Workflows",
    detail:
      "Operating problem → tailored design → testing and review → team deployment.",
    description:
      "Workflow illustration: a customer brief and operating problem move through tailored design and testing, human review in the customer's context, and a workflow the team deploys and uses.",
    nodes: cast(
      "Brief / operating problem",
      "Tailored design and build",
      "Test and review",
      "Review in customer context",
      "Team deploys and uses it",
    ),
    // The review in context feeds back: on the wide sheet into the design and
    // build, on the narrow one into the brief it started from.
    flow: {
      landscape: [
        link("n1", "human"),
        link("n2", "human", "trunk"),
        link("n3", "human"),
        link("human", "n4", "trunk"),
        link("n4", "n2", "return"),
      ],
      portrait: [
        link("n1", "human"),
        link("n2", "human"),
        link("n3", "human", "trunk"),
        link("human", "n4", "trunk"),
        link("n4", "n1", "return"),
      ],
    },
  },
  {
    id: "product",
    choice: "Automations",
    detail:
      "Repetitive process → system handoffs → human review → usable output.",
    description:
      "Automation illustration: a repetitive process crosses system handoffs, passes human review where judgment matters, and ends in a usable output the team can rely on.",
    nodes: cast(
      "Repetitive work",
      "System handoffs",
      "Human review",
      "Usable output",
    ),
    // Two unnamed outputs beside the named one: the same work reaching a
    // customer more than one way.
    flow: {
      landscape: [
        link("n1", "human"),
        link("n2", "human", "trunk"),
        link("n3", "human"),
        link("human", "n4", "trunk"),
        link("human", "out1"),
        link("human", "out2"),
      ],
      portrait: [
        link("n1", "human"),
        link("n2", "human"),
        link("n3", "human", "trunk"),
        link("human", "n4", "trunk"),
        link("human", "out1"),
        link("human", "out2"),
      ],
    },
  },
];

export const schematicById = (id: string): Schematic =>
  schematics.find((entry) => entry.id === id) ?? schematics[0];

/* ── The master drawing: the whole proposition, not one of its three routes ── */

/**
 * What the whole page is about, drawn once: the three things a business already
 * has, joined through human direction into work people actually do.
 */
export const masterSchematic: Schematic = {
  id: "master",
  choice: "Found42",
  detail: "People, workflows and products — connected, with people in charge.",
  description:
    "Found42 illustration: people, workflows and products connect through human direction into practical AI in everyday work.",
  nodes: [
    { id: "n1", label: "Your people", kind: "source" },
    { id: "n2", label: "Your workflows", kind: "source" },
    { id: "human", label: "Human direction", kind: "human" },
    { id: "n3", label: "What your business knows", kind: "source" },
    { id: "n4", label: "Practical AI at work", kind: "result" },
  ],
  flow: {
    landscape: [
      link("n1", "human"),
      link("n2", "human", "trunk"),
      link("n3", "human"),
      link("human", "n4", "trunk"),
      link("human", "out1"),
      link("human", "out2"),
    ],
    portrait: [
      link("n1", "human"),
      link("n2", "human"),
      link("n3", "human", "trunk"),
      link("human", "n4", "trunk"),
    ],
  },
};

/* ── Drawing ── */

/** One composition's artwork for one shape of field. */
export const schematicArt = (
  schematic: Schematic,
  orientation: Orientation,
): Art => artFor(schematic.id, orientation);

/** A composition's words, each told in the beat its piece arrives in. */
export const schematicLabels = (
  schematic: Schematic,
  art: Art,
): LabelContent[] =>
  schematic.nodes.map((node) => ({
    key: node.id,
    text: node.label,
    kind: node.kind,
    beat: art.labels[node.id]?.beat ?? 0,
  }));

/**
 * One complete still drawing. The live drawing starts from exactly this markup
 * and then takes over its layers, so a still composition is never a second
 * implementation of the same picture.
 */
export function fieldMarkup(
  schematic: Schematic,
  orientation: Orientation = "landscape",
): string {
  const art = schematicArt(schematic, orientation);
  return fieldHtml(art, schematicLabels(schematic, art), schematic.description);
}

/** A still drawing in its own container, for a band that only shows one. */
export const schematicFigure = (
  schematic: Schematic,
  orientation: Orientation,
  className = "system system--quiet",
): string =>
  `<div class="${className}">${fieldMarkup(schematic, orientation)}</div>`;

/**
 * A single plain strip, used where a whole composition would be too much: the
 * closing invitation carries one solid strip rather than an unrelated ornament.
 */
const accents = {
  invitation: {
    width: 600,
    height: 260,
    d: "M-20 64 L176 64 C236 64 236 196 296 196 L452 196 C520 196 520 22 620 22",
  },
} as const;

export type AccentVariant = keyof typeof accents;

export function accentSvg(variant: AccentVariant, className: string): string {
  const accent = accents[variant];
  return (
    `<svg class="${className}" xmlns="http://www.w3.org/2000/svg"` +
    ` viewBox="0 0 ${accent.width} ${accent.height}" fill="none"` +
    ' preserveAspectRatio="none" aria-hidden="true" focusable="false">' +
    `<path class="accent-strip" d="${accent.d}"/>` +
    "</svg>"
  );
}
