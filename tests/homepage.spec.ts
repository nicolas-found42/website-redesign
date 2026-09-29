import { test, expect } from "@playwright/test";
test("the homepage offers a clear resource and consultation path with near-hero proof", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Train teams. Build useful skills. Automate the work.",
  );
  const hero = page.locator(".hero");
  await expect(
    hero.getByRole("link", { name: /Explore free resources/ }),
  ).toHaveAttribute("href", "/resources/");
  const team = hero.getByRole("link", { name: "Talk to us" });
  await expect(team).toBeVisible();
  await team.click();
  const inquiry = page.getByRole("dialog");
  await expect(inquiry).toContainText("You’re sending a consultation inquiry");
  await expect(
    inquiry.getByRole("link", { name: "Open the live inquiry form" }),
  ).toHaveAttribute("href", "https://www.found42.com/contact");
  await page.keyboard.press("Escape");
  await expect(hero).toContainText(
    "Paul Keely · Co-founder and Managing Director, Palladium Security LLC",
  );
  await expect(hero).not.toContainText("Workshops · Workflows · Automations");
  await expect(hero).not.toContainText("Fig. 01");
});
test("the homepage previews the scorecard and public toolkit in the free resources band", async ({
  page,
}) => {
  await page.goto("/");
  const start = page.locator("#resources");
  await expect(
    start.getByRole("heading", { name: "Not ready to talk? Start here" }),
  ).toBeVisible();
  await expect(start.locator("article.resource")).toHaveCount(2);
  await expect(
    start.getByRole("heading", { name: "AI Readiness Scorecard" }),
  ).toBeVisible();
  await expect(
    start.getByRole("heading", { name: "C-Level AI Toolkit" }),
  ).toBeVisible();
  await expect(
    start.getByRole("link", { name: /All free resources/ }),
  ).toHaveAttribute("href", "/resources/");
  await expect(start).not.toContainText("Strategic Advisor Mini-Course");
  await expect(start).not.toContainText("Index / 04");
  await start.getByRole("link", { name: /Take the scorecard/ }).click();
  await expect(page).toHaveURL(/\/resources\/#scorecard$/);
  await expect(
    page.getByRole("group", { name: "AI Readiness Scorecard" }),
  ).toContainText("Question 1 of 12");
});
test("all three audiences link to their catalog tracks", async ({ page }) => {
  await page.goto("/#audiences");
  const rail = page.getByRole("group", { name: "Choose an audience" });

  await rail.getByRole("button", { name: /C-level executives/ }).click();
  await expect(
    page
      .locator(".audience-card")
      .first()
      .getByRole("link", { name: "For executives" }),
  ).toHaveAttribute("href", "/services/#track-c-level-ai");

  await rail
    .getByRole("button", { name: /Individual Contributors and Teams/ })
    .click();
  await expect(
    page
      .locator(".audience-card")
      .nth(1)
      .getByRole("link", { name: "For Individual Contributors and Teams" }),
  ).toHaveAttribute("href", "/services/#track-role-based");

  await rail.getByRole("button", { name: /AI builders/ }).click();
  await expect(
    page
      .locator(".audience-card")
      .nth(2)
      .getByRole("link", { name: "For AI builders" }),
  ).toHaveAttribute("href", "/services/#track-ai-builders");

  await expect(
    page.locator(".audience-panel:not([hidden]) .audience-scene"),
  ).toHaveCount(1);
  await expect(page.locator("#audiences h2")).toHaveText(
    "Find the work that sounds like yours",
  );
  await expect(page.locator("#audiences")).not.toContainText("One method");
});
test("published workshop quotes remain attributed and inquiries use the live route", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".hero-proof")).toContainText("Paul Keely");
  await expect(page.locator("#testimonials")).toContainText(
    "Carmen Paredes Ramirez",
  );
  await page
    .getByRole("link", { name: "Talk to us", exact: true })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).not.toContainText("booked");
  await expect(dialog.locator("form")).toHaveCount(0);
  await expect(
    dialog.getByRole("link", { name: "Open the live inquiry form" }),
  ).toHaveAttribute("href", "https://www.found42.com/contact");
});

