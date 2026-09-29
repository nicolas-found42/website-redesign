import {
  figure,
  part,
  place,
  r,
  seal,
  type Art,
  type LabelPlace,
  type Orientation,
  type Pt,
} from "./kit";

/**
 * AI builders: the stair.
 *
 * A learner with a work problem stands at the foot of a stair built from card.
 * Each step is one of the four things a builder learns to do — design, test,
 * troubleshoot, anticipate failures — and each carries a reviewer's red seal,
 * because a person reviews every step. At the top is the workflow in use: a
 * paper chain of three links, the parts joined and working.
 */

/** Depth of every top face: the stair is seen a little from above and the left. */
const DEPTH: Pt = [26, -22];

/** A block of card: its face and the top a step is stood on. */
function block(
  x: number,
  y: number,
  width: number,
  height: number,
  face: string,
  top = "var(--paper-sunk)",
) {
  const [dx, dy] = DEPTH;
  return (
    `<path class="s-ink" d="M${r(x)} ${r(y)} L${r(x + dx)} ${r(y + dy)} L${r(x + width + dx)} ${r(y + dy)} L${r(x + width + dx)} ${r(y + height + dy)} L${r(x + width)} ${r(y + height)} L${r(x)} ${r(y + height)} Z" stroke-width="6"/>` +
    `<path d="M${r(x)} ${r(y)} L${r(x + dx)} ${r(y + dy)} L${r(x + width + dx)} ${r(y + dy)} L${r(x + width)} ${r(y)} Z" fill="${top}"/>` +
    `<path class="f-ink" d="M${r(x + width)} ${r(y)} L${r(x + width + dx)} ${r(y + dy)} L${r(x + width + dx)} ${r(y + height + dy)} L${r(x + width)} ${r(y + height)} Z" opacity="0.32"/>` +
    `<rect x="${r(x)}" y="${r(y)}" width="${width}" height="${height}" fill="${face}"/>` +
    `<path class="s-ink" d="M${r(x)} ${r(y)} L${r(x + width)} ${r(y)} L${r(x + width + dx)} ${r(y + dy)}" fill="none" stroke-width="2.2"/>`
  );
}

/** A name plate glued to a block's face. */
const plate = (at: Pt, width: number, height: number) =>
  `<rect class="f-paper s-ink" x="${r(at[0] - width / 2)}" y="${r(at[1] - height / 2)}" width="${width}" height="${height}" rx="4" stroke-width="2.4"/>`;

/** The workflow in use: three linked paper loops. */
function chain(at: Pt, link: number): string {
  const [x, y] = at;
  const loop = (cx: number, front: boolean) =>
    `<rect class="s-ink" x="${r(cx - link / 2)}" y="${r(y - link * 0.3)}" width="${link}" height="${r(link * 0.6)}" rx="${r(link * 0.3)}" fill="none" stroke-width="15"/>` +
    `<rect class="${front ? "s-warm" : "s-sunk"}" x="${r(cx - link / 2)}" y="${r(y - link * 0.3)}" width="${link}" height="${r(link * 0.6)}" rx="${r(link * 0.3)}" fill="none" stroke-width="9"/>`;
  const step = link * 0.74;
  return loop(x - step, false) + loop(x + step, false) + loop(x, true);
}

type Step = { key: string; x: number; top: number; width: number };

function stair(
  field: { width: number; height: number },
  ground: number,
  steps: readonly Step[],
  learner: { at: Pt; label: LabelPlace },
  plates: { height: number; front?: boolean },
): Art {
  const face = "var(--paper-warm)";
  const labels: Record<string, LabelPlace> = { learner: learner.label };
  const parts: string[] = [
    part(
      { name: "ground", beat: 0, enter: "fade" },
      `<rect class="f-sunk" x="0" y="${ground}" width="${field.width}" height="10" rx="2"/>`,
    ),
    part(
      {
        name: "learner",
        beat: 0,
        enter: "rise",
        origin: learner.at,
        nodes: ["learner"],
        marks: ["person:learner"],
        links: ["learner>design"],
      },
      figure(learner.at, 1.5, "ink"),
    ),
  ];

  const blocks: string[] = [];
  steps.forEach((step, index) => {
    const height = ground - step.top;
    const last = index === steps.length - 1;
    // Stood one in front of another, a step shows only the band above the top
    // face of the step in front of it; side by side, it shows its whole face.
    const shown =
      plates.front && index > 0
        ? steps[index - 1].top + DEPTH[1] - step.top
        : height;
    const middle: Pt = [
      step.x + step.width / 2,
      step.top + Math.min(shown / 2, 70),
    ];
    labels[step.key] = place(middle, "center", "middle", {
      width: last ? step.width - 20 : step.width - 44,
      ground: last ? "ink" : "paper",
    });
    blocks.push(
      part(
        {
          name: "step",
          beat: index + 1,
          enter: "unfold-y",
          origin: [step.x, ground],
          nodes: [step.key],
          links: index > 0 ? [`${steps[index - 1].key}>${step.key}`] : [],
          marks: last ? ["result:workflow"] : [],
        },
        block(
          step.x,
          step.top,
          step.width,
          height,
          last ? "var(--ink)" : face,
        ) + (last ? "" : plate(middle, step.width - 28, plates.height)),
      ),
    );
  });

  // Stood one in front of another, the nearest step is laid last.
  parts.push(...(plates.front ? blocks.reverse() : blocks));

  // The seals go on after the blocks, so no later block covers an earlier seal.
  steps.slice(0, -1).forEach((step, index) => {
    parts.push(
      part(
        {
          name: "seal",
          beat: index + 1,
          order: 1,
          enter: "stamp",
          origin: [step.x + 42, step.top - 14],
          marks: [`check:${step.key}`],
        },
        seal([step.x + 42, step.top - 14], 22, -10 + index * 6),
      ),
    );
  });

  const top = steps[steps.length - 1];
  parts.push(
    part(
      {
        name: "chain",
        beat: steps.length + 1,
        enter: "drop",
        origin: [top.x + top.width / 2, top.top - 60],
        links: ["workflow>blocks"],
      },
      chain([top.x + top.width / 2 + 10, top.top - 58], 58),
    ),
  );

  return {
    width: field.width,
    height: field.height,
    parts: parts.join(""),
    labels,
  };
}

function landscape(): Art {
  const ground = 490;
  return stair(
    { width: 1000, height: 590 },
    ground,
    [
      { key: "design", x: 130, top: 400, width: 168 },
      { key: "test", x: 298, top: 330, width: 168 },
      { key: "troubleshoot", x: 466, top: 260, width: 168 },
      { key: "anticipate", x: 634, top: 190, width: 168 },
      { key: "workflow", x: 802, top: 190, width: 168 },
    ],
    {
      at: [68, ground - 34],
      label: place([30, ground + 24], "start", "below", { width: 420 }),
    },
    { height: 62 },
  );
}

function portrait(): Art {
  const ground = 690;
  return stair(
    { width: 620, height: 790 },
    ground,
    [
      { key: "design", x: 150, top: 590, width: 440 },
      { key: "test", x: 200, top: 480, width: 390 },
      { key: "troubleshoot", x: 250, top: 370, width: 340 },
      { key: "anticipate", x: 300, top: 260, width: 290 },
      { key: "workflow", x: 350, top: 150, width: 240 },
    ],
    {
      at: [96, ground - 34],
      label: place([30, ground + 24], "start", "below", { width: 560 }),
    },
    { height: 76, front: true },
  );
}

export const buildersArt = (orientation: Orientation): Art =>
  orientation === "portrait" ? portrait() : landscape();
