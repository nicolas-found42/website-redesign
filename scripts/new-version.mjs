/**
 * Starts a new version: picks an unused readable name, creates a self-contained
 * folder under `versions/`, and writes its `version.json` as a draft.
 *
 *   npm run version:new                       copy of `current`, random name
 *   npm run version:new -- --blank            minimal shell instead of a copy
 *   npm run version:new -- --from <slug>      copy another version
 *   npm run version:new -- --title "Bold type" --author "Sam"
 *
 * Everything unique to the version lives in its folder, so deleting the folder
 * deletes the version. Names are never reused: a name that ever existed in git
 * history is skipped.
 */
import { execFileSync } from "node:child_process";
import { cp, mkdir, stat, writeFile } from "node:fs/promises";
import { randomInt } from "node:crypto";
import { resolve } from "node:path";
import { baseline, slugPattern, versionsDir } from "./versions.mjs";

const adjectives =
  `amber azure bold brisk calm clear coral crisp deep dusk eager early fair firm gentle gilded golden grand green hazel icy ivory jade keen kind light lilac lively lunar mellow misty modest noble olive opal pale plain polar quiet rapid rosy ruby sage scarlet serene silver sleek solar steady swift tidal true vivid warm wild windy`.split(
    " ",
  );
const nouns =
  `acorn anchor aspen badger beacon birch brook cedar cliff clover comet condor crane cricket delta dune eagle falcon fern finch fjord fox garnet glacier harbor haven heron holly island juniper kestrel lagoon lantern lark lotus maple marten meadow otter owl pebble pine plover quartz raven reef robin sparrow summit swallow thistle tundra willow wren`.split(
    " ",
  );

const args = process.argv.slice(2);
const option = (name) => {
  const at = args.indexOf(name);
  return at === -1 ? undefined : args[at + 1];
};
const blank = args.includes("--blank");
const source = option("--from") ?? baseline;

const exists = (path) =>
  stat(path).then(
    () => true,
    () => false,
  );
function everExisted(slug) {
  try {
    return (
      execFileSync(
        "git",
        ["log", "--all", "--format=%H", "-1", "--", `versions/${slug}`],
        { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
      ).trim() !== ""
    );
  } catch {
    return false; // Not a git checkout: the folder check below still applies.
  }
}
async function freshName() {
  for (let attempt = 0; attempt < 200; attempt++) {
    const slug = `${adjectives[randomInt(adjectives.length)]}-${nouns[randomInt(nouns.length)]}`;
    if (!(await exists(resolve(versionsDir, slug))) && !everExisted(slug))
      return slug;
  }
  throw new Error("Could not find an unused name; try again.");
}
function author() {
  try {
    return execFileSync("git", ["config", "user.name"], {
      encoding: "utf8",
    }).trim();
  } catch {
    return "";
  }
}

const slug = option("--name") ?? (await freshName());
if (!slugPattern.test(slug)) throw new Error(`"${slug}" is not a valid name.`);
const target = resolve(versionsDir, slug);
if (await exists(target)) throw new Error(`versions/${slug} already exists.`);

if (blank) {
  await mkdir(resolve(target, "src"), { recursive: true });
  await mkdir(resolve(target, "public"), { recursive: true });
  await writeFile(
    resolve(target, "index.html"),
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, nofollow" />
    <meta name="description" content="A redesign of the Found42 website." />
    <title>Found42 — ${slug}</title>
  </head>
  <body>
    <div id="app">
      <main id="main">
        <h1>${slug}</h1>
        <p>Start designing here.</p>
      </main>
    </div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`,
  );
  await writeFile(
    resolve(target, "src/main.ts"),
    `import { reviewRequested } from "@shared/review/activation";

// The team's review tools load only from a review link; visitors never fetch them.
let disposeReview: (() => void) | undefined;
if (reviewRequested())
  void import("@shared/review/review").then(({ mountReview }) => {
    disposeReview = mountReview();
  });

if (import.meta.hot) import.meta.hot.dispose(() => disposeReview?.());
`,
  );
} else {
  const from = resolve(versionsDir, source);
  if (!(await exists(from))) throw new Error(`versions/${source} not found.`);
  await cp(from, target, {
    recursive: true,
    filter: (path) => !/(?:^|\/)(?:version\.json|node_modules)$/.test(path),
  });
}

const created = new Date().toISOString().slice(0, 10);
const meta = {
  title: option("--title") ?? slug,
  summary: option("--summary") ?? "",
  status: "draft",
  created,
  author: option("--author") ?? author(),
};
if (!meta.summary) delete meta.summary;
if (!meta.author) delete meta.author;
// A copied version brings its prerenderer; a blank shell has none.
if (await exists(resolve(target, "prerender.mjs"))) meta.prerender = true;
await writeFile(
  resolve(target, "version.json"),
  `${JSON.stringify(meta, null, 2)}\n`,
);
console.log(
  `Created versions/${slug} (${blank ? "blank shell" : `copy of ${source}`}).\n` +
    `  Develop:  VERSION=${slug} npm run dev\n` +
    `  Metadata: versions/${slug}/version.json (status: draft)\n` +
    `  Delete the folder to remove the version and every trace of it from the site.`,
);
