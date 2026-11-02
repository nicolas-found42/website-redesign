import {
  part,
  place,
  seal,
  type Art,
  type LabelPlace,
  type Orientation,
} from "./kit";
import {
  arrow,
  colleague,
  contents,
  desk,
  folio,
  laptop,
  paper,
  type WorkSurface,
} from "./work";

/** Builders learn together by testing their own build and investigating failures. */
const keys = ["design", "test", "troubleshoot", "anticipate", "workflow"];
const kinds: WorkSurface[] = ["plan", "tests", "fault", "failures", "actions"];
function proving(orientation: Orientation): Art {
  const wide = orientation === "landscape";
  const width = wide ? 1000 : 620;
  const height = wide ? 970 : 2030;
  const xs = wide ? [30, 355, 680, 60, 550] : [50, 50, 50, 50, 50];
  const ys = wide ? [190, 190, 190, 550, 550] : [160, 505, 850, 1195, 1540];
  const widths = wide ? [280, 280, 280, 370, 410] : [520, 520, 520, 520, 520];
  const labels: Record<string, LabelPlace> = {
    learner: place([wide ? 165 : 140, 80], "start", "middle", {
      width: wide ? 680 : 440,
    }),
  };
  const parts: string[] = [
    part(
      {
        name: "learner",
        beat: 0,
        enter: "rise",
        marks: ["person:learner"],
        nodes: ["learner"],
        links: ["learner>design"],
      },
      colleague([wide ? 87 : 74, 80], 0.62, "point") +
        arrow(
          wide ? "M123 114 H170 V176" : "M95 136 H310 V146",
          wide ? [170, 176] : [310, 146],
          "down",
        ),
    ),
  ];
  keys.forEach((key, i) => {
    const x = xs[i],
      y = ys[i],
      w = widths[i],
      cx = x + w / 2;
    labels[key] = place([cx, y + 25], "center", "middle", {
      width: w - 15,
      ground: i === 4 ? "ink" : "paper",
    });
    const heading =
      i === 4
        ? `<rect class="f-ink" x="${x}" y="${y - 15}" width="${w}" height="80" rx="5"/>`
        : "";
    const screen =
      i === 0 || i === 3
        ? folio(wide ? cx - 83 : x + 205, y + 95, wide ? 166 : 270, kinds[i])
        : laptop(wide ? cx - 83 : x + 205, y + 80, wide ? 166 : 270, kinds[i]);
    const people = wide
      ? colleague([cx - 80, y + 203], 0.75, "review") +
        (i === 4 || i === 2
          ? colleague([cx + 118, y + 199], 0.75, "point", "left")
          : "")
      : colleague([x + 85, y + 197], 0.9, "review") +
        (i === 4 || i === 2
          ? colleague([x + 448, y + 186], 0.85, "point", "left")
          : "");
    const check = i < 4 ? seal([wide ? cx - 32 : x + 141, y + 229], 16) : "";
    parts.push(
      part(
        {
          name: i === 4 ? "shared-build" : "proving-station",
          beat: i + 1,
          enter: "rise",
          origin: [cx, y + 250],
          nodes: [key],
          marks: [i === 4 ? "result:workflow" : `check:${key}`],
        },
        heading + screen + people + desk(x, y + 245, w) + check,
      ),
    );
    if (i < 4) {
      const d = wide
        ? i === 2
          ? "M965 325 H982 V510 H245 V535"
          : i === 3
            ? "M440 695 H538"
            : `M${x + w + 6} ${y + 140} H${xs[i + 1] - 8}`
        : `M310 ${y + 290} V${ys[i + 1] - 16}`;
      const tip = wide
        ? i === 2
          ? ([245, 535] as const)
          : i === 3
            ? ([538, 695] as const)
            : ([xs[i + 1] - 8, y + 140] as const)
        : ([310, ys[i + 1] - 16] as const);
      parts.unshift(
        part(
          {
            name: "next",
            beat: i + 2,
            enter: "fade",
            links: [`${key}>${keys[i + 1]}`],
          },
          arrow(d, tip, i === 2 || !wide ? "down" : "right"),
        ),
      );
    }
  });
  // A reusable build is composed of three joined parts; the final link stays.
  const by = wide ? 895 : 1950;
  const bx = wide ? 585 : 155;
  parts.push(
    part(
      {
        name: "components",
        beat: 6,
        enter: "rise",
        links: ["workflow>blocks"],
      },
      arrow(
        wide ? "M755 878 V887" : "M310 1870 V1939",
        wide ? [755, 887] : [310, 1939],
        "down",
      ) +
        [0, 1, 2]
          .map(
            (i) =>
              paper(bx + i * 112, by, 94, 52) +
              `<g transform="translate(${bx + i * 112 + 12} ${by + 12}) scale(.55)">${contents(0, 0, 120, "owners")}</g>` +
              (i < 2
                ? arrow(
                    `M${bx + i * 112 + 97} ${by + 26} H${bx + (i + 1) * 112 - 3}`,
                    [bx + (i + 1) * 112 - 3, by + 26],
                  )
                : ""),
          )
          .join(""),
    ),
  );
  return { width, height, parts: parts.join(""), labels };
}
export const buildersArt = (orientation: Orientation): Art =>
  proving(orientation);
