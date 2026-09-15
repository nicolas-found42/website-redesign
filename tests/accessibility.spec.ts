import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("mobile menu supports keyboard navigation and returns focus to the chosen section", async ({
  page,
  browserName,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Menu" });
  await menu.focus();
  await page.keyboard.press("Enter");
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).not.toBeVisible();
  await menu.press("Enter");
  // WebKit on macOS uses Option-Tab to include links in keyboard navigation.
  await page.keyboard.press(
    browserName === "webkit" && process.platform === "darwin"
      ? "Alt+Tab"
      : "Tab",
  );
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#resources$/);
  await expect(
    page.getByRole("heading", { name: "A useful place to start." }),
  ).toBeFocused();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
});

test("reduced-motion visitors can operate the drawing without animated movement", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#services");
  const automate = page.getByRole("button", {
    name: "Automation",
    exact: true,
  });
  await automate.focus();
  await page.keyboard.press("Enter");
  await expect(automate).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByText("Connect tasks into workflows your team can use.").first(),
  ).toBeVisible();
  // Nothing perceptible: the reduced-motion clamp is in force on every effect
  // the page has, and none of them is still running once the choice is made.
  expect(
    await page.evaluate(() =>
      document
        .getAnimations()
        .map((animation) => Number(animation.effect?.getTiming().duration ?? 0))
        .filter((duration) => duration > 1),
    ),
  ).toEqual([]);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document
            .getAnimations()
            .filter((animation) => animation.playState === "running").length,
      ),
    )
    .toBe(0);
  expect(
    await automate.evaluate(
      (element) => getComputedStyle(element).outlineStyle,
    ),
  ).toBe("solid");
});

/**
 * Entrances are measured after they have finished. A block on its way in is
 * briefly part-way through its opacity, and contrast during a transition is not
 * what a reader is given — the settled page is.
 */
async function settle(page: import("@playwright/test").Page) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => {
    const step = Math.round(innerHeight * 0.6);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 120));
    }
    window.scrollTo(0, 0);
  });
  // Wait on the page's own state rather than a fixed delay, so a slow machine
  // measures a settled page instead of a half-finished entrance. Only the
  // blocks are counted: a heading that is still split is one below the fold
  // waiting its turn, which is the design rather than an unfinished entrance,
  // and it is already at full opacity either way.
  await expect
    .poll(
      () =>
        page.evaluate(
          () => document.querySelectorAll("[data-reveal]:not(.is-in)").length,
        ),
      { timeout: 15000 },
    )
    .toBe(0);
  await page.waitForTimeout(400);
}

for (const width of [390, 768, 1440])
  test(`accessible content and layout at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await settle(page);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(result.violations).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });

test("enlarged text keeps mobile resource disclosures and controls within the viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(
    page.getByText("Requires email, LinkedIn profile and CAPTCHA.", {
      exact: false,
    }),
  ).toBeVisible();
  const choice = page.getByRole("button", { name: "Automation", exact: true });
  await choice.click();
  await expect(choice).toHaveAttribute("aria-pressed", "true");
});

test("no document overflow at the narrow widths, at default and doubled text", async ({
  page,
}) => {
  for (const width of [320, 360, 390, 700, 960, 1024]) {
    for (const scale of ["100%", "200%"]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/");
      await page.evaluate((size) => {
        document.documentElement.style.fontSize = size;
      }, scale);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(300);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${width}px at ${scale} root text`,
      ).toBe(true);
    }
  }
});
