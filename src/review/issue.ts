import type { FeedbackItem } from "./model";
import { itemMarkdown, kindNames, priorityNames } from "./markdown";
import { targetLabel } from "./target-meta";

export const issueLabels = ["needs-triage", "review-feedback"];
export const maxIssueBodyBytes = 60_000;
export const issueMarker = (id: string, hash: string) => {
  if (!/^[a-zA-Z0-9-]{1,80}$/.test(id) || !/^[a-f0-9]{64}$/.test(hash))
    throw new Error("Invalid feedback marker.");
  return `<!-- found42-feedback:${id}:${hash} -->`;
};

/** User text stays literal, with mentions and active Markdown disabled. */
const literalEntities: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "@": "@\u200b",
};
const literal = (text: string) =>
  text.replace(
    /[!-/:-@[-`{-~]/g,
    (character) => literalEntities[character] ?? `\\${character}`,
  );
function escaped(value: unknown): unknown {
  if (typeof value === "string") return literal(value);
  if (Array.isArray(value)) return value.map(escaped);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([key, field]) => [key, escaped(field)]),
    );
  return value;
}

/** Shared by hosted delivery and the manual backup importer. */
export function feedbackIssue(item: FeedbackItem, site: string, hash: string) {
  const safe = escaped(item) as FeedbackItem;
  // The export's final HTML metadata line uses code spans; quote those fields
  // separately so arbitrary selector text cannot break out of a code span.
  const readable = itemMarkdown(safe, 1).split("\n").slice(2, -1).join("\n");
  const json = JSON.stringify({ site, ...item }, null, 2);
  const longest = Math.max(
    2,
    ...Array.from(json.matchAll(/`+/g), (match) => match[0].length),
  );
  const fence = "`".repeat(longest + 1);
  const title =
    `${kindNames[item.change.kind]}: ${item.target.pageName} › ${targetLabel(item.target)}`
      .replace(/@/g, "@\u200b")
      .replace(/[\r\n]/g, " ")
      .slice(0, 120);
  const quoted = (s: string) =>
    literal(s)
      .split("\n")
      .map((line) => `> ${line}`)
      .join("\n");
  const issue = {
    title,
    labels: issueLabels,
    body: [
      `Reported by **${safe.reviewer}** (self-reported name) on ${literal(item.created.slice(0, 10))} through review mode.`,
      "",
      `Page: ${literal(site + item.target.page.replace(/^\//, ""))}`,
      "",
      `**Importance:** ${priorityNames[item.priority]}`,
      "",
      readable,
      "",
      "**Selected text or image description**",
      quoted(item.target.text),
      "",
      "**Selector**",
      quoted(item.target.selector),
      "",
      `**Seen at:** ${item.target.viewport.width} × ${item.target.viewport.height}`,
      ...item.target.state.map((state) => quoted(state)),
      "",
      "This request needs triage; publication does not approve implementation or commercial claims.",
      "",
      "<details><summary>Feedback record</summary>",
      "",
      `${fence}json`,
      json,
      fence,
      "",
      "</details>",
      "",
      `Feedback id: ${literal(item.id)}`,
      issueMarker(item.id, hash),
    ].join("\n"),
  };
  if (new TextEncoder().encode(issue.body).byteLength > maxIssueBodyBytes)
    throw new Error(
      "Formatted feedback is too long; shorten the draft before sending.",
    );
  return issue;
}
