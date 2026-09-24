/**
 * The working-system schematic: Found42's visual language.
 *
 * A composition is a transit-map drawing of one way the business works —
 * labelled nodes joined by routes that only ever run horizontally, vertically
 * or at 45°. The same five node identities appear in every composition, so
 * switching between them rearranges the *same* work rather than replacing one
 * picture with another.
 *
 * Each composition is drawn twice. The landscape layout is the wide, editorial
 * one; the portrait layout is a separate composition for narrow screens, not
 * the wide drawing scaled down. Neither depicts a product interface, a customer
 * system or a measured result.
 */

export type Point = readonly [number, number];

/**
 * Where a node's annotation sits, so a label never crosses a route.
 * `start` sits above and to the right of the node, `under` below and to the
 * right — which is what a node whose route leaves upwards needs.
 */
export type Anchor = "start" | "under" | "end" | "above" | "below";

export type NodeKind = "source" | "human" | "result";

export type LayoutNode = {
  readonly at: Point;
  readonly anchor: Anchor;
};

export type RouteWeight = "trunk" | "branch" | "return";

export type SchematicRoute = {
  readonly points: readonly Point[];
  readonly weight: RouteWeight;
};

export type Layout = {
  /** The drawing field; every coordinate in this layout is in these units. */
  readonly width: number;
  readonly height: number;
  /** Keyed by node id. */
  readonly nodes: Readonly<Record<string, LayoutNode>>;
  readonly routes: readonly SchematicRoute[];
};

export type SchematicNode = {
  /** Stable across compositions, so a node travels instead of being replaced. */
  readonly id: string;
  readonly label: string;
  readonly kind: NodeKind;
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
  readonly landscape: Layout;
  readonly portrait: Layout;
};

export type Orientation = "landscape" | "portrait";

/**
 * A run along one axis, a 45° diagonal, then a run along the same axis. `bias`
 * slides the diagonal along the run so a route composes with its neighbours.
 */
export function route45(a: Point, b: Point, bias = 0.5): Point[] {
  const [ax, ay] = a;
  const [bx, by] = b;
  const dx = bx - ax;
  const dy = by - ay;
  if (dx === 0 || dy === 0) return [a, b];
  const sx = Math.sign(dx);
  const sy = Math.sign(dy);
  const adx = Math.abs(dx);
  const ady = Math.abs(dy);
  if (adx === ady) return [a, b];
  if (adx > ady) {
    const run = (adx - ady) * bias;
    return [a, [ax + sx * run, ay], [ax + sx * (run + ady), by], b];
  }
  const run = (ady - adx) * bias;
  return [a, [ax, ay + sy * run], [bx, ay + sy * (run + adx)], b];
}

const round = (value: number) => Math.round(value * 100) / 100;

function toward([fx, fy]: Point, [tx, ty]: Point, distance: number): Point {
  const dx = tx - fx;
  const dy = ty - fy;
  const length = Math.hypot(dx, dy) || 1;
  const step = Math.min(distance, length / 2);
  return [fx + (dx / length) * step, fy + (dy / length) * step];
}

/** One polyline with its corners rounded, as SVG path data. */
export function roundedPolyline(
  points: readonly Point[],
  radius: number,
): string {
  if (points.length < 2) return "";
  let data = `M${round(points[0][0])} ${round(points[0][1])}`;
  for (let index = 1; index < points.length - 1; index += 1) {
    const corner = points[index];
    const entry = toward(corner, points[index - 1], radius);
    const exit = toward(corner, points[index + 1], radius);
    data += ` L${round(entry[0])} ${round(entry[1])} Q${round(corner[0])} ${round(corner[1])} ${round(exit[0])} ${round(exit[1])}`;
  }
  const last = points[points.length - 1];
  return `${data} L${round(last[0])} ${round(last[1])}`;
}

/** The corner radius of every route, so the whole drawing reads as one hand. */
export const cornerRadius = 24;

export const routePath = (route: SchematicRoute): string =>
  roundedPolyline(route.points, cornerRadius);

const trunk = (points: readonly Point[]): SchematicRoute => ({
  points,
  weight: "trunk",
});
const branch = (points: readonly Point[]): SchematicRoute => ({
  points,
  weight: "branch",
});
const back = (points: readonly Point[]): SchematicRoute => ({
  points,
  weight: "return",
});

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
 * Training: real work moves through live guided practice and review, then
 * returns as something the team can use.
 */
