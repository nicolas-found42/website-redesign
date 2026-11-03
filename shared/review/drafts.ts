import type { FeedbackItem } from "./model";
import type { Outcome } from "./submission-contract";
import { versionSlug } from "./paths";

export type DeliveryReceipt = Outcome & { label: string };

/**
 * The on-disk shape of one version's drafts. `version` is the format number,
 * not the site version; bump it only for an incompatible change.
 */
export interface DraftRecord {
  version: 1;
  reviewer: string;
  items: FeedbackItem[];
  receipts?: DeliveryReceipt[];
  published?: string[];
  uploadedScreenshots?: string[];
}

/** Every version shares one origin, so drafts are kept apart by version. */
export const draftStorageKey = `found42-review:feedback:${versionSlug}`;

export const emptyDrafts = (reviewer = ""): DraftRecord => ({
  version: 1,
  reviewer,
  items: [],
});

function isDraftRecord(value: unknown): value is DraftRecord {
  return (
    !!value &&
    typeof value === "object" &&
    "version" in value &&
    value.version === 1 &&
    "reviewer" in value &&
    typeof value.reviewer === "string" &&
    "items" in value &&
    Array.isArray(value.items)
  );
}

/**
 * Reads the drafts for this version. Unreadable or refused storage means none:
 * a corrupted list must never break the page or the review entry point.
 */
export function readSavedDrafts(): DraftRecord | null {
  try {
    const saved: unknown = JSON.parse(
      localStorage.getItem(draftStorageKey) ?? "null",
    );
    return isDraftRecord(saved) ? saved : null;
  } catch {
    return null;
  }
}

/**
 * Where drafts wait between visits. The ledger owns what a draft means; this
 * seam owns only how a record survives the page.
 */
export interface DraftStorage {
  /** The last written record, or null when none is readable. */
  read(): DraftRecord | null;
  /**
   * Stores `record`. A quota failure may store `fallback` (the same drafts
   * without images) instead, so the written words survive. Returns the record
   * that was kept, or null when the browser refused both.
   */
  write(record: DraftRecord, fallback?: DraftRecord): DraftRecord | null;
  /** False once this page has seen storage refuse every version of a write. */
  readonly persistent: boolean;
}

/** localStorage, with a probe so an unwritable browser is known up front. */
export function browserDraftStorage(): DraftStorage {
  let persistent = true;
  try {
    localStorage.setItem(`${draftStorageKey}:probe`, "1");
    localStorage.removeItem(`${draftStorageKey}:probe`);
  } catch {
    persistent = false;
  }
  return {
    get persistent() {
      return persistent;
    },
    read: readSavedDrafts,
    write(record, fallback) {
      if (!persistent) return null;
      for (const candidate of fallback ? [record, fallback] : [record]) {
        try {
          localStorage.setItem(draftStorageKey, JSON.stringify(candidate));
          return candidate;
        } catch {
          /* A full quota rejects the image, not necessarily the words. */
        }
      }
      persistent = false;
      return null;
    },
  };
}

/** A page-lifetime ledger for tests and for a browser that refuses storage. */
export function memoryDraftStorage(
  initial: DraftRecord = emptyDrafts(),
): DraftStorage & { current(): DraftRecord } {
  let record = initial;
  return {
    persistent: false,
    read: () => record,
    write(next, fallback) {
      record = fallback ?? next;
      return record;
    },
    current: () => record,
  };
}
