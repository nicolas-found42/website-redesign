import { test, expect } from "@playwright/test";

test("an executive can explore three distinct service illustrations with the keyboard", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("img", { name: /Training illustration:/ }),
  ).toBeVisible();
  await expect(page.getByText("Useful prompts", { exact: true })).toBeVisible();
  const automation = page.getByRole("button", {
    name: "Automation",
    exact: true,
  });
  await automation.focus();
  await automation.press("Enter");
  await expect(automation).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("img", { name: /Automation illustration:/ }),
  ).toBeVisible();
  await expect(page.getByText("Operations", { exact: true })).toBeVisible();
  const product = page.getByRole("button", {
    name: "Product value",
    exact: true,
  });
  await product.press("Space");
  await expect(
    page.getByRole("img", { name: /Product illustration:/ }),
  ).toBeVisible();
  await expect(
    page.getByText("Customer workflow", { exact: true }),
  ).toBeVisible();
  await expect(automation).toHaveAttribute("aria-pressed", "false");
  await expect(product).toBeFocused();
});

test("switching to reduced motion during rapid choices leaves a complete final illustration", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.getByRole("button", { name: "Automation", exact: true }).click();
  await page
    .getByRole("button", { name: "Product value", exact: true })
    .click();
  await page.getByRole("button", { name: "Training", exact: true }).click();
  await page
    .getByRole("button", { name: "Product value", exact: true })
    .click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  const expectedPage = await context.newPage();
  await expectedPage.emulateMedia({ reducedMotion: "reduce" });
  await expectedPage.goto("/");
  await expectedPage.evaluate(() => document.fonts.ready);
  await expectedPage
    .getByRole("button", { name: "Product value", exact: true })
    .click();
  const illustration = page.getByRole("img", { name: /Product illustration:/ });
  const expectedIllustration = expectedPage.getByRole("img", {
    name: /Product illustration:/,
  });
  await expect(async () => {
    const actual = await illustration.screenshot();
    const expected = await expectedIllustration.screenshot();
    expect(
      actual.equals(expected),
      "interrupted and motionless illustrations should render identically",
    ).toBe(true);
  }).toPass({ timeout: 3000 });
  await expectedPage.close();
});

test("a mobile visitor can select each illustration by touch", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4173/");
  await page.getByRole("button", { name: "Automation", exact: true }).tap();
  await expect(page.getByText("Operations", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Product value", exact: true }).tap();
  await expect(
    page.getByRole("img", { name: /Product illustration:/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Training", exact: true }).tap();
  await expect(
    page.getByRole("img", { name: /Training illustration:/ }),
  ).toBeVisible();
  await context.close();
});
