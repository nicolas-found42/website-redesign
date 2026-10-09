import {
  part,
  place,
  type Art,
  type LabelPlace,
  type Orientation,
} from "./kit";
import { arrow, paper } from "./work";

/** Four output documents, rather than people illustrating their working day. */
const cards = ["brief", "meeting", "debrief", "actions"] as const;

/** Content blocks are fields in each output, never a decorative ruled texture. */
const field = (x: number, y: number, w: number, h = 8) =>
  `<rect class="f-muted" x="${x}" y="${y}" width="${w}" height="${h}" rx="2"/>`;

function output(index: number, x: number, y: number, w: number): string {
  if (index === 0) {
    // Three priorities, each with a rank badge, summary and supporting detail.
    return [0, 1, 2]
      .map((row) => {
        const yy = y + row * 64;
        const rank = [
          "M20 12 L28 6 V34 M20 34 H36",
          "M16 12 Q28 0 36 12 Q39 18 16 34 H38",
          "M16 8 Q40 0 36 18 Q42 36 16 32 M25 19 H34",
        ][row];
        return (
          `<rect class="f-warm" x="${x}" y="${yy}" width="${w}" height="54" rx="4"/>` +
          `<g transform="translate(${x + 3} ${yy + 6})"><path class="s-ink" d="${rank}" fill="none" stroke-width="4" stroke-linecap="round"/></g>` +
          field(x + 58, yy + 13, w - 82, 10) +
          field(x + 58, yy + 33, w * 0.56, 6)
        );
      })
      .join("");
  }
  if (index === 1) {
    // An agenda has time boxes and discussion blocks, rather than a checklist.
    return [0, 1, 2]
      .map((row) => {
        const yy = y + row * 64;
        return (
          `<rect class="f-warm s-line" x="${x}" y="${yy}" width="56" height="48" rx="4" stroke-width="2"/>` +
          `<circle class="s-ink" cx="${x + 28}" cy="${yy + 24}" r="15" stroke-width="2.5"/><path class="s-ink" d="M${x + 28} ${yy + 12} V${yy + 24} L${x + 36 + row * 2} ${yy + 29}" stroke-width="2.5"/>` +
          `<rect class="f-warm" x="${x + 70}" y="${yy}" width="${w - 70}" height="48" rx="4"/>` +
          field(x + 84, yy + 12, w - 112, 10) +
          field(x + 84, yy + 31, w * 0.43, 6)
        );
      })
      .join("");
  }
  if (index === 2) {
    // A debrief table pairs the follow-up with its owner and due-date fields.
    const owner = x + w * 0.56;
    const date = x + w * 0.77;
    return (
      `<rect class="f-warm" x="${x}" y="${y}" width="${w}" height="180" rx="4"/>` +
      `<path class="s-line" d="M${owner - 12} ${y + 8} V${y + 172} M${date - 12} ${y + 8} V${y + 172}" stroke-width="2"/>` +
      [0, 1, 2]
        .map((row) => {
          const yy = y + 12 + row * 56;
          return (
            field(x + 12, yy + 8, w * 0.45, 9) +
            field(x + 12, yy + 27, w * 0.32, 6) +
            `<circle class="f-muted" cx="${owner + 15}" cy="${yy + 10}" r="8"/><path class="f-muted" d="M${owner + 2} ${yy + 30} Q${owner + 15} ${yy + 11} ${owner + 28} ${yy + 30} Z"/>` +
            `<rect class="f-paper s-ink" x="${date}" y="${yy + 2}" width="39" height="32" rx="3" stroke-width="2"/><path class="s-ink" d="M${date} ${yy + 12} H${date + 39} M${date + 10} ${yy - 2} V${yy + 6} M${date + 29} ${yy - 2} V${yy + 6}" stroke-width="2"/>` +
            field(date + 9, yy + 20, 21, 6)
          );
        })
        .join("")
    );
  }
  // Transcript notes on the left become discrete tasks on the right. The
  // checklist remains unapproved until the executive's separate decision.
  const notes = w * 0.32;
  const tasks = x + w * 0.47;
  return (
    `<rect class="f-paper" x="${x}" y="${y}" width="${notes}" height="134" rx="4"/>` +
    [0, 1, 2]
      .map((row) => {
        const yy = y + 12 + row * 40;
        return (
          field(x + 10, yy, notes - 20, 8) +
          field(x + 10, yy + 16, notes * 0.65, 6) +
          `<rect class="f-paper" x="${tasks}" y="${yy - 4}" width="${w * 0.53}" height="34" rx="4"/><rect class="s-ink" x="${tasks + 9}" y="${yy + 4}" width="17" height="17" rx="2" stroke-width="2"/>` +
          field(tasks + 36, yy + 8, w * 0.53 - 48, 8)
        );
      })
      .join("") +
    `<path class="s-paper" d="M${x + notes + 7} ${y + 65} H${tasks - 8} M${tasks - 17} ${y + 58} L${tasks - 8} ${y + 65} L${tasks - 17} ${y + 72}" stroke-width="3"/>`
  );
}

function timeline(orientation: Orientation): Art {
  const wide = orientation === "landscape";
  const width = wide ? 1000 : 600;
  const pitch = wide ? 510 : 560;
  const height = wide ? 1260 : 2450;
  const w = wide ? 440 : 520;
  const labels: Record<string, LabelPlace> = {};
  const parts: string[] = [];
  cards.forEach((key, index) => {
    const x = wide ? 30 + (index % 2) * 500 : 40;
    const y = 24 + (wide ? Math.floor(index / 2) : index) * pitch;
    const last = index === 3;
    const cx = x + w / 2;
    labels[key] = place([cx, y + 78], "center", "middle", {
      width: w - 24,
      ground: last ? "ink" : "paper",
    });
    labels[`${key}-sample`] = place([cx, y + 208], "center", "middle", {
      width: w - 24,
      ground: last ? "ink" : "paper",
    });
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
        paper(x, y, w, 470, last) + output(index, x + 24, y + 250, w - 48),
      ),
    );
    if (!last) {
      const next = cards[index + 1];
      const d = wide
        ? index === 1
          ? "M750 504 V522 H14 V684 H24"
          : `M${x + w + 6} ${y + 150} H${x + w + 54}`
        : `M300 ${y + 486} V${y + pitch - 8}`;
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
      const my = y + 390;
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
              `M${x + w - 10} ${my + 38} H${x + w + 12} V${y + 316} H${x + w - 10}`,
              [x + w - 10, y + 316],
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
