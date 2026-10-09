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

/**
 * How a scene's words sit in the cards they name, as a browser reports it.
 *
 * Passed whole to `locator.evaluate` on a scene's field, so it stands alone.
 * It reads what a person sees: whether any word is broken across lines inside
 * itself, how large the words are set and whether each label sits inside the
 * card, tab, panel or plate the drawing puts it on.
 */
export function readTextFit(
  field: Element,
  openLabels: readonly string[] = [],
) {
  const card: Record<string, string> = {
    role: "path.f-ink",
    skill: "rect.f-paper",
    result: "rect.f-ink",
    human: "rect.f-red",
    direction: "rect.f-red",
  };
  const tolerance = 1;
  return [...field.querySelectorAll<HTMLElement>(".system-label")].map(
    (label) => {
      const text = label.querySelector<HTMLElement>(".system-label-text")!;
      const node = label.dataset.node ?? "";
      const words: { word: string; lines: number }[] = [];
      let left = Infinity;
      let right = -Infinity;
      let top = Infinity;
      let bottom = -Infinity;
      const walker = document.createTreeWalker(text, NodeFilter.SHOW_TEXT);
      for (let at = walker.nextNode(); at; at = walker.nextNode()) {
        for (const match of (at.textContent ?? "").matchAll(/\S+/g)) {
          const range = document.createRange();
          range.setStart(at, match.index);
          range.setEnd(at, match.index + match[0].length);
          const rects = [...range.getClientRects()].filter((r) => r.width > 0);
          words.push({
            word: match[0],
            // Every line a word occupies: more than one means it was split.
            lines: new Set(rects.map((r) => Math.round(r.top / 4))).size,
          });
          for (const r of rects) {
            left = Math.min(left, r.left);
            right = Math.max(right, r.right);
            top = Math.min(top, r.top);
            bottom = Math.max(bottom, r.bottom);
          }
        }
      }
      const kind = node.replace(/\d+$/, "");
      const part = field.querySelector(`[data-nodes~="${node}"]`);
      const cardSelector = openLabels.includes(node) ? null : card[kind];
      const shape = cardSelector ? part?.querySelector(cardSelector) : null;
      const box = shape?.getBoundingClientRect();
      return {
        text: text.textContent?.trim() ?? "",
        node,
        fontSize: parseFloat(getComputedStyle(text).fontSize),
        splitWords: words.filter((w) => w.lines > 1).map((w) => w.word),
        onCard: cardSelector ? !!box : null,
        outsideCard: box
          ? left < box.left - tolerance ||
            right > box.right + tolerance ||
            top < box.top - tolerance ||
            bottom > box.bottom + tolerance
          : null,
        outsideViewport: left < -tolerance || right > innerWidth + tolerance,
      };
    },
  );
}

export type TextFit = ReturnType<typeof readTextFit>;
