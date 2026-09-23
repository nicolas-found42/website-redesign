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
test("forms validate, disclose unavailable delivery, trap focus and restore trigger", async ({
  page,
}) => {
  await page.goto("/resources/");
  const form = page.locator("#playbook form");
  await form.getByRole("button").click();
  await expect(form).toContainText("Enter a valid work email.");
  await form.getByLabel("Work email").fill("preview@example.com");
  await form.getByRole("button").click();
  await expect(form).toContainText("Nothing was sent");
  const trigger = page.getByRole("button", { name: /Explore the mini-course/ });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("A safe rollout pattern");
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await page.getByRole("button", { name: /Talk to our team/ }).click();
  await dialog.getByRole("button", { name: "Check my draft" }).click();
  await expect(dialog).toContainText("Complete every field");
  await dialog.getByLabel("Your name").fill("Preview User");
  await dialog.getByLabel("Work email").fill("preview@example.com");
  await dialog.getByLabel("Company").fill("Preview");
  await dialog
    .getByLabel("What should work better?")
    .fill("Review a repetitive workflow");
  await dialog.getByRole("button", { name: "Check my draft" }).click();
  await expect(dialog).toContainText("Nothing was sent.");
  const violations = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(violations.violations).toEqual([]);
});

test("all email gates validate without sending requests or claiming a subscription", async ({
  page,
}) => {
  const submissions: string[] = [];
  page.on("request", (r) => {
    if (r.method() !== "GET") submissions.push(r.url());
  });
  await page.goto("/resources/");
  for (const id of ["playbook", "library"]) {
    const form = page.locator(`#${id} form`);
    await form.getByLabel("Work email").fill("invalid");
    await form.getByRole("button").click();
    await expect(form).toContainText("Enter a valid work email.");
    await form.getByLabel("Work email").fill("preview@example.com");
    await form.getByRole("button").click();
    await expect(form).toContainText("you have not been subscribed.");
  }
  await page.locator('[data-dialog="course"]').click();
  const course = page.getByRole("dialog");
  await course.getByRole("button", { name: /Start the course/ }).click();
  await expect(course).toContainText("Enter a valid work email.");
  await course.getByLabel("Work email").fill("preview@example.com");
  await course.getByRole("button", { name: /Start the course/ }).click();
  await expect(course).toContainText("Nothing was sent");
  const close = course.getByRole("button", { name: "Close dialog" });
  await close.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(
    course.getByRole("button", { name: /Start the course/ }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page.keyboard.press("Escape");
  await page.goto("/blog/");
  const newsletter = page.locator("form");
  await newsletter.getByRole("button").click();
  await expect(newsletter).toContainText("Enter a valid work email.");
  await newsletter.getByLabel("Work email").fill("preview@example.com");
  await newsletter.getByRole("button").click();
  await expect(newsletter).toContainText("you have not been subscribed.");
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
