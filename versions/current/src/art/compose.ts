import {
  part,
  type Art,
  type Entrance,
  type LabelPlace,
  type Orientation,
  type Pt,
} from "./kit";

/**
 * How a drawing is composed.
 *
 * A drawing is written once: its story is an ordered run of stages — the
 * nodes it names, the parts it is drawn from, the beats they arrive on and
 * the connections they make — and its words. Only the numbers that genuinely
 * differ between a wide and a narrow sheet live in a geometry record per
 * orientation. `drawn` puts the two together, so a drawing can never say one
 * thing in one shape and something else in the other.
 */

/** The field a drawing is set in, in field units. */
export type Size = { readonly width: number; readonly height: number };

/** A rectangle in field units. */
export type Rect = {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
};

/** Where a word sits and how wide it may wrap; how it is set is its own. */
export type Anchor = { readonly at: Pt; readonly width?: number };

/** One drawn connector: its path, its arrow tip and the way it points. */
export type Connector = {
  readonly d: string;
  readonly tip: Pt;
  readonly dir: "right" | "left" | "up" | "down";
};

/**
 * One step in a drawing's story, stated once: the node key it stands for, the
 * part it is drawn as, when it arrives and what it connects. Coordinates
 * belong to the orientation's geometry, not to the story.
 */
export type Stage = {
  readonly key: string;
  readonly name: string;
  readonly beat: number;
  readonly enter: Entrance;
  readonly order?: number;
  readonly links?: readonly string[];
  readonly nodes?: readonly string[];
  readonly marks?: readonly string[];
};

/** How one orientation draws a stage: its word, its entrance point, and the
 * entrance itself where the layout changes the direction of arrival. */
export type StagePlace = {
  readonly label?: LabelPlace;
  readonly origin?: Pt;
  readonly enter?: Entrance;
};

/** The parts and words one orientation's layout produces. */
export type Staged = {
  readonly parts: readonly string[];
  readonly labels: Readonly<Record<string, LabelPlace>>;
};

/**
 * Lay a run of stages out for one orientation. The stages are the content,
 * stated once; `place` and `body` supply that orientation's geometry.
 */
export function stageRun<S extends Stage>(
  stages: readonly S[],
  place: (stage: S, index: number) => StagePlace,
  body: (stage: S, index: number) => string,
): Staged {
  const labels: Record<string, LabelPlace> = {};
  const parts = stages.map((stage, index) => {
    const at = place(stage, index);
    if (at.label) labels[stage.key] = at.label;
    return part(
      {
        name: stage.name,
        beat: stage.beat,
        enter: at.enter ?? stage.enter,
        order: stage.order,
        origin: at.origin,
        nodes: stage.nodes,
        links: stage.links,
        marks: stage.marks,
      },
      body(stage, index),
    );
  });
  return { parts, labels };
}

/** The connections an ordered run makes, one from each stage to the next. */
export const chain = (stages: readonly Stage[]): string[] =>
  stages.slice(1).map((stage, index) => `${stages[index].key}>${stage.key}`);

/**
 * A drawing described once. `build` states its content and reads its numbers
 * from the orientation's geometry record; the size record carries the field.
 */
export type Plan<G> = {
  readonly size: Readonly<Record<Orientation, Size>>;
  readonly geometry: Readonly<Record<Orientation, G>>;
  readonly build: (geometry: G, size: Size) => Staged;
};

/** Render a plan at one orientation: the same drawing, the same content. */
export function drawn<G>(plan: Plan<G>): (orientation: Orientation) => Art {
  return (orientation) => {
    const size = plan.size[orientation];
    const { parts, labels } = plan.build(plan.geometry[orientation], size);
    return {
      width: size.width,
      height: size.height,
      parts: parts.join(""),
      labels,
    };
  };
}
