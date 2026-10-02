import {
  part,
  place,
  type Art,
  type LabelPlace,
  type Orientation,
} from "./kit";

/** Four things an executive uses through the day, with the final call in red. */
const cards = ["brief", "meeting", "debrief", "actions"] as const;

function timeline(orientation: Orientation): Art {
  const wide = orientation === "landscape";
  const width = wide ? 1000 : 600;
  const height = wide ? 950 : 1646;
  const cardWidth = wide ? 440 : 520;
  // The last card stands taller: it holds its sample above the decision mark.
  const cardHeight = (last: boolean) =>
    wide ? (last ? 410 : 320) : 344;
  const rowPitch = wide ? 392 : 384;
  const labelWidth = cardWidth - (wide ? 24 : 48);
  const labels: Record<string, LabelPlace> = {};
  const parts: string[] = [];

  cards.forEach((key, index) => {
    const last = index === cards.length - 1;
    const tall = cardHeight(last);
    const x = wide ? 30 + (index % 2) * 500 : 40;
    const y = wide ? 24 + Math.floor(index / 2) * rowPitch : 24 + index * rowPitch;
    // Titles and samples budget two lines each at enlarged text; the narrow
    // cards set larger against their type, so the last card's sample keeps
    // clear of the decision mark.
    const titleAt = y + (wide ? 78 : last ? 62 : 95);
    const sampleAt = y + (wide ? 216 : last ? 176 : 190);
    labels[key] = place(
      [x + cardWidth / 2, titleAt],
      "center",
      "middle",
      {
        width: labelWidth,
      },
    );
    labels[`${key}-sample`] = place(
      [x + cardWidth / 2, sampleAt],
      "center",
      "middle",
      {
        width: labelWidth,
      },
    );
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
        `<rect class="f-sunk" x="${x + 5}" y="${y + 6}" width="${cardWidth}" height="${tall}" rx="8"/>` +
          `<rect class="f-paper s-ink" x="${x}" y="${y}" width="${cardWidth}" height="${tall}" rx="8" stroke-width="3"/>` +
          `<rect class="f-ink" x="${x + 18}" y="${y + 18}" width="28" height="6" rx="3"/>`,
      ),
    );
    if (index < cards.length - 1) {
      const cx = wide ? x + cardWidth + 30 : width / 2;
      const cy = wide ? y + tall / 2 : y + tall + 20;
      // Reading continues from the second top card to the first bottom card.
      const arrow =
        wide && index === 1
          ? "M750 350 L750 380 L250 380 L250 405 M243 398 L250 405 L257 398"
          : wide
            ? `M${cx - 12} ${cy} L${cx + 12} ${cy} M${cx + 5} ${cy - 7} L${cx + 12} ${cy} L${cx + 5} ${cy + 7}`
            : `M${cx - 7} ${cy - 7} L${cx} ${cy + 2} L${cx + 7} ${cy - 7}`;
      parts.push(
        part(
          {
            name: "next",
            beat: index + 1,
            enter: "fade",
            links: [`${key}>${cards[index + 1]}`],
          },
          `<path class="s-ink" d="${arrow}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
        ),
      );
    } else {
      const markWidth = wide ? 368 : 330;
      const markHeight = wide ? 88 : 72;
      const mx = x + (cardWidth - markWidth) / 2;
      const my = y + tall - markHeight - 14;
      labels.direction = place(
        [x + cardWidth / 2, my + markHeight / 2],
        "center",
        "middle",
        { width: markWidth - 16, ground: "red" },
      );
      parts.push(
        part(
          {
            name: "decision",
            beat: 4,
            enter: "stamp",
            origin: [mx, my],
            nodes: ["direction"],
            marks: ["human:direction"],
            links: ["direction>actions"],
          },
          `<rect class="f-red s-ink" x="${mx}" y="${my}" width="${markWidth}" height="${markHeight}" rx="5" stroke-width="2"/>`,
        ),
      );
    }
  });
  labels.illustrative = place([width / 2, height - 72], "center", "middle", {
    width: width - 70,
  });
  return { width, height, parts: parts.join(""), labels };
}

export const executivesArt = (orientation: Orientation): Art =>
  timeline(orientation);
