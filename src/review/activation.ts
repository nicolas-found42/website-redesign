/**
 * Review mode is for the team, never a visitor. It starts only from a review
 * link (`?review`) and lasts for the tab's session, so it survives the plain
 * links between pages; `?review=off` or the toolbar's Exit ends it. Without
 * session storage it lasts only for the page the link opened.
 *
 * This module is also where a reviewer who arrives without the link can be
 * offered a way back: `mountReviewEntry` adds one quiet line when this browser
 * already holds unsent drafts. It deliberately loads no review code, so a
 * first-time visitor still fetches nothing and sees nothing.
 */
const flag = "found42-review:active";

export function reviewRequested(url = new URL(location.href)) {
  const param = url.searchParams.get("review");
  try {
    if (param === "off") sessionStorage.removeItem(flag);
    else if (param !== null) sessionStorage.setItem(flag, "on");
    return param !== "off" && sessionStorage.getItem(flag) === "on";
  } catch {
    return param !== null && param !== "off";
  }
}

export function endReviewSession() {
  try {
    sessionStorage.removeItem(flag);
  } catch {
    /* Nothing was kept, so nothing needs ending. */
  }
}

/**
 * The list `store.ts` writes; read defensively because it is on disk and only
 * "unreadable means none" keeps a corrupted list from breaking the site.
 */
const savedKey = "found42-review:feedback";

/** How many unsent drafts this browser holds; 0 when none or unreadable. */
export function savedDraftCount(): number {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(savedKey) ?? "null");
    if (
      saved &&
      typeof saved === "object" &&
      "version" in saved &&
      saved.version === 1 &&
      "items" in saved &&
      Array.isArray(saved.items)
    )
      return saved.items.length;
  } catch {
    /* Unreadable or refused storage is the same as no drafts. */
  }
  return 0;
}

/**
 * The same page with `?review` added, so it keeps its path, other query params
 * and hash, and a stale `?review=off` cannot keep review mode off.
 */
export function reviewEntryHref(href: string): string {
  const url = new URL(href);
  url.searchParams.delete("review");
  const rest = url.searchParams.toString();
  url.search = rest ? `?${rest}&review` : "?review";
  return `${url.pathname}${url.search}${url.hash}`;
}

const entryId = "found42-review-entry";

/**
 * The entry point, inline in the site rather than in a shadow root: it is not
 * review chrome, and a shadow root would sit over the page until an observer
 * in review.ts removed it.
 */
const entryStyles = `#${entryId}{position:fixed;inset:auto 0 0 0;z-index:2147482000;display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;justify-content:center;padding:12px 16px;background:#20201f;color:#faf9f6;font-family:"Manrope Variable",Manrope,system-ui,sans-serif;font-size:15px;line-height:1.4;text-align:center}
#${entryId} .found42-entry-action{display:inline-flex;align-items:center;min-height:32px;padding:7px 14px;border:1px solid #faf9f6;border-radius:8px;background:transparent;color:#faf9f6;font:inherit;font-weight:650;text-decoration:none;cursor:pointer}
#${entryId} .found42-entry-action:hover{background:#faf9f6;color:#20201f}
#${entryId} .found42-entry-action:focus-visible{outline:3px solid #8ab8ff;outline-offset:2px}`;

/**
 * Offers a path back into review mode when this browser holds unsent drafts.
 * On a review URL, for a first-time reviewer, or with drafts unreadable, it
 * adds nothing at all. Returns a disposer that removes whatever it added.
 */
export function mountReviewEntry(url = new URL(location.href)) {
  if (reviewRequested(url)) return () => {};
  const count = savedDraftCount();
  if (!count) return () => {};

  const items = `${count} unsent feedback ${count === 1 ? "item" : "items"}`;
  const entry = document.createElement("div");
  entry.id = entryId;
  entry.dataset.entryResume = "";

  const label = document.createElement("span");
  label.textContent = `You have ${items} saved in this browser.`;
  const action = document.createElement("a");
  action.className = "found42-entry-action";
  action.href = reviewEntryHref(url.href);
  action.textContent = "Resume review";
  // The visible text already says what is resumed; the title names the path.
  action.title = "Continue reviewing the site and send your saved feedback";
  entry.append(label, action);

  const style = document.createElement("style");
  style.textContent = entryStyles;
  document.head.append(style);
  document.body.append(entry);

  const dispose = () => {
    entry.remove();
    style.remove();
  };
  entry.addEventListener("click", (event) => {
    // The browser is leaving for the review URL; drop the bar now so it never
    // shows again in the bfcache snapshot of this page.
    if (event.target instanceof Element && event.target.closest("a")) dispose();
  });
  return dispose;
}

/**
 * Called from module scope below. `main.ts` imports this module to ask whether
 * review mode is on, and that import is the only startup hook a visitor's page
 * gets: it is the smallest place this nudge can live without review code in
 * the main bundle. Moving the call into `main.ts` — `mountReviewEntry();`
 * beside the existing `reviewRequested()` check, imported on line 6 — is tidy
 * but changes nothing a reviewer sees.
 */
export function bootstrapReviewEntry(url = new URL(location.href)) {
  if (!document.body || document.getElementById(entryId)) return () => {};
  return mountReviewEntry(url);
}

if (typeof document !== "undefined" && typeof location !== "undefined") {
  try {
    bootstrapReviewEntry();
  } catch {
    /* A visitor who cannot read storage simply sees no nudge. */
  }
}
