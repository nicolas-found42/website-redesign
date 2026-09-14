import { test, expect, type Page } from "@playwright/test";

/**
 * The working-system drawing.
 *
 * These cover what the drawing has to guarantee rather than how it is built:
 * three distinct compositions a visitor can reach with a keyboard or a touch,
 * the same still composition at rest however it was reached, and no drawing
 * state left behind by an interrupted or reduced-motion transition.
 */

/** Everything the sticky drawing shows, as a browser would report it. */
const drawing = (target: Page) =>
  target.evaluate(() => {
    const round = (value: number) => Math.round(value * 10) / 10;
    const field = document.querySelector(".services-art .system-field")!;
    const labels = [...field.querySelectorAll(".system-label")];
    return {
      labels: labels.map((label) => label.textContent?.trim()),
      places: labels.map((label) => {
        const style = (label as HTMLElement).style;
        return [style.getPropertyValue("--x"), style.getPropertyValue("--y")];
      }),
      markers: [...field.querySelectorAll(".marker")].map((marker) =>
        marker.getAttribute("transform"),
      ),
      paths: [...field.querySelectorAll(".route")].map((path) =>
        path.getAttribute("d"),
      ),
      // A settled drawing must carry no half-finished draw on any route.
      drawState: [...field.querySelectorAll(".route")].map((path) => {
        const style = getComputedStyle(path);
        return [style.strokeDasharray, style.strokeDashoffset];
      }),
      describedBy: field.getAttribute("aria-label"),
      caption: document.querySelector(".services-caption")?.textContent,
      pressed: [...document.querySelectorAll("[data-service]")].map((choice) =>
        choice.getAttribute("aria-pressed"),
      ),
      leaning: [
        ...document.querySelectorAll(".services-art .system-field"),
      ].map((el) =>
        round(Number((el as HTMLElement).style.getPropertyValue("--lean-x")) || 0),
      ),
    };
  });

test("an executive can reach three distinct service drawings with the keyboard", async ({
  page,
}) => {
  await page.goto("/#services");
  await expect(
    page.getByRole("img", { name: /Training illustration:/ }).first(),
  ).toBeVisible();

  const automation = page.getByRole("button", {
    name: "Automation",
    exact: true,
  });
  await automation.focus();
  await automation.press("Enter");
  await expect(automation).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByText("Connect tasks into workflows your team can use.").first(),
  ).toBeVisible();

  const product = page.getByRole("button", {
    name: "Product value",
    exact: true,
  });
  await product.press("Space");
  await expect(product).toHaveAttribute("aria-pressed", "true");
  await expect(automation).toHaveAttribute("aria-pressed", "false");
  await expect(product).toBeFocused();
  await expect(
    page.getByText("Turn business expertise into new product value.").first(),
  ).toBeVisible();
});

test("every service stays readable on the page whichever drawing is shown", async ({
  page,
}) => {
  await page.goto("/#services");
  for (const title of [
    "AI Empowerment Training",
    "AI-Powered Automation",
    "AI Product Differentiation for B2B SaaS",
  ]) {
    await expect(
      page.getByRole("heading", { name: title, exact: true }),
    ).toBeVisible();
  }
});

test("a completed choice rests in the same still composition as a fresh page", async ({
  page,
  context,
}) => {
  await page.goto("/#services");
  await page.evaluate(() => document.fonts.ready);
  await page.getByRole("button", { name: "Automation", exact: true }).click();

  const motionlessPage = await context.newPage();
  await motionlessPage.emulateMedia({ reducedMotion: "reduce" });
  await motionlessPage.goto("/#services");
  await motionlessPage.evaluate(() => document.fonts.ready);
  await motionlessPage
    .getByRole("button", { name: "Automation", exact: true })
    .click();

  await expect
    .poll(async () => drawing(page), {
      message: "a settled drawing should leave no draw state behind",
      timeout: 8000,
    })
    .toEqual(await drawing(motionlessPage));
  await motionlessPage.close();
});

test("switching to reduced motion during rapid choices leaves a complete drawing", async ({
  page,
  context,
}) => {
  await page.goto("/#services");
  await page.evaluate(() => document.fonts.ready);
  // Four choices in one task, so the last transition is genuinely in flight
  // when the motion preference changes.
  await page.evaluate(() => {
    const choices = [
      ...document.querySelectorAll<HTMLButtonElement>("[data-service]"),
    ];
    [1, 2, 0, 2].forEach((index) => choices[index].click());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });

  const expectedPage = await context.newPage();
  await expectedPage.emulateMedia({ reducedMotion: "reduce" });
  await expectedPage.goto("/#services");
  await expectedPage.evaluate(() => document.fonts.ready);
  await expectedPage
    .getByRole("button", { name: "Product value", exact: true })
    .click();

  await expect
    .poll(async () => drawing(page), {
      message: "an interrupted drawing should finish as the motionless one",
      timeout: 8000,
    })
    .toEqual(await drawing(expectedPage));
  await expectedPage.close();
});

test("the opening drawing is complete and labelled without any interaction", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const opening = page.locator(".hero-art .system-field");
  await expect(opening).toHaveAttribute("aria-label", /Found42 illustration:/);
  await expect
    .poll(() => opening.locator(".system-label").count())
    .toBeGreaterThan(3);
  await expect(opening.getByText("Human direction", { exact: true })).toBeVisible();
  await expect
    .poll(() =>
      opening
        .locator(".route")
        .evaluateAll((routes) =>
          routes.every(
            (route) => getComputedStyle(route).strokeDasharray === "none",
          ),
        ),
    )
    .toBe(true);
});

test("a visitor on a phone gets each service's own drawing and can jump between them", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4173/#services");

  // The narrow layout gives every article its own still drawing rather than one
  // sticky pane, so all three are on the page at once.
  for (const name of [
    /Training illustration:/,
    /Automation illustration:/,
    /Product illustration:/,
  ]) {
    await expect(page.getByRole("img", { name })).toHaveCount(1);
  }
  await expect(
    page.locator("#service-training").getByText("Useful prompts", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.locator("#service-automation").getByText("Operations", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.locator("#service-product").getByText("Customer workflow", {
      exact: true,
    }),
  ).toBeVisible();

  const automation = page.getByRole("button", {
    name: "Automation",
    exact: true,
  });
  await automation.tap();
  await expect(automation).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.locator('[data-service-article="1"]'),
  ).toHaveClass(/is-current/);
  await context.close();
});

test("a visitor can stop the page's motion and start it again", async ({
  page,
}) => {
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Pause motion" });
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await toggle.click();
  await expect(
    page.getByRole("button", { name: "Resume motion" }),
  ).toHaveAttribute("aria-pressed", "true");

  // Paused means nothing is running, not that anything has disappeared.
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
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page.locator(".hero-art .system-field .system-label").first(),
  ).toBeVisible();

  await page.getByRole("button", { name: "Resume motion" }).click();
  await expect(
    page.getByRole("button", { name: "Pause motion" }),
  ).toHaveAttribute("aria-pressed", "false");
});
