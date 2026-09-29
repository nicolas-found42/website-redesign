import { readFileSync } from "node:fs";

const reportPath = process.argv[2];
if (!reportPath) {
  throw new Error("Pass the path to a Playwright JSON report.");
}

const report = JSON.parse(readFileSync(reportPath, "utf8"));
const tests = [];

function collect(suite) {
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) {
      const attempts = test.results ?? [];
      tests.push({
        project: test.projectName || "unit",
        file: spec.file || suite.file || "unknown",
        title: spec.title || "untitled",
        duration: attempts.reduce(
          (total, result) => total + (result.duration || 0),
          0,
        ),
        retries: Math.max(0, attempts.length - 1),
        status: test.status || "unknown",
      });
    }
  }

  for (const child of suite.suites ?? []) collect(child);
}

for (const suite of report.suites ?? []) collect(suite);
if (tests.length === 0) {
  throw new Error(`No tests found in ${reportPath}`);
}

const clean = (value) =>
  String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
const seconds = (milliseconds) => (milliseconds / 1000).toFixed(1);
const outcome = (status) =>
  ({ expected: "passed", unexpected: "failed" })[status] || status;
const projects = [...new Set(tests.map((test) => test.project))].sort();

console.log("## Playwright timing summary\n");
console.log(
  `Results: ${tests.length} tests; ${tests.filter((test) => test.retries > 0).length} retried. Durations include retries and exclude server startup.\n`,
);
console.log("| Project | Tests | Sum of test durations | Slowest test |");
console.log("| --- | ---: | ---: | ---: |");
for (const project of projects) {
  const matches = tests.filter((test) => test.project === project);
  console.log(
    `| ${clean(project)} | ${matches.length} | ${seconds(matches.reduce((total, test) => total + test.duration, 0))} s | ${seconds(Math.max(...matches.map((test) => test.duration)))} s |`,
  );
}

console.log("\n### Slowest tests\n");
console.log("| Project | Test | Duration | Outcome | Retries |");
console.log("| --- | --- | ---: | --- | ---: |");
for (const test of [...tests]
  .sort((a, b) => b.duration - a.duration)
  .slice(0, 15)) {
  console.log(
    `| ${clean(test.project)} | ${clean(`${test.file}: ${test.title}`)} | ${seconds(test.duration)} s | ${clean(outcome(test.status))} | ${test.retries} |`,
  );
}
