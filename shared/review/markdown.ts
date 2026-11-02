import type { Change, FeedbackItem, Kind, Priority } from "./model";
import { screenName, sectionGloss, targetLabel } from "./target-meta";

export const kindNames: Record<Kind, string> = {
  comment: "Comment (not classified)",
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

const short = (text: string, length = 70) =>
  text.length > length ? `${text.slice(0, length - 1)}…` : text;

/** One line saying what the change is, beside a label that already names the target. */
export function summarize(change: Change) {
  switch (change.kind) {
    case "comment":
      return short(change.detail);
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
    case "comment":
      return ["**Comment**", quote(change.detail)];
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
    ...(item.kindUncertain
      ? [
          "**Kind:** The reviewer chose “Not sure yet”; classification remains provisional.",
          "",
        ]
      : []),
    `**Where:** ${target.pageName} › ${sectionGloss(target.section)} › ${targetLabel(target)}`,
    "",
    ...changeLines(item.change),
    "",
    ...(item.change.kind === "comment" && item.change.detail === item.why
      ? []
      : ["**Why**", quote(item.why), ""]),
    ...(item.everywhere
      ? ["**Applies everywhere this appears on the site.**", ""]
      : []),
    `<sub>Page \`${target.page}\` · element \`${target.selector}\` · seen at ${seen}</sub>`,
  ].join("\n");
}
