import type { Art, LabelPlace } from "./kit";

/**
 * A drawing's field: the artwork and the words set over it, as one still
 * composition. The live drawings start from exactly this markup and return to
 * it, so a still drawing is never a second implementation of the same picture.
 */

/** A word in a drawing and when in the story it is said. */
export type LabelContent = {
  /** The node or annotation this label names; the drawing places it by this key. */
  readonly key: string;
  readonly text: string;
  readonly kind: string;
  readonly beat: number;
};

const share = (value: number, of: number) => ((value / of) * 100).toFixed(3);

/** One label, placed as a share of the field so it scales with the drawing. */
export function labelHtml(
  art: Art,
  label: LabelContent,
  place: LabelPlace = art.labels[label.key],
): string {
  if (!place) throw new Error(`No place for the label "${label.key}"`);
  const width =
    place.width === undefined ? "" : `;--w:${share(place.width, art.width)}`;
  // Unitless: the stylesheet multiplies by 1%. Percentages written into the
  // markup would otherwise read as figures in the page's own text.
  return (
    `<span class="system-label system-label--${label.kind} is-${place.align} is-${place.baseline} ground-${place.ground ?? "paper"}"` +
    ` data-node="${label.key}" data-beat="${label.beat}"` +
    ` style="--x:${share(place.at[0], art.width)};--y:${share(place.at[1], art.height)}${width}">` +
    `<i class="system-label-text">${label.text}</i></span>`
  );
}

export const labelsHtml = (art: Art, labels: readonly LabelContent[]) =>
  labels.map((label) => labelHtml(art, label)).join("");

/** The artwork alone: its prints and its parts in painting order. */
export const artInner = (art: Art) =>
  `<defs>${art.defs}</defs><g class="art">${art.parts}</g>`;

export function fieldHtml(
  art: Art,
  labels: readonly LabelContent[],
  description: string,
  className = "system-field",
): string {
  return (
    `<div class="${className}" style="--ratio:${art.width} / ${art.height}"` +
    ` role="img" aria-label="${description}">` +
    `<svg class="system-svg" viewBox="0 0 ${art.width} ${art.height}" fill="none"` +
    ' aria-hidden="true" focusable="false">' +
    artInner(art) +
    "</svg>" +
    `<div class="system-labels" aria-hidden="true">${labelsHtml(art, labels)}</div>` +
    "</div>"
  );
}

/**
 * Pattern ids must be unique in the document. Prerendered drawings and live
 * ones are numbered from different counters so a live rebuild can never take
 * an id a still drawing elsewhere on the page is using.
 */
let count = 0;
export const drawingId = (name: string) =>
  `${typeof window === "undefined" ? "s" : "l"}${(count += 1)}-${name}`;
