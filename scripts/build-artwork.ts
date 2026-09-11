import { writeFileSync } from "node:fs";
import { optimize } from "svgo";
import { ribbonSvg, type RibbonState } from "../src/artwork.ts";

// Standalone fragments of the same geometry: colour has to travel inside the
// file, because a stylesheet cannot reach an SVG loaded through an image.
for (const [name, state, stroke] of [
  ["reading-connections", 2, "#ff5a5f"],
  ["contact-connections", 1, "#ff8589"],
] as const satisfies readonly (readonly [string, RibbonState, string])[]) {
  const source = ribbonSvg(state, { stroke });
  const result = optimize(source, { multipass: true });
  writeFileSync(`public/assets/${name}.svg`, result.data + "\n");
  console.log(`${name}: ${source.length} → ${result.data.length} bytes`);
}
