import {
  figure,
  paint,
  part,
  place,
  prints,
  r,
  strip,
  type Art,
  type LabelPlace,
  type Orientation,
  type Print,
} from "./kit";

/**
 * Individual contributors: the loop.
 *
 * Four people in one company, each with a ribbon of their own role. Each
 * ribbon runs through a skill cut for that role — its buckle — and all four
 * are gathered through one red ring: the human in the loop, which is what a
 * loop is. The ribbons stay four ribbons the whole way; the method is shared,
 * the skill is not.
 */

const ROLE_PRINTS: readonly Print[] = ["dots", "stripes", "rules", "checks"];

/** A role's tab: the ribbon's printed end, with the person it belongs to. */
function tab(x: number, y: number, width: number, height: number): string {
  const h = height / 2;
  return (
    `<rect class="f-sunk" x="${r(x + 5)}" y="${r(y - h + 6)}" width="${width}" height="${height}" rx="4"/>` +
    `<path class="f-ink" d="M${r(x)} ${r(y - h)} L${r(x + width)} ${r(y - h)} L${r(x + width)} ${r(y + h)} L${r(x)} ${r(y + h)} L${r(x + 14)} ${r(y)} Z"/>` +
    figure([x + 40, y + 4], 0.72, "paper")
  );
}

/** A skill: the buckle a role's ribbon is threaded through. */
function buckle(
  x: number,
  y: number,
  width: number,
  height: number,
  ribbon: number,
): string {
  const h = height / 2;
  const slot = (sx: number) =>
    `<rect class="f-ink" x="${r(sx - 5)}" y="${r(y - ribbon / 2 - 4)}" width="10" height="${ribbon + 8}" rx="2"/>`;
  return (
    `<rect class="f-sunk" x="${r(x + 6)}" y="${r(y - h + 7)}" width="${width}" height="${height}" rx="10"/>` +
    `<rect class="f-paper s-ink" x="${r(x)}" y="${r(y - h)}" width="${width}" height="${height}" rx="10" stroke-width="3"/>` +
    slot(x + 16) +
    slot(x + width - 16)
  );
}

/** Half of the red ring: the back half is drawn before the ribbons, the front after. */
function ringHalf(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  half: "back" | "front",
  axis: "x" | "y",
): string {
  const tone = half === "back" ? "s-red-deep" : "s-red";
  // For ribbons running along x the ring stands upright; along y it lies flat.
  const d =
    axis === "x"
      ? half === "front"
        ? `M${r(cx)} ${r(cy - ry)} A${rx} ${ry} 0 0 0 ${r(cx)} ${r(cy + ry)}`
        : `M${r(cx)} ${r(cy + ry)} A${rx} ${ry} 0 0 0 ${r(cx)} ${r(cy - ry)}`
      : half === "front"
        ? `M${r(cx - rx)} ${r(cy)} A${rx} ${ry} 0 0 0 ${r(cx + rx)} ${r(cy)}`
        : `M${r(cx + rx)} ${r(cy)} A${rx} ${ry} 0 0 0 ${r(cx - rx)} ${r(cy)}`;
  return `<path class="${tone}" d="${d}" fill="none" stroke-width="18" stroke-linecap="round"/>`;
}

const plate = (x: number, y: number, width: number, height: number) =>
  `<rect class="f-red-deep" x="${r(x + 5)}" y="${r(y + 6)}" width="${width}" height="${height}" rx="6" opacity="0.28"/>` +
  `<rect class="f-red" x="${r(x)}" y="${r(y)}" width="${width}" height="${height}" rx="6"/>`;