const trainingLandscape: Layout = {
  width: 1000,
  height: 620,
  nodes: {
    n1: { at: [168, 128], anchor: "start" },
    n2: { at: [452, 268], anchor: "above" },
    human: { at: [560, 470], anchor: "below" },
    n3: { at: [836, 268], anchor: "above" },
    n4: { at: [836, 128], anchor: "end" },
  },
  routes: [
    trunk(route45([168, 128], [560, 470], 0.5)),
    branch(route45([452, 268], [560, 470], 0.3)),
    trunk(route45([560, 470], [836, 268], 0.45)),
    branch([
      [836, 268],
      [836, 128],
    ]),
    back([
      [836, 128],
      [930, 128],
      [930, 574],
      [88, 574],
      [88, 128],
      [168, 128],
    ]),
  ],
};

const trainingPortrait: Layout = {
  width: 620,
  height: 776,
  nodes: {
    n1: { at: [180, 112], anchor: "start" },
    n2: { at: [180, 268], anchor: "start" },
    human: { at: [456, 400], anchor: "below" },
    n3: { at: [180, 560], anchor: "start" },
    n4: { at: [180, 700], anchor: "start" },
  },
  routes: [
    trunk(route45([180, 112], [456, 400], 0.5)),
    branch(route45([180, 268], [456, 400], 0.35)),
    trunk(route45([456, 400], [180, 560], 0.5)),
    branch([
      [180, 560],
      [180, 700],
    ]),
    back([
      [180, 700],
      [76, 700],
      [76, 112],
      [180, 112],
    ]),
  ],
};

/**
 * Workflow: the customer's operating problem passes through tailored design,
 * review and build into a workflow the team deploys.
 */
const automationLandscape: Layout = {
  width: 1000,
  height: 620,
  nodes: {
    n1: { at: [168, 120], anchor: "start" },
    n2: { at: [168, 310], anchor: "start" },
    human: { at: [612, 310], anchor: "below" },
    n3: { at: [168, 500], anchor: "under" },
    n4: { at: [880, 310], anchor: "end" },
  },
  routes: [
    branch(route45([168, 120], [420, 310], 0.55)),
    trunk([
      [168, 310],
      [612, 310],
    ]),
    branch(route45([168, 500], [420, 310], 0.55)),
    trunk([
      [612, 310],
      [880, 310],
    ]),
    back([
      [880, 310],
      [944, 310],
      [944, 574],
      [88, 574],
      [88, 310],
      [168, 310],
    ]),
  ],
};

const automationPortrait: Layout = {
  width: 620,
  height: 760,
  nodes: {
    n1: { at: [164, 110], anchor: "start" },
    n2: { at: [164, 264], anchor: "start" },
    human: { at: [456, 418], anchor: "below" },
    n3: { at: [164, 418], anchor: "start" },
    n4: { at: [456, 646], anchor: "below" },
  },
  routes: [
    branch(route45([164, 110], [456, 418], 0.55)),
    branch(route45([164, 264], [456, 418], 0.55)),
    trunk([
      [164, 418],
      [456, 418],
    ]),
    trunk([
      [456, 418],
      [456, 646],
    ]),
    back([
      [456, 646],
      [564, 646],
      [564, 62],
      [164, 62],
      [164, 110],
    ]),
  ],
};

/**
 * Automation: a repetitive process crosses system handoffs, with human review
 * where judgment matters, and ends in an output the team can use.
 */
const productLandscape: Layout = {
  width: 1000,
  height: 620,
  nodes: {
    n1: { at: [168, 128], anchor: "start" },
    n2: { at: [168, 310], anchor: "start" },
    human: { at: [512, 310], anchor: "below" },
    n3: { at: [168, 492], anchor: "under" },
    n4: { at: [880, 310], anchor: "end" },
  },
  routes: [
    branch(route45([168, 128], [512, 310], 0.5)),
    trunk([
      [168, 310],
      [512, 310],
    ]),
    branch(route45([168, 492], [512, 310], 0.5)),
    trunk([
      [512, 310],
      [880, 310],
    ]),
    branch(route45([512, 310], [880, 136], 0.62)),
    branch(route45([512, 310], [880, 484], 0.62)),
  ],
};

