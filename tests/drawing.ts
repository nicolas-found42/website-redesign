/**
 * What a drawing's field shows, as a browser reports it.
 *
 * Passed whole to `locator.evaluate`, so it must stand alone: no imports and
 * nothing from the enclosing module is visible where it runs.
 *
 * A drawing is built from parts — an outer group that nothing moves, and the
 * body inside it that an entrance animates — and words set over the artwork.
 * At rest every body and every word is fully shown and untransformed, and
 * nothing is animating anywhere in the field.
 */
export function readField(field: Element) {
  const svg = field.querySelector<SVGSVGElement>(".system-svg")!;
  const atRest = (el: Element) => {
    const style = getComputedStyle(el);
    return (
      style.opacity === "1" &&
      (style.transform === "none" ||
        style.transform === "matrix(1, 0, 0, 1, 0, 0)")
    );
  };
  const words = [...field.querySelectorAll<HTMLElement>(".system-label")];
  const parts = [...field.querySelectorAll<SVGGElement>(".part")];
  const list = (value: string | undefined) =>
    value ? value.split(" ").filter(Boolean) : [];
  return {
    describedBy: field.getAttribute("aria-label"),
    viewBox: svg.getAttribute("viewBox"),
    labels: words.map((label) => ({
      node: label.dataset.node,
      text: label.textContent?.trim(),
      kind: [...label.classList]
        .find((name) => name.startsWith("system-label--"))
        ?.slice("system-label--".length),
      beat: Number(label.dataset.beat),
      x: label.style.getPropertyValue("--x"),
      y: label.style.getPropertyValue("--y"),
    })),
    parts: parts.map((piece) => ({
      name: piece.dataset.part,
      beat: Number(piece.dataset.beat),
      links: list(piece.dataset.links),
      nodes: list(piece.dataset.nodes),
      marks: list(piece.dataset.marks),
    })),
    // The artwork itself, with each drawing's own pattern ids reduced to the
    // print they name, so two renderings of one composition compare equal.
    geometry: (svg.querySelector(".art")?.innerHTML ?? "").replace(
      /url\(#[^)]*?-(\w+)\)/g,
      "$1",
    ),
    unsettled: {
      parts: parts.filter(
        (piece) => !atRest(piece.querySelector(".part-body") ?? piece),
      ).length,
      words: words.filter(
        (label) => !atRest(label.querySelector(".system-label-text") ?? label),
      ).length,
    },
    animating: field.getAnimations({ subtree: true }).length,
  };
}

export type FieldState = ReturnType<typeof readField>;
