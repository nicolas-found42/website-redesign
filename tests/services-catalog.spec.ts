import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * The services page is Found42's catalog: five training tracks, the formats
 * they run in, services beyond training, two free sessions, and the people
 * behind the work. Commercial terms from the private proposal stay private.
 */

test("the services page lists every track, format, service and free session", async ({
  page,
}) => {
  await page.goto("/services/");
  await expect(page.locator("h1")).toHaveText(
    "Use Claude as a system, not a tool.",
  );
  await expect(page.locator("#tracks .track h3")).toHaveText([
    "C-Level AI",
    "Analysts",
    "GTM Teams",
    "AI Builders",
    "Customized Role-Based Training",
  ]);
  await expect(page.locator("#formats .catalog-option h3")).toHaveText([
    "Open enrollment",
    "Private cohort",
    "Private workshop",
    "Function clinic",
    "Executive 1:1",
    "Custom role-based program",
  ]);
  await expect(page.locator("#beyond-training .catalog-option h3")).toHaveText([
    "Custom build",
    "Advisory retainer",
    "Advisory facilitation",
    "Annual program",
  ]);
  await expect(page.locator("#start-free h3")).toHaveText([
    "Claude as a Strategic Advisor",
    "Claude for High-Stakes Communications",
  ]);
  await expect(page.locator("#formats")).toContainText("Minimum 10 seats");
  await expect(page.locator("#formats")).toContainText("Up to 25 seats");
  await expect(page.locator("#formats")).toContainText(
    "focused 90-minute session",
  );
  await expect(page.locator("#formats")).toContainText("Six weeks, one to one");
  await expect(page.locator("#beyond-training")).toContainText(
    "three-month minimum",
  );
  await expect(page.locator("#beyond-training")).toContainText(
    "governance policy grid",
  );
  await expect(page.locator("#start-free")).toContainText(
    "A configured strategic advisor",
  );
  await expect(page.locator("#start-free")).toContainText(
    "A reusable review pattern for email",
  );
  for (const [id, audience, asset] of [
    [
      "c-level-ai",
      "C-level executives, owners, partners and principals",
      "Chief of Staff Claude plugin",
    ],
    ["analysts", "Deal teams", "CIM-to-deal memo"],
    [
      "gtm-teams",
      "Sales, business development, marketing",
      "200 GTM Skill templates",
    ],
    [
      "ai-builders",
      "advanced users who are not engineers",
      "live debugging sessions",
    ],
    [
      "role-based",
      "Any function the other tracks don’t cover",
      "10 role-specific Claude Skills",
    ],
  ]) {
    await expect(page.locator(`#track-${id}`)).toContainText(audience);
    await expect(page.locator(`#track-${id}`)).toContainText(asset);
  }
  await expect(page.locator(".catalog-biography")).toContainText(
    "over 15 years at Google",
  );
  await expect(page.locator(".catalog-biography")).toContainText(
    "BreakBeatCode",
  );
  await expect(page.locator(".catalog-quotes blockquote")).toContainText([
    /trusted advisor in less than an hour/,
    /cuts through the AI hype/,
    /The exercises turned AI from concept to execution/,
  ]);
  await expect(page.locator(".catalog-quotes figcaption strong")).toHaveText([
    "Andrew Miller",
    "Robb Henshaw",
    "Paul Keely",
  ]);
  await expect(
    page.getByRole("heading", { name: "About Richard Achée" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "A useful place to begin" }),
  ).toBeVisible();
  // It no longer repeats the homepage's audience gallery and services sequence.
  await expect(page.locator("#audiences, #services")).toHaveCount(0);
});

test("the public catalog omits paid and client-specific proposal terms", async ({
  page,
}) => {
  await page.goto("/services/");
  const text = await page.locator("main").innerText();
  expect(text).not.toMatch(/\$[\d,]+|price|pricing|fixed quote|90 days/i);
  expect(text).not.toMatch(/Seidler|\bSEP\b|AI Committee|\bConfidential\b/i);
  await expect(page.locator("#start-free")).toContainText(
    "offered at no charge",
  );
  await expect(page).toHaveTitle(/Services \| Found42/);
  await expect(page.locator('meta[name="description"]')).not.toHaveAttribute(
    "content",
    /price|pricing|\$[\d,]+/i,
  );
});