const productPortrait: Layout = {
  width: 620,
  height: 760,
  nodes: {
    n1: { at: [164, 110], anchor: "start" },
    n2: { at: [164, 264], anchor: "start" },
    human: { at: [432, 418], anchor: "below" },
    n3: { at: [164, 418], anchor: "start" },
    n4: { at: [432, 656], anchor: "below" },
  },
  routes: [
    branch(route45([164, 110], [432, 418], 0.55)),
    branch(route45([164, 264], [432, 418], 0.55)),
    trunk([
      [164, 418],
      [432, 418],
    ]),
    trunk([
      [432, 418],
      [432, 656],
    ]),
    // Two unlabelled surfaces beside the named one: the same work reaching a
    // customer more than one way.
    branch(route45([432, 418], [196, 656], 0.5)),
    branch(route45([432, 418], [576, 656], 0.5)),
  ],
};

export const schematics: readonly Schematic[] = [
  {
    id: "training",
    choice: "Workshops",
    detail: "Real work → live practice → review → a takeaway the team applies.",
    description:
      "Workshop illustration: a team brings real work into live guided practice, reviews the result together, and leaves with a reusable skill and an applicable takeaway.",
    nodes: cast(
      "Team's real work",
      "Live guided practice",
      "Reusable skill",
      "Apply afterwards",
      "Group review",
    ),
    landscape: trainingLandscape,
    portrait: trainingPortrait,
  },
  {
    id: "automation",
    choice: "Workflows",
    detail: "Operating problem → tailored design → testing and review → team deployment.",
    description:
      "Workflow illustration: a customer brief and operating problem move through tailored design and testing, human review in the customer's context, and a workflow the team deploys and uses.",
    nodes: cast(
      "Brief / operating problem",
      "Tailored design and build",
      "Test and review",
      "Review in customer context",
      "Team deploys and uses it",
    ),
    landscape: automationLandscape,
    portrait: automationPortrait,
  },
  {
    id: "product",
    choice: "Automations",
    detail: "Repetitive process → system handoffs → human review → usable output.",
    description:
      "Automation illustration: a repetitive process crosses system handoffs, passes human review where judgment matters, and ends in a usable output the team can rely on.",
    nodes: cast(
      "Repetitive work",
      "System handoffs",
      "Human review",
      "Usable output",
    ),
    landscape: productLandscape,
    portrait: productPortrait,
  },
];

export const schematicById = (id: string): Schematic =>
  schematics.find((entry) => entry.id === id) ?? schematics[0];

/** The route layer of one layout, as markup. */
export const routeMarkup = (layout: Layout): string =>
  layout.routes
    .map(
      (route, index) =>
        `<path class="route route--${route.weight}" data-route="${index}" d="${routePath(route)}"/>`,
    )
    .join("");

/** The node markers of one layout, as markup. */
export const markerMarkup = (
  schematic: Schematic,
  layout: Layout,
  scale = 1,
): string =>
  schematic.nodes
    .map((node) => {
      const { at } = layout.nodes[node.id];
      const body =
        node.kind === "human"
          ? `<circle class="marker-halo" r="${28 * scale}"/><circle class="marker-ring" r="${15 * scale}"/><circle class="marker-core" r="${6 * scale}"/>`
          : `<circle class="marker-ring" r="${11 * scale}"/><circle class="marker-core" r="${4 * scale}"/>`;
      // The outer group is placed by attribute and the inner one carries any
      // animated transform, so a tween can never displace a node.
      return `<g class="marker marker--${node.kind}" data-node="${node.id}" transform="translate(${at[0]} ${at[1]})"><g class="marker-body">${body}</g></g>`;
    })
    .join("");

/** The annotation layer of one layout, as markup. */
export const labelMarkup = (schematic: Schematic, layout: Layout): string =>
  schematic.nodes
    .map((node) => {
      const place = layout.nodes[node.id];
      // Unitless: the stylesheet multiplies by 1%. Percentages written into
      // the markup would otherwise read as figures in the page's own text.
      const x = ((place.at[0] / layout.width) * 100).toFixed(3);
      const y = ((place.at[1] / layout.height) * 100).toFixed(3);
      return (
        `<span class="system-label system-label--${place.anchor} system-label--${node.kind}"` +
        ` data-node="${node.id}" style="--x:${x};--y:${y}">` +
        `<i class="system-label-text">${node.label}</i></span>`
      );
    })
    .join("");

