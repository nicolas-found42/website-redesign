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

test("reduced-motion visitors can operate the workflow without animated movement", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const automate = page.getByRole("button", {
    name: "Automation",
    exact: true,
  });
  await automate.focus();
  await page.keyboard.press("Enter");
  await expect(automate).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByText("Connect tasks into workflows your team can use."),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document
          .getAnimations()
          .filter((animation) => animation.playState === "running").length,
    ),
  ).toBe(0);
  expect(
    await automate.evaluate(
      (element) => getComputedStyle(element).outlineStyle,
    ),
  ).toBe("solid");
});

for (const width of [390, 768, 1440])
  test(`accessible content and layout at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
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
