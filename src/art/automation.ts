import {
  identityFill,
  part,
  place,
  mitre,
  r,
  run as runStrip,
  seal,
  type Art,
  type LabelPlace,
  type Orientation,
  type Pt,
} from "./kit";

/**
 * Workflows: the process track.
 *
 * Five numbered steps in reading order. The brief, the tailored design and
 * build, and the test and review gather down into the red deployment
 * checkpoint the team uses; deployment passes a review diamond — does the
 * work still fit? — and reaches the review in the customer's context. That
 * review's tail is a ribbon threaded back *into* the design-and-build step,
 * labelled as the iteration, because that is how the workflow keeps being
 * fitted to the work. Both compositions show the same order, the same
 * decision and the same return into the design step.
 */

const INK = "var(--ink)";
const PAPER = "var(--paper)";

/** A step card: a solid sheet with a charcoal outline and its soft shadow. */
const card = (x: number, y: number, width: number, height: number, fill: string) =>
  `<rect class="f-sunk" x="${r(x + 5)}" y="${r(y + 6)}" width="${width}" height="${height}" rx="6"/>` +
  `<rect class="s-ink" x="${r(x)}" y="${r(y)}" width="${width}" height="${height}" rx="6" fill="${fill}" stroke-width="3"/>`;

/** A step's number, set in its card's top-left corner. Decorative: the order
 *  is also carried by the layout and the caption, and the drawing is
 *  aria-hidden with the description telling the same story. */
const numeral = (at: Pt, value: string, fill: string, size = 23) =>
  `<text x="${r(at[0])}" y="${r(at[1])}" font-size="${size}" font-weight="700"` +
  ` fill="${fill}" text-anchor="middle" dominant-baseline="central"` +
  ` style="font-family:var(--font-display)">${value}</text>`;

/** The review diamond: a paper gate the flow passes through, pressed with
 *  the reviewer's seal. */
const reviewGate = (at: Pt, half: number) => {
  const [x, y] = at;
  const d =
    `M${r(x)} ${r(y - half)} L${r(x + half)} ${r(y)} ` +
    `L${r(x)} ${r(y + half)} L${r(x - half)} ${r(y)} Z`;
  return (
    `<path class="f-sunk" d="${d}" transform="translate(4 5)"/>` +
    `<path class="s-ink" d="${d}" fill="${PAPER}" stroke-width="3" stroke-linejoin="round"/>` +
    seal(at, Math.round(half * 0.52), -8)
  );
};

type Step = {
  key: string;
  box: [number, number, number, number];
  fill: string;
  ground: "paper" | "ink" | "red";
  labelAt: Pt;
  labelWidth: number;
  beat: number;
  numeralAt: Pt;
  numeralFill: string;
};

function track(
  field: { width: number; height: number },
  steps: readonly [Step, Step, Step, Step, Step],
  gather: string,
  deploy: string,
  gate: { at: Pt; half: number },
  refit: string,
  decision: LabelPlace,
  iteration: LabelPlace,
): Art {
  const labels: Record<string, LabelPlace> = {};
  for (const step of steps) {
    labels[step.key] = place(step.labelAt, "center", "middle", {
      width: step.labelWidth,
      ground: step.ground === "paper" ? undefined : step.ground,
      beat: step.beat,
    });
  }
  labels.decision = decision;
  labels.iteration = iteration;

  const stepParts = steps.map((step, index) => {
    const [x, y, w, h] = step.box;
    return part(
      {
        name: index < 3 ? "step" : index === 3 ? "checkpoint" : "result",
        beat: step.beat,
        order: index,
        enter: "unfold-y",
        origin: [x, y],
        nodes: [step.key],
      },
      card(x, y, w, h, step.fill) + numeral(step.numeralAt, String(index + 1), step.numeralFill),
    );
  });

  const parts = [
    part(
      {
        name: "refit",
        beat: 3,
        enter: "unfold-y",
        origin: gate.at,
        links: ["n4>n2"],
      },
      refit,
    ),
    part(
      {
        name: "gather",
        beat: 1,
        enter: "slide-down",
        origin: [steps[1].box[0], steps[1].box[1]],
        links: ["n1>human", "n2>human", "n3>human"],
      },
      gather,
    ),
    part(
      {
        name: "deploy",
        beat: 2,
        enter: "slide-right",
        origin: gate.at,
        links: ["human>n4"],
      },
      deploy,
    ),
    ...stepParts,
    part(
      {
        name: "review-point",
        beat: 2,
        order: 1,
        enter: "pop",
        origin: gate.at,
        marks: ["seal:n4"],
      },
      reviewGate(gate.at, gate.half),
    ),
  ];

  return { width: field.width, height: field.height, parts: parts.join(""), labels };
}