/**
 * One complete still drawing: routes, markers and annotations in the field they
 * share. The live drawing starts from exactly this markup and then takes over
 * the layers, so a still composition is never a second implementation of the
 * same picture.
 */
export function fieldMarkup(
  schematic: Schematic,
  orientation: Orientation = "landscape",
): string {
  const layout = schematic[orientation];
  return (
    `<div class="system-field" style="--ratio:${layout.width} / ${layout.height}"` +
    ` role="img" aria-label="${schematic.description}">` +
    `<svg class="system-svg" viewBox="0 0 ${layout.width} ${layout.height}" fill="none"` +
    ' aria-hidden="true" focusable="false">' +
    `<g class="routes">${routeMarkup(layout)}</g>` +
    '<g class="signals"></g>' +
    `<g class="markers">${markerMarkup(schematic, layout)}</g>` +
    "</svg>" +
    `<div class="system-labels" aria-hidden="true">${labelMarkup(schematic, layout)}</div>` +
    "</div>"
  );
}

/** A still drawing in its own container, for a band that only shows one. */
export const schematicFigure = (
  schematic: Schematic,
  orientation: Orientation,
  className = "system system--quiet",
): string =>
  `<div class="${className}">${fieldMarkup(schematic, orientation)}</div>`;

/* ── The master drawing: the whole proposition, not one of its three routes ── */

const masterLandscape: Layout = {
  width: 1000,
  height: 620,
  nodes: {
    n1: { at: [176, 118], anchor: "start" },
    n2: { at: [176, 306], anchor: "start" },
    human: { at: [556, 306], anchor: "below" },
    n3: { at: [176, 494], anchor: "under" },
    n4: { at: [884, 306], anchor: "end" },
  },
  routes: [
    branch(route45([176, 118], [400, 306], 0.55)),
    trunk([
      [176, 306],
      [556, 306],
    ]),
    branch(route45([176, 494], [400, 306], 0.55)),
    trunk([
      [556, 306],
      [884, 306],
    ]),
    branch(route45([556, 306], [884, 140], 0.6)),
    branch(route45([556, 306], [884, 472], 0.6)),
  ],
};

const masterPortrait: Layout = {
  width: 620,
  height: 700,
  nodes: {
    n1: { at: [168, 96], anchor: "start" },
    n2: { at: [168, 250], anchor: "start" },
    human: { at: [456, 404], anchor: "below" },
    n3: { at: [168, 404], anchor: "start" },
    n4: { at: [456, 608], anchor: "below" },
  },
  routes: [
    branch(route45([168, 96], [456, 404], 0.55)),
    branch(route45([168, 250], [456, 404], 0.55)),
    trunk([
      [168, 404],
      [456, 404],
    ]),
    trunk([
      [456, 404],
      [456, 608],
    ]),
  ],
};

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
  landscape: masterLandscape,
  portrait: masterPortrait,
};

/**
 * A single route, used where a whole composition would be too much: the
 * editorial card and the closing invitation carry one line of the same drawing
 * rather than an unrelated ornament.
 */
const accents = {
  reading: {
    width: 600,
    height: 300,
    points: [
      [-20, 232],
      [176, 232],
      [316, 92],
      [470, 92],
      [620, 242],
    ] as Point[],
  },
  invitation: {
    width: 600,
    height: 260,
    points: [
      [-20, 60],
      [150, 60],
      [268, 178],
      [452, 178],
      [620, 10],
    ] as Point[],
  },
} as const;

export type AccentVariant = keyof typeof accents;

export function accentSvg(variant: AccentVariant, className: string): string {
  const accent = accents[variant];
  return (
    `<svg class="${className}" xmlns="http://www.w3.org/2000/svg"` +
    ` viewBox="0 0 ${accent.width} ${accent.height}" fill="none"` +
    ' preserveAspectRatio="none" aria-hidden="true" focusable="false">' +
    `<path class="accent-route" d="${roundedPolyline(accent.points, cornerRadius)}"/>` +
    "</svg>"
  );
}
