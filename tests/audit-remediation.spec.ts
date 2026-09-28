import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Regression checks for the September 22 site audit. Each one reproduces a
 * defect a visitor could hit — see artifacts/site-audit/2026-09-22/report.md
 * for the finding it guards — and asserts what they should experience instead.
 */

const box = async (page: Page, selector: string) => {
  const bounds = await page.locator(selector).first().boundingBox();
  expect(bounds, selector).not.toBeNull();
  return bounds!;
};

test("F01: a wheel over the inquiry dialog scrolls the dialog, not the page behind it", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 560 });
  await page.goto("/resources/");
  await page
    .getByRole("button", { name: /Talk to us/ })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  // The dialog is taller than the window, which is the case that failed.
  expect(await dialog.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(
    true,
  );
  const bounds = await dialog.boundingBox();
  await page.mouse.move(bounds!.x + bounds!.width / 2, bounds!.y + 200);
  await page.mouse.wheel(0, 400);
  await expect
    .poll(() => dialog.evaluate((el) => el.scrollTop))
    .toBeGreaterThan(0);
  expect(await page.evaluate(() => scrollY)).toBe(0);
});

test("F01: a wheel over the open mobile menu scrolls the menu, not the page", async ({
  page,
}) => {
  await page.setViewportSize({ width: 900, height: 360 });
  await page.goto("/");
  await page.getByRole("button", { name: "Menu" }).click();
  const nav = page.locator("#navigation");
  expect(await nav.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(
    true,
  );
  await page.mouse.move(450, 200);
  await page.mouse.wheel(0, 400);
  await expect
    .poll(() => nav.evaluate((el) => el.scrollTop))
    .toBeGreaterThan(0);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await expect(
    nav.getByRole("button", { name: /Talk to us/ }),
  ).toBeInViewport();
  // The toggle sits above the panel, not inside it: a wheel there must not
  // move the page behind the menu either.
  const toggle = await page.locator(".menu-toggle").boundingBox();
  await page.mouse.move(
    toggle!.x + toggle!.width / 2,
    toggle!.y + toggle!.height / 2,
  );
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(600);
  expect(await page.evaluate(() => scrollY)).toBe(0);
});

test("F02, F06: the inquiry backdrop and focus dismissal still work", async ({
  page,
}) => {
  await page.goto("/resources/");
  const trigger = page.getByRole("button", { name: /Talk to our team/ });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  // A click inside the dialog's own box never dismisses it…
  const bounds = await dialog.boundingBox();
  await page.mouse.click(bounds!.x + 8, bounds!.y + 8);
  await expect(dialog).toBeVisible();
  // …a click on the dimmed backdrop does, and focus returns to the trigger.
  await page.mouse.click(4, 4);
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("F03, F17: the live inquiry handoff is accessible and honest", async ({
  page,
}) => {
  await page.goto("/resources/");
  await page.getByRole("button", { name: /Talk to our team/ }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("consultation inquiry, not reserving a meeting");
  await expect(dialog.locator("form")).toHaveCount(0);
  await expect(
    dialog.getByRole("link", { name: "Open the live inquiry form" }),
  ).toHaveClass(/\baction\b/);
  const result = await new AxeBuilder({ page })
    .include("dialog")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(result.violations).toEqual([]);
});

test("F04: the industries dropdown closes on a press elsewhere and when focus moves on", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const industries = page.locator(".industry-menu");
  const summary = industries.locator("summary");
  await summary.click();
  await expect(industries).toHaveAttribute("open", "");
  await page.mouse.click(300, 500);
  await expect(industries).not.toHaveAttribute("open", "");

  await summary.click();
  // Moving within the dropdown keeps it open…
  await industries.getByRole("link", { name: "Private Equity" }).focus();
  await expect(industries).toHaveAttribute("open", "");
  // …moving past it closes it.
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "About", exact: true })
    .focus();
  await expect(industries).not.toHaveAttribute("open", "");
});

test("F04: in the narrow menu the industries list stays open while the visitor moves around it", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Menu" }).click();
  const industries = page.locator(".industry-menu");
  await industries.locator("summary").click();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "About", exact: true })
    .focus();
  await page.mouse.click(300, 700);
  await expect(industries).toHaveAttribute("open", "");
});

test("F05: the open menu shows how to close it", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const toggle = page.locator(".menu-toggle");
  await expect(toggle).toHaveAccessibleName("Menu");
  await toggle.click();
  await expect(toggle).toHaveAccessibleName("Close menu");
  await expect(toggle.locator(".icon").last()).toBeVisible();
  await expect(toggle.locator(".icon").first()).toBeHidden();
  await toggle.click();
  await expect(toggle).toHaveAccessibleName("Menu");
  await expect(toggle.locator(".icon").first()).toBeVisible();
});

