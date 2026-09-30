import {
  fingerprint,
  maxBatch,
  maxRequestBytes,
  validIssue,
  type Outcome,
  type Submission,
} from "./submission-contract";
import type { FeedbackItem, Store, DeliveryReceipt } from "./store";
import { targetLabel } from "./target";

export const submissionUrl = import.meta.env.VITE_REVIEW_SUBMISSION_URL;
export const sendLabel = (count: number) =>
  `Send ${count} feedback ${count === 1 ? "item" : "items"}`;
const pending =
  "We could not confirm delivery. Your draft is saved. Retry later to check whether its issue was created.";

/** Sends the captured versions in bounded chunks, retaining every uncertain item. */
export async function submitDrafts(
  store: Store,
  site: string,
  progress: (done: number, total: number) => void,
) {
  if (navigator.locks)
    return navigator.locks.request("found42-review:submission", () =>
      sendSnapshot(store, site, progress),
    );
  return sendSnapshot(store, site, progress);
}

async function sendSnapshot(
  store: Store,
  site: string,
  progress: (done: number, total: number) => void,
) {
  const snapshot = structuredClone(store.items());
  const receipts: DeliveryReceipt[] = [];
  const remember = (item: FeedbackItem, outcome: Outcome) =>
    receipts.push({
      ...outcome,
      label: `${item.target.pageName} › ${targetLabel(item.target)}`,
    });
  let revised = false;
  progress(0, snapshot.length);
  for (let offset = 0; offset < snapshot.length;) {
    const items: FeedbackItem[] = [];
    while (offset < snapshot.length && items.length < maxBatch) {
      const next = snapshot[offset];
      const proposed: Submission = {
        version: 1,
        site,
        items: [...items, next],
      };
      if (
        items.length &&
        new TextEncoder().encode(JSON.stringify(proposed)).byteLength >
          maxRequestBytes
      )
        break;
      items.push(next);
      offset++;
    }
    const hashes = await Promise.all(
      items.map((item) => fingerprint(site, item)),
    );
    let results: unknown[] = [];
    let failure = pending;
    try {
      if (!submissionUrl) throw new Error("unconfigured");
      if (!navigator.onLine) throw new Error("offline");
      const response = await fetch(submissionUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version: 1, site, items }),
        signal: AbortSignal.timeout(25_000),
      });
      if (!response.ok) {
        failure =
          response.status === 429
            ? "Sending is temporarily limited. Your draft is saved. Please retry later."
            : response.status === 400 ||
                response.status === 413 ||
                response.status === 422
              ? "This feedback could not be accepted. Your draft is saved; check its length and details before retrying."
              : "The submission service is temporarily unavailable. Your draft is saved. Please retry later.";
      } else {
        const data: unknown = await response.json();
        if (
          data &&
          typeof data === "object" &&
          "outcomes" in data &&
          Array.isArray(data.outcomes)
        )
          results = data.outcomes;
      }
    } catch {
      if (!submissionUrl)
        failure =
          "Sending is not available yet. Your draft is saved. Please contact the team or download a backup.";
      else if (!navigator.onLine)
        failure =
          "You’re offline. Your draft is saved. Reconnect and send again.";
    }
    items.forEach((item, index) => {
      const hash = hashes[index];
      const candidates = results.filter(
        (value) =>
          value &&
          typeof value === "object" &&
          "id" in value &&
          (value.id === item.id ||
            ("inputIndex" in value &&
              value.inputIndex === index &&
              "status" in value &&
              value.status === "invalid" &&
              "fingerprint" in value &&
              value.fingerprint === "")),
      );
      const outcome =
        candidates.length === 1
          ? (candidates[0] as Partial<Outcome>)
          : undefined;
      if (
        outcome &&
        typeof outcome.message === "string" &&
        ["confirmed", "retryable", "invalid", "pending"].includes(
          outcome.status ?? "",
        ) &&
        (outcome.fingerprint === hash ||
          (outcome.status === "invalid" && outcome.fingerprint === ""))
      ) {
        if (outcome.status === "confirmed") {
          if (validIssue(outcome.issue)) {
            revised = store.confirmSubmitted(item) || revised;
            remember(item, { ...outcome, id: item.id } as Outcome);
            return;
          }
        } else {
          remember(item, { ...outcome, id: item.id } as Outcome);
          return;
        }
      }
      remember(item, {
        id: item.id,
        fingerprint: hash,
        status: "pending",
        message: failure,
      });
    });
    store.setReceipts(receipts);
    progress(receipts.length, snapshot.length);
    // Stop after a transport/service failure to avoid hammering a quota-limited
    // endpoint; all remaining snapshot items still get explicit receipts.
    if (
      !results.length ||
      receipts
        .slice(-items.length)
        .some(
          (outcome) =>
            outcome.status === "retryable" || outcome.status === "pending",
        )
    ) {
      for (const item of snapshot.slice(offset))
        remember(item, {
          id: item.id,
          fingerprint: await fingerprint(site, item),
          status: "pending",
          message: failure,
        });
      break;
    }
  }
  store.setReceipts(receipts);
  return { receipts, revised };
}
