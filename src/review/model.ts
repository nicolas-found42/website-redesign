import type { ElementKind } from "./elements";

/**
 * What a piece of feedback points at, recorded so whoever acts on it can find
 * the exact element again: by selector while the markup holds, and by page,
 * section and text once it has moved.
 */
export interface Target {
  /** Path under the site, e.g. `/services/`. */
  page: string;
  pageName: string;
  section: string;
  /** What kind of thing it is: Heading, Paragraph, Image… */
  element: ElementKind;
  selector: string;
  /** The words it showed, or an image's description. */
  text: string;
  /** Choices the page was showing, e.g. `C-Level selected`. */
  state: string[];
  viewport: { width: number; height: number };
}

export type Kind = "wording" | "content" | "visual" | "layout" | "comment";
export type Priority = "must" | "should" | "nice";

/** Each kind asks for the answer that kind of feedback is missing without it. */
export type Change =
  | { kind: "comment"; detail: string }
  | { kind: "wording"; current: string; proposed: string }
  | {
      kind: "content";
      action: "add" | "remove" | "replace";
      /** Where an addition goes, relative to the target. */
      position?: "before" | "after" | "inside";
      detail: string;
    }
  | { kind: "visual"; problem: string; desired: string; example: string }
  | {
      kind: "layout";
      action: "move" | "remove" | "combine" | "reorder" | "other";
      position?: "above" | "below";
      /** The band it moves next to or combines with. */
      relativeTo?: { name: string; selector: string };
      detail: string;
    };

export interface Screenshot {
  sha256: string;
  width: number;
  height: number;
  source: "tab" | "file";
  captured: string;
  /** Local draft pixels; stripped from submission records and issue bodies. */
  dataUrl?: string;
}

export interface FeedbackItem {
  screenshot?: Screenshot;
  id: string;
  created: string;
  updated?: string;
  reviewer: string;
  target: Target;
  change: Change;
  /** The reviewer chose Not sure yet; change.kind was inferred from the fields. */
  kindUncertain?: true;
  /** The change applies wherever the same thing appears on the site. */
  everywhere: boolean;
  why: string;
  priority: Priority;
}
