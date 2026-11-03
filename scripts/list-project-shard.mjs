import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const [shard, outputFile] = process.argv.slice(2);
if (!shard || !outputFile) {
  throw new Error(
    "Usage: node scripts/list-project-shard.mjs <current/total> <test-list-file>",
  );
}

// Listing must not overwrite the JSON artifact produced by the actual run.
const env = { ...process.env };
for (const key of [
  "PLAYWRIGHT_JSON_OUTPUT_FILE",
  "PLAYWRIGHT_JSON_OUTPUT_DIR",
  "PLAYWRIGHT_JSON_OUTPUT_NAME",
])
  delete env[key];

function list(...filters) {
  const result = spawnSync(
    "node_modules/.bin/playwright",
    [
      "test",
      "--list",
      "--reporter=json",
      "--workers=2",
      "--pass-with-no-tests",
      ...filters,
    ],
    { env, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 },
  );
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      result.stderr || result.stdout || "Could not list Playwright tests.",
    );
  }
  return JSON.parse(result.stdout);
}

function tests(report) {
  const result = [];
  function collect(suite, parents) {
    for (const spec of suite.specs ?? []) {
      for (const test of spec.tests ?? []) {
        result.push({
          id: spec.id,
          project: test.projectName,
          line: `[${test.projectName}] › ${spec.file} › ${[...parents, spec.title].join(" › ")}`,
        });
      }
    }
    for (const child of suite.suites ?? [])
      collect(child, [...parents, child.title]);
  }
  for (const suite of report.suites ?? []) collect(suite, []);
  return result;
}

// Validate the requested shard with Playwright before deriving project shards.
const projects = list(`--shard=${shard}`).config.projects.map(
  (project) => project.name,
);
const [current, total] = shard.split("/").map(Number);
// Keep native file/serial groups, but stagger projects so the same expensive
// file cohort does not land on one runner in every browser engine.
const selected = projects.flatMap((project, index) => {
  const projectShard = ((current - 1 - (index % total) + total) % total) + 1;
  return tests(
    list(`--project=${project}`, `--shard=${projectShard}/${total}`),
  );
});
if (selected.length === 0) throw new Error(`Shard ${shard} selected no tests.`);
writeFileSync(outputFile, `${selected.map((test) => test.line).join("\n")}\n`);

// A title or path that the native test-list parser cannot represent must fail
// before CI runs a narrower gate. Compare identities, not only counts.
const expectedIds = selected.map((test) => test.id).sort();
const actualIds = tests(list(`--test-list=${outputFile}`))
  .map((test) => test.id)
  .sort();
if (
  new Set(expectedIds).size !== expectedIds.length ||
  JSON.stringify(expectedIds) !== JSON.stringify(actualIds)
) {
  throw new Error(
    `Shard ${shard} test-list did not preserve the selected test IDs.`,
  );
}
console.log(
  `Shard ${shard}: ${projects
    .map(
      (project) =>
        `${project}=${selected.filter((test) => test.project === project).length}`,
    )
    .join(", ")}; ${selected.length} exact test IDs verified.`,
);
