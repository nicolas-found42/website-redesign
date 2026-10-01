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

test("phone visitors read each audience beside its own scene and operate a compact scrolling rail", async ({
  page,
}) => {
  for (const height of [686, 742]) {
    await page.setViewportSize({ width: 384, height });
    await page.goto("/#audiences");
    const rail = page.getByRole("group", { name: "Choose an audience" });
    expect((await rail.boundingBox())!.height).toBeLessThanOrEqual(72);
    for (const [index, name] of names.entries()) {
      const choice = page.getByRole("button", { name, exact: true });
      await choice.focus();
      await page.keyboard.press("Enter");
      await expect(choice).toHaveAttribute("aria-pressed", "true");
      await expect(choice).toBeFocused();
      const bounds = await choice.boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(384);
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
  test(`${mode} leaves every audience article and complete still scene in reading order${mode === "without scripting" ? " [production]" : ""}`, async ({
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

test("phone keyboard reading moves the pressed audience beyond a chosen pill", async ({
  page,
  browserName,
}) => {
  await page.setViewportSize({ width: 384, height: 742 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const nextFocus = browserName === "webkit" ? "Alt+Tab" : "Tab";
  for (const route of ["/", "/services/"]) {
    await page.goto(route + "#audiences");
    const first = page.getByRole("button", { name: names[0], exact: true });
    await first.focus();
    await page.keyboard.press("Enter");
    await expect(first).toHaveAttribute("aria-pressed", "true");
    for (let step = 0; step < 4; step++) await page.keyboard.press(nextFocus);
    const contributors = page.getByRole("article", {
      name: names[1],
      exact: true,
    });
    await expect(contributors.getByRole("link")).toBeFocused();
    await expect(
      page.getByRole("button", { name: names[1], exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press(nextFocus);
    await expect(
      page.getByRole("button", { name: names[2], exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
  }
});

test("narrow audience jumps retry when an interrupted article only crosses the viewport midpoint", async ({
  page,
}) => {
  await page.setViewportSize({ width: 384, height: 742 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    Element.prototype.scrollIntoView = function () {
      const count = Number(
        document.documentElement.dataset.testScrollIntoViewCalls ?? 0,
      );
      document.documentElement.dataset.testScrollIntoViewCalls = String(
        count + 1,
      );
      if (count !== 0) return;

      const box = this.getBoundingClientRect();
      const middle = innerHeight / 2;
      const landing =
        Number.parseFloat(getComputedStyle(this).scrollMarginTop) +
        Number.parseFloat(
          getComputedStyle(document.documentElement).scrollPaddingTop,
        );
      const targetTop = Math.min(middle, landing) - 10;
      window.scrollTo({
        top: scrollY + box.top - targetTop,
        behavior: "instant",
      });
      const landed = this.getBoundingClientRect();
      document.documentElement.dataset.testInterruptWasMidpointOnly = String(
        landed.top < landing && landed.top < middle && landed.bottom > middle,
      );
      window.dispatchEvent(new Event("scrollend"));
    };
  });

  for (const route of ["/", "/services/"]) {
    await page.goto(route + "#audiences");
    const choice = page.getByRole("button", {
      name: names[2],
      exact: true,
    });
    await choice.click();
    await expect(page.locator("html")).toHaveAttribute(
      "data-test-interrupt-was-midpoint-only",
      "true",
    );
    await expect
      .poll(() =>
        page.locator("html").getAttribute("data-test-scroll-into-view-calls"),
      )
      .toBe("2");
  }
});

test("reduced motion corrects a narrow audience jump released short of its target", async ({
  page,
}) => {
  await page.setViewportSize({ width: 384, height: 742 });
  await page.addInitScript(() => {
    const original = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function (options) {
      if (!this.matches("[data-audience-panel]"))
        return original.call(this, options);

      const calls = (document.documentElement.dataset.testScrollBehaviors ?? "")
        .split(",")
        .filter(Boolean);
      calls.push(
        typeof options === "object" ? (options.behavior ?? "auto") : "auto",
      );
      document.documentElement.dataset.testScrollBehaviors = calls.join(",");
      if (calls.length > 2) return original.call(this, options);

      const box = this.getBoundingClientRect();
      window.scrollTo({
        top: scrollY + box.top - innerHeight * 0.75,
        behavior: "instant",
      });
      window.dispatchEvent(new Event("scrollend"));
    };
  });

  for (const route of ["/", "/services/"]) {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(route + "#audiences");
    const choice = page.getByRole("button", { name: names[2], exact: true });
    await choice.click();
    await expect
      .poll(() =>
        page.locator("html").getAttribute("data-test-scroll-behaviors"),
      )
      .toBe("smooth,smooth");

    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect
      .poll(() =>
        page.locator("html").getAttribute("data-test-scroll-behaviors"),
      )
      .toBe("smooth,smooth,instant");
    const article = page.getByRole("article", {
      name: names[2],
      exact: true,
    });
    await expect
      .poll(() =>
        article.evaluate((element) => {
          const box = element.getBoundingClientRect();
          const margin = Number.parseFloat(
            getComputedStyle(element).scrollMarginTop,
          );
          const padding = Number.parseFloat(
            getComputedStyle(document.documentElement).scrollPaddingTop,
          );
          return Math.abs(box.top - (margin + padding));
        }),
      )
      .toBeLessThanOrEqual(4);
    await expect(choice).toHaveAttribute("aria-pressed", "true");
  }
});

test("phone audience choices keep the hidden pinned drawings still", async ({
  page,
}) => {
  await page.setViewportSize({ width: 384, height: 742 });
  await page.goto("/#audiences");
  const choice = page.getByRole("button", { name: names[1], exact: true });
  await choice.focus();
  await page.keyboard.press("Enter");
  await expect(choice).toHaveAttribute("aria-pressed", "true");
  expect(
    await page.locator(".audience-art").evaluate(
      (pane) =>
        document.getAnimations().filter((animation) => {
          const target = (animation.effect as KeyframeEffect).target;
          return target instanceof Element && pane.contains(target);
        }).length,
    ),
  ).toBe(0);
});

test("mouse scrolling releases a narrow audience or service pill selection", async ({
  page,
}) => {
  await page.setViewportSize({ width: 800, height: 742 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of ["/", "/services/"]) {
    for (const [section, firstName, articleId, nextName] of [
      ["audiences", names[0], "audience-builders", names[2]],
      ["services", "Workshops", "service-product", "Automations"],
    ]) {
      await page.goto(route + "#" + section);
      const region = page.locator("#" + section);
      const first = region.getByRole("button", {
        name: firstName,
        exact: true,
      });
      await first.click();
      await expect(first).toHaveAttribute("aria-pressed", "true");
      // A scrollbar drag produces a mouse press and scrolling, without wheel,
      // touch or a navigation key. Keep the scroll separate from those inputs.
      await page.mouse.move(799, 400);
      await page.mouse.down();
      await page
        .locator("#" + articleId)
        .evaluate((article) =>
          article.scrollIntoView({ block: "center", behavior: "instant" }),
        );
      await page.mouse.up();
      await expect(
        region.getByRole("button", { name: nextName, exact: true }),
      ).toHaveAttribute("aria-pressed", "true");
    }
  }
});
