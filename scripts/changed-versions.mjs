/**
 * Which versions does a change touch? CI runs the full suite for the shared
 * code and `current` on every change, but the per-version contract only for the
 * versions that changed, so cost does not grow with every draft.
 *
 *   node scripts/changed-versions.mjs <base-ref>
 *
 * Prints `all` when shared code, the build, the hub or tooling changed (every
 * version could be affected), `none` when only documentation changed, and
 * otherwise the comma-separated slugs whose folders changed.
 */
import { execFileSync } from "node:child_process";

/** Paths that cannot change what any version builds or how it behaves. */
const inert = /^(?:docs\/|artifacts\/|research\/|\.out-of-scope\/|[^/]+\.md$)/;

export function select(paths) {
  const slugs = new Set();
  for (const path of paths) {
    const version = /^versions\/([^/]+)\//.exec(path);
    if (version) slugs.add(version[1]);
    else if (!inert.test(path)) return "all";
  }
  return slugs.size ? [...slugs].sort().join(",") : "none";
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const base = process.argv[2];
  if (!base) {
    console.error("Usage: node scripts/changed-versions.mjs <base-ref>");
    process.exit(1);
  }
  const changed = execFileSync(
    "git",
    ["diff", "--name-only", `${base}...HEAD`],
    { encoding: "utf8" },
  )
    .split("\n")
    .filter(Boolean);
  console.log(select(changed));
}
