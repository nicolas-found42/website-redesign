import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/*
 * The stand-up follow-up: the services sequence on a phone, the homepage's
 * failure-mode figure and the scorecard answered on the page.
 */

const phone = { width: 390, height: 844 };

/** The words a service article's drawing currently shows. */
const labelsOf = (page: Page, index: number) =>
  page.evaluate(
    (index) =>
      [
        ...document
          .querySelectorAll(".service-figure")
          [index].querySelectorAll(".system-label"),
      ].map((label) => label.textContent),
    index,
  );

/** Puts the top `share` of a service article's drawing on screen. */
const reveal = (page: Page, index: number, share: number) =>
  page.evaluate(
    ([index, share]) => {
      const figure = document.querySelectorAll(".service-figure")[index];
      const box = figure.getBoundingClientRect();
      window.scrollTo({
        top: scrollY + box.top - innerHeight + box.height * share,
        behavior: "instant",
      });
    },
    [index, share],
  );

test("on a phone, a service's drawing arrives as the one before it and settles as its own", async ({
  browser,
}) => {
  const context = await browser.newContext({ viewport: phone });
  const page = await context.newPage();
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const own = await labelsOf(page, 1);
  expect(own).toContain("Brief / operating problem");
  const before = await labelsOf(page, 0);

  await reveal(page, 1, 0.15);
  await expect.poll(() => labelsOf(page, 1)).toEqual(before);

  await reveal(page, 1, 1);
  await expect.poll(() => labelsOf(page, 1), { timeout: 4000 }).toEqual(own);

  // The third was never approached, so it never stopped being its own.
  expect(await labelsOf(page, 2)).toContain("Repetitive work");
  await context.close();
});

test("paused or reduced, every phone drawing is its own composition throughout", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: phone,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto("/");
  const own = await labelsOf(page, 1);
  for (const share of [0.1, 0.3, 0.6, 1]) {
    await reveal(page, 1, share);
    await page.waitForTimeout(150);
    expect(await labelsOf(page, 1)).toEqual(own);
  }
  await context.close();
});

for (const [width, text] of [
  [390, "100%"],
  [320, "200%"],
] as const)
  test(`on a phone the rail rides under the header and a jump lands below it (${width}px, ${text} text)`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width, height: 844 },
      hasTouch: true,
    });
    const page = await context.newPage();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/#services");
    // At a large text size the choices wrap onto more than one row.
    await page.evaluate(
      (size) => (document.documentElement.style.fontSize = size),
      text,
    );
    await page.evaluate(async () => {
      await document.fonts.ready;
      document
        .querySelector("#services")!
        .scrollIntoView({ behavior: "instant" });
    });
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(1000);
    const automations = page.getByRole("button", {
      name: "Automations",
      exact: true,
    });
    await automations.tap();
    await expect
      .poll(() =>
        page.evaluate(() => {
          const article = document.querySelector("#service-product")!;
          const rail = document.querySelector(".services-aside")!;
          const top = article.getBoundingClientRect().top;
          return (
            top >= rail.getBoundingClientRect().bottom - 1 &&
            top < innerHeight - 20
          );
        }),
      )
      .toBe(true);
    await expect(automations).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator('[data-service-article="2"]')).toHaveClass(
      /is-current/,
    );
    const [header, rail, article] = await page.evaluate(() =>
      [".site-header", ".services-aside", "#service-product"].map(
        (selector) => {
          const box = document.querySelector(selector)!.getBoundingClientRect();
          return { top: box.top, bottom: box.bottom };
        },
      ),
    );
    expect(rail.top).toBeGreaterThanOrEqual(header.bottom - 1);
    expect(rail.top).toBeLessThan(header.bottom + 2);
    expect(article.top).toBeGreaterThanOrEqual(rail.bottom - 1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await context.close();
  });

for (const height of [500, 600])
  test(`a short-phone choice survives scroll settlement and yields to reading (${height}px)`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: 320, height },
      hasTouch: true,
    });
    const page = await context.newPage();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/#services");
    await expect(page.locator(".services-art .system-field")).toHaveCount(1);
    await page.evaluate(
      () => (document.documentElement.style.fontSize = "200%"),
    );
    await page.evaluate(async () => {
      await document.fonts.ready;
      document
        .querySelector("#services")!
        .scrollIntoView({ behavior: "instant" });
    });
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(1000);
    await expect
      .poll(() =>
        page.evaluate(() => {
          const section = document.querySelector<HTMLElement>("#services")!;
          const rail = section.querySelector<HTMLElement>(".services-aside")!;
          const measured = Number.parseFloat(
            section.style.getPropertyValue("--services-rail"),
          );
          return Math.abs(measured - rail.offsetHeight);
        }),
      )
      .toBeLessThan(1);
    const automations = page.getByRole("button", {
      name: "Automations",
      exact: true,
    });
    await automations.tap();
    await expect(automations).toHaveAttribute("aria-pressed", "true");
    await expect
      .poll(() =>
        page.evaluate(() => {
          const box = document
            .querySelector('[data-service-article="2"]')!
            .getBoundingClientRect();
          return box.top < innerHeight - 20 && box.bottom > 20;
        }),
      )
      .toBe(true);
    // A short viewport can still show the previous article at its midpoint.
    // A completed rail jump remains the reader's explicit choice at rest.
    await expect(page.locator('[data-service-article="2"]')).toHaveClass(
      /is-current/,
    );
    await page.evaluate(() => window.dispatchEvent(new Event("scrollend")));
    await expect(automations).toHaveAttribute("aria-pressed", "true");
    await page.evaluate(() => window.dispatchEvent(new Event("wheel")));
    await page.evaluate(() =>
      document
        .querySelector('[data-service-article="1"]')!
        .scrollIntoView({ block: "center", behavior: "instant" }),
    );
    await expect(
      page.getByRole("button", { name: "Workflows", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await context.close();
  });

test("the homepage's published playbook is one click from its full inventory", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("#resources h3")).toHaveText([
    "AI Readiness Scorecard",
    "C-Level AI Toolkit",
  ]);
  await page.getByRole("link", { name: "Explore all free resources" }).click();
  const entry = page.getByRole("link", {
    name: "Request the published AI Failure Modes Playbook",
  });
  await expect(entry).toHaveAttribute(
    "href",
    "https://www.found42.com/ai-failure-modes-playbook",
  );
  await expect(page.locator("#playbook")).toContainText(
    "Failure Modes Playbook",
  );
});

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
  expect(await app.locator(".scorecard-echo img").count()).toBe(0);
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
