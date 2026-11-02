import { pt, r, type Pt } from "./kit";

/** Recognizable work objects, drawn in the same solid inks as Workshops. */
export type WorkSurface =
  | "priorities"
  | "agenda"
  | "owners"
  | "actions"
  | "plan"
  | "tests"
  | "fault"
  | "failures"
  | "systems";

export function paper(
  x: number,
  y: number,
  w: number,
  h: number,
  dark = false,
): string {
  return (
    `<rect class="f-sunk" x="${r(x + 5)}" y="${r(y + 6)}" width="${w}" height="${h}" rx="5"/><rect class="f-paper s-ink" x="${x}" y="${y}" width="${w}" height="${h}" rx="5" stroke-width="3"/>` +
    (dark
      ? `<rect class="f-ink" x="${x + 2}" y="${y + 2}" width="${w - 4}" height="${h - 4}" rx="4"/>`
      : "")
  );
}

/** Interface/document contents: discrete fields, no decorative ruled texture. */
export function contents(
  x: number,
  y: number,
  w: number,
  kind: WorkSurface,
  dark = false,
): string {
  const ink = dark ? "f-paper" : "f-ink";
  const muted = dark ? "f-muted" : "f-line";
  const rows = [0, 1, 2].map((i) => {
    const yy = y + i * 22;
    const check = `<rect class="${i === 0 && kind === "actions" ? "f-red" : "f-paper s-ink"}" x="${x}" y="${yy}" width="10" height="10" rx="2" stroke-width="1.4"/>`;
    if (kind === "owners")
      return `<rect class="${ink}" x="${x}" y="${yy}" width="${r(w * 0.48)}" height="6" rx="1"/><rect class="${muted}" x="${r(x + w * 0.67)}" y="${yy}" width="${r(w * 0.28)}" height="6" rx="1"/>`;
    if (kind === "fault")
      return `<rect class="${i === 1 ? "f-red" : muted}" x="${x}" y="${yy}" width="${r(w * (0.8 - i * 0.15))}" height="7" rx="2"/>`;
    if (kind === "failures")
      return `<path class="s-ink" d="M${x + 5} ${yy - 2} L${x + 13} ${yy + 12} L${x - 3} ${yy + 12} Z" stroke-width="1.5"/><rect class="${muted}" x="${x + 23}" y="${yy + 3}" width="${r(w * (0.7 - i * 0.1))}" height="6" rx="1"/>`;
    if (kind === "tests")
      return `<rect class="f-warm s-ink" x="${x}" y="${yy - 3}" width="${r(w * 0.42)}" height="17" rx="2" stroke-width="1"/><path class="s-ink" d="M${r(x + w * 0.48)} ${yy + 5} H${r(x + w * 0.58)}" stroke-width="2"/><rect class="${i === 1 ? "f-red" : muted}" x="${r(x + w * 0.64)}" y="${yy + 1}" width="${r(w * 0.3)}" height="7" rx="1"/>`;
    if (kind === "systems" || kind === "plan")
      return `<rect class="${muted}" x="${x + (i * w) / 3}" y="${y}" width="${r(w / 3 - 9)}" height="65" rx="3"/><rect class="${ink}" x="${x + (i * w) / 3 + 5}" y="${y + 8}" width="${r(w / 3 - 19)}" height="7" rx="1"/><rect class="f-paper" x="${x + (i * w) / 3 + 5}" y="${y + 25 + i * 6}" width="${r(w / 3 - 19)}" height="18" rx="2"/>`;
    return (
      check +
      `<rect class="${i === 0 ? ink : muted}" x="${x + 22}" y="${yy + 2}" width="${r(w * (0.72 - i * 0.12))}" height="6" rx="1"/>`
    );
  });
  return rows.join("");
}

export function laptop(
  x: number,
  y: number,
  w: number,
  kind: WorkSurface,
): string {
  const h = w * 0.62;
  return (
    paper(x, y, w, h) +
    `<rect class="f-ink" x="${x + 10}" y="${y + 10}" width="${w - 20}" height="6" rx="2"/>` +
    `<g transform="translate(${x + 12} ${y + 28}) scale(${r((w - 24) / 180)})">${contents(0, 0, 180, kind)}</g>` +
    `<path class="f-warm s-ink" d="M${x - 12} ${r(y + h)} H${x + w + 12} L${x + w + 5} ${r(y + h + 10)} H${x - 5} Z" stroke-width="2.5"/>`
  );
}

/** A seated colleague reaches toward the work; review places a red pen in hand. */
export function colleague(
  at: Pt,
  scale = 1,
  action: "read" | "review" | "point" = "read",
  face: "left" | "right" = "right",
): string {
  const mirror = face === "left" ? -1 : 1;
  return (
    `<g transform="translate(${pt(at)}) scale(${r(scale * mirror)} ${r(scale)})">` +
    `<ellipse class="f-sunk" cx="0" cy="90" rx="40" ry="8"/><path class="s-ink" d="M-20 42 V88 M16 42 V88" stroke-width="4" stroke-linecap="round"/>` +
    `<circle class="f-paper s-ink" cx="0" cy="-24" r="20" stroke-width="3"/><path class="f-ink" d="M-20 -24 Q-22 -48 0 -45 Q19 -42 20 -22 L-4 -36 Z"/>` +
    `<path class="f-ink s-ink" d="M-23 13 Q0 -5 22 12 L31 49 H-31 Z" stroke-width="2.5"/>` +
    `<path class="s-ink" d="M16 15 L42 ${action === "point" ? -6 : 40} L62 ${action === "point" ? -22 : 26} M-19 20 L-34 40 L-54 27" stroke-width="4" stroke-linecap="round"/>` +
    (action === "review"
      ? `<path class="s-red" d="M60 13 L69 37" stroke-width="5" stroke-linecap="round"/>`
      : "") +
    `</g>`
  );
}

export function desk(x: number, y: number, w: number): string {
  return `<rect class="f-sunk" x="${x - 4}" y="${y + 6}" width="${w + 8}" height="12" rx="2"/><path class="s-ink" d="M${x} ${y} H${x + w} M${x + 12} ${y + 2} V${y + 72} M${x + w - 12} ${y + 2} V${y + 72}" stroke-width="4" stroke-linecap="round"/>`;
}

export function folio(
  x: number,
  y: number,
  w: number,
  kind: WorkSurface,
): string {
  const h = Math.max(48, Math.round(w * 0.55));
  return (
    `<path class="f-warm s-ink" d="M${x - 6} ${y + 8} V${y - 8} H${x + w * 0.36} L${x + w * 0.43} ${y + 8} H${x + w + 5} V${y + h + 9} H${x - 6} Z" stroke-width="2.5"/>` +
    paper(x, y, w, h) +
    `<g transform="translate(${x + 10} ${y + 12}) scale(${r((w - 20) / 180)})">${contents(0, 0, 180, kind)}</g>`
  );
}

export function arrow(
  d: string,
  tip: Pt,
  direction: "right" | "left" | "down" | "up" = "right",
  red = false,
): string {
  const [x, y] = tip;
  const head =
    direction === "down"
      ? `M${x - 7} ${y - 9} L${x} ${y} L${x + 7} ${y - 9}`
      : direction === "up"
        ? `M${x - 7} ${y + 9} L${x} ${y} L${x + 7} ${y + 9}`
        : direction === "left"
          ? `M${x + 9} ${y - 7} L${x} ${y} L${x + 9} ${y + 7}`
          : `M${x - 9} ${y - 7} L${x} ${y} L${x - 9} ${y + 7}`;
  return `<path class="s-${red ? "red" : "ink"}" d="${d} ${head}" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
}
