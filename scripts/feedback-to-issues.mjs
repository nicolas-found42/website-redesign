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

const labels = ["needs-triage", "review-feedback"];
const gh = (...command) =>
  execFileSync("gh", command, { encoding: "utf8" }).trim();

// The page's own export module formats the issue, so the two never disagree.
const server = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "silent",
});
try {
  const { parseFeedbackFile, itemMarkdown, kindNames } =
    await server.ssrLoadModule("/src/review/export.ts");
  const { targetLabel } = await server.ssrLoadModule("/src/review/target.ts");
  const record = parseFeedbackFile(await readFile(file, "utf8"));

  const issues = record.items.map((item, i) => {
    const where = `${item.target.pageName} › ${targetLabel(item.target)}`;
    const title = `${kindNames[item.change.kind]}: ${where}`;
    const readable = itemMarkdown(item, i + 1)
      .split("\n")
      .slice(2)
      .join("\n");
    const body = [
      `Reported by **${item.reviewer || record.reviewer}** on ${item.created.slice(0, 10)} through review mode on ${record.site}.`,
      "",
      readable,
      "",
      "<details><summary>Feedback record</summary>",
      "",
      "```json",
      JSON.stringify(item, null, 2),
      "```",
      "",
      "</details>",
      "",
      `Feedback id: \`${item.id}\``,
    ].join("\n");
    return {
      id: item.id,
      title: title.length > 120 ? `${title.slice(0, 119)}…` : title,
      body,
    };
  });

  if (!create) {
    for (const issue of issues)
      console.log(
        `\n━━ ${issue.title}\nlabels: ${labels.join(", ")}\n\n${issue.body}\n`,
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
          ...labels.flatMap((label) => ["--label", label]),
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
