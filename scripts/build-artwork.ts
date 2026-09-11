import { writeFileSync } from "node:fs";
import { optimize } from "svgo";
import { motif } from "../src/workflow.ts";
for (const [name, state, stroke] of [
  ["reading-connections", 2, "#ff5a5f"],
  ["contact-connections", 1, "#ff8589"],
] as const) {
  const source = motif(state)
    .replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"')
    .replace(
      'fill="none"',
      `fill="none" stroke="${stroke}" stroke-width="1.2"`,
    );
  const result = optimize(source, { multipass: true });
  writeFileSync(`public/assets/${name}.svg`, result.data + "\n");
  console.log(`${name}: ${source.length} → ${result.data.length} bytes`);
}
