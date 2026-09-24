import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const phone = { width: 390, height: 844 };

test("the scorecard walks forward and back, keeps what was typed, and never sends it", async ({
  page,
}) => {
  const external: string[] = [];
  page.on("request", (request) => {
    if (!request.url().startsWith("http://127.0.0.1:4173"))
      external.push(request.url());
  });
  await page.goto("/resources/#scorecard");
  const app = page.getByRole("group", { name: "AI Readiness Scorecard" });
  const yes = app.getByRole("button", { name: "Yes", exact: true });
  const no = app.getByRole("button", { name: "No", exact: true });

  await yes.click();
  await expect(app).toContainText("Question 2 of 12");
  await expect(app.locator("h3")).toBeFocused();
  await app.getByRole("button", { name: "← Back" }).click();
  await expect(app).toContainText("Question 1 of 12");

  for (let step = 0; step < 12; step++) await no.click();
  await expect(app).toContainText("Last question");
  const typed = 'Board pack <img src=x onerror="window.injected=true">';
  await app.getByRole("textbox").fill(typed);
  await app.getByRole("button", { name: "← Back" }).click();
  await expect(app).toContainText("Question 12 of 12");
  await no.click();
  await expect(app.getByRole("textbox")).toHaveValue(typed);
  await app.getByRole("button", { name: /See my result/ }).click();

  await expect(app.locator("h3")).toHaveText("Early days");
  await expect(app.locator("h3")).toBeFocused();
  await expect(app.locator(".scorecard-areas li")).toHaveCount(5);
  await expect(app.locator(".scorecard-next > li")).toHaveCount(3);
  await expect(app.locator(".scorecard-echo")).toContainText(typed);
  await expect(app.locator(".scorecard-echo img")).toHaveCount(0);
  expect(await page.evaluate(() => "injected" in window)).toBe(false);
  expect(
    await app.locator(".scorecard-result").evaluate((node) => node.textContent),
  ).not.toMatch(/\d/);

  const result = await new AxeBuilder({ page })
    .include("#scorecard")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(result.violations).toEqual([]);

  await app.getByRole("button", { name: /Plan the next step/ }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("From your readiness check")).toBeVisible();
  await expect(dialog).toContainText(typed);
  await expect(dialog.locator("img")).toHaveCount(0);
  expect(await page.evaluate(() => "injected" in window)).toBe(false);
  await page.keyboard.press("Escape");
  await app.getByRole("button", { name: "Retake" }).click();
  await expect(app).toContainText("Question 1 of 12");
  expect(external).toEqual([]);
});

test("the header is lifted however the page got past the opening", async ({
  browser,
}) => {
  const context = await browser.newContext({ viewport: phone });
  const page = await context.newPage();
  const header = page.locator(".site-header");
  // Opened at an anchor, and jumped far down before the first frame: in both
  // the opening goes from below the viewport to above it without crossing it.
  await page.goto("/#services");
  await expect(header).toHaveClass(/is-lifted/);
  await page.goto("/");
  await page.evaluate(() =>
    window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }),
  );
  await expect(header).toHaveClass(/is-lifted/);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(header).not.toHaveClass(/is-lifted/);
  await context.close();
});

test("every scorecard state reflows at 320px with doubled text, before the fonts arrive", async ({
  page,
}) => {
  // Fallback faces are wider than the page's own, so this is the worst case a
  // slow font leaves a visitor in.
  await page.route(/\.woff2(\?|$)/, (route) => route.abort());
  await page.setViewportSize({ width: 320, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/resources/");
  await page.evaluate(() => (document.documentElement.style.fontSize = "200%"));
  const fits = () =>
    page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
  const app = page.getByRole("group", { name: "AI Readiness Scorecard" });
  expect(await fits()).toBe(true);
  for (let step = 0; step < 12; step++)
    await app
      .getByRole("button", { name: step % 2 ? "Yes" : "No", exact: true })
      .click();
  expect(await fits()).toBe(true);
  await app.getByRole("button", { name: /See my result/ }).click();
  expect(await fits()).toBe(true);
});