function landscape(uid: string): Art {
  const ys = [170, 272, 374, 476];
  const ring = { x: 828, y: 330, rx: 26, ry: 92 };
  const bundle = ys.map((_, i) => ring.y + (i - 1.5) * 30);
  const labels: Record<string, LabelPlace> = {
    company: place([62, 70], "start", "below", { width: 400 }),
    human: place([ring.x, 531], "center", "middle", {
      width: 210,
      ground: "red",
    }),
  };
  const rows = ys.map((y, i) => {
    const n = i + 1;
    const fill = paint(uid, ROLE_PRINTS[i]);
    const by = bundle[i];
    const d = `M290 ${y} L660 ${y} C736 ${y} 748 ${by} ${ring.x - 20} ${by} L912 ${by}`;
    labels[`role${n}`] = place([124, y], "start", "middle", {
      width: 164,
      ground: "ink",
    });
    labels[`skill${n}`] = place([490, y], "center", "middle", { width: 214 });
    return part(
      {
        name: "role",
        beat: n,
        enter: "slide-right",
        origin: [60, y],
        nodes: [`role${n}`, `skill${n}`],
        links: [`role${n}>skill${n}`, `skill${n}>human`],
        marks: [`person:role${n}`],
      },
      strip(d, 36, fill) + buckle(360, y, 260, 76, 36) + tab(60, y, 230, 58),
    );
  });
  const parts = [
    part(
      { name: "company", beat: 0, enter: "fade", nodes: ["company"] },
      `<rect class="f-warm" x="30" y="44" width="940" height="552" rx="12"/>` +
        `<rect class="s-line" x="30" y="44" width="940" height="552" rx="12" fill="none" stroke-width="2" stroke-dasharray="1 9" stroke-linecap="round"/>`,
    ),
    part(
      { name: "ring", beat: 5, enter: "wrap", origin: [ring.x, ring.y] },
      ringHalf(ring.x, ring.y, ring.rx, ring.ry, "back", "x"),
    ),
    ...rows,
    part(
      {
        name: "loop",
        beat: 5,
        enter: "wrap",
        order: 1,
        origin: [ring.x, ring.y],
        nodes: ["human"],
        marks: ["human:human"],
      },
      ringHalf(ring.x, ring.y, ring.rx, ring.ry, "front", "x") +
        `<path class="s-red" d="M${ring.x} ${ring.y + ring.ry + 8} L${ring.x} 500" stroke-width="4"/>` +
        plate(ring.x - 124, 500, 248, 62),
    ),
  ];
  return {
    width: 1000,
    height: 620,
    defs: prints(uid),
    parts: parts.join(""),
    labels,
  };
}

function portrait(uid: string): Art {
  const ys = [160, 292, 424, 556];
  const lanes = [582, 556, 530, 504];
  const ring = { x: 543, y: 720, rx: 64, ry: 18 };
  const labels: Record<string, LabelPlace> = {
    company: place([40, 54], "start", "below", { width: 520 }),
    human: place([306, 720], "center", "middle", { width: 250, ground: "red" }),
  };
  const rows = ys.map((y, i) => {
    const n = i + 1;
    const fill = paint(uid, ROLE_PRINTS[i]);
    const x = lanes[i];
    const d = `M262 ${y} L${x - 28} ${y} Q${x} ${y} ${x} ${y + 28} L${x} 806`;
    labels[`role${n}`] = place([98, y], "start", "middle", {
      width: 162,
      ground: "ink",
    });
    labels[`skill${n}`] = place([382, y], "center", "middle", { width: 170 });
    return part(
      {
        name: "role",
        beat: n,
        enter: "slide-right",
        origin: [34, y],
        nodes: [`role${n}`, `skill${n}`],
        links: [`role${n}>skill${n}`, `skill${n}>human`],
        marks: [`person:role${n}`],
      },
      strip(d, 20, fill) + buckle(288, y, 188, 92, 20) + tab(34, y, 228, 60),
    );
  });
  const parts = [
    part(
      { name: "company", beat: 0, enter: "fade", nodes: ["company"] },
      `<rect class="f-warm" x="14" y="30" width="592" height="810" rx="12"/>` +
        `<rect class="s-line" x="14" y="30" width="592" height="810" rx="12" fill="none" stroke-width="2" stroke-dasharray="1 9" stroke-linecap="round"/>`,
    ),
    part(
      { name: "ring", beat: 5, enter: "wrap", origin: [ring.x, ring.y] },
      ringHalf(ring.x, ring.y, ring.rx, ring.ry, "back", "y"),
    ),
    ...rows,
    part(
      {
        name: "loop",
        beat: 5,
        enter: "wrap",
        order: 1,
        origin: [ring.x, ring.y],
        nodes: ["human"],
        marks: ["human:human"],
      },
      ringHalf(ring.x, ring.y, ring.rx, ring.ry, "front", "y") +
        `<path class="s-red" d="M${ring.x - ring.rx - 8} ${ring.y} L440 ${ring.y}" stroke-width="4"/>` +
        plate(172, ring.y - 32, 268, 64),
    ),
  ];
  return {
    width: 620,
    height: 870,
    defs: prints(uid),
    parts: parts.join(""),
    labels,
  };
}

export const contributorsArt = (orientation: Orientation, uid: string): Art =>
  orientation === "portrait" ? portrait(uid) : landscape(uid);