test("the opening is text-led with the approved lead and no proof numbers", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".hero-lead")).toHaveText(
    "Found42 helps non-technical teams use AI in the work they already own. We train people how to create and use Claude Skills tailored to their roles, and automate repeatable work while judgment stays with your team.",
  );
  await expect(page.locator(".hero")).toContainText(
    "Claude is Anthropic’s AI assistant.",
  );
  await expect(page.locator(".hero .system, .hero svg[role=img]")).toHaveCount(
    0,
  );
  await expect(page.locator(".hero-proof")).toContainText("Paul Keely");
  const main = page.locator("main");
  await expect(main).not.toContainText("Found42 in numbers");
  for (const claim of [/\b20\+/, /\b500\+/, /\b50\+/, /workshops delivered/])
    await expect(main).not.toContainText(claim);
});

test("the companies row shows five bundled logos, named, in the approved order", async ({
  page,
}) => {
  await page.goto("/");
  const row = page.locator("#companies");
  await expect(row).toContainText("Teams we have worked with");
  const logos = row.getByRole("img");
  // The heading names the row, so the logos read as the answer to it.
  await expect(
    page.getByRole("region", { name: "Teams we have worked with" }),
  ).toHaveAttribute("id", "companies");
  await expect(
    row.getByRole("heading", { name: "Teams we have worked with" }),
  ).toBeVisible();
  await expect(logos).toHaveCount(5);
  const names = [
    "Google",
    "Edgescale AI",
    "Millsapps, Ballinger & Associates (MB&A)",
    "Seidler Equity Partners (SEP)",
    "PeakSpan Capital",
  ];
  for (const [index, name] of names.entries())
    await expect(logos.nth(index)).toHaveAccessibleName(name);
  for (const logo of await logos.all()) {
    await expect(logo).toHaveJSProperty("complete", true);
    await expect(logo).not.toHaveJSProperty("naturalWidth", 0);
    const src = await logo.getAttribute("src");
    expect(src).toMatch(/^\/assets\/logos\//);
  }
});

test("the companies heading reads at section-heading scale and wraps above the logos", async ({
  page,
}) => {
  const sizes = [
    { width: 1440, height: 900, min: 28, max: 32 },
    { width: 384, height: 686, min: 24, max: 24 },
    { width: 384, height: 742, min: 24, max: 24 },
  ];
  for (const { width, height, min, max } of sizes) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    const heading = page
      .locator("#companies")
      .getByRole("heading", { name: "Teams we have worked with" });
    const size = await heading.evaluate((el) =>
      parseFloat(getComputedStyle(el).fontSize),
    );
    expect(size, `${width}px`).toBeGreaterThanOrEqual(min);
    expect(size, `${width}px`).toBeLessThanOrEqual(max);
  }
  for (const [width, height, text] of [
    [384, 686, "100%"],
    [384, 742, "100%"],
    [384, 742, "200%"],
    [320, 700, "200%"],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await page.evaluate(
      (size) => (document.documentElement.style.fontSize = size),
      text,
    );
    const fit = await page.locator("#companies").evaluate((row) => {
      const heading = row.querySelector("h2");
      const list = row.querySelector("ul");
      if (!heading || !list) throw new Error("row is missing its parts");
      const head = heading.getBoundingClientRect();
      const first = list.getBoundingClientRect();
      return {
        bottom: head.bottom,
        listTop: first.top,
        left: head.left,
        right: head.right,
        clipped: heading.scrollWidth > heading.clientWidth,
        pageFits: document.documentElement.scrollWidth <= innerWidth,
      };
    });
    const label = `${width}px at ${text} text`;
    expect(fit.bottom, label).toBeLessThanOrEqual(fit.listTop);
    expect(fit.left, label).toBeGreaterThanOrEqual(0);
    expect(fit.right, label).toBeLessThanOrEqual(width);
    expect(fit.clipped, label).toBe(false);
    expect(fit.pageFits, label).toBe(true);
  }
});

test("the companies row keeps proportions and fits without scrolling at any width", async ({
  page,
}) => {
  for (const width of [1440, 1024, 768, 430, 384, 320]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/");
    const logos = page.locator("#companies").getByRole("img");
    for (const logo of await logos.all()) {
      await expect(logo).toHaveJSProperty("complete", true);
      const fit = await logo.evaluate((img: HTMLImageElement) => {
        const box = img.getBoundingClientRect();
        return {
          ratio: box.width / box.height,
          natural: img.naturalWidth / img.naturalHeight,
          right: box.right,
        };
      });
      expect(fit.right, `${width}px`).toBeLessThanOrEqual(width);
      expect(Math.abs(fit.ratio - fit.natural), `${width}px`).toBeLessThan(
        0.05,
      );
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `${width}px`,
    ).toBe(true);
  }
});