function landscape(): Art {
  const w = 24;
  const gather =
    runStrip([135, 184], [135, 300], INK, w, { from: 0, to: 0 }) +
    mitre([135, 300], [0, 1], [1, 0], INK, INK, w) +
    runStrip([135, 300], [280, 300], INK, w, { from: 0, to: 0 }) +
    mitre([280, 300], [1, 0], [0, 1], INK, INK, w) +
    runStrip([280, 300], [280, 362], INK, w, { from: 0, to: 0 }) +
    runStrip([400, 184], [400, 362], INK, w, { from: 0, to: 0 }) +
    runStrip([670, 184], [670, 300], INK, w, { from: 0, to: 0 }) +
    mitre([670, 300], [0, 1], [-1, 0], INK, INK, w) +
    runStrip([670, 300], [520, 300], INK, w, { from: 0, to: 0 }) +
    mitre([520, 300], [-1, 0], [0, 1], INK, INK, w) +
    runStrip([520, 300], [520, 362], INK, w, { from: 0, to: 0 });
  const deploy = runStrip([548, 410], [712, 410], INK, w, { from: 0, to: 0 });
  const refit =
    runStrip([820, 458], [820, 540], INK, 28, { from: 0, to: 0 }) +
    mitre([820, 540], [0, 1], [-1, 0], INK, INK, 28) +
    runStrip([820, 540], [60, 540], INK, 28, { from: 0, to: 0 }) +
    mitre([60, 540], [-1, 0], [0, -1], INK, INK, 28) +
    runStrip([60, 540], [60, 60], INK, 28, { from: 0, to: 0 }) +
    mitre([60, 60], [0, -1], [1, 0], INK, INK, 28) +
    runStrip([60, 60], [400, 60], INK, 28, { from: 0, to: 0 }) +
    mitre([400, 60], [1, 0], [0, 1], INK, INK, 28) +
    runStrip([400, 60], [400, 98], INK, 28, { from: 0, to: 0 });
  const steps: readonly [Step, Step, Step, Step, Step] = [
    { key: "n1", box: [40, 86, 190, 110], fill: identityFill.n1, ground: "paper", labelAt: [145, 146], labelWidth: 150, beat: 0, numeralAt: [58, 112], numeralFill: INK },
    { key: "n2", box: [270, 86, 260, 110], fill: identityFill.n2, ground: "ink", labelAt: [410, 141], labelWidth: 210, beat: 0, numeralAt: [290, 112], numeralFill: PAPER },
    { key: "n3", box: [570, 86, 200, 110], fill: identityFill.n3, ground: "paper", labelAt: [675, 146], labelWidth: 150, beat: 0, numeralAt: [592, 112], numeralFill: INK },
    { key: "human", box: [220, 350, 420, 120], fill: "var(--red)", ground: "red", labelAt: [430, 412], labelWidth: 360, beat: 1, numeralAt: [244, 380], numeralFill: PAPER },
    { key: "n4", box: [700, 350, 240, 120], fill: INK, ground: "ink", labelAt: [826, 412], labelWidth: 188, beat: 2, numeralAt: [724, 380], numeralFill: PAPER },
  ];
  return track(
    { width: 1000, height: 620 },
    steps,
    gather,
    deploy,
    { at: [670, 410], half: 30 },
    refit,
    place([670, 470], "center", "below", { width: 240, beat: 2 }),
    place([440, 558], "center", "below", { width: 440, beat: 3 }),
  );
}

