import {
  identityFill,
  part,
  place,
  mitre,
  pt,
  r,
  run as runStrip,
  swallowtail as cutEnd,
  type Art,
  type LabelPlace,
  type Orientation,
  type Pt,
} from "./kit";

/**
 * Workflows: the concertina.
 *
 * A workflow is built the way a folded leaflet is read — one panel after
 * another. The brief, the tailored design and build, and the test and review
 * are the first three panels; the team deploying and using it is the red
 * panel; the review in the customer's context is the last. Its tail is a
 * ribbon threaded back into the panel it improves — the design and build on
 * the wide sheet, the brief on the narrow one — because that is how the
 * workflow keeps being fitted to the work.
 */

type Panel = { top: [Pt, Pt]; bottom: [Pt, Pt] };

const quad = ({ top, bottom }: Panel) =>
  `M${pt(top[0])} L${pt(top[1])} L${pt(bottom[1])} L${pt(bottom[0])} Z`;

const centre = ({ top, bottom }: Panel): Pt => [
  (top[0][0] + top[1][0] + bottom[0][0] + bottom[1][0]) / 4,
  (top[0][1] + top[1][1] + bottom[0][1] + bottom[1][1]) / 4,
];

/**
 * Five panels down a zigzag. Each panel shares its lower fold with the next
 * one's upper fold; the folds lean alternately, which is what makes a strip
 * read as folded rather than cut into cards.
 */
function panels(
  origin: Pt,
  width: number,
  height: number,
  drift: number,
  lean: number,
): Panel[] {
  // Alternate folds stand out and in: the zigzag down both edges is the fold.
  const folds = Array.from({ length: 6 }, (_, k): [Pt, Pt] => {
    const out = k % 2 === 1 ? drift : 0;
    const left: Pt = [origin[0] + k * lean * 2 + out, origin[1] + k * height];
    return [left, [left[0] + width, left[1]]];
  });
  return folds.slice(0, 5).map((top, i) => ({ top, bottom: folds[i + 1] }));
}

const plate = (at: Pt, width: number, height: number) => {
  const x = at[0] - width / 2;
  const y = at[1] - height / 2;
  return (
    `<rect class="f-sunk" x="${r(x + 4)}" y="${r(y + 5)}" width="${width}" height="${height}" rx="4"/>` +
    `<rect class="f-paper s-ink" x="${r(x)}" y="${r(y)}" width="${width}" height="${height}" rx="4" stroke-width="2.5"/>`
  );
};

function leaflet(
  field: { width: number; height: number },
  geometry: {
    origin: Pt;
    width: number;
    height: number;
    drift: number;
    lean: number;
  },
  back: { into: number; reach: number },
  plateWidth: number,
): Art {
  const sheet = panels(
    geometry.origin,
    geometry.width,
    geometry.height,
    geometry.drift,
    geometry.lean,
  );
  const fills = [
    identityFill.n1,
    identityFill.n2,
    identityFill.n3,
    "var(--red)",
    "var(--ink)",
  ];
  const keys = ["n1", "n2", "n3", "human", "n4"];
  const plateHeight = geometry.height - 30;

  const face = (panel: Panel, index: number) => {
    const d = quad(panel);
    // Panels that face away from the light are the same paper in shadow; the
    // human's red keeps its own deeper red rather than a grey veil.
    const shade =
      index % 2 === 0 && index < 4
        ? `<path class="f-ink" d="${d}" opacity="0.14"/>`
        : "";
    const sticker =
      index < 3 ? plate(centre(panel), plateWidth, plateHeight) : "";
    return (
      `<path class="s-ink" d="${d}" stroke-width="6"/>` +
      `<path d="${d}" fill="${fills[index]}"/>` +
      shade +
      `<path class="s-ink" d="M${pt(panel.bottom[0])} L${pt(panel.bottom[1])}" stroke-width="2.4"/>` +
      sticker
    );
  };

  // The tail of the last panel is a ribbon threaded back into the panel it
  // refits: out from under the leaflet, up in two sharp folds, and back
  // behind the panel, its cut end showing on the far side.
  const last = sheet[4];
  const target = sheet[back.into];
  const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const exit = mid(last.top[1], last.bottom[1]);
  const entry = mid(target.top[1], target.bottom[1]);
  const farSide = mid(target.top[0], target.bottom[0]);
  const w = 30;
  const ink = "var(--ink)";
  const outX =
    Math.max(...sheet.map((panel) => panel.bottom[1][0])) + back.reach;
  const turnUp: Pt = [outX, exit[1] + 10];
  const turnIn: Pt = [outX, entry[1]];
  const start: Pt = [exit[0] - 60, turnUp[1]];
  const cut: Pt = [farSide[0] - 46, entry[1]];
  const ribbon =
    runStrip(start, turnUp, ink, w, { from: 0 }) +
    runStrip(turnUp, turnIn, ink, w) +
    runStrip(turnIn, [cut[0] + 50, cut[1]], ink, w, { to: 0 }) +
    cutEnd(cut, ink, w, 60) +
    mitre(turnUp, [1, 0], [0, -1], ink, ink, w, { crease: "s-muted" }) +
    mitre(turnIn, [0, -1], [-1, 0], ink, ink, w, { crease: "s-muted" });

  const parts = [
    part(
      {
        name: "refit",
        beat: 3,
        enter: "unfold-y",
        origin: turnUp,
        links: [`n4>${keys[back.into]}`],
      },
      ribbon,
    ),
    ...sheet.map((panel, index) =>
      part(
        {
          name: "panel",
          beat: index < 3 ? 0 : index - 2,
          order: index < 3 ? index : 0,
          enter: "unfold-y",
          origin: panel.top[0],
          nodes: [keys[index]],
          links:
            index < 3
              ? [`${keys[index]}>human`]
              : index === 4
                ? ["human>n4"]
                : [],
        },
        face(panel, index),
      ),
    ),
  ];

  const labels: Record<string, LabelPlace> = {};
  sheet.forEach((panel, index) => {
    const [x, y] = centre(panel);
    labels[keys[index]] = place([x, y + 1], "center", "middle", {
      width: index < 3 ? plateWidth - 20 : plateWidth,
      ground: index === 3 ? "red" : index === 4 ? "ink" : "paper",
      beat: index < 3 ? 0 : index - 2,
    });
  });

  return {
    width: field.width,
    height: field.height,
    parts: parts.join(""),
    labels,
  };
}

export const automationArt = (orientation: Orientation): Art =>
  orientation === "portrait"
    ? leaflet(
        { width: 620, height: 820 },
        { origin: [70, 40], width: 400, height: 136, drift: 40, lean: 5 },
        { into: 0, reach: 44 },
        330,
      )
    : leaflet(
        { width: 1000, height: 620 },
        { origin: [100, 34], width: 520, height: 108, drift: 50, lean: 16 },
        { into: 1, reach: 110 },
        380,
      );
