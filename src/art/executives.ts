import {
  part,
  place,
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

/** Decision papers and the people using them, through an illustrative day. */
const cards = ["brief", "meeting", "debrief", "actions"] as const;
const kinds: WorkSurface[] = ["priorities", "agenda", "owners", "actions"];

function timeline(orientation: Orientation): Art {
  const wide = orientation === "landscape";
  const width = wide ? 1000 : 600;
  const pitch = wide ? 510 : 560;
  const height = wide ? 1140 : 2450;
  const w = wide ? 440 : 520;
  const labels: Record<string, LabelPlace> = {};
  const parts: string[] = [];
  cards.forEach((key, index) => {
    const x = wide ? 30 + (index % 2) * 500 : 40;
    const y = 24 + (wide ? Math.floor(index / 2) : index) * pitch;
    const last = index === 3;
    labels[key] = place([x + w / 2, y + 78], "center", "middle", {
      width: w - 24,
      ground: last ? "ink" : "paper",
    });
    labels[`${key}-sample`] = place([x + w / 2, y + 208], "center", "middle", {
      width: w - 24,
      ground: last ? "ink" : "paper",
    });
    // The tablet, agenda sheet, bound notes and action screen have different
    // silhouettes. All title/sample text remains on its own paper rectangle.
    const document =
      paper(x, y, w, last ? 360 : 300, last) +
      (index === 0
        ? `<rect class="f-ink" x="${x + w / 2 - 18}" y="${y + 12}" width="36" height="5" rx="2"/>`
        : index === 2
          ? `<rect class="f-ink" x="${x}" y="${y}" width="9" height="300"/>`
          : index === 1
            ? `<path class="s-ink" d="M${x + w - 25} ${y} V${y + 25} H${x + w}" stroke-width="2"/>`
            : "") +
      (last ? "" : contents(x + 28, y + 246, w - 60, kinds[index]));
    // The third decorative row stays inside its document at 296 units.
    parts.push(
      part(
        {
          name: key,
          beat: index,
          enter: "rise",
          origin: [x, y],
          nodes: [key],
          marks: [index === 0 ? "source:brief" : `result:${key}`],
        },
        document,
      ),
    );
    const base = y + 423;
    const cx = x + w / 2;
    let work: string;
    if (index === 1) {
      work =
        colleague([x + 64, base - 44], 0.95, "point") +
        colleague([x + w - 64, base - 44], 0.95, "read", "left") +
        `<path class="f-warm s-ink" d="M${x + 80} ${base - 24} L${cx} ${base - 62} L${x + w - 80} ${base - 24} L${cx} ${base + 17} Z" stroke-width="3"/>` +
        `<path class="s-ink" d="M${x + 85} ${base - 20} V${base + 62} M${x + w - 85} ${base - 20} V${base + 62} M${cx} ${base + 17} V${base + 80}" stroke-width="3"/>` +
        `<path class="f-paper s-ink" d="M${cx - 30} ${base - 35} L${cx + 10} ${base - 45} L${cx + 35} ${base - 32} L${cx - 8} ${base - 20} Z" stroke-width="2"/><path class="s-red" d="M${cx - 9} ${base - 31} L${cx + 14} ${base - 36}" stroke-width="4"/>`;
    } else {
      work =
        colleague([cx + 65, base - 45], 1, index > 1 ? "review" : "read") +
        (index === 0
          ? laptop(x + 24, base - 82, 115, "priorities")
          : folio(x + 25, base - 45, 105, kinds[index])) +
        `<path class="f-paper s-ink" d="M${cx + 90} ${base - 30} L${cx + 134} ${base - 48} L${cx + 165} ${base - 22} L${cx + 122} ${base - 4} Z" stroke-width="2.5"/>` +
        desk(x + 10, base, w - 20);
    }
    parts.push(
      part(
        {
          name: index === 1 ? "meeting-table" : "working-desk",
          beat: index,
          order: 1,
          enter: "rise",
          origin: [cx, base],
        },
        work,
      ),
    );
    if (!last) {
      const next = cards[index + 1];
      const d = wide
        ? index === 1
          ? "M750 520 V530 H14 V684 H24"
          : `M${x + w + 6} ${y + 150} H${x + w + 54}`
        : `M300 ${y + 508} V${y + pitch - 8}`;
      const tip: readonly [number, number] = wide
        ? index === 1
          ? [24, 684]
          : [x + w + 54, y + 150]
        : [300, y + pitch - 8];
      parts.push(
        part(
          {
            name: "next",
            beat: index + 1,
            enter: "fade",
            links: [`${key}>${next}`],
          },
          arrow(d, tip, wide ? "right" : "down"),
        ),
      );
    } else {
      const my = y + 270;
      labels.direction = place([cx, my + 38], "center", "middle", {
        width: w - 66,
        ground: "red",
      });
      parts.push(
        part(
          {
            name: "decision",
            beat: 4,
            enter: "rise",
            nodes: ["direction"],
            marks: ["human:direction"],
            links: ["direction>actions"],
          },
          `<rect class="f-red" x="${x + 24}" y="${my}" width="${w - 48}" height="76" rx="5"/>` +
            arrow(
              `M${x + w - 10} ${base - 12} H${x + w + 12} V${my + 38} H${x + w - 10}`,
              [x + w - 10, my + 38],
              "left",
              true,
            ),
        ),
      );
    }
  });
  labels.illustrative = place([width / 2, height - 110], "center", "middle", {
    width: width - 60,
  });
  return { width, height, parts: parts.join(""), labels };
}
export const executivesArt = (orientation: Orientation): Art =>
  timeline(orientation);
