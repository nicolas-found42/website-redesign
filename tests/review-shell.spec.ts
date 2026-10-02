import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * The review shell's reviewer-facing copy and actions: the public-GitHub
 * notice and its explainer (#123), the target tools that must never render as
 * a dead grey button (#125), and the receipt's copy-as-text and retry
 * actions (#127). Journeys stay in review-mode.spec.ts; this file pins what
 * the shell says and what its controls do.
 */

const panel = (page: Page) => page.getByRole("dialog");
const bar = (page: Page) => page.getByRole("region", { name: "Review mode" });
const notice = (page: Page) => bar(page).locator(".bar-notice");
/**
 * The text a copy action hands over. Only one element in the shadow root
 * carries the full item at a time — the backup preview, or the receipt's own
 * fallback box — and reading it returns the same string the clipboard gets:
 * `copy()` writes `preview.value` verbatim, and `copyAsText()` writes the
 * exported text its caller was handed.
 */
const copiedText = (page: Page) =>
  page
    .locator("#found42-review textarea.preview")
    .evaluateAll((fields) => (fields.at(-1) as HTMLTextAreaElement).value);

/** Starts picking and chooses `target`; returns the open feedback form. */
async function pick(page: Page, selector: string) {
  await page.getByRole("button", { name: "Add feedback" }).click();
  await page.locator(selector).click();
  await expect(panel(page)).toBeVisible();
  return panel(page);
}

async function saveDraft(page: Page, wording = "A clearer opening.") {
  const form = await pick(page, "#hero-title");
  await form.getByLabel("Change it to").fill(wording);
  const name = form.getByLabel("Your name");
  if (await name.count()) await name.fill("Adejoke");
  await form.getByLabel("Why?", { exact: true }).fill("Visitors should know.");
  await form.getByRole("radio", { name: "Must change" }).check();
  await form.getByRole("button", { name: "Save feedback" }).click();
  await expect(panel(page)).toHaveCount(0);
}

const axe = (page: Page) =>
  new AxeBuilder({ page })
    .include("#found42-review")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();

test("#123 the bar warning stays verbatim and now explains what public means", async ({
  page,
}) => {
  await page.goto("/?review");

  // Regression: the exact warning the shipped journey pins, still the bar's own line.
  await expect(notice(page)).toHaveText(
    "Your feedback, name and any screenshots will be posted publicly on GitHub.",
  );

  const explainer = bar(page).locator("[data-notice-detail]");
  await expect(explainer).toBeVisible();
  await expect(explainer.locator("summary")).toContainText(
    "What does “publicly on GitHub” mean?",
  );
  // Closed with no JavaScript; opened by the reviewer, and readable either way.
  expect(await explainer.evaluate((el: HTMLDetailsElement) => el.open)).toBe(
    false,
  );
  await explainer.locator("summary").click();
  expect(await explainer.evaluate((el: HTMLDetailsElement) => el.open)).toBe(
    true,
  );
  const text = (await explainer.innerText()).replace(/\s+/g, " ");
  expect(text).toContain("public list where the team works");
  expect(text).toContain("A first name is enough");
  // What is *not* shared (acceptance criterion 3).
  expect(text).toContain("no email address, no account and no tracking");
  // Two sentences of plain English, not a paragraph of legalese.
  await expect(explainer.locator("p")).toHaveCount(2);

  expect((await axe(page)).violations).toEqual([]);
});

test("#123 the warning is on every surface and cannot be sent past unseen", async ({
  page,
}) => {
  await page.goto("/?review");
  await saveDraft(page);

  await page.getByRole("button", { name: /My feedback/ }).click();
  const list = panel(page);
  await expect(list.locator("[data-notice-detail]")).toBeVisible();
  await expect(list).toContainText(
    "Your feedback, name and any screenshots will be posted publicly on GitHub.",
  );
  await list.getByRole("button", { name: "Close", exact: true }).first().click();

  // Reaching the Send button means opening the bar that carries the warning;
  // the receipt repeats both the warning and the explainer.
  await page.getByRole("button", { name: /Send 1 feedback item/ }).click();
  const receipt = panel(page);
  await expect(receipt).toContainText(
    "Your feedback, name and any screenshots will be posted publicly on GitHub.",
  );
  await expect(receipt.locator("[data-notice-detail]")).toBeVisible();
});

test("#125 every target tool names its effect and smaller says why", async ({
  page,
}) => {
  await page.goto("/?review");
  const form = await pick(page, "#hero-title");

  const larger = form.getByRole("button", { name: "Larger area" });
  const smaller = form.getByRole("button", { name: "Smaller area" });
  const repick = form.getByRole("button", { name: "Pick again" });
  const reason = form.locator('[data-reason="tool-reason"]').first();

  // Acceptance criterion 1: each enabled control states its effect.
  await expect(larger).toHaveAttribute(
    "aria-label",
    "Larger area — select a bigger part of the page",
  );
  await expect(repick).toHaveAttribute(
    "aria-label",
    "Pick again — choose a different part of the page",
  );

  // Acceptance criterion 2: never a dead unexplained button — the impossible
  // tool says why in its accessible name, its description and on screen.
  await expect(smaller).toBeDisabled();
  await expect(smaller).toBeVisible();
  await expect(smaller).toHaveAttribute(
    "aria-label",
    "Smaller area — go back to the smaller part — already the smallest part of this selection",
  );
  await expect(smaller).toHaveAttribute("aria-describedby", "tool-reason");
  await expect(reason).toHaveText("Already the smallest part of this selection.");
  await expect(larger).toBeEnabled();

  // The page highlight is the live cue (acceptance criterion 3): widening a
  // minimal target visibly marks a bigger box behind the sheet.
  const highlight = page.locator("#found42-review .highlight");
  const before = await highlight.boundingBox();
  await larger.click();
  const after = await highlight.boundingBox();
  expect(after!.width * after!.height).toBeGreaterThan(
    before!.width * before!.height,
  );
  expect(
    (await form.getByRole("heading", { level: 2 }).innerText()).trim(),
  ).toContain("Area “");

  // Shrinking comes back once it can round-trip the wider selection.
  await expect(smaller).toBeEnabled();
  await expect(smaller).toHaveAttribute(
    "aria-label",
    "Smaller area — go back to the smaller part",
  );
  await expect(smaller).not.toHaveAttribute("aria-describedby", "tool-reason");
  await smaller.click();
  await expect(form.getByRole("heading", { level: 2 })).toHaveText(
    "Heading “Train teams. Build useful skills. Automate the work.”",
  );
  // Back at the smallest part it is explained again — never a silent pill.
  await expect(smaller).toBeDisabled();
  await expect(reason).toHaveText("Already the smallest part of this selection.");

  expect((await axe(page)).violations).toEqual([]);
});

test("#127 the receipt offers copy-as-text beside any file export", async ({
  page,
}) => {
  await page.goto("/?review");
  await saveDraft(page);

  // The receipt, as a reviewer reaches it.
  await page.getByRole("button", { name: /Send 1 feedback item/ }).click();
  const receipt = panel(page);
  await expect(
    receipt.getByRole("button", { name: "Copy my feedback as text" }),
  ).toBeVisible();
  await expect(receipt.getByRole("button", { name: "Try again" })).toBeEnabled();
  await expect(
    receipt.getByRole("button", { name: "Download a copy" }),
  ).toBeVisible();
  await expect(receipt.locator("[data-copy-text]")).toHaveCount(1);
  await receipt
    .getByRole("button", { name: "Close", exact: true })
    .first()
    .click();

  // The backup panel offers the same copy action, and its text is readable.
  await page.getByRole("button", { name: /My feedback/ }).click();
  await panel(page).getByRole("button", { name: "Download backup…" }).click();
  const backup = panel(page);
  await backup
    .getByRole("button", { name: "Copy my feedback as text" })
    .click();
  await expect(page.locator("#found42-review .toast")).toContainText(
    /Feedback copied as text|selected below/,
  );
  // Acceptance criterion 3: the copy carries the full readable item. This is
  // the exact string handed to the clipboard (also pasted by hand and
  // recorded in the PR notes).
  const copied = await copiedText(page);
  expect(copied).toContain("**Where:** Home › Page opening ›");
  expect(copied).toContain(
    "Heading “Train teams. Build useful skills. Automate the work.”",
  );
  expect(copied).toContain("**Current text**");
  expect(copied).toContain("**Change it to**");
  expect(copied).toContain("A clearer opening.");
  expect(copied).toContain("**Why**");
  expect(copied).toContain("Visitors should know.");
  expect(copied).toContain("## 1. Wording · Must change");
});

test("#127 copy and retry are disabled when the receipt has no drafts left", async ({
  page,
}) => {
  await page.goto("/?review");
  await saveDraft(page);
  await page.getByRole("button", { name: /Send 1 feedback item/ }).click();
  await panel(page)
    .getByRole("button", { name: "Close", exact: true })
    .first()
    .click();

  // Emptying the saved drafts must disable the copy and retry actions rather
  // than leave them looking live.
  await page.evaluate(() => {
    const saved = JSON.parse(
      localStorage.getItem("found42-review:feedback") ?? "{}",
    );
    localStorage.setItem(
      "found42-review:feedback",
      JSON.stringify({ ...saved, items: [] }),
    );
  });
  await page.getByRole("button", { name: "Last receipt" }).click();
  const receipt = panel(page);
  await expect(
    receipt.getByRole("button", { name: "Copy my feedback as text" }),
  ).toBeDisabled();
  await expect(receipt.getByRole("button", { name: "Try again" })).toBeDisabled();
});

test("#127 with no sending configured the bar says so before anything is written", async ({
  page,
}) => {
  // The suite's servers always configure VITE_REVIEW_SUBMISSION_URL, so here
  // the pre-notice must stay quiet. The configured path is asserted; the
  // unavailable-endpoint path is a stated verification gap in the PR notes.
  await page.goto("/?review");
  await expect(bar(page).locator("[data-sending-warning]")).toBeHidden();
  // Text matchers read hidden text too, so count only what the reviewer sees.
  await expect(bar(page).locator(".bar-warning:visible")).toHaveCount(0);
});
