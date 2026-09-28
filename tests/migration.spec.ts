import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const routes = [
  "resources",
  "services",
  "industries/private-equity",
  "industries/b2b-saas",
  "about",
  "blog",
];
for (const width of [390, 768, 1440])
  test(`all supporting pages accessible and reflow at ${width}`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(`/${route}/`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(result.violations, route).toEqual([]);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        route,
      ).toBe(true);
    }
  });
test("all pages reflow at 360px with doubled text", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 360, height: 844 });
  for (const route of ["", ...routes]) {
    await page.goto(`/${route}`);
    await page.evaluate(
      () => (document.documentElement.style.fontSize = "200%"),
    );
    const overflow = await page.evaluate(() =>
      Array.from(document.querySelectorAll("body *"))
        .filter((e) => {
          const r = e.getBoundingClientRect();
          return (
            r.width &&
            r.right > innerWidth + 1 &&
            getComputedStyle(e).position !== "absolute" &&
            getComputedStyle(e).visibility !== "hidden"
          );
        })
        .map((e) => ({
          tag: e.tagName,
          class: e.className,
          right: e.getBoundingClientRect().right,
        }))
        .slice(0, 10),
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      JSON.stringify({ route, overflow }),
    ).toBe(true);
  }
});
test("assessment branches, Back and Retake preserve source behavior", async ({
  page,
}) => {
  await page.goto("/resources/");
  await page.locator(".workflow-preview summary").click();
  const host = page.locator("#assessment");
  for (const [choice, title] of [
    [0, "Clarify before building"],
    [1, "Promising, with guardrails"],
    [2, "Strong first workflow"],
  ] as const) {
    for (let step = 0; step < 4; step++) {
      await host.locator("[data-answer]").nth(choice).click();
      if (step === 1) {
        await host.getByRole("button", { name: /Back/ }).click();
        await host.locator("[data-answer]").nth(choice).click();
      }
    }
    await expect(host.getByRole("heading", { name: title })).toBeVisible();
    await host.getByRole("button", { name: "Retake", exact: true }).click();
    await expect(host).toContainText("1 / 4");
  }
});
test("inquiry handoff explains the live form, traps focus and restores its trigger", async ({
  page,
}) => {
  await page.goto("/resources/");
  const trigger = page.getByRole("button", { name: /Talk to our team/ });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("link", { name: "Open the live inquiry form" }),
  ).toHaveAttribute("href", "https://www.found42.com/contact");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  const violations = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(violations.violations).toEqual([]);
});

test("active resources use published destinations and inactive forms make no request", async ({
  page,
}) => {
  const submissions: string[] = [];
  page.on("request", (request) => {
    if (request.method() !== "GET") submissions.push(request.url());
  });
  await page.goto("/resources/");
  await expect(page.locator("#playbook form")).toHaveCount(0);
  await expect(page.locator("#library form")).toHaveCount(0);
  await expect(page.locator("#course form")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Read the verified lesson" }),
  ).toHaveAttribute("href", "https://maven.com/p/fc1def/build-a-strategic-advisor-in-claude");
  await page.goto("/blog/");
  await expect(page.locator("form")).toHaveCount(0);
  await expect(page.locator("main")).toContainText(
    "No newsletter subscription is available yet.",
  );
  expect(submissions).toEqual([]);
});

test("mobile menu stays readable over ink, exposes industries, and traps keyboard focus", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/industries/private-equity/");
  await page.locator(".industry-grid").scrollIntoViewIfNeeded();
  const menu = page.getByRole("button", { name: "Menu" });
  await menu.click();
  const nav = page.getByRole("navigation");
  await nav.locator("summary").click();
  const bounds = await nav.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.y).toBe(0);
  expect(bounds!.height).toBe(844);
  await expect(nav.getByRole("link", { name: "Private Equity" })).toBeVisible();
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(result.violations).toEqual([]);
  await menu.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(nav.getByRole("button", { name: "Talk to us" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(menu).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveAttribute("aria-expanded", "false");
});
