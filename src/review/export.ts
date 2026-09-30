import type { FeedbackItem } from "./model";
import { sitePath } from "../paths";
import { itemMarkdown } from "./markdown";
export { itemMarkdown, kindNames, priorityNames, summarize } from "./markdown";

/** The marker the import script looks for; the JSON after it is the record. */
export const dataMarker = "found42-review-feedback";

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
    let record: unknown;
    try {
      record = JSON.parse(json);
    } catch {
      continue;
    }
    if (
      !record ||
      typeof record !== "object" ||
      !("format" in record) ||
      record.format !== dataMarker
    )
      continue;
    if (
      !("version" in record) ||
      record.version !== 1 ||
      !("items" in record) ||
      !Array.isArray(record.items)
    )
      throw new Error("This isn't version 1 review-mode feedback.");
    return record as FeedbackRecord;
  }
  throw new Error(
    `No review-mode data found. The file should end with a JSON block marked "${dataMarker}".`,
  );
}