test("F07: a control reached by tabbing backwards is not left under the sticky header", async ({
  page,
  browserName,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/resources/");
  await page.locator("#contact .contact-action").focus();
  const back =
    browserName === "webkit" && process.platform === "darwin"
      ? "Alt+Shift+Tab"
      : "Shift+Tab";
  for (let step = 0; step < 30; step++) {
    await page.keyboard.press(back);
    // Firefox scrolls a focused text field's caret into view a frame or two
    // after focus lands. Pressed faster than that — no visitor is — the late
    // scroll lands after focus has moved on and drags the page back to the
    // field, leaving the next control off-screen. Two frames is a keypress at
    // human speed.
    await page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    );
    // Some engines bring the focused control into view a frame later; the
    // assertion is about where it comes to rest.
    await page.waitForFunction(() => {
      const box = document.activeElement!.getBoundingClientRect();
      return box.bottom > 0 && box.top < innerHeight;
    });
    const { top, header, inHeader, skip } = await page.evaluate(() => {
      const active = document.activeElement as HTMLElement;
      return {
        top: active.getBoundingClientRect().top,
        header: document.querySelector(".site-header")!.getBoundingClientRect()
          .bottom,
        inHeader: !!active.closest(".site-header"),
        skip: active.matches(".skip-link, body, #main"),
      };
    });
    if (inHeader || skip) break;
    expect(top, `step ${step}`).toBeGreaterThanOrEqual(header - 1);
  }
});

test("F08: executive scene annotations are not covered by the drawing", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  /**
   * Both boxes are read in one pass, relative to the scene's own field, once
   * the fonts are in: measured separately, a late font moves the section
   * between the two readings.
   */
  const measure = () =>
    page.evaluate(async () => {
      await document.fonts.ready;
      const panel = document.querySelector("#audience-executives")!;
      const svg = panel.querySelector<SVGSVGElement>(".scene-field svg")!;
      const field = svg.getBoundingClientRect();
      const text = (label: string) =>
        [...panel.querySelectorAll(".system-label")]
          .find((el) => el.textContent?.includes(label))!
          .querySelector(".system-label-text")!
          .getBoundingClientRect();
      const pill = [...panel.querySelectorAll(".system-label")]
        .find((el) => el.textContent?.includes("Tailored executive skill"))!
        .getBoundingClientRect();
      // The operating view's first rule: the topmost horizontal route inside the panel.
      const scale = field.height / svg.viewBox.baseVal.height;
      const rule = Math.min(
        ...[...svg.querySelectorAll(".route")]
          .map((route) =>
            (route.getAttribute("d") ?? "").match(
              /^M\s*[\d.]+[ ,]([\d.]+)\s*L\s*[\d.]+[ ,]\1$/,
            ),
          )
          .filter((match): match is RegExpMatchArray => !!match)
          .map((match) => Number(match[1]))
          .filter((y) => y > 300),
      );
      if (!Number.isFinite(rule))
        throw new Error("No horizontal operating-view rule found in the scene");
      return {
        problemRight: text("Your operating problem").right - field.left,
        pillLeft: pill.left - field.left,
        captionBottom: text("Illustrative executive operating view").bottom - field.top,
        ruleTop: rule * scale,
      };
    });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const wide = await measure();
  expect(wide.problemRight).toBeLessThanOrEqual(wide.pillLeft);

  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    const narrow = await measure();
    expect(narrow.captionBottom, `${width}px`).toBeLessThanOrEqual(
      narrow.ruleTop,
    );
  }
});

test("F10, F12: the resources foot keeps the column's edge, and industry grids draw one rule", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const grid = await box(page, ".resource-grid");
  const foot = await box(page, ".resource-foot");
  expect(Math.abs(foot.x - grid.x)).toBeLessThanOrEqual(1);

  await page.goto("/industries/private-equity/");
  const head = await box(page, ".on-ink .section-head");
  const industryGrid = await box(page, ".industry-grid");
  expect(
    await page
      .locator(".industry-grid")
      .evaluate((el) => getComputedStyle(el).borderTopWidth),
  ).toBe("0px");
  expect(industryGrid.y - (head.y + head.height)).toBeLessThanOrEqual(72);
});

test("F15: page openings do not skip a heading level", async ({ page }) => {
  for (const path of [
    "/resources/",
    "/industries/private-equity/",
    "/industries/b2b-saas/",
    "/blog/",
  ]) {
    await page.goto(path);
    const result = await new AxeBuilder({ page })
      .withRules(["heading-order"])
      .analyze();
    expect(result.violations, path).toEqual([]);
  }
});
