/**
 * Turns a review-mode feedback file into GitHub issues, one per item.
 *
 *   npm run feedback:issues -- <file.md>            prints the issues it would open
 *   npm run feedback:issues -- <file.md> --create   opens them with `gh`
 *
 * The repository is public and so are its issues: read the dry run first. Each
 * issue carries its item's id, so running it twice never opens one twice.
 */
import { createServer } from "vite";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const args = process.argv.slice(2);
const create = args.includes("--create");
const file = args.find((arg) => !arg.startsWith("--"));
if (!file) {
  console.error("Usage: npm run feedback:issues -- <feedback file> [--create]");
  process.exit(1);
}

const gh = (...command) =>
  execFileSync(
    "gh",
    [...command, "--repo", "nicolas-found42/website-redesign"],
    { encoding: "utf8" },
  ).trim();

// The page's own export module formats the issue, so the two never disagree.
const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "silent",
});
try {
  const { parseFeedbackFile } = await server.ssrLoadModule(
    "/src/review/export.ts",
  );
  const { feedbackIssue } = await server.ssrLoadModule("/src/review/issue.ts");
  const { fingerprint } = await server.ssrLoadModule(
    "/src/review/submission-contract.ts",
  );
  const record = parseFeedbackFile(await readFile(file, "utf8"));
  const issues = await Promise.all(
    record.items.map(async (raw) => {
      const item = { ...raw, reviewer: raw.reviewer || record.reviewer };
      return {
        id: item.id,
        ...feedbackIssue(
          item,
          record.site,
          await fingerprint(record.site, item),
        ),
      };
    }),
  );

  if (!create) {
    for (const issue of issues)
      console.log(
        `\n━━ ${issue.title}\nlabels: ${issue.labels.join(", ")}\n\n${issue.body}\n`,
      );
    console.log(
      `${issues.length} ${issues.length === 1 ? "issue" : "issues"} would be opened from ${record.reviewer}'s feedback. Run again with --create to open them.`,
    );
  } else {
    gh(
      "label",
      "create",
      "review-feedback",
      "--color",
      "C2E0C6",
      "--description",
      "Sent by the team through the preview's review mode",
      "--force",
    );
    const dir = await mkdtemp(join(tmpdir(), "found42-feedback-"));
    try {
      for (const issue of issues) {
        const existing = gh(
          "issue",
          "list",
          "--state",
          "all",
          "--label",
          "review-feedback",
          "--search",
          `"${issue.id}" in:body`,
          "--json",
          "url",
          "--jq",
          ".[0].url // empty",
        );
        if (existing) {
          console.log(`Already open: ${existing} (${issue.title})`);
          continue;
        }
        const bodyFile = join(dir, `${issue.id}.md`);
        await writeFile(bodyFile, issue.body);
        const url = gh(
          "issue",
          "create",
          "--title",
          issue.title,
          "--body-file",
          bodyFile,
          ...issue.labels.flatMap((label) => ["--label", label]),
        );
        console.log(`Opened ${url} (${issue.title})`);
      }
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  }
} finally {
  await server.close();
}
