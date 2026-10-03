import {
  fingerprint,
  submissionItem,
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
const storageLock = "found42-review:submission-lock";

async function withSubmissionLock<T>(run: () => Promise<T>): Promise<T> {
  if (navigator.locks)
    return navigator.locks.request("found42-review:submission", run);

  // Web Locks is not available in every supported browser. localStorage writes
  // are synchronous across same-origin tabs, so a short renewable lease keeps
  // those browsers from starting duplicate sends at the same time.
  const owner = `${Date.now()}-${Math.random()}`;
  const leaseMs = 30_000;
  const lockValue = () =>
    JSON.stringify({ owner, expires: Date.now() + leaseMs });
  const acquire = (): boolean | undefined => {
    try {
      const current: unknown = JSON.parse(
        localStorage.getItem(storageLock) ?? "null",
      );
      if (
        current &&
        typeof current === "object" &&
        "expires" in current &&
        typeof current.expires === "number" &&
        current.expires > Date.now()
      )
        return false;
      const value = lockValue();
      localStorage.setItem(storageLock, value);
      return localStorage.getItem(storageLock) === value;
    } catch {
      return undefined;
    }
  };

  while (true) {
    const acquired = acquire();
    if (acquired === undefined) return run();
    if (acquired) break;
    await new Promise((resolve) => window.setTimeout(resolve, 50));
  }

  const renew = window.setInterval(() => {
    try {
      const current: unknown = JSON.parse(
        localStorage.getItem(storageLock) ?? "null",
      );
      if (
        current &&
        typeof current === "object" &&
        "owner" in current &&
        current.owner === owner
      )
        localStorage.setItem(storageLock, lockValue());
    } catch {
      /* The lease will expire if storage stops being available. */
    }
  }, leaseMs / 3);
  try {
    return await run();
  } finally {
    window.clearInterval(renew);
    try {
      const current: unknown = JSON.parse(
        localStorage.getItem(storageLock) ?? "null",
      );
      if (
        current &&
        typeof current === "object" &&
        "owner" in current &&
        current.owner === owner
      )
        localStorage.removeItem(storageLock);
    } catch {
      /* A future send can take over when the lease expires. */
    }
  }
}

async function uploadEvidence(
  store: Store,
  item: FeedbackItem,
): Promise<string | undefined> {
  const image = item.screenshot;
  if (!image || store.uploadedScreenshots().includes(image.sha256)) return;
  if (!submissionUrl)
    return "Screenshot delivery is not configured. Your draft is saved; send text without the image or try later.";
  try {
    if (!image.dataUrl?.startsWith("data:image/png;base64,"))
      return "Saved screenshot pixels are missing. Replace the image or send text without it.";
    const bytes = Uint8Array.from(atob(image.dataUrl.split(",")[1]), (char) =>
      char.charCodeAt(0),
    );
    const response = await fetch(
      new URL(`/screenshots/${image.sha256}`, submissionUrl),
      {
        method: "POST",
        headers: { "Content-Type": "image/png" },
        body: bytes,
        signal: AbortSignal.timeout(25_000),
      },
    );
    if (!response.ok) {
      if (response.status === 429)
        return "Screenshot uploads are temporarily limited. Your draft is saved. Retry later or send text without the image.";
      if (response.status === 507)
        return "Free screenshot storage is full. Your draft is saved. Send text without the image or contact the team.";
      if ([400, 413, 415, 422].includes(response.status))
        return "This screenshot could not be accepted. Replace it with a smaller PNG or send text without it. Your written draft is saved.";
      return "Screenshot service is temporarily unavailable. Your draft is saved. Retry or send text without the image.";
    }
    const receipt = (await response.json()) as {
      sha256?: unknown;
      width?: unknown;
      height?: unknown;
    };
    if (
      receipt.sha256 === image.sha256 &&
      receipt.width === image.width &&
      receipt.height === image.height
    ) {
      store.confirmScreenshot(image.sha256);
      return;
    }
  } catch {
    /* An immutable upload can safely be repeated after an uncertain response. */
  }
  return "Screenshot upload could not be confirmed. Your draft is saved. Reconnect and retry or send text without the image.";
}

/** Sends the captured versions in bounded chunks, retaining every uncertain item. */
export async function submitDrafts(
  store: Store,
  site: string,
  progress: (done: number, total: number) => void,
) {
  return withSubmissionLock(() => sendSnapshot(store, site, progress));
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
      const imageFailure = await uploadEvidence(store, next);
      if (imageFailure) {
        remember(next, {
          id: next.id,
          fingerprint: await fingerprint(site, next),
          status: "retryable",
          reason: "screenshot",
          message: imageFailure,
        });
        offset++;
        store.setReceipts(receipts);
        progress(receipts.length, snapshot.length);
        continue;
      }
      const proposed: Submission = {
        version: 1,
        site,
        items: [...items, next].map(submissionItem),
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
    if (!items.length) continue;
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
        body: JSON.stringify({
          version: 1,
          site,
          items: items.map(submissionItem),
        }),
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
          "Sending isn’t set up on this site yet, so nothing was posted. Your words are saved in this browser — choose Copy my feedback as text and email it to the team, or try again later.";
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
          if (outcome.reason === "screenshot" && item.screenshot)
            store.forgetScreenshot(item.screenshot.sha256);
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
