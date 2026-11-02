import {
  part,
  place,
  seal,
  type Art,
  type LabelPlace,
  type Orientation,
} from "./kit";
import { arrow, colleague, contents, desk, folio, laptop, paper } from "./work";

/** Workflows: a customer engagement, with a reusable build and a refit loop. */
const keys = ["n1", "n2", "n3", "human", "n4"] as const;

function engagement(orientation: Orientation): Art {
  const wide = orientation === "landscape";
  const width = wide ? 1000 : 620;
  const height = wide ? 1020 : 1770;
  const xs = wide ? [70, 390, 710, 710, 390] : [120, 120, 120, 120, 120];
  const ys = wide ? [100, 100, 100, 490, 490] : [40, 340, 640, 940, 1370];
  const w = wide ? 250 : 400;
  const labels: Record<string, LabelPlace> = {};
  const parts: string[] = [];
  keys.forEach((key, i) => {
    const x = xs[i],
      y = ys[i],
      cx = x + w / 2;
    labels[key] = place([cx, y + 45], "center", "middle", {
      width: w - 14,
      ground: i === 3 ? "red" : "paper",
      beat: i,
    });
    const heading =
      (i === 3
        ? `<rect class="f-red" x="${x - 10}" y="${y}" width="${w + 20}" height="90" rx="5"/>`
        : "") +
      `<text class="f-${i === 3 ? "paper" : "muted"}" x="${i === 3 ? x + 2 : x - 16}" y="${y + 50}" font-size="20" font-family="var(--font-display)">${i + 1}</text>`;
    let object = "";
    if (i === 0)
      object =
        folio(cx - 93, y + 120, 145, "owners") +
        paper(cx + 16, y + 140, 82, 95) +
        contents(cx + 25, y + 160, 65, "priorities");
    if (i === 1)
      object =
        laptop(cx - 82, y + 105, 164, "plan") +
        colleague([cx - 104, y + 204], 0.75, "point") +
        colleague([cx + 116, y + 204], 0.75, "read", "left") +
        desk(x - 12, y + 242, w + 24);
    if (i === 2 || i === 4)
      object =
        laptop(cx - 96, y + 111, 122, i === 2 ? "tests" : "owners") +
        colleague([cx + 50, y + 196], 0.85, "review") +
        desk(x - 8, y + 239, w + 16) +
        seal([cx + 103, y + 223], 16);
    if (i === 3)
      object =
        laptop(cx - 98, y + 121, 134, "plan") +
        folio(cx + 50, y + 169, 66, "actions") +
        colleague([cx + 72, y + 139], 0.75, "point", "left") +
        desk(x - 10, y + 244, w + 20);
    parts.push(
      part(
        {
          name:
            i === 0
              ? "source-material"
              : i === 1
                ? "co-design"
                : i === 3
                  ? "handover"
                  : "customer-review",
          beat: i,
          enter: "rise",
          origin: [cx, y + 245],
          nodes: [key],
        },
        heading + object,
      ),
    );
  });
  const links = ["n1>n2", "n2>n3", "n3>human", "human>n4"];
  const paths = wide
    ? [
        { d: "M330 260 H378", tip: [378, 260] as const, dir: "right" as const },
        { d: "M650 260 H698", tip: [698, 260] as const, dir: "right" as const },
        { d: "M835 378 V478", tip: [835, 478] as const, dir: "down" as const },
        { d: "M700 650 H650", tip: [650, 650] as const, dir: "left" as const },
      ]
    : ys.slice(0, -1).map((y, i) => ({
        d:
          i === 3
            ? "M320 1214 V1240 H90 V1348 H320 V1358"
            : `M320 ${y + 274} V${ys[i + 1] - 12}`,
        tip: [320, ys[i + 1] - 12] as const,
        dir: "down" as const,
      }));
  paths.forEach((p, i) =>
    parts.unshift(
      part(
        { name: "next", beat: i + 1, enter: "fade", links: [links[i]] },
        arrow(p.d, p.tip, p.dir),
      ),
    ),
  );
  const gate = wide ? ([674, 650] as const) : ([90, 1290] as const);
  const [gx, gy] = gate;
  parts.push(
    part(
      { name: "review-point", beat: 4, enter: "pop", marks: ["seal:n4"] },
      `<path class="f-paper s-ink" d="M${gx} ${gy - 25} L${gx + 25} ${gy} L${gx} ${gy + 25} L${gx - 25} ${gy} Z" stroke-width="3"/>` +
        seal(gate, 13) +
        (wide
          ? `<path class="s-red" d="M${gx} ${gy + 25} V804" stroke-width="2"/>`
          : ""),
    ),
  );
  labels.decision = wide
    ? place([710, 845], "center", "middle", { width: 410, beat: 4 })
    : place([145, 1290], "start", "middle", { width: 430, beat: 4 });
  const returnPath = wide
    ? "M490 785 V905 H28 V30 H515 V88"
    : "M120 1510 H28 V400 H108";
  const returnTip = wide ? ([515, 88] as const) : ([108, 400] as const);
  parts.unshift(
    part(
      { name: "refit", beat: 5, enter: "fade", links: ["n4>n2"] },
      arrow(returnPath, returnTip, wide ? "down" : "right"),
    ),
  );
  labels.iteration = place([width / 2, height - 70], "center", "middle", {
    width: width - 110,
    beat: 5,
  });
  return { width, height, parts: parts.join(""), labels };
}
export const automationArt = (orientation: Orientation): Art =>
  engagement(orientation);
