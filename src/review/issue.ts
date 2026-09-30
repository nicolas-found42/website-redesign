import type { FeedbackItem } from "./store";
import { itemMarkdown, kindNames } from "./export";
import { targetLabel } from "./target";

export const issueLabels = ["needs-triage", "review-feedback"];
export const issueMarker = (id: string, hash: string) =>
  `<!-- found42-feedback:${id}:${hash} -->`;

/** User text stays literal, with mentions and active Markdown disabled. */
const literal = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/@/g, "@\u200b")
    .replace(/[\\`*_{}[\]()#!|~]/g, "\\$&");
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
  return {
    title,
    labels: issueLabels,
    body: [
      `Reported by **${safe.reviewer}** (self-reported name) on ${item.created.slice(0, 10)} through review mode.`,
      "",
      `Page: ${site}${item.target.page.replace(/^\//, "")}`,
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
      `Feedback id: ${item.id}`,
      issueMarker(item.id, hash),
    ].join("\n"),
  };
}
