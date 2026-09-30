import type { FeedbackItem } from "./model";
import { elementNames } from "./elements";

export const repository = "nicolas-found42/website-redesign";
export const publicSite = "https://nicolas-found42.github.io/website-redesign/";
export const maxBatch = 3;
export const maxRequestBytes = 64_000;
export const maxItemBytes = 20_000;

export interface Submission {
  version: 1;
  site: string;
  items: FeedbackItem[];
}
export interface Outcome {
  id: string;
  fingerprint: string;
  status: "confirmed" | "retryable" | "invalid" | "pending";
  message: string;
  reason?: "content-conflict" | "unknown-page";
  inputIndex?: number;
  issue?: { number: number; url: string };
}

/** Property order is irrelevant; every submitted field is part of its version. */
export function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .filter((key) => record[key] !== undefined)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonical(record[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}
export async function fingerprint(site: string, item: FeedbackItem) {
  const bytes = new TextEncoder().encode(canonical({ site, item }));
  return Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
    (byte) => byte.toString(16).padStart(2, "0"),
  ).join("");
}

const object = (
  value: unknown,
  keys: string[],
): value is Record<string, unknown> =>
  !!value &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  Object.keys(value).every((key) => keys.includes(key));
const text = (value: unknown, max: number, required = true): value is string =>
  typeof value === "string" &&
  value.length <= max &&
  (!required || !!value.trim()) &&
  !Array.from(value).some((char) => {
    const code = char.charCodeAt(0);
    return (code < 32 && ![9, 10, 13].includes(code)) || code === 127;
  });
const oneOf = (value: unknown, allowed: string[]) =>
  typeof value === "string" && allowed.includes(value);
const date = (value: unknown) =>
  text(value, 40) &&
  Number.isFinite(Date.parse(value)) &&
  new Date(value).toISOString() === value;
export const pages = [
  "/",
  "/services/",
  "/industries/private-equity/",
  "/industries/b2b-saas/",
  "/resources/",
  "/about/",
  "/blog/",
];

/** Reject unknown fields at every level, including arbitrary GitHub commands. */
export function validItem(value: unknown): value is FeedbackItem {
  if (
    !object(value, [
      "id",
      "created",
      "updated",
      "reviewer",
      "target",
      "change",
      "everywhere",
      "why",
      "priority",
    ])
  )
    return false;
  if (
    !text(value.id, 80) ||
    !/^[a-zA-Z0-9-]+$/.test(value.id) ||
    !date(value.created) ||
    (value.updated !== undefined && !date(value.updated)) ||
    !text(value.reviewer, 100) ||
    !text(value.why, 4000) ||
    typeof value.everywhere !== "boolean" ||
    !oneOf(value.priority, ["must", "should", "nice"])
  )
    return false;
  const target = value.target;
  if (
    !object(target, [
      "page",
      "pageName",
      "section",
      "element",
      "selector",
      "text",
      "state",
      "viewport",
    ]) ||
    !oneOf(target.page, pages) ||
    !text(target.pageName, 100) ||
    !text(target.section, 300) ||
    !oneOf(target.element, elementNames) ||
    !text(target.selector, 1000) ||
    !text(target.text, 4000, false) ||
    !Array.isArray(target.state) ||
    target.state.length > 20 ||
    !target.state.every((s) => text(s, 200))
  )
    return false;
  const viewport = target.viewport;
  if (
    !object(viewport, ["width", "height"]) ||
    ![viewport.width, viewport.height].every(
      (n) =>
        typeof n === "number" && Number.isInteger(n) && n > 0 && n <= 20000,
    )
  )
    return false;
  const change = value.change;
  if (
    !object(change, [
      "kind",
      "current",
      "proposed",
      "action",
      "position",
      "detail",
      "problem",
      "desired",
      "example",
      "relativeTo",
    ])
  )
    return false;
  switch (change.kind) {
    case "wording":
      return (
        object(change, ["kind", "current", "proposed"]) &&
        text(change.current, 4000, false) &&
        text(change.proposed, 4000) &&
        change.current !== change.proposed
      );
    case "content":
      return (
        object(change, ["kind", "action", "position", "detail"]) &&
        oneOf(change.action, ["add", "remove", "replace"]) &&
        text(change.detail, 4000, change.action !== "remove") &&
        (change.action === "add"
          ? oneOf(change.position, ["before", "after", "inside"])
          : change.position === undefined)
      );
    case "visual":
      return (
        object(change, ["kind", "problem", "desired", "example"]) &&
        text(change.problem, 4000) &&
        text(change.desired, 4000) &&
        text(change.example, 1000, false)
      );
    case "layout": {
      if (
        !object(change, [
          "kind",
          "action",
          "position",
          "relativeTo",
          "detail",
        ]) ||
        !oneOf(change.action, [
          "move",
          "remove",
          "combine",
          "reorder",
          "other",
        ]) ||
        !text(
          change.detail,
          4000,
          change.action === "reorder" || change.action === "other",
        )
      )
        return false;
      if (
        change.action === "move" &&
        !oneOf(change.position, ["above", "below"])
      )
        return false;
      if (change.action !== "move" && change.position !== undefined)
        return false;
      return change.action === "move" || change.action === "combine"
        ? object(change.relativeTo, ["name", "selector"]) &&
            text(change.relativeTo.name, 300) &&
            text(change.relativeTo.selector, 1000)
        : change.relativeTo === undefined;
    }
    default:
      return false;
  }
}

export function validEnvelope(
  value: unknown,
): value is { version: 1; site: string; items: unknown[] } {
  return (
    object(value, ["version", "site", "items"]) &&
    value.version === 1 &&
    value.site === publicSite &&
    Array.isArray(value.items) &&
    value.items.length > 0 &&
    value.items.length <= maxBatch
  );
}

export function validIssue(
  value: unknown,
): value is NonNullable<Outcome["issue"]> {
  return (
    object(value, ["number", "url"]) &&
    typeof value.number === "number" &&
    Number.isSafeInteger(value.number) &&
    value.number > 0 &&
    value.url === `https://github.com/${repository}/issues/${value.number}`
  );
}
