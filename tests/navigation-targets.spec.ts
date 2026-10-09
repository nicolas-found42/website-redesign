import { test, expect } from "@playwright/test";

const destinations = [
  ["Private equity", "/industries/private-equity/"],
  ["Portfolio companies", "/industries/portfolio-companies/"],
  ["Software companies", "/industries/b2b-saas/"],
] as const;

test("three business audiences have direct top-level navigation links", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 821 });
  await page.goto("/services/");
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  for (const [name, href] of destinations) {
    const link = nav.getByRole("link", { name, exact: true });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", href);
  }
  await expect(nav.locator("details")).toHaveCount(0);
});

for (const [width, size] of [
  [1920, "100%"],
  [1440, "100%"],
  [1280, "100%"],
  [1024, "100%"],
  [390, "100%"],
  [390, "200%"],
  [1440, "200%"],
] as const) {
  test(`audience navigation stays readable at ${width}px with ${size} text`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/industries/portfolio-companies/");
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate((textSize) => {
      document.documentElement.style.fontSize = textSize;
    }, size);
    if (width <= 1280)
      await page.getByRole("button", { name: "Menu", exact: true }).click();
    const nav = page.getByRole("navigation", { name: "Main navigation" });
    for (const [name, href] of destinations) {
      const link = nav.getByRole("link", { name, exact: true });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute("href", href);
    }
    await expect(
      nav.getByRole("link", { name: "Portfolio companies", exact: true }),
    ).toHaveAttribute("aria-current", "page");
    const layout = await nav.evaluate((root) => {
      const boxes = [...root.querySelectorAll("a")].map((link) =>
        link.getBoundingClientRect(),
      );
      return {
        offscreen: boxes.filter(
          (box) => box.left < -1 || box.right > innerWidth + 1,
        ).length,
        overlaps: boxes.flatMap((a, i) =>
          boxes
            .slice(i + 1)
            .filter(
              (b) =>
                a.left < b.right - 1 &&
                b.left < a.right - 1 &&
                a.top < b.bottom - 1 &&
                b.top < a.bottom - 1,
            ),
        ).length,
      };
    });
    expect(layout).toEqual({ offscreen: 0, overlaps: 0 });
  });
}

test("portfolio-company page keeps operating work and training destinations separate from deal work", async ({
  page,
}) => {
  await page.goto("/industries/portfolio-companies/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Useful skills for operating teams.",
  );
  await expect(page.locator(".industry-grid")).toContainText(
    "Portfolio operations",
  );
  await expect(page.locator(".industry-grid")).toContainText(
    "Role-based training",
  );
  await expect(
    page.locator("main").getByRole("link", { name: /Explore training tracks/ }),
  ).toHaveAttribute("href", "/services/#tracks");
  await expect(page.locator(".industry-grid")).not.toContainText(
    "Deal screening",
  );
  await page.goto("/industries/private-equity/");
  await expect(page.locator(".industry-grid")).toContainText("Deal screening");
  await expect(page.locator(".industry-grid")).not.toContainText(
    "Portfolio operations",
  );
});

test("portfolio-company review selection saves the eighth page's context", async ({
  page,
}) => {
  await page.goto("/industries/portfolio-companies/?review");
  await page.getByRole("button", { name: "Add feedback" }).click();
  await page.getByRole("heading", { level: 1 }).click();
  const form = page.getByRole("dialog");
  await form.getByLabel("Your name").fill("Route review test");
  await form
    .getByLabel("Change it to")
    .fill("Useful skills for our operating teams.");
  await form
    .getByLabel("Why?", { exact: true })
    .fill("Check the new page's feedback context.");
  await form.getByRole("radio", { name: "Must change" }).check();
  await form.getByRole("button", { name: "Save feedback" }).click();
  const target = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("found42-review:feedback")!).items[0]
        .target,
  );
  expect(target.page).toBe("/industries/portfolio-companies/");
  expect(target.pageName).toBe("AI for Portfolio Companies");
});
