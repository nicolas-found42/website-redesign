import {
  identityPrint,
  mitre,
  paint,
  part,
  place,
  prints,
  r,
  run as runStrip,
  strip,
  swallowtail as cutEnd,
  type Art,
  type Dir,
  type Orientation,
  type Pt,
} from "./kit";

/**
 * Workshops: the loop.
 *
 * One strip, folded at its corners into a loop, because a workshop is a loop:
 * the team's real work goes round through group review — the red side of the
 * loop, where live guided practice is tucked in — comes back as a reusable
 * skill, is applied afterwards, and is tucked back under the real work it
 * started from. The strip starts with a cut end, so it is clear where the
 * loop begins and which way it runs.
 */

const W = 56;

/** A fold, a run and a cut end of this loop's strip. */
const fold = (
  at: Pt,
  into: Dir,
  out: Dir,
  incoming: string,
  outgoing: string,
) => mitre(at, into, out, incoming, outgoing, W);
const run = (
  a: Pt,
  b: Pt,
  fill: string,
  ends: { from?: number; to?: number } = {},
) => runStrip(a, b, fill, W, ends);
const swallowtail = (at: Pt, fill: string, width = W) =>
  cutEnd(at, fill, width);

/** The red side's name plate: the loop's buckle. */
const plate = (at: Pt, width: number, height: number) => {
  const [x, y] = at;
  const x0 = x - width / 2;
  const y0 = y - height / 2;
  return (
    `<rect class="f-red-deep" x="${r(x0 + 5)}" y="${r(y0 + 6)}" width="${width}" height="${height}" rx="7" opacity="0.28"/>` +
    `<rect class="f-red" x="${r(x0)}" y="${r(y0)}" width="${width}" height="${height}" rx="7"/>` +
    `<rect class="s-paper" x="${r(x0 + 7)}" y="${r(y0 + 7)}" width="${width - 14}" height="${height - 14}" rx="4" fill="none" stroke-width="1.6" stroke-dasharray="1 6" stroke-linecap="round"/>`
  );
};

function loop(
  uid: string,
  box: { left: number; right: number; top: number; bottom: number },
  practice: { from: number; y: number },
  platesAt: { human: Pt; width: number; height: number },
  field: { width: number; height: number },
  labels: Art["labels"],
): Art {
  const { left, right, top, bottom } = box;
  const real = paint(uid, identityPrint.n1);
  const guided = paint(uid, identityPrint.n2);
  const skill = paint(uid, identityPrint.n3);
  const red = "var(--red)";
  const applied = "var(--ink)";
  const tl: Pt = [left, top];
  const tr: Pt = [right, top];
  const br: Pt = [right, bottom];
  const bl: Pt = [left, bottom];

  const parts = [
    // Applied afterwards, travelling back up to the work it came from, and
    // tucked under the start of the strip.
    part(
      {
        name: "applied",
        beat: 3,
        enter: "unfold-y",
        origin: bl,
        nodes: ["n4"],
        links: ["n3>n4", "n4>n1"],
      },
      run(bl, tl, applied, { to: 0 }) +
        fold(bl, [-1, 0], [0, -1], skill, applied),
    ),
    part(
      {
        name: "skill",
        beat: 2,
        enter: "unfold-x",
        origin: br,
        nodes: ["n3"],
        links: ["human>n3"],
      },
      run(br, bl, skill) + fold(br, [0, 1], [-1, 0], red, skill),
    ),
    part(
      {
        name: "practice",
        beat: 1,
        enter: "slide-right",
        origin: [practice.from, practice.y],
        nodes: ["n2"],
        links: ["n2>human"],
      },
      strip(
        `M${r(practice.from + 60)} ${practice.y} L${right} ${practice.y}`,
        W - 14,
        guided,
      ) + swallowtail([practice.from, practice.y], guided, W - 14),
    ),
    part(
      {
        name: "review",
        beat: 1,
        enter: "unfold-y",
        order: 1,
        origin: tr,
        nodes: ["human"],
        links: ["n1>human"],
      },
      run(tr, br, red) + fold(tr, [1, 0], [0, 1], real, red),
    ),
    part(
      {
        name: "plate",
        beat: 1,
        enter: "swing",
        order: 2,
        origin: [platesAt.human[0], platesAt.human[1] - platesAt.height / 2],
      },
      plate(platesAt.human, platesAt.width, platesAt.height),
    ),
    part(
      {
        name: "work",
        beat: 0,
        enter: "slide-right",
        origin: [left - W / 2 - 70, top],
        nodes: ["n1"],
      },
      run([left - W / 2 - 6, top], tr, real, { from: 0 }) +
        swallowtail([left - W / 2 - 70, top], real),
    ),
  ];

  return {
    width: field.width,
    height: field.height,
    defs: prints(uid),
    parts: parts.join(""),
    labels,
  };
}

function landscape(uid: string): Art {
  const box = { left: 150, right: 760, top: 150, bottom: 452 };
  return loop(
    uid,
    box,
    { from: 214, y: 301 },
    { human: [760, 301], width: 256, height: 70 },
    { width: 1000, height: 620 },
    {
      n1: place(
        [box.left - W / 2 - 70, box.top - W / 2 - 16],
        "start",
        "above",
        { width: 420, beat: 0 },
      ),
      n2: place([214, 301 - W / 2 - 10], "start", "above", {
        width: 330,
        beat: 1,
      }),
      human: place([760, 303], "center", "middle", {
        width: 224,
        ground: "red",
        beat: 1,
      }),
      n3: place([455, box.bottom + W / 2 + 16], "center", "below", {
        width: 420,
        beat: 2,
      }),
      n4: place(
        [box.left + W / 2 + 18, box.bottom - W / 2 - 16],
        "start",
        "above",
        { width: 300, beat: 3 },
      ),
    },
  );
}

function portrait(uid: string): Art {
  const box = { left: 104, right: 452, top: 170, bottom: 690 };
  return loop(
    uid,
    box,
    { from: 150, y: 430 },
    { human: [452, 430], width: 250, height: 76 },
    { width: 620, height: 860 },
    {
      n1: place(
        [box.left - W / 2 - 70 + 4, box.top - W / 2 - 16],
        "start",
        "above",
        { width: 520, beat: 0 },
      ),
      n2: place([150, 430 - W / 2 - 10], "start", "above", {
        width: 250,
        beat: 1,
      }),
      human: place([452, 432], "center", "middle", {
        width: 220,
        ground: "red",
        beat: 1,
      }),
      n3: place([278, box.bottom + W / 2 + 16], "center", "below", {
        width: 520,
        beat: 2,
      }),
      n4: place(
        [box.left + W / 2 + 18, box.bottom - W / 2 - 16],
        "start",
        "above",
        { width: 260, beat: 3 },
      ),
    },
  );
}

export const trainingArt = (orientation: Orientation, uid: string): Art =>
  orientation === "portrait" ? portrait(uid) : landscape(uid);