function portrait(): Art {
  const w = 24;
  const gather =
    runStrip([468, 86], [570, 86], INK, w, { from: 0, to: 0 }) +
    mitre([570, 86], [1, 0], [0, 1], INK, INK, w) +
    runStrip([570, 86], [570, 460], INK, w, { from: 0, to: 0 }) +
    mitre([570, 460], [0, 1], [-1, 0], INK, INK, w) +
    runStrip([570, 460], [478, 460], INK, w, { from: 0, to: 0 }) +
    runStrip([468, 216], [546, 216], INK, w, { from: 0, to: 0 }) +
    mitre([546, 216], [1, 0], [0, 1], INK, INK, w) +
    runStrip([546, 216], [546, 486], INK, w, { from: 0, to: 0 }) +
    mitre([546, 486], [0, 1], [-1, 0], INK, INK, w) +
    runStrip([546, 486], [478, 486], INK, w, { from: 0, to: 0 }) +
    runStrip([468, 346], [522, 346], INK, w, { from: 0, to: 0 }) +
    mitre([522, 346], [1, 0], [0, 1], INK, INK, w) +
    runStrip([522, 346], [522, 512], INK, w, { from: 0, to: 0 }) +
    mitre([522, 512], [0, 1], [-1, 0], INK, INK, w) +
    runStrip([522, 512], [478, 512], INK, w, { from: 0, to: 0 });
  const deploy = runStrip([310, 524], [310, 618], INK, w, { from: 0, to: 0 });
  const refit =
    runStrip([172, 656], [64, 656], INK, 28, { from: 0, to: 0 }) +
    mitre([64, 656], [-1, 0], [0, -1], INK, INK, 28) +
    runStrip([64, 656], [64, 216], INK, 28, { from: 0, to: 0 }) +
    mitre([64, 216], [0, -1], [1, 0], INK, INK, 28) +
    runStrip([64, 216], [172, 216], INK, 28, { from: 0, to: 0 });
  const steps: readonly [Step, Step, Step, Step, Step] = [
    { key: "n1", box: [130, 36, 360, 100], fill: identityFill.n1, ground: "paper", labelAt: [318, 86], labelWidth: 300, beat: 0, numeralAt: [152, 62], numeralFill: INK },
    { key: "n2", box: [130, 166, 360, 100], fill: identityFill.n2, ground: "ink", labelAt: [318, 216], labelWidth: 300, beat: 1, numeralAt: [152, 192], numeralFill: PAPER },
    { key: "n3", box: [130, 296, 360, 100], fill: identityFill.n3, ground: "paper", labelAt: [318, 346], labelWidth: 300, beat: 1, numeralAt: [152, 322], numeralFill: INK },
    { key: "human", box: [130, 436, 360, 100], fill: "var(--red)", ground: "red", labelAt: [318, 486], labelWidth: 300, beat: 2, numeralAt: [152, 462], numeralFill: PAPER },
    { key: "n4", box: [130, 606, 360, 100], fill: INK, ground: "ink", labelAt: [318, 656], labelWidth: 300, beat: 2, numeralAt: [152, 632], numeralFill: PAPER },
  ];
  return track(
    { width: 620, height: 820 },
    steps,
    gather,
    deploy,
    { at: [310, 571], half: 30 },
    refit,
    place([352, 571], "start", "middle", { width: 190, beat: 2 }),
    place([310, 744], "center", "below", { width: 400, beat: 3 }),
  );
}

export const automationArt = (orientation: Orientation): Art =>
  orientation === "portrait" ? portrait() : landscape();
