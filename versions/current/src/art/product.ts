import {
  part,
  place,
  seal,
  type Art,
  type LabelPlace,
  type Orientation,
} from "./kit";
import { arrow, colleague, contents, desk, folio, laptop, paper } from "./work";

/** Automations: repeated work crosses systems under human direction and review. */
function operations(orientation: Orientation): Art {
  const wide = orientation === "landscape";
  const width = wide ? 1000 : 620;
  const height = wide ? 670 : 1790;
  const xs = wide ? [100, 300, 500, 700, 900] : [430, 430, 430, 430, 430];
  const ys = wide ? [250, 250, 250, 250, 250] : [140, 440, 780, 1120, 1460];
  const keys = ["n1", "n2", "human", "n3", "n4"];
  const labels: Record<string, LabelPlace> = {};
  const parts: string[] = [];
  keys.forEach((key, i) => {
    const x = xs[i],
      y = ys[i];
    labels[key] = wide
      ? place([x, 135], "center", "middle", { width: 175, beat: i })
      : place([35, y - 15], "start", "middle", { width: 225, beat: i });
    let object: string;
    if (i === 0)
      object =
        [2, 1, 0]
          .map((k) => paper(x - 70 - k * 5, y - 45 - k * 8, 140, 100))
          .join("") + contents(x - 52, y - 18, 108, "priorities");
    else if (i === 1)
      object =
        laptop(x - 74, y - 55, 148, "systems") +
        `<path class="s-ink" d="M${x - 36} ${y + 65} V${y + 82} H${x + 36} V${y + 65}" stroke-width="2.5"/>` +
        paper(x - 48, y + 68, 30, 42) +
        paper(x + 18, y + 68, 30, 42);
    else if (i === 4)
      object =
        paper(x - 76, y - 55, 152, 120, true) +
        contents(x - 58, y - 20, 116, "actions", true) +
        seal([x + 48, y + 46], 15);
    else
      object =
        laptop(x - 90, y - 58, 125, i === 2 ? "plan" : "tests") +
        colleague([x + 35, y + 105], 0.92, i === 2 ? "point" : "review") +
        folio(x + 38, y + 120, 58, "actions") +
        desk(x - 92, y + 154, 184) +
        (i === 3 ? seal([x + 68, y + 142], 15) : "");
    parts.push(
      part(
        {
          name:
            i === 0
              ? "work-queue"
              : i === 1
                ? "system-handoffs"
                : i === 2
                  ? "operator"
                  : i === 3
                    ? "reviewer"
                    : "output",
          beat: i,
          enter: "rise",
          origin: [x, y],
          nodes: [key],
          marks: i === 3 ? ["seal:approved"] : [],
        },
        object,
      ),
    );
  });
  const links = ["n1>n2", "n2>human", "human>n3", "n3>n4"];
  links.forEach((link, i) => {
    const d = wide
      ? `M${xs[i] + 86} 245 H${xs[i + 1] - 86}`
      : `M430 ${ys[i] + (i < 2 ? 135 : 240)} V${ys[i + 1] - 70}`;
    const tip = wide
      ? ([xs[i + 1] - 86, 245] as const)
      : ([430, ys[i + 1] - 70] as const);
    parts.unshift(
      part(
        { name: "next", beat: i + 1, enter: "fade", links: [link] },
        arrow(d, tip, wide ? "right" : "down"),
      ),
    );
  });
  // Preserve both unnamed outputs as visible branches from human direction.
  const outputAt = wide
    ? [
        [900, 5],
        [900, 565],
      ]
    : [
        [150, 1675],
        [480, 1675],
      ];
  outputAt.forEach(([x, y], i) => {
    const d = wide
      ? i === 0
        ? "M548 200 H600 V20 H806 V65 H820"
        : "M500 488 V605 H820"
      : i === 0
        ? "M335 780 H18 V1710 H82"
        : "M524 780 H602 V1710 H552";
    const tip = wide
      ? i === 0
        ? ([820, 65] as const)
        : ([820, 605] as const)
      : i === 0
        ? ([82, 1710] as const)
        : ([552, 1710] as const);
    parts.unshift(
      part(
        {
          name: "branch",
          beat: 4,
          enter: "fade",
          links: [`human>out${i + 1}`],
        },
        arrow(d, tip, !wide && i === 1 ? "left" : "right"),
      ),
    );
    parts.push(
      part(
        {
          name: "copy",
          beat: 4,
          order: i + 1,
          enter: "rise",
          origin: [x, y],
          links: [],
        },
        paper(x - 66, y, 132, 80) +
          contents(x - 50, y + 16, 96, "owners") +
          seal([x + 46, y + 61], 13),
      ),
    );
  });
  return { width, height, parts: parts.join(""), labels };
}
export const productArt = (orientation: Orientation): Art =>
  operations(orientation);