test("jump links and audience anchors reach named catalog entries", async ({
  page,
}) => {
  await page.goto("/services/");
  for (const [name, id] of [
    ["Training tracks", "tracks"],
    ["Delivery formats", "formats"],
    ["Beyond training", "beyond-training"],
    ["Start free", "start-free"],
  ]) {
    const link = page.locator(".page-jumps").getByRole("link", { name });
    await expect(link).toHaveAttribute("href", `#${id}`);
    await link.click();
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    await expect(page.locator(`#${id}`)).toBeVisible();
  }
  for (const [id, title] of [
    ["c-level-ai", "C-Level AI"],
    ["role-based", "Customized Role-Based Training"],
    ["ai-builders", "AI Builders"],
  ]) {
    await page.goto(`/services/#track-${id}`);
    await expect(page.locator(`#track-${id}`)).toHaveAttribute(
      "aria-labelledby",
      `track-${id}-title`,
    );
    await expect(page.locator(`#track-${id} h3`)).toHaveText(title);
    const gap = await page
      .locator(`#track-${id}`)
      .evaluate(
        (target) =>
          target.getBoundingClientRect().top -
          document.querySelector(".site-header")!.getBoundingClientRect()
            .bottom,
      );
    expect(gap, `${title} clears the sticky header`).toBeGreaterThanOrEqual(0);
  }
  const keyboardLink = page
    .locator(".page-jumps")
    .getByRole("link", { name: "Delivery formats" });
  await keyboardLink.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#formats$/);
});

test("other preview pages describe the price-free catalog accurately", async ({
  page,
}) => {
  for (const route of [
    "/resources/",
    "/industries/private-equity/",
    "/industries/b2b-saas/",
  ]) {
    await page.goto(route);
    await expect(
      page.getByRole("link", { name: /delivery formats|training tracks/i }),
    ).toHaveAttribute("href", /services\/#(?:formats|tracks)$/);
    expect(await page.locator("main").innerText()).not.toMatch(
      /formats and pricing|training tracks and pricing/i,
    );
  }
});

test("general and contextual inquiries carry the selected offering to the live handoff", async ({
  page,
}) => {
  await page.goto("/services/");
  await page
    .locator(".page-opening")
    .getByRole("button", { name: /^Inquire/ })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("link", { name: "Open the live inquiry form" }),
  ).toHaveAttribute("href", "https://www.found42.com/contact");
  await expect(dialog.locator("form")).toHaveCount(0);
  await page.keyboard.press("Escape");
  for (const name of [
    "C-Level AI",
    "Analysts",
    "GTM Teams",
    "AI Builders",
    "Customized Role-Based Training",
    "Custom build",
    "Advisory retainer",
    "Advisory facilitation",
    "Annual program",
  ]) {
    await page.getByRole("button", { name: `Inquire about ${name}` }).click();
    await expect(dialog.locator(".note").first()).toHaveText(`About ${name}`);
    await expect(dialog.locator(".inquiry-context")).toBeVisible();
    await expect(dialog.locator(".inquiry-context")).toContainText(
      "does not prefill the live form",
    );
    await expect(
      dialog.getByRole("link", { name: "Open the live inquiry form" }),
    ).toHaveAttribute("href", "https://www.found42.com/contact");
    await page.keyboard.press("Escape");
  }
  await page.getByRole("button", { name: "Ask for a free session" }).click();
  await expect(dialog.locator(".inquiry-context")).toContainText(
    "Add “a free 30-minute session” to your message",
  );
});

test("the catalog reflows across viewports and passes axe", async ({
  page,
}) => {
  for (const [width, scale] of [
    [320, "200%"],
    [390, "100%"],
    [768, "100%"],
    [1440, "100%"],
  ] as const) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/services/");
    await page.evaluate((size) => {
      document.documentElement.style.fontSize = size;
    }, scale);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `${width}px at ${scale}`,
    ).toBe(true);
  }
  await expect(
    page.locator("#formats").getByRole("heading", { name: "Private cohort" }),
  ).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/services/");
  const result = await new AxeBuilder({ page })
    .include("main")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(result.violations).toEqual([]);
});

test("the prerendered catalog keeps its content and contact route without script", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(
      "http://127.0.0.1:4179/website-redesign/services/#track-ai-builders",
    );
    await expect(
      page.getByRole("heading", { name: "AI Builders" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Open Found42’s contact form" }),
    ).toHaveAttribute("href", "https://www.found42.com/contact");
    await expect(page.locator("#start-free")).toContainText(
      "offered at no charge",
    );
  } finally {
    await context.close();
  }
});
