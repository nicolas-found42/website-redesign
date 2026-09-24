import type { Target } from "./target";

export type Kind = "wording" | "content" | "visual" | "layout";
export type Priority = "must" | "should" | "nice";

/** Each kind asks for the answer that kind of feedback is missing without it. */
export type Change =
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

export interface FeedbackItem {
  id: string;
  created: string;
  updated?: string;
  reviewer: string;
  target: Target;
  change: Change;
  /** The change applies wherever the same thing appears on the site. */
  everywhere: boolean;
  why: string;
  priority: Priority;
}

interface Saved {
  version: 1;
  reviewer: string;
  items: FeedbackItem[];
}

const key = "found42-review:feedback";

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
      const saved = JSON.parse(localStorage.getItem(key) ?? "null");
      if (saved?.version === 1 && Array.isArray(saved.items)) memory = saved;
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
    reviewer: () => read().reviewer,
    setReviewer: (reviewer: string) => write({ ...read(), reviewer }),
    save(item: FeedbackItem) {
      const saved = read();
      const at = saved.items.findIndex(({ id }) => id === item.id);
      const items =
        at < 0
          ? [...saved.items, item]
          : saved.items.map((existing, i) => (i === at ? item : existing));
      write({ ...saved, items });
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
