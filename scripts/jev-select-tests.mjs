import { execFileSync, spawnSync } from "node:child_process";
import { basename, relative, resolve } from "node:path";

const repository = process.cwd();
const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
  console.error(
    "OPENROUTER_API_KEY is unavailable. Use npm run test:quick for the deterministic local smoke run.",
  );
  process.exit(2);
}

const changedPaths = new Set(
  [
    ...execFileSync("git", ["diff", "--name-only", "HEAD", "--"], {
      cwd: repository,
      encoding: "utf8",
    }).split(/\r?\n/),
    ...execFileSync("git", ["ls-files", "--others", "--exclude-standard"], {
      cwd: repository,
      encoding: "utf8",
    }).split(/\r?\n/),
  ]
    .filter(Boolean)
    .filter(
      (path) =>
        !/(^|\/)(?:\.env(?:\.|$)|\.dev\.vars|[^/]*(?:secret|credential|token)[^/]*)/i.test(
          path,
        ),
    ),
);
if (changedPaths.size === 0) {
  console.error(
    "No changed files to prioritize. Make a change first, or run npm run test:quick with a file/line filter.",
  );
  process.exit(2);
}

const listed = spawnSync(
  "node_modules/.bin/playwright",
  ["test", "--config=playwright.quick.config.ts", "--reporter=json", "--list"],
  { cwd: repository, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 },
);
if (listed.status !== 0) {
  console.error(listed.stderr || "Could not list the quick Chromium tests.");
  process.exit(listed.status ?? 1);
}
const report = JSON.parse(listed.stdout);
const candidates = new Map();
function collect(suite) {
  for (const spec of suite.specs ?? []) {
    const file = spec.file ?? suite.file;
    if (!file?.endsWith(".spec.ts")) continue;
    const candidate = candidates.get(file) ?? { file, tests: [] };
    candidate.tests.push(spec.title);
    candidates.set(file, candidate);
  }
  for (const child of suite.suites ?? []) collect(child);
}
for (const suite of report.suites ?? []) collect(suite);
if (candidates.size === 0) {
  console.error("Playwright did not list any focused Chromium candidates.");
  process.exit(2);
}

const safePaths = [...changedPaths].map((path) => relative(repository, resolve(repository, path)));
const grouped = [...candidates.values()].sort((a, b) => a.file.localeCompare(b.file));
const questions = Object.fromEntries(
  grouped.map((candidate, index) => [
    `spec_${index}`,
    {
      type: "noul",
      instructions: {
        question:
          "For a partial local smoke run only, does this spec contain a test materially relevant to the changed file paths? Judge likely behavioral overlap, not general test quality.",
        candidate: `candidates[${index}]`,
      },
      criteria: {
        true: "At least one test in this spec directly exercises behavior likely affected by the changed paths.",
        false: "The spec is unlikely to exercise behavior affected by the changed paths.",
      },
    },
  ]),
);
const started = performance.now();
let response;
try {
  response = await fetch("https://openrouter.ai/api/v1/systemone", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    signal: AbortSignal.timeout(8_000),
    body: JSON.stringify({
      model: "typesafe/jev-1.13",
      state: {
        changedPaths: safePaths,
        candidates: grouped.map(({ file, tests }) => ({
          file,
          tests: tests.slice(0, 12),
        })),
      },
      questions,
    }),
  });
} catch (error) {
  console.error(
    `Jev request failed (${error instanceof Error ? error.message : "unknown error"}). No tests were started; use npm run test:quick instead.`,
  );
  process.exit(2);
}
const elapsedMs = Math.round(performance.now() - started);
if (!response.ok) {
  console.error(`Jev request failed with HTTP ${response.status}. No tests were started.`);
  process.exit(2);
}
const result = await response.json();
const costNote =
  typeof result.usage?.cost === "number"
    ? `; billed $${result.usage.cost.toFixed(6)}`
    : "";
const answers = result.answers;
if (!answers || Object.keys(answers).length !== grouped.length) {
  console.error("Jev returned an incomplete answer set. No tests were started.");
  process.exit(2);
}
const ranked = grouped
  .map((candidate, index) => ({
    ...candidate,
    relevance: answers[`spec_${index}`]?.noul,
  }))
  .filter((candidate) => Number.isFinite(candidate.relevance))
  .sort((a, b) => b.relevance - a.relevance);
if (ranked.length !== grouped.length) {
  console.error("Jev returned an invalid relevance score. No tests were started.");
  process.exit(2);
}

const directlyChanged = ranked.filter((candidate) =>
  [...changedPaths].some(
    (path) =>
      path.startsWith("tests/") && basename(path) === basename(candidate.file),
  ),
);
const changedTestFiles = [...changedPaths].filter(
  (path) => path.startsWith("tests/") && path.endsWith(".spec.ts"),
);
const excludedChangedTests = changedTestFiles.filter(
  (path) => !candidates.has(basename(path)),
);
const additional = ranked
  .filter((candidate) => candidate.relevance >= 0.35 && !directlyChanged.includes(candidate))
  .slice(0, 3);
const fallback = directlyChanged.length || additional.length ? [] : ranked.slice(0, 1);
const selected = [...directlyChanged, ...additional, ...fallback];
const selectedFiles = selected.map((candidate) => `tests/${candidate.file}`);
console.log(
  `Jev relevance pass: ${elapsedMs} ms${costNote}; ${grouped.length} spec files considered; ${selected.length} selected.`,
);
console.log(`Changed paths sent (no file contents): ${safePaths.join(", ")}`);
if (excludedChangedTests.length) {
  console.log(
    `Changed specs outside the quick Chromium scope (not run): ${excludedChangedTests.join(", ")}`,
  );
}
for (const candidate of selected) {
  console.log(
    `  ${candidate.file} (relevance ${candidate.relevance.toFixed(2)}${directlyChanged.includes(candidate) ? "; directly changed" : ""})`,
  );
}
console.log(
  "PARTIAL Chromium smoke only — not full verification. Production-tagged cases, other browsers, and unselected specs do not run.",
);
const run = spawnSync(
  "node_modules/.bin/playwright",
  [
    "test",
    "--config=playwright.quick.config.ts",
    "--reporter=line",
    "--workers=2",
    ...selectedFiles,
  ],
  { cwd: repository, stdio: "inherit" },
);
process.exit(run.status ?? 1);
