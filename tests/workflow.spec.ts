import { test, expect, type Page } from "@playwright/test";

test("an executive can explore three distinct service illustrations with the keyboard", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("img", { name: /Training illustration:/ }),
  ).toBeVisible();
  await expect(page.getByText("Useful prompts", { exact: true })).toBeVisible();
  const automation = page.getByRole("button", {
    name: "Automation",
    exact: true,
  });
  await automation.focus();
  await automation.press("Enter");
  await expect(automation).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("img", { name: /Automation illustration:/ }),
  ).toBeVisible();
  await expect(page.getByText("Operations", { exact: true })).toBeVisible();
  const product = page.getByRole("button", {
    name: "Product value",
    exact: true,
  });
  await product.press("Space");
  await expect(
    page.getByRole("img", { name: /Product illustration:/ }),
  ).toBeVisible();
  await expect(
    page.getByText("Customer workflow", { exact: true }),
  ).toBeVisible();
  await expect(automation).toHaveAttribute("aria-pressed", "false");
  await expect(product).toBeFocused();
});

/** Everything the illustration shows, as a browser would report it. */
const illustration = (target: Page) =>
  target.evaluate(() => {
    const round = (value) => Math.round(value * 10) / 10;
    const nodes = [...document.querySelectorAll(".workflow-node")];
    return {
      labels: nodes.map((node) => node.textContent?.trim()),
      boxes: nodes.map((node) => {
        const { x, y, width, height } = node.getBoundingClientRect();
        return [round(x), round(y), round(width), round(height)];
      }),
      paths: [...document.querySelectorAll(".workflow-art svg path")].map(
        (path) => path.getAttribute("d"),
      ),
      drawing: [...document.querySelectorAll(".workflow-art svg path")].map(
        (path) => {
          const style = getComputedStyle(path);
          return [style.strokeDasharray, style.strokeDashoffset];
        },
      ),
      describedBy: document
        .querySelector("[role='img']")
        ?.getAttribute("aria-label"),
      detail: document.querySelector(".workflow-detail")?.textContent,
      pressed: [...document.querySelectorAll("[data-workflow]")].map((button) =>
        button.getAttribute("aria-pressed"),
      ),
    };
  });

test("a completed choice rests in the same still composition as a fresh page", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.getByRole("button", { name: "Automation", exact: true }).click();
  const motionlessPage = await context.newPage();
  await motionlessPage.emulateMedia({ reducedMotion: "reduce" });
  await motionlessPage.goto("/");
  await motionlessPage.evaluate(() => document.fonts.ready);
  await motionlessPage
    .getByRole("button", { name: "Automation", exact: true })
    .click();
  await expect
    .poll(async () => illustration(page), {
      message: "a settled illustration should leave no drawing state behind",
      timeout: 5000,
    })
    .toEqual(await illustration(motionlessPage));
  await motionlessPage.close();
});

test("switching to reduced motion during rapid choices leaves a complete final illustration", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  // Four choices in one task, so the last transition is genuinely in flight
  // when the motion preference changes.
  await page.evaluate(() => {
    const choices = [
      ...document.querySelectorAll<HTMLButtonElement>("[data-workflow]"),
    ];
    [1, 2, 0, 2].forEach((index) => choices[index].click());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const expectedPage = await context.newPage();
  await expectedPage.emulateMedia({ reducedMotion: "reduce" });
  await expectedPage.goto("/");
  await expectedPage.evaluate(() => document.fonts.ready);
  await expectedPage
    .getByRole("button", { name: "Product value", exact: true })
    .click();
  await expect
    .poll(async () => illustration(page), {
      message:
        "an interrupted illustration should finish as the motionless one",
    })
    .toEqual(await illustration(expectedPage));
  await expectedPage.close();
});

test("a mobile visitor can select each illustration by touch", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4173/");
  await page.getByRole("button", { name: "Automation", exact: true }).tap();
  await expect(page.getByText("Operations", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Product value", exact: true }).tap();
  await expect(
    page.getByRole("img", { name: /Product illustration:/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Training", exact: true }).tap();
  await expect(
    page.getByRole("img", { name: /Training illustration:/ }),
  ).toBeVisible();
  await context.close();
});
