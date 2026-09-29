import { test, expect } from "@playwright/test";

const names = [
  "C-level executives",
  "Individual Contributors and Teams",
  "AI builders",
];
const ids = ["executives", "contributors", "builders"];
const destinations = [
  "/services/#track-c-level-ai",
  "/services/#track-role-based",
  "/services/#track-ai-builders",
];

test("Home and Services let a visitor read and jump between three complete audience articles", async ({
  page,
}) => {
  for (const route of ["/", "/services/"]) {
    await page.goto(route);
    const section = page.locator("#audiences");
    const rail = section.getByRole("group", { name: "Choose an audience" });
    await expect(rail.getByRole("button")).toHaveCount(3);
    await expect(
      section.getByRole("button", { name: /Previous audience|Next audience/ }),
    ).toHaveCount(0);
    for (const [index, name] of names.entries()) {
      const article = section.getByRole("article", { name, exact: true });
      await expect(
        article.getByRole("heading", { name, exact: true }),
      ).toBeVisible();
      await expect(article.locator("li")).toHaveCount(3);
      await expect(article.getByRole("link")).toHaveAttribute(
        "href",
        destinations[index],
      );
      await rail.getByRole("button", { name, exact: true }).click();
      await expect(
        rail.getByRole("button", { name, exact: true }),
      ).toHaveAttribute("aria-pressed", "true");
      await expect(article).toBeInViewport();
    }
  }
});

test("reading an audience changes the pinned scene and the announced selection", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/#audiences");
  const rail = page.getByRole("group", { name: "Choose an audience" });
  for (const [index, id] of ids.entries()) {
    await page
      .locator(`#audience-${id}`)
      .evaluate((article) => article.scrollIntoView({ block: "center" }));
    await expect(
      rail.getByRole("button", { name: names[index], exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".audience-art").getByRole("img")).toHaveCount(1);
    await expect(
      page.locator(".audience-art").getByRole("img"),
    ).toHaveAccessibleName(
      new RegExp(
        index === 0
          ? "Executive day"
          : index === 1
            ? "Individual Contributors and Teams illustration"
            : "Builder illustration",
      ),
    );
  }
  await expect(page.locator(".audience-pinned-caption")).not.toHaveAttribute(
    "aria-live",
  );
});

test("phone visitors read each audience beside its own scene and operate the wrapping pills", async ({
  page,
}) => {
  for (const height of [686, 742]) {
    await page.setViewportSize({ width: 384, height });
    await page.goto("/#audiences");
    for (const [index, name] of names.entries()) {
      const choice = page.getByRole("button", { name, exact: true });
      await choice.focus();
      await page.keyboard.press("Enter");
      await expect(choice).toHaveAttribute("aria-pressed", "true");
      await expect(choice).toBeFocused();
      expect(
        await choice.evaluate(
          (button) => getComputedStyle(button).outlineStyle,
        ),
      ).not.toBe("none");
      const article = page.getByRole("article", { name, exact: true });
      await expect(article.getByRole("img")).toHaveCount(1);
      await expect(article.getByRole("img")).toBeVisible();
      await expect(article).toBeInViewport();
      await expect(article.getByRole("link")).toHaveAttribute(
        "href",
        destinations[index],
      );
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

for (const mode of ["reduced motion", "without scripting"] as const) {
  test(`${mode} leaves every audience article and complete still scene in reading order`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      javaScriptEnabled: mode !== "without scripting",
      reducedMotion: mode === "reduced motion" ? "reduce" : "no-preference",
      viewport: { width: 1440, height: 1000 },
    });
    const page = await context.newPage();
    await page.goto(
      mode === "without scripting"
        ? (process.env.PW_AUDIENCE_STATIC_URL ??
            "http://127.0.0.1:4179/website-redesign/") + "#audiences"
        : "/#audiences",
    );
    await expect(page.locator(".audience-panel h3")).toHaveText(names);
    for (const name of names) {
      const article = page.getByRole("article", { name, exact: true });
      await expect(article).toBeVisible();
      await expect(article.getByRole("img")).toBeVisible();
      expect(
        await article
          .locator(".part-body")
          .evaluateAll((parts) =>
            parts.every((part) => getComputedStyle(part).opacity === "1"),
          ),
      ).toBe(true);
    }
    await context.close();
  });
}

test("the playbook page explains the verified request route", async ({
  page,
}) => {
  await page.goto("/resources/#playbook");
  const figure = page.locator("#playbook .review-figure");
  await expect(figure.getByRole("img")).toHaveAccessibleName(
    /weak outputs, missing context, false confidence/,
  );
  for (const check of ["Weak outputs", "Missing context", "False confidence"])
    await expect(figure.getByText(check, { exact: true })).toBeVisible();
  await expect(figure).toContainText("not reproduced here");
  await expect(
    page.getByRole("link", { name: /Request the published AI Failure Modes/ }),
  ).toHaveAttribute(
    "href",
    "https://www.found42.com/ai-failure-modes-playbook",
  );
});

test("public copy no longer says “no fluff” on any route", async ({ page }) => {
  for (const route of [
    "",
    "resources/",
    "services/",
    "industries/private-equity/",
    "industries/b2b-saas/",
    "about/",
    "blog/",
  ]) {
    await page.goto(`/${route}`);
    const text = await page.evaluate(() => document.documentElement.outerHTML);
    expect(text, route).not.toMatch(/no[\s-]*fluff/i);
  }
});

const INTRO =
  "Whether you are an executive, an individual contributor, or an AI builder, we have workshops tailored to your role that will put Claude to work and save you 4-8 hours every week.";

test("the approved audience introduction appears wherever the audiences do", async ({
  page,
}) => {
  for (const route of ["/", "/services/"]) {
    await page.goto(route);
    await expect(page.locator("#audiences .section-head .lead")).toHaveText(
      INTRO,
    );
  }
});

test("Services names the people Customized Role-Based Training serves", async ({
  page,
}) => {
  await page.goto("/services/#track-role-based");
  const audience = page.locator("#track-role-based .track-audience");
  await expect(audience.locator(".track-term")).toHaveText("For");
  await expect(audience).toContainText("Individual Contributors and Teams");
  await expect(audience).not.toContainText(/any function|don.t cover/i);
  await expect(page.locator("#track-role-based-title")).toHaveText(
    "Customized Role-Based Training",
  );
});
