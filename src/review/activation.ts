/**
 * Review mode is for the team, never a visitor. It starts only from a review
 * link (`?review`) and lasts for the tab's session, so it survives the plain
 * links between pages; `?review=off` or the toolbar's Exit ends it. Without
 * session storage it lasts only for the page the link opened.
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
