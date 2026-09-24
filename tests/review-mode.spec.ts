import { test, expect, type Locator, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

/**
 * Review mode: the team points at the exact thing on a page and says precisely
 * what should change, then sends a file that names the page, section, element
 * and current text for every item. Visitors never load any of it.
 */

const production = "http://127.0.0.1:4179/website-redesign";
const panel = (page: Page) => page.getByRole("dialog");
const toast = (page: Page) =>
  page.locator("#found42-review").getByRole("status");
const saved = (page: Page) =>
  page.evaluate(() =>
    JSON.parse(localStorage.getItem("found42-review:feedback") ?? "null"),
  );

/** Starts picking and chooses `target`; returns the open feedback form. */
async function pick(page: Page, target: Locator) {
  await page.getByRole("button", { name: "Add feedback" }).click();
  await target.click();
  await expect(panel(page)).toBeVisible();
  return panel(page);
}

async function answer(
  form: Locator,
  { name = "Adejoke", why = "Visitors should see who we help first." } = {},
) {
  const reviewer = form.getByLabel("Your name");
  if (await reviewer.count()) await reviewer.fill(name);
  await form.getByLabel("Why?", { exact: true }).fill(why);
  await form.getByRole("radio", { name: "Must change" }).check();
}

test("visitors never load review mode; a review link does", async ({
  page,
}) => {
  const requested: string[] = [];
  page.on("request", (request) => requested.push(request.url()));
  await page.goto(`${production}/`);
  // A negative network assertion must wait for late dynamic imports.
  // eslint-disable-next-line playwright/no-networkidle
  await page.waitForLoadState("networkidle");
  await expect(page.locator("#found42-review")).toHaveCount(0);
  expect(requested.filter((url) => /\/assets\/review-/.test(url))).toEqual([]);

  await page.goto(`${production}/?review`);
  await expect(page.getByRole("region", { name: "Review mode" })).toBeVisible();
  expect(requested.some((url) => /\/assets\/review-/.test(url))).toBe(true);
});

test("a review link stays on across pages until Exit", async ({ page }) => {
  await page.goto("/?review");
  const bar = page.getByRole("region", { name: "Review mode" });
  await expect(bar).toBeVisible();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Services", exact: true })
    .click();
  await expect(page).toHaveURL(/\/services\/$/);
  await expect(bar).toBeVisible();

  await bar.getByRole("button", { name: "Exit" }).click();
  await expect(bar).toHaveCount(0);
  await page.goto("/about/");
  await expect(page.locator("#found42-review")).toHaveCount(0);
});

test("rewording a heading records its exact words, new words and place", async ({
  page,
}) => {
  await page.goto("/?review");
  const heading = page.locator("#audiences-title");
  await heading.scrollIntoViewIfNeeded();
  const form = await pick(page, heading);

  await expect(form.getByRole("heading", { level: 2 })).toHaveText(
    "Heading “Find the work that sounds like yours”",
  );
  await expect(form.getByRole("radio", { name: /Wording/ })).toBeChecked();
  await expect(form.locator("[data-current]")).toHaveText(
    "Find the work that sounds like yours",
  );
  // The review form captures the approved heading as displayed.
  await expect(form.getByLabel("Change it to")).toHaveValue(
    "Find the work that sounds like yours",
  );
  await form.getByLabel("Change it to").fill("Who we work with");
  await answer(form);
  await form.getByRole("button", { name: "Save feedback" }).click();

  await expect(panel(page)).toHaveCount(0);
  await expect(toast(page)).toContainText("Feedback saved");
  await expect(
    page.getByRole("button", { name: /^Feedback 1: Wording on Heading/ }),
  ).toBeVisible();
  const { reviewer, items } = await saved(page);
  expect(reviewer).toBe("Adejoke");
  expect(items).toHaveLength(1);
  expect(items[0]).toMatchObject({
    priority: "must",
    change: {
      kind: "wording",
      current: "Find the work that sounds like yours",
      proposed: "Who we work with",
    },
    target: {
      page: "/",
      pageName: "Home",
      section: "Find the work that sounds like yours",
      element: "Heading",
    },
  });
  expect(
    await page.evaluate(
      (selector) => document.querySelector(selector)?.id,
      items[0].target.selector,
    ),
  ).toBe("audiences-title");
});

test("vague or unchanged answers are refused with what is missing", async ({
  page,
}) => {
  await page.goto("/?review");
  const form = await pick(page, page.locator("#hero-title"));
  await form.getByRole("button", { name: "Save feedback" }).click();

  await expect(form).toContainText("Add your name.");
  await expect(form).toContainText("This still matches the current text.");
  await expect(form).toContainText("Say why");
  await expect(form).toContainText("Choose how important it is.");
  await expect(form.getByLabel("Your name")).toBeFocused();
  await form.getByLabel("Your name").fill("Adejoke");
  await expect(form).not.toContainText("Add your name.");
  expect(await saved(page)).toBeNull();
});

test("while picking, a press chooses a link instead of following it", async ({
  page,
}) => {
  await page.goto("/?review");
  const services = page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Services", exact: true });
  const form = await pick(page, services);
  await expect(page).toHaveURL(/\/\?review$/);
  const title = form.getByRole("heading", { level: 2 });
  await expect(title).toHaveText("Link “Services”");

  await form.getByRole("button", { name: "Larger area" }).click();
  await expect(title).not.toHaveText("Link “Services”");
  await form.getByRole("button", { name: "Smaller area" }).click();
  await expect(title).toHaveText("Link “Services”");
  await expect(
    form.getByRole("button", { name: "Smaller area" }),
  ).toBeDisabled();
});

test("layout feedback names the section it should move next to", async ({
  page,
}) => {
  await page.goto("/?review");
  const heading = page.locator("#resources-title");
  await heading.scrollIntoViewIfNeeded();
  const form = await pick(page, heading);
  await form.getByRole("radio", { name: /Layout/ }).check();
  await form.getByRole("radio", { name: "Move it", exact: true }).check();
  await form.locator('select[name="layoutPosition"]').selectOption("below");
  await form
    .getByLabel("Section", { exact: true })
    .selectOption({ label: "Find the work that sounds like yours" });
  await answer(form, { why: "People should recognise themselves first." });
  await form.getByRole("button", { name: "Save feedback" }).click();
  await expect(panel(page)).toHaveCount(0);

  const { items } = await saved(page);
  expect(items[0].change).toMatchObject({
    kind: "layout",
    action: "move",
    position: "below",
    relativeTo: {
      name: "Find the work that sounds like yours",
      selector: "#audiences",
    },
  });
});

test("the sent file reads plainly and carries data the import script reads", async ({
  page,
  browserName,
}, testInfo) => {
  await page.goto("/?review");
  const form = await pick(page, page.locator("#hero-title"));
  await form.getByLabel("Change it to").fill("Claude training for your team.");
  await answer(form, { name: "Adejoke Test" });
  await form.getByRole("button", { name: "Save feedback" }).click();
  await expect(panel(page)).toHaveCount(0);

  await page.getByRole("button", { name: "Send", exact: true }).click();
  const send = panel(page);
  await expect(send.getByRole("heading", { level: 2 })).toHaveText(
    "Send your feedback",
  );
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    send.getByRole("button", { name: "Download file" }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(
    /^found42-feedback-adejoke-test-\d{4}-\d{2}-\d{2}\.md$/,
  );
  const file = testInfo.outputPath(download.suggestedFilename());
  await download.saveAs(file);
  const text = readFileSync(file, "utf8");
  expect(text).toContain("# Website feedback from Adejoke Test");
  expect(text).toContain(
    "**Where:** Home › Page opening › Heading “Train teams. Build useful skills. Automate the work.”",
  );
  expect(text).toContain("**Change it to**\n> Claude training for your team.");
  expect(text).toContain("`#hero-title`");

  // One engine is enough to prove the script reads what every engine writes.
  if (browserName !== "chromium") return;
  const dryRun = execFileSync(
    "node",
    ["scripts/feedback-to-issues.mjs", file],
    { encoding: "utf8" },
  );
  expect(dryRun).toContain(
    "━━ Wording: Home › Heading “Train teams. Build useful skills. Automate the work.”",
  );
  expect(dryRun).toContain("Reported by **Adejoke Test**");
  expect(dryRun).toContain("1 issue would be opened");
});

test("saved feedback can be found, edited and deleted", async ({ page }) => {
  await page.goto("/?review");
  const form = await pick(page, page.locator("#hero-title"));
  await form.getByLabel("Change it to").fill("First version.");
  await answer(form);
  await form.getByRole("button", { name: "Save feedback" }).click();
  await expect(panel(page)).toHaveCount(0);

  await page.getByRole("button", { name: /My feedback/ }).click();
  const list = panel(page);
  await expect(list).toContainText("Wording · Must change");
  await list.getByRole("button", { name: "Edit" }).click();
  const edit = panel(page);
  await expect(edit.getByLabel("Change it to")).toHaveValue("First version.");
  await edit.getByLabel("Change it to").fill("Second version.");
  await edit.getByRole("button", { name: "Save feedback" }).click();
  await expect(toast(page)).toContainText("Feedback updated.");
  expect((await saved(page)).items[0].change.proposed).toBe("Second version.");

  await page.getByRole("button", { name: /My feedback/ }).click();
  const remove = panel(page).getByRole("button", { name: "Delete" });
  await remove.click();
  await expect(remove).toHaveText("Delete it?");
  await remove.click();
  await expect(panel(page)).toContainText("Nothing yet.");
  expect((await saved(page)).items).toEqual([]);
});

test("on a phone the bar and form fit the screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?review");
  const bar = page.getByRole("region", { name: "Review mode" });
  const box = (await bar.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(16);
  expect(box.x + box.width).toBeLessThanOrEqual(390 - 16);

  const form = await pick(page, page.locator("#hero-title"));
  const sheet = (await form.boundingBox())!;
  // The sheet spans the screen, less any scrollbar an engine reserves.
  expect(sheet.x).toBe(0);
  expect(sheet.width).toBeGreaterThanOrEqual(370);
  expect(sheet.y + sheet.height).toBeLessThanOrEqual(844);
  // The chosen heading stays visible above the sheet.
  const heading = (await page.locator("#hero-title").boundingBox())!;
  expect(heading.y).toBeLessThan(sheet.y);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
});

test("review mode meets the site's accessibility bar", async ({ page }) => {
  await page.goto("/?review");
  await expect(page.getByRole("region", { name: "Review mode" })).toBeVisible();
  const audit = () =>
    new AxeBuilder({ page })
      .include("#found42-review")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
  expect((await audit()).violations).toEqual([]);
  await pick(page, page.locator("#hero-title"));
  expect((await audit()).violations).toEqual([]);
});
