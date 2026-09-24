import { test, expect } from "@playwright/test";

test("the playbook page explains the verified request route", async ({
  page,
}) => {
  await page.goto("/resources/#playbook");
  const figure = page.locator("#playbook .review-figure");
  await expect(figure.getByRole("img")).toHaveAccessibleName(
    /weak outputs, missing context, false confidence/,
  );
  for (const check of ["Weak outputs", "Missing context", "False confidence"])
    await expect(figure.getByText(check, { exact: true })).toBeVisible();
  await expect(figure).toContainText("not reproduced here");
  await expect(
    page.getByRole("link", { name: /Request the published AI Failure Modes/ }),
  ).toHaveAttribute(
    "href",
    "https://www.found42.com/ai-failure-modes-playbook",
  );
});

test("public copy no longer says “no fluff” on any route", async ({ page }) => {
  for (const route of [
    "",
    "resources/",
    "services/",
    "industries/private-equity/",
    "industries/b2b-saas/",
    "about/",
    "blog/",
  ]) {
    await page.goto(`/${route}`);
    const text = await page.evaluate(() => document.documentElement.outerHTML);
    expect(text, route).not.toMatch(/no[\s-]*fluff/i);
  }
});
