import { canonical } from "./submission-contract";
import { revisionOf } from "./submission-contract";
import {
  browserDraftStorage,
  emptyDrafts,
  type DeliveryReceipt,
  type DraftRecord,
  type DraftStorage,
} from "./drafts";
import type { FeedbackItem } from "./model";
export type { Kind, Priority, Change, FeedbackItem } from "./model";
export type { DeliveryReceipt } from "./drafts";

/**
 * Everything a reviewer can do to their drafts. The ledger is the only writer
 * of the saved record; callers describe a change instead of reaching into it.
 */
export type DraftAction =
  | { kind: "set-reviewer"; reviewer: string }
  | { kind: "save"; item: FeedbackItem }
  | { kind: "confirm-submitted"; item: FeedbackItem }
  | { kind: "save-as-new"; id: string }
  | { kind: "remove"; id: string }
  | { kind: "clear" }
  | { kind: "confirm-screenshot"; sha256: string }
  | { kind: "forget-screenshot"; sha256: string }
  | { kind: "set-receipts"; receipts: DeliveryReceipt[] };

export interface ApplyResult {
  /** False when this browser kept the change only in memory. */
  persisted: boolean;
  /** `save`: the record was kept without its screenshot to fit storage. */
  imageOmitted?: boolean;
  /** `confirm-submitted`: the published copy differed from what was sent. */
  revised?: boolean;
  /** `save-as-new`: the id was still a saved draft. */
  found?: boolean;
}

export interface DraftSnapshot {
  reviewer: string;
  items: FeedbackItem[];
  receipts: DeliveryReceipt[];
  uploadedScreenshots: string[];
  /** False once this page has seen storage refuse every version of a write. */
  persistent: boolean;
}

export interface DraftLedger {
  snapshot(): DraftSnapshot;
  apply(action: DraftAction): ApplyResult;
}

/**
 * Feedback waits in this browser until the reviewer sends it, across pages and
 * visits. Every change rereads what is saved first, so two open tabs add to
 * the same list instead of overwriting each other. When storage is refused the
 * list lives only as long as the page, and `persistent` says so.
 */
export function createDraftLedger(
  storage: DraftStorage = browserDraftStorage(),
): DraftLedger {
  let memory: DraftRecord = storage.read() ?? emptyDrafts();
  let dirty = false;
  // A refused write must stay visible on this page; other tabs' saved changes
  // are read until then, so two open tabs keep adding to one list.
  const read = (): DraftRecord => (dirty ? memory : (storage.read() ?? memory));

  /** Keeps the change even when storage refuses it, and reports which happened. */
  const keep = (next: DraftRecord, fallback?: DraftRecord): boolean => {
    memory = next;
    const written = storage.write(next, fallback);
    if (!written) {
      dirty = true;
      return false;
    }
    memory = written;
    dirty = false;
    return true;
  };

  const apply = (action: DraftAction): ApplyResult => {
    switch (action.kind) {
      case "set-reviewer":
        return {
          persisted: keep({ ...read(), reviewer: action.reviewer }),
        };
      case "save": {
        const saved = read();
        const item = saved.published?.includes(action.item.id)
          ? { ...action.item, id: newId() }
          : action.item;
        const at = saved.items.findIndex(({ id }) => id === item.id);
        const items =
          at < 0
            ? [...saved.items, item]
            : saved.items.map((existing, i) => (i === at ? item : existing));
        const next = { ...saved, items };
        if (!item.screenshot) return { persisted: keep(next) };
        const withoutImage = { ...item };
        delete withoutImage.screenshot;
        const fallback = {
          ...saved,
          items: items.map((entry) =>
            entry.id === item.id ? withoutImage : entry,
          ),
        };
        return {
          persisted: keep(next, fallback),
          imageOmitted: memory === fallback,
        };
      }
      case "confirm-submitted": {
        const saved = read();
        const current = saved.items.find((item) => item.id === action.item.id);
        const revised =
          !!current &&
          canonical(revisionOf(current)) !== canonical(revisionOf(action.item));
        return {
          revised,
          persisted: keep({
            ...saved,
            published: [
              ...new Set([...(saved.published ?? []), action.item.id]),
            ],
            items: saved.items.flatMap((item) =>
              item.id !== action.item.id
                ? [item]
                : revised
                  ? [{ ...item, id: newId() }]
                  : [],
            ),
          }),
        };
      }
      case "save-as-new": {
        const saved = read();
        if (!saved.items.some((item) => item.id === action.id))
          return { found: false, persisted: true };
        return {
          found: true,
          persisted: keep({
            ...saved,
            published: [...new Set([...(saved.published ?? []), action.id])],
            items: saved.items.map((item) =>
              item.id === action.id ? { ...item, id: newId() } : item,
            ),
          }),
        };
      }
      case "remove": {
        const saved = read();
        return {
          persisted: keep({
            ...saved,
            items: saved.items.filter((item) => item.id !== action.id),
          }),
        };
      }
      case "clear": {
        const saved = read();
        return { persisted: keep({ ...saved, items: [] }) };
      }
      case "confirm-screenshot": {
        const saved = read();
        return {
          persisted: keep({
            ...saved,
            uploadedScreenshots: [
              ...new Set([...(saved.uploadedScreenshots ?? []), action.sha256]),
            ],
          }),
        };
      }
      case "forget-screenshot": {
        const saved = read();
        return {
          persisted: keep({
            ...saved,
            uploadedScreenshots: (saved.uploadedScreenshots ?? []).filter(
              (sha) => sha !== action.sha256,
            ),
          }),
        };
      }
      case "set-receipts": {
        const saved = read();
        const merged = new Map(
          (saved.receipts ?? []).map((receipt) => [receipt.id, receipt]),
        );
        for (const receipt of action.receipts) {
          if (merged.get(receipt.id)?.status !== "confirmed")
            merged.set(receipt.id, receipt);
        }
        return {
          persisted: keep({ ...saved, receipts: [...merged.values()] }),
        };
      }
      default:
        throw new Error("Unknown draft action.");
    }
  };

  return {
    snapshot: (): DraftSnapshot => {
      const saved = read();
      return {
        reviewer: saved.reviewer,
        items: saved.items,
        receipts: saved.receipts ?? [],
        uploadedScreenshots: saved.uploadedScreenshots ?? [],
        persistent: storage.persistent,
      };
    },
    apply,
  };
}

export const newId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
