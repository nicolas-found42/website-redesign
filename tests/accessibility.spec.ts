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
  ).toBeHidden();
  await menu.press("Enter");
  // WebKit on macOS uses Option-Tab to include links in keyboard navigation.
  await page.keyboard.press(
    browserName === "webkit" && process.platform === "darwin"
      ? "Alt+Tab"
      : "Tab",
  );
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/resources\/$/);
  await expect(
    page.getByRole("heading", { name: "Start with the work." }),
  ).toBeVisible();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
});

test("reduced-motion visitors can operate the drawing without animated movement", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#services");
  const automate = page.getByRole("button", {
    name: "Workflows",
    exact: true,
  });
  await automate.focus();
  await page.keyboard.press("Enter");
  await expect(automate).toHaveAttribute("aria-pressed", "true");
  await expect(
    page
      .locator(".services-art .system-label")
      .filter({ hasText: "Brief / operating problem" })
      .first(),
  ).toBeVisible();
  await expect(
    page
      .locator(".services-caption")
      .filter({ hasText: "Operating problem" })
      .first(),
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

test("the testimonial rail is keyboard-operable and keeps every quote in the DOM", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#testimonials");
  const cards = page.locator(".testimonial-card");
  await expect(cards).toHaveCount(5);
  const names = page.locator(".testimonial-card figcaption strong");
  const readingOrder = [
    "Robb Henshaw",
    "Paul Keely",
    "Carmen Paredes Ramirez",
    "Andrew Miller",
    "Neville Louison",
  ];
  await expect(names).toHaveText(readingOrder);
  const count = page.locator("[data-testimonial-count]");
  await expect(count).toHaveText("1 / 5");
  const track = page.locator(".testimonial-track");
  await track.focus();
  await page.keyboard.press("ArrowRight");
  await expect(count).toHaveText("2 / 5");
  await page.keyboard.press("ArrowLeft");
  await expect(count).toHaveText("1 / 5");
  // Stepping the rail never removes or reorders a quote: all five stay in the
  // document in the same reading order the no-script layout gives them.
  await expect(cards).toHaveCount(5);
  await expect(names).toHaveText(readingOrder);
});

/**
 * Entrances are measured after they have finished. A block on its way in is
 * briefly part-way through its opacity, and contrast during a transition is not
 * what a reader is given — the settled page is.
 */
async function settle(page: import("@playwright/test").Page) {
  await page.evaluate(() => document.fonts.ready);
  // A timed scroll sweep can leave a viewport before WebKit delivers its
  // intersection callback on a busy runner. Visit each target and observe its
  // actual reveal/opacity before advancing, without forcing application state.
  for (const target of await page.locator("[data-reveal]").all()) {
    await target.evaluate((element) =>
      element.scrollIntoView({ block: "center", behavior: "instant" }),
    );
    await expect(target).toHaveClass(/\bis-in\b/);
    await expect(target).toHaveCSS("opacity", "1");
  }
  await expect(page.locator("[data-reveal]:not(.is-in)")).toHaveCount(0);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
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
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const start = page.locator("#resources");
  await expect(start).toContainText("C-Level AI Toolkit");
  await expect(start).toContainText(
    "Public page · Some links need a ChatGPT account",
  );
  const choice = page.getByRole("button", { name: "Workflows", exact: true });
  await choice.click();
  await expect(choice).toHaveAttribute("aria-pressed", "true");
});

test("no document overflow at the narrow widths, at default and doubled text", async ({
  page,
}) => {
  await page.goto("/");
  for (const width of [320, 360, 390, 700, 960, 1024]) {
    for (const scale of ["100%", "200%"] as const) {
      await page.setViewportSize({ width, height: 844 });
      await page.evaluate((size) => {
        document.documentElement.style.fontSize = size;
      }, scale);
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(
        () =>
          new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
          ),
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${width}px at ${scale} root text`,
      ).toBe(true);
    }
  }
});
