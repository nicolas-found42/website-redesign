/**
 * Records what every drawing said before the redesign, so the redesign can be
 * checked against it.
 *
 *   node scripts/diagram-inventory.mjs <git-ref> <out.json>
 *
 * The drawings at `git-ref` must still be in the routed format they were
 * deployed in (40e42eb and earlier). The inventory is their content, not their
 * geometry: every word and which node or annotation says it, each node's kind,
 * when in its story each word and mark is told, the role and skill pairings,
 * and every connection a schematic makes — feedback loops and unnamed outputs
 * included — for each orientation. A route that ends on another route's line is
 * a branch joining it, so it is recorded as reaching where that route goes.
 *
 * `tests/fixtures/diagram-inventory.json` was written by this script from the
 * deployed commit 40e42eb, then revised by hand for the September 29 review
 * (issue #74 and ADR 0008): the Design step, the Claude Daily Brief, the
 * Workshops words and the teams-and-individual-contributors name. Do not
 * regenerate it from later code; it records what each drawing should say.
 */
import { createServer } from "vite";
import { execFileSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [ref, out] = process.argv.slice(2);
if (!ref || !out) {
  console.error("usage: diagram-inventory.mjs <git-ref> <out.json>");
  process.exit(1);
}

const root = await mkdtemp(join(tmpdir(), "diagram-inventory-"));
execFileSync("sh", ["-c", `git archive ${ref} src | tar -x -C "${root}"`]);

const server = await createServer({
  root,
  configFile: false,
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
  logLevel: "error",
});

const same = (a, b) =>
  Math.abs(a[0] - b[0]) < 0.01 && Math.abs(a[1] - b[1]) < 0.01;
/** Whether `p` lies on the segment from `a` to `b`. */
const onSegment = (p, a, b) => {
  const cross = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
  if (Math.abs(cross) > 0.01) return false;
  const within = (v, s, e) =>
    v >= Math.min(s, e) - 0.01 && v <= Math.max(s, e) + 0.01;
  return within(p[0], a[0], b[0]) && within(p[1], a[1], b[1]);
};

function flow(schematic, layout) {
  const nodeAt = (p) =>
    schematic.nodes.find((node) => same(layout.nodes[node.id].at, p))?.id;
  const ends = layout.routes.map((route) => ({
    from: route.points[0],
    to: route.points[route.points.length - 1],
    points: route.points,
    weight: route.weight,
  }));
  let unnamed = 0;
  const reach = (point, self) => {
    const node = nodeAt(point);
    if (node) return node;
    // A branch that joins another route goes where that route goes.
    const host = ends.find(
      (other) =>
        other !== self &&
        other.points.some(
          (p, i) => i > 0 && onSegment(point, other.points[i - 1], p),
        ),
    );
    if (host) return reach(host.to, host);
    unnamed += 1;
    return `out${unnamed}`;
  };
  return ends.map((route) => ({
    from: nodeAt(route.from) ?? reach(route.from, route),
    to: reach(route.to, route),
    weight: route.weight,
  }));
}

const sceneContent = (layout) => ({
  labels: layout.labels.map(({ text, kind, beat }) => ({ text, kind, beat })),
  marks: layout.markers.map(({ kind, beat }) => ({ kind, beat })),
  frames: layout.frames.map(({ kind, beat }) => ({ kind, beat })),
  routes: layout.routes.map(({ weight, beat, carry }) => ({
    weight,
    beat,
    ...(carry ? { carry } : {}),
  })),
});

try {
  const { schematics, masterSchematic } =
    await server.ssrLoadModule("/src/schematic.ts");
  const { audiences, reviewScene } =
    await server.ssrLoadModule("/src/audiences.ts");
  const inventory = {
    source: ref,
    schematics: [masterSchematic, ...schematics].map((schematic) => ({
      id: schematic.id,
      choice: schematic.choice,
      detail: schematic.detail,
      description: schematic.description,
      nodes: schematic.nodes.map(({ id, label, kind }) => ({
        id,
        label,
        kind,
      })),
      flow: {
        landscape: flow(schematic, schematic.landscape),
        portrait: flow(schematic, schematic.portrait),
      },
    })),
    scenes: [...audiences.map((audience) => audience.scene), reviewScene].map(
      (scene) => ({
        id: scene.id,
        description: scene.description,
        landscape: sceneContent(scene.landscape),
        portrait: sceneContent(scene.portrait),
      }),
    ),
    captions: audiences.map(({ id, caption }) => ({ id, caption })),
  };
  await writeFile(out, `${JSON.stringify(inventory, null, 2)}\n`);
} finally {
  await server.close();
  await rm(root, { recursive: true, force: true });
}
