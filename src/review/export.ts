import type { Change, FeedbackItem, Kind, Priority } from "./store";
import { sitePath } from "../paths";
import { screenName, targetLabel } from "./target";

export const kindNames: Record<Kind, string> = {
  wording: "Wording",
  content: "Content",
  visual: "Visual",
  layout: "Layout",
};
export const priorityNames: Record<Priority, string> = {
  must: "Must change",
  should: "Should change",
  nice: "Nice to have",
};

/** The marker the import script looks for; the JSON after it is the record. */
export const dataMarker = "found42-review-feedback";

const short = (text: string, length = 70) =>
  text.length > length ? `${text.slice(0, length - 1)}…` : text;

/** One line saying what the change is, beside a label that already names the target. */
export function summarize(change: Change) {
  switch (change.kind) {
    case "wording":
      return `Change to “${short(change.proposed, 90)}”`;
    case "content":
      return change.action === "remove"
        ? "Remove this"
        : `${change.action === "add" ? `Add ${change.position} this` : "Replace with"}: ${short(change.detail)}`;
    case "visual":
      return short(change.problem);
    case "layout":
      return {
        move: `Move ${change.position} “${change.relativeTo?.name}”`,
        remove: "Remove this",
        combine: `Combine with “${change.relativeTo?.name}”`,
        reorder: `Reorder: ${short(change.detail)}`,
        other: short(change.detail),
      }[change.action];
  }
}

/** Multi-line text as a Markdown quote, so it reads exactly as written. */
const quote = (text: string) =>
  text
    .split("\n")
    .map((line) => `> ${line}`.trimEnd())
    .join("\n");

function changeLines(change: Change) {
  switch (change.kind) {
    case "wording":
      return [
        "**Current text**",
        quote(change.current),
        "",
        "**Change it to**",
        quote(change.proposed),
      ];
    case "content":
      if (change.action === "remove") return ["**Remove this.**"];
      return [
        change.action === "add"
          ? `**Add ${change.position} this**`
          : "**Replace it with**",
        quote(change.detail),
      ];
    case "visual":
      return [
        "**What looks wrong**",
        quote(change.problem),
        "",
        "**What it should look or feel like**",
        quote(change.desired),
        ...(change.example
          ? ["", `**Example to follow:** ${change.example}`]
          : []),
      ];
    case "layout": {
      const action = {
        move: `**Move it ${change.position} “${change.relativeTo?.name}”.**`,
        remove: "**Remove it.**",
        combine: `**Combine it with “${change.relativeTo?.name}”.**`,
        reorder: "**New order**",
        other: "**What should change**",
      }[change.action];
      return [
        action,
        ...(change.detail
          ? [
              ...(change.action === "reorder" || change.action === "other"
                ? []
                : ["", "**Notes**"]),
              quote(change.detail),
            ]
          : []),
      ];
    }
  }
}

export function itemMarkdown(item: FeedbackItem, number: number) {
  const { target } = item;
  const seen = [
    `${target.viewport.width} × ${target.viewport.height} (${screenName(target.viewport)})`,
    ...target.state,
  ].join(" · ");
  return [
    `## ${number}. ${kindNames[item.change.kind]} · ${priorityNames[item.priority]}`,
    "",
    `**Where:** ${target.pageName} › ${target.section} › ${targetLabel(target)}`,
    "",
    ...changeLines(item.change),
    "",
    "**Why**",
    quote(item.why),
    "",
    ...(item.everywhere
      ? ["**Applies everywhere this appears on the site.**", ""]
      : []),
    `<sub>Page \`${target.page}\` · element \`${target.selector}\` · seen at ${seen}</sub>`,
  ].join("\n");
}

const slug = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "reviewer";

/** The file a reviewer sends: readable first, the importable record last. */
export function feedbackFile(
  items: FeedbackItem[],
  reviewer: string,
  { now = new Date(), site = new URL(sitePath(), location.href).href } = {},
) {
  const date = now.toISOString().slice(0, 10);
  const pages = new Set(items.map(({ target }) => target.page)).size;
  const record = {
    format: dataMarker,
    version: 1,
    exported: now.toISOString(),
    reviewer,
    site,
    items,
  };
  const text = [
    `# Website feedback from ${reviewer} · ${date}`,
    "",
    `${items.length} ${items.length === 1 ? "item" : "items"} across ${pages} ${pages === 1 ? "page" : "pages"}, made with the preview's review mode.`,
    "",
    ...items.flatMap((item, i) => [itemMarkdown(item, i + 1), ""]),
    "---",
    "",
    `Import data (keep this part when you send it): ${dataMarker}`,
    "",
    "```json",
    JSON.stringify(record, null, 2),
    "```",
    "",
  ].join("\n");
  return { name: `found42-feedback-${slug(reviewer)}-${date}.md`, text };
}

export interface FeedbackRecord {
  format: typeof dataMarker;
  version: 1;
  exported: string;
  reviewer: string;
  site: string;
  items: FeedbackItem[];
}

/**
 * Reads the record back out of a sent file, or out of anything it was pasted
 * into, since the data block survives around whatever a chat app did to the
 * readable part.
 */
export function parseFeedbackFile(text: string): FeedbackRecord {
  const blocks = [...text.matchAll(/```json\s*\n([\s\S]*?)\n```/g)].reverse();
  for (const [, json] of blocks) {
    let record: FeedbackRecord | undefined;
    try {
      record = JSON.parse(json);
    } catch {
      continue;
    }
    if (record?.format !== dataMarker) continue;
    if (record.version !== 1 || !Array.isArray(record.items))
      throw new Error("This isn't version 1 review-mode feedback.");
    return record;
  }
  throw new Error(
    `No review-mode data found. The file should end with a JSON block marked "${dataMarker}".`,
  );
}
