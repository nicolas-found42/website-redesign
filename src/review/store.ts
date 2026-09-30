import { canonical, type Outcome } from "./submission-contract";
import type { FeedbackItem } from "./model";
export type { Kind, Priority, Change, FeedbackItem } from "./model";

export type DeliveryReceipt = Outcome & { label: string };

interface Saved {
  version: 1;
  reviewer: string;
  items: FeedbackItem[];
  receipts?: DeliveryReceipt[];
  published?: string[];
}

export const storageKey = "found42-review:feedback";
const key = storageKey;
const content = (item: FeedbackItem) => {
  const fields: Partial<FeedbackItem> = { ...item };
  delete fields.created;
  delete fields.updated;
  return canonical(fields);
};

/**
 * Feedback waits in this browser until the reviewer sends it, across pages and
 * visits. Every change rereads what is saved first, so two open tabs add to
 * the same list instead of overwriting each other. When storage is refused the
 * list lives only as long as the page, and `persistent` says so.
 */
export function createStore() {
  let memory: Saved = { version: 1, reviewer: "", items: [] };
  let persistent = true;
  try {
    localStorage.setItem(`${key}:probe`, "1");
    localStorage.removeItem(`${key}:probe`);
  } catch {
    persistent = false;
  }

  const read = (): Saved => {
    if (!persistent) return memory;
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(key) ?? "null");
      if (
        saved &&
        typeof saved === "object" &&
        "version" in saved &&
        saved.version === 1 &&
        "reviewer" in saved &&
        typeof saved.reviewer === "string" &&
        "items" in saved &&
        Array.isArray(saved.items)
      )
        memory = saved as Saved;
    } catch {
      /* An unreadable list keeps the last one this page knew. */
    }
    return memory;
  };
  const write = (next: Saved) => {
    memory = next;
    if (!persistent) return;
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      persistent = false;
    }
  };

  return {
    get persistent() {
      return persistent;
    },
    items: () => read().items,
    receipts: () => read().receipts ?? [],
    setReceipts(receipts: DeliveryReceipt[]) {
      const saved = read();
      const merged = new Map(
        (saved.receipts ?? []).map((receipt) => [receipt.id, receipt]),
      );
      for (const receipt of receipts) {
        if (merged.get(receipt.id)?.status !== "confirmed")
          merged.set(receipt.id, receipt);
      }
      write({ ...saved, receipts: [...merged.values()] });
    },
    reviewer: () => read().reviewer,
    setReviewer: (reviewer: string) => write({ ...read(), reviewer }),
    save(item: FeedbackItem) {
      const saved = read();
      if (saved.published?.includes(item.id)) item = { ...item, id: newId() };
      const at = saved.items.findIndex(({ id }) => id === item.id);
      const items =
        at < 0
          ? [...saved.items, item]
          : saved.items.map((existing, i) => (i === at ? item : existing));
      write({ ...saved, items });
    },
    confirmSubmitted(submitted: FeedbackItem) {
      const saved = read();
      const current = saved.items.find((item) => item.id === submitted.id);
      const revised = current && content(current) !== content(submitted);
      write({
        ...saved,
        published: [...new Set([...(saved.published ?? []), submitted.id])],
        items: saved.items.flatMap((item) =>
          item.id !== submitted.id
            ? [item]
            : revised
              ? [{ ...item, id: newId() }]
              : [],
        ),
      });
      return !!revised;
    },
    saveAsNew(id: string) {
      const saved = read();
      if (!saved.items.some((item) => item.id === id)) return false;
      write({
        ...saved,
        published: [...new Set([...(saved.published ?? []), id])],
        items: saved.items.map((item) =>
          item.id === id ? { ...item, id: newId() } : item,
        ),
      });
      return true;
    },
    remove(id: string) {
      const saved = read();
      write({ ...saved, items: saved.items.filter((item) => item.id !== id) });
    },
    clear: () => write({ ...read(), items: [] }),
  };
}

export type Store = ReturnType<typeof createStore>;

export const newId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
