/**
 * The ribbon visual language: named compositions rendered inline in a band or
 * written to a standalone asset by `scripts/build-artwork.ts`.
 */
const viewBox = "0 0 600 430";
const pathCount = 14;
const pathSpacing = 4;

// The interconnected loop, the route across functions, the combined inputs.
const shapes = {
  loop: (n: number) =>
    `M102 ${86 + n} C105 ${245 + n} 500 ${240 - n} 486 ${82 + n} C474 ${-10 + n} 225 ${75 - n} ${300 + n} 218 C${375 + n} 367 532 ${387 - n} 486 ${344 + n} C400 ${269 + n} 80 ${232 - n} 108 ${344 + n} C150 ${487 + n} 431 ${362 - n} ${300 + n} 218 C${169 + n} 75 100 ${-35 + n} 102 ${86 + n}`,
  route: (n: number) =>
    `M102 ${86 + n} H${404 + n} Q${492 + n} ${86 + n} ${492 + n} 129 Q${492 + n} ${172 - n} ${405 + n} ${172 - n} H${196 - n} Q${102 - n} ${172 - n} ${102 - n} 284 Q${102 - n} ${361 + n} ${196 - n} ${361 + n} H486`,
  combine: (n: number) =>
    `M108 ${82 + n} C${130 + n} ${182 + n} ${265 + n} ${185 - n} 486 ${344 + n} M486 ${82 + n} C${490 + n} ${210 + n} ${340 - n} ${240 + n} 108 ${344 + n} M108 ${82 + n} C${107 - n} ${354 - n} ${297 + n} ${420 - n} 486 ${344 + n}`,
};

export type RibbonVariant = keyof typeof shapes;

export type RibbonPresentation = {
  /** Class applied for the stylesheet; omit for a standalone asset. */
  className?: string;
  /** Stroke baked into a standalone asset, where no stylesheet can reach it. */
  stroke?: string;
};

/** Original line artwork: complete still compositions, never a results dashboard. */
export function ribbonPaths(variant: RibbonVariant) {
  return Array.from({ length: pathCount }, (_, index) => {
    const n = (index - (pathCount - 1) / 2) * pathSpacing;
    return `<path d="${shapes[variant](n)}"/>`;
  }).join("");
}

export function ribbonSvg(
  variant: RibbonVariant,
  presentation: RibbonPresentation = {},
) {
  const { className, stroke } = presentation;
  return [
    "<svg",
    className ? ` class="${className}"` : "",
    ' xmlns="http://www.w3.org/2000/svg"',
    ` viewBox="${viewBox}"`,
    ' fill="none"',
    stroke ? ` stroke="${stroke}"` : "",
    ' stroke-width="1.2"',
    ' aria-hidden="true" focusable="false"',
    `>${ribbonPaths(variant)}</svg>`,
  ].join("");
}
